import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  smartRecommendationsTable,
  analyticsSnapshotsTable,
  leadsTable,
  growthStreaksTable,
} from '@/db/schema';
import { eq, and, isNull, gte, desc, count } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || token !== cronSecret) {
    return errorResponse('Unauthorized', 401);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all active growth/domination orgs
  const orgs = await db
    .select({ id: organizationsTable.id, name: organizationsTable.name, planTier: organizationsTable.planTier, healthScore: organizationsTable.healthScore })
    .from(organizationsTable)
    .where(and(
      eq(organizationsTable.isActive, true),
    ));

  const eligibleOrgs = orgs.filter(
    (o) => o.planTier === 'growth' || o.planTier === 'domination'
  );

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const org of eligibleOrgs) {
    try {
      // Check if there are still active (non-dismissed) recommendations
      const activeRows = await db
        .select({ id: smartRecommendationsTable.id })
        .from(smartRecommendationsTable)
        .where(and(
          eq(smartRecommendationsTable.organizationId, org.id),
          isNull(smartRecommendationsTable.dismissedAt),
        ))
        .limit(1);

      if (activeRows.length > 0) {
        skipped++;
        continue;
      }

      // Gather context
      const [analyticsRows, leadsRows, streakRows] = await Promise.all([
        db.select()
          .from(analyticsSnapshotsTable)
          .where(and(
            eq(analyticsSnapshotsTable.organizationId, org.id),
            gte(analyticsSnapshotsTable.snapshotDate, thirtyDaysAgo.toISOString().slice(0, 10)),
          ))
          .orderBy(desc(analyticsSnapshotsTable.snapshotDate))
          .limit(30),
        db.select({ count: count() })
          .from(leadsTable)
          .where(and(
            eq(leadsTable.organizationId, org.id),
            gte(leadsTable.createdAt, thirtyDaysAgo),
          )),
        db.select()
          .from(growthStreaksTable)
          .where(eq(growthStreaksTable.orgId, org.id))
          .limit(1),
      ]);

      const totalVisitors = analyticsRows.reduce((sum, r) => {
        const m = r.metrics as Record<string, number> | null;
        return sum + (m?.sessions ?? 0);
      }, 0);
      const totalLeads = leadsRows[0]?.count ?? 0;
      const currentStreak = streakRows[0]?.currentStreak ?? 0;
      const conversionRate = totalVisitors > 0 ? ((Number(totalLeads) / totalVisitors) * 100).toFixed(2) : '0';
      const hasAnalytics = analyticsRows.length > 0;

      const recs = await generateWithAI(org.id, org.name, org.healthScore, org.planTier, {
        totalVisitors,
        totalLeads: Number(totalLeads),
        conversionRate,
        currentStreak,
        hasAnalytics,
      });

      await db.insert(smartRecommendationsTable).values(recs);
      generated++;
    } catch (err) {
      errors.push(`org ${org.id}: ${String(err)}`);
    }
  }

  return jsonResponse({
    success: true,
    orgsEligible: eligibleOrgs.length,
    generated,
    skipped,
    errors,
  });
}

async function generateWithAI(
  orgId: string,
  orgName: string,
  healthScore: number,
  planTier: string,
  ctx: {
    totalVisitors: number;
    totalLeads: number;
    conversionRate: string;
    currentStreak: number;
    hasAnalytics: boolean;
  },
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const validCategories = ['seo', 'content', 'technical', 'design', 'marketing'];

  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const prompt = `You are a digital marketing strategist for Caliber Web Studio. Generate exactly 3 personalized, actionable recommendations for this client.

Client data:
- Business: ${orgName}
- Plan tier: ${planTier}
- Growth Score: ${healthScore}/100
- Monthly website visitors: ${ctx.hasAnalytics ? ctx.totalVisitors : 'not connected'}
- Monthly leads: ${ctx.totalLeads}
- Lead conversion rate: ${ctx.conversionRate}%
- Growth streak weeks: ${ctx.currentStreak}
- Analytics connected: ${ctx.hasAnalytics ? 'yes' : 'no'}

Return a JSON array with exactly 3 objects, each with:
- title: string (action-oriented, max 8 words)
- description: string (2 sentences, specific and actionable)
- impact: string (quantified, e.g. "+12 to Growth Score")
- category: one of: seo, content, technical, design, marketing
- priority: 1, 2, or 3 (1 = highest)

Return ONLY the JSON array.`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0];
      if (text.type === 'text') {
        const raw = text.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(raw) as Array<{
          title: string;
          description: string;
          impact: string;
          category: string;
          priority: number;
        }>;

        return parsed.slice(0, 3).map((r, i) => ({
          organizationId: orgId,
          title: String(r.title).slice(0, 255),
          description: String(r.description),
          impact: String(r.impact).slice(0, 100),
          category: (validCategories.includes(r.category) ? r.category : 'marketing') as 'seo' | 'content' | 'technical' | 'design' | 'marketing',
          priority: typeof r.priority === 'number' ? r.priority : i + 1,
        }));
      }
    } catch (err) {
      console.error('[generate-recommendations cron] AI error for org', orgId, err);
    }
  }

  // Fallback
  return buildFallbackRecs(orgId, healthScore, ctx.hasAnalytics, ctx.totalLeads);
}

function buildFallbackRecs(
  orgId: string,
  score: number,
  hasAnalytics: boolean,
  leads: number,
) {
  const recs: Array<{
    organizationId: string;
    title: string;
    description: string;
    impact: string;
    category: 'seo' | 'content' | 'technical' | 'design' | 'marketing';
    priority: number;
  }> = [];

  if (!hasAnalytics) {
    recs.push({
      organizationId: orgId,
      title: 'Connect Google Analytics to unlock insights',
      description: 'Connecting Google Analytics is the single highest-impact step you can take right now. It unlocks traffic data, visitor behavior, and conversion tracking across your entire portal.',
      impact: '+20 to Growth Score',
      category: 'technical',
      priority: 1,
    });
  }

  if (leads < 5) {
    recs.push({
      organizationId: orgId,
      title: 'Add a lead capture form to your homepage',
      description: 'Your homepage is your highest-traffic page. Adding a clear call-to-action form can increase leads by 40% or more. Request this from your CWS team today.',
      impact: '+15 leads/month',
      category: 'marketing',
      priority: recs.length + 1,
    });
  }

  if (score < 80) {
    recs.push({
      organizationId: orgId,
      title: 'Optimize images for faster load speed',
      description: 'Pages loading over 3 seconds lose 40% of visitors before they even see your content. Image optimization and caching improvements can lift your Growth Score and Google ranking.',
      impact: '+10 to Growth Score',
      category: 'technical',
      priority: recs.length + 1,
    });
  }

  recs.push({
    organizationId: orgId,
    title: 'Publish one new page or blog post',
    description: 'Google rewards websites that publish fresh content regularly. One new page or post per month signals activity, builds authority, and improves your local SEO ranking.',
    impact: '+8 keyword positions',
    category: 'seo',
    priority: recs.length + 1,
  });

  return recs.slice(0, 3);
}
