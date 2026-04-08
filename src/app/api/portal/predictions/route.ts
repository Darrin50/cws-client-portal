import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/db';
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
  analyticsSnapshotsTable,
  leadsTable,
  morningBriefsTable,
  growthGoalsTable,
} from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { withAuth, jsonResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-helpers';
import type { MorningBriefData } from '@/db/schema/morning-briefs';

// ── Types ────────────────────────────────────────────────────────────────────

interface Ga4DayMetrics {
  visitors?: number;
}

interface ChartPoint {
  date: string;         // formatted label e.g. 'Apr 8'
  isoDate: string;      // YYYY-MM-DD for sorting
  actual: number | null;
  predicted: number | null;
  upper: number | null;
  lower: number | null;
}

interface MetricPrediction {
  currentMonthly: number;
  predicted30d: number;
  predicted90d: number;
  growthRatePct: number;   // % change per month
  confidence: number;      // 0–1 (R²)
  milestoneTarget: number;
  milestoneDate: string | null;  // ISO date
  daysToMilestone: number | null;
}

interface GoalProgress {
  id: string;
  metricType: string;
  targetValue: number;
  targetDate: string | null;
  currentValue: number;
  predictedHitDate: string | null;
  daysRemaining: number | null;
  willBeatTarget: boolean;   // hit it before targetDate
}

interface PredictionsResponse {
  chartData: ChartPoint[];
  visitors: MetricPrediction;
  leads: MetricPrediction;
  score: { current: number; predicted30d: number; predicted90d: number; nextTarget: number };
  goals: GoalProgress[];
  narrative: string | null;
  isDemo: boolean;
  generatedAt: string;
}

// ── Linear regression helpers ─────────────────────────────────────────────────

interface Regression {
  slope: number;
  intercept: number;
  rSquared: number;
  se: number;    // standard error of regression
  xMean: number;
  sxx: number;   // sum of squared x deviations
  n: number;
}

function linearRegression(pts: { x: number; y: number }[]): Regression {
  const n = pts.length;
  if (n < 2) {
    const y = pts[0]?.y ?? 0;
    return { slope: 0, intercept: y, rSquared: 0, se: 0, xMean: 0, sxx: 1, n };
  }
  const xMean = pts.reduce((s, p) => s + p.x, 0) / n;
  const yMean = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0, sxx = 0;
  for (const p of pts) {
    sxy += (p.x - xMean) * (p.y - yMean);
    sxx += (p.x - xMean) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = yMean - slope * xMean;
  let ssTot = 0, ssRes = 0;
  for (const p of pts) {
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - (slope * p.x + intercept)) ** 2;
  }
  const rSquared = ssTot < 1e-9 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  const se = n > 2 ? Math.sqrt(ssRes / (n - 2)) : yMean * 0.15;
  return { slope, intercept, rSquared, se, xMean, sxx, n };
}

function predict(reg: Regression, x: number): number {
  return Math.max(0, reg.slope * x + reg.intercept);
}

function confidenceBand(reg: Regression, x: number, z = 1.645): { upper: number; lower: number } {
  const base = predict(reg, x);
  const sePred = reg.sxx > 0
    ? reg.se * Math.sqrt(1 + 1 / reg.n + (x - reg.xMean) ** 2 / reg.sxx)
    : reg.se;
  return {
    upper: Math.max(0, base + z * sePred),
    lower: Math.max(0, base - z * sePred),
  };
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso + 'T00:00:00Z').getTime() - new Date(fromIso + 'T00:00:00Z').getTime()) /
      86400000,
  );
}

function formatChartLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// ── Synthetic data (when no real analytics) ───────────────────────────────────

function syntheticVisitorHistory(
  orgId: string,
  healthScore: number,
  days: number,
): { date: string; visitors: number }[] {
  // Deterministic pseudo-random from orgId hash
  let seed = 0;
  for (let i = 0; i < orgId.length; i++) {
    seed = ((seed << 5) - seed + orgId.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const baseDaily = Math.round((healthScore / 100) * 60 + 15); // 15–75
  const today = isoToday();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const d = new Date(date + 'T00:00:00Z');
    const weekday = d.getUTCDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.7 : 1.0;
    const trendFactor = 1 + ((days - 1 - i) / days) * 0.25; // gentle 25% growth over period
    const noise = 0.75 + rand() * 0.5;
    result.push({
      date,
      visitors: Math.round(baseDaily * trendFactor * weekendFactor * noise),
    });
  }
  return result;
}

// ── Next milestone helper ─────────────────────────────────────────────────────

function nextMilestone(current: number, milestones: number[]): number {
  return milestones.find((m) => m > current) ?? milestones[milestones.length - 1] ?? current * 2;
}

const VISITOR_MILESTONES = [100, 250, 500, 750, 1000, 1500, 2500, 5000, 10000, 25000, 50000];
const LEAD_MILESTONES = [5, 10, 25, 50, 100, 150, 250, 500, 1000];

// ── Resolve org ───────────────────────────────────────────────────────────────

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({
        id: organizationsTable.id,
        planTier: organizationsTable.planTier,
        healthScore: organizationsTable.healthScore,
        createdAt: organizationsTable.createdAt,
        name: organizationsTable.name,
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  if (!userRows[0]) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userRows[0].id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({
      id: organizationsTable.id,
      planTier: organizationsTable.planTier,
      healthScore: organizationsTable.healthScore,
      createdAt: organizationsTable.createdAt,
      name: organizationsTable.name,
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

// ── Claude narrative ──────────────────────────────────────────────────────────

async function generateNarrative(
  orgName: string,
  visitors: MetricPrediction,
  leads: MetricPrediction,
  isDemo: boolean,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const prompt = `You are a growth analyst writing a 2-3 sentence predictive summary for a small business owner.
${isDemo ? 'Note: These are estimated projections based on website health score (no real analytics connected yet).' : ''}

Business: ${orgName}
Current monthly visitors: ${visitors.currentMonthly}
Projected in 90 days: ${visitors.predicted90d}
Monthly growth rate: ${visitors.growthRatePct > 0 ? '+' : ''}${visitors.growthRatePct.toFixed(1)}%
Current monthly leads: ${leads.currentMonthly}
Projected leads in 90 days: ${leads.predicted90d}
${visitors.milestoneDate ? `Will reach ${visitors.milestoneTarget} monthly visitors by: ${visitors.milestoneDate}` : ''}

Write 2-3 sentences. Be specific with numbers. Be motivating but honest. Do not use em-dashes. Do not start with the business name.`;

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = msg.content[0];
    if (block.type === 'text') return block.text.trim();
    return null;
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    const { userId: clerkUserId, orgId: clerkOrgId } = auth;
    const org = await resolveOrg(clerkUserId!, clerkOrgId ?? null);
    if (!org) return errorResponse('Organization not found', 404);

    // Tier gate: growth and domination only
    if (org.planTier === 'starter') return forbiddenResponse();

    const today = isoToday();
    const sixtyDaysAgo = addDays(today, -60);

    // ── Fetch raw data ──────────────────────────────────────────────────────

    const [snapshots, leadsRows, briefRows, goalsRows] = await Promise.all([
      // GA4 visitor snapshots, last 60 days
      db
        .select({ snapshotDate: analyticsSnapshotsTable.snapshotDate, metrics: analyticsSnapshotsTable.metrics, source: analyticsSnapshotsTable.source })
        .from(analyticsSnapshotsTable)
        .where(
          and(
            eq(analyticsSnapshotsTable.organizationId, org.id),
            gte(analyticsSnapshotsTable.snapshotDate, sixtyDaysAgo),
          ),
        ),
      // Leads, last 60 days
      db
        .select({ createdAt: leadsTable.createdAt })
        .from(leadsTable)
        .where(
          and(
            eq(leadsTable.organizationId, org.id),
            gte(leadsTable.createdAt, new Date(sixtyDaysAgo + 'T00:00:00Z')),
          ),
        ),
      // Last 30 morning briefs for growth score
      db
        .select({ date: morningBriefsTable.date, briefData: morningBriefsTable.briefData })
        .from(morningBriefsTable)
        .where(eq(morningBriefsTable.organizationId, org.id))
        .orderBy(desc(morningBriefsTable.date))
        .limit(30),
      // Goals
      db
        .select()
        .from(growthGoalsTable)
        .where(eq(growthGoalsTable.orgId, org.id)),
    ]);

    // ── Build daily visitor series ──────────────────────────────────────────

    const visitorsByDate = new Map<string, number>();
    for (const snap of snapshots) {
      if (snap.source !== 'ga4') continue;
      const m = (snap.metrics ?? {}) as Ga4DayMetrics;
      const prev = visitorsByDate.get(snap.snapshotDate) ?? 0;
      visitorsByDate.set(snap.snapshotDate, prev + (m.visitors ?? 0));
    }

    const hasRealData = visitorsByDate.size >= 4;
    let isDemo = false;
    let visitorHistory: { date: string; visitors: number }[];

    if (hasRealData) {
      visitorHistory = Array.from(visitorsByDate.entries())
        .map(([date, visitors]) => ({ date, visitors }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      isDemo = true;
      visitorHistory = syntheticVisitorHistory(org.id, org.healthScore, 60);
    }

    // ── Visitor regression ──────────────────────────────────────────────────

    const visitorPts = visitorHistory.map((p, i) => ({ x: i, y: p.visitors }));
    const visitorReg = linearRegression(visitorPts);
    const histLen = visitorHistory.length;

    const currentMonthlyVisitors = visitorHistory
      .slice(-30)
      .reduce((s, p) => s + p.visitors, 0);

    // Daily prediction for next 90 days
    const pred30Visitors = Array.from({ length: 30 }, (_, i) =>
      predict(visitorReg, histLen + i),
    ).reduce((s, v) => s + v, 0);
    const pred90Visitors = Array.from({ length: 90 }, (_, i) =>
      predict(visitorReg, histLen + i),
    ).reduce((s, v) => s + v, 0);

    // Monthly growth rate (slope * 30 / current_monthly_avg)
    const monthlyAvgVisitors = currentMonthlyVisitors / 1;
    const visitorGrowthRatePct = monthlyAvgVisitors > 0
      ? Math.round((visitorReg.slope * 30 / (monthlyAvgVisitors / 30)) * 100 * 10) / 10
      : 0;

    // Milestone: next round number
    const milestoneVisitors = nextMilestone(Math.round(currentMonthlyVisitors), VISITOR_MILESTONES);
    // Solve regression day when cumulative 30-day sum >= milestone
    let visitorMilestoneDate: string | null = null;
    let daysToVisitorMilestone: number | null = null;
    if (visitorReg.slope > 0) {
      // Approximate: find when daily average * 30 >= milestone
      // daily avg = slope * x + intercept
      // milestone / 30 = slope * x + intercept => x = (milestone/30 - intercept) / slope
      const xTarget = (milestoneVisitors / 30 - visitorReg.intercept) / visitorReg.slope;
      const daysOut = Math.round(xTarget - histLen);
      if (daysOut > 0 && daysOut < 730) {
        daysToVisitorMilestone = daysOut;
        visitorMilestoneDate = addDays(today, daysOut);
      }
    }

    // ── Lead regression ─────────────────────────────────────────────────────

    // Bin leads by week (7-day buckets) for regression
    const leadsByWeek = new Map<number, number>();
    for (const lead of leadsRows) {
      const daysAgo = diffDays(lead.createdAt.toISOString().slice(0, 10), today);
      const weekBucket = Math.floor((59 - Math.min(daysAgo, 59)) / 7);
      leadsByWeek.set(weekBucket, (leadsByWeek.get(weekBucket) ?? 0) + 1);
    }
    const totalWeeks = 8;
    const leadPts = Array.from({ length: totalWeeks }, (_, i) => ({
      x: i,
      y: leadsByWeek.get(i) ?? (isDemo ? Math.round(1 + i * 0.4 + Math.random() * 0.5) : 0),
    }));
    const leadReg = linearRegression(leadPts);

    const currentMonthlyLeads = leadsRows.filter((l) => {
      const daysAgo = diffDays(l.createdAt.toISOString().slice(0, 10), today);
      return daysAgo <= 30;
    }).length;

    const pred30Leads = Math.round(Array.from({ length: 4 }, (_, i) =>
      predict(leadReg, totalWeeks + i),
    ).reduce((s, v) => s + v, 0));
    const pred90Leads = Math.round(Array.from({ length: 13 }, (_, i) =>
      predict(leadReg, totalWeeks + i),
    ).reduce((s, v) => s + v, 0));

    const milestoneLead = nextMilestone(currentMonthlyLeads, LEAD_MILESTONES);
    let leadMilestoneDate: string | null = null;
    let daysToLeadMilestone: number | null = null;
    if (leadReg.slope > 0) {
      const xTarget = (milestoneLead / 4 - leadReg.intercept) / leadReg.slope;
      const daysOut = Math.round((xTarget - totalWeeks) * 7);
      if (daysOut > 0 && daysOut < 730) {
        daysToLeadMilestone = daysOut;
        leadMilestoneDate = addDays(today, daysOut);
      }
    }

    const leadGrowthRatePct = currentMonthlyLeads > 0
      ? Math.round((leadReg.slope * 4 / currentMonthlyLeads) * 100 * 10) / 10
      : 0;

    // ── Growth score ────────────────────────────────────────────────────────

    const scoreHistory = briefRows
      .map((b) => ({ date: b.date, score: (b.briefData as MorningBriefData)?.growthScore ?? 0 }))
      .filter((b) => b.score > 0)
      .reverse();

    const currentScore = scoreHistory[scoreHistory.length - 1]?.score ?? org.healthScore;
    const scorePts = scoreHistory.map((p, i) => ({ x: i, y: p.score }));
    const scoreReg = linearRegression(scorePts.length >= 2 ? scorePts : [{ x: 0, y: currentScore }, { x: 1, y: currentScore }]);
    const pred30Score = Math.min(100, Math.round(predict(scoreReg, scorePts.length + 30)));
    const pred90Score = Math.min(100, Math.round(predict(scoreReg, scorePts.length + 90)));
    const nextScoreTarget = Math.min(100, Math.ceil((currentScore + 1) / 10) * 10);

    // ── Build chart data (weekly samples, 60 hist + 90 proj) ───────────────

    const chartData: ChartPoint[] = [];

    // Historical: sample every 7 days from visitor history
    for (let i = 0; i < visitorHistory.length; i += 7) {
      const pt = visitorHistory[i]!;
      chartData.push({
        date: formatChartLabel(pt.date),
        isoDate: pt.date,
        actual: pt.visitors,
        predicted: null,
        upper: null,
        lower: null,
      });
    }
    // Add last historical point (connects to predicted line)
    const lastHist = visitorHistory[visitorHistory.length - 1]!;
    const lastX = visitorHistory.length - 1;
    chartData.push({
      date: formatChartLabel(lastHist.date),
      isoDate: lastHist.date,
      actual: lastHist.visitors,
      predicted: Math.round(predict(visitorReg, lastX)),
      upper: null,
      lower: null,
    });

    // Projected: weekly for 90 days
    for (let d = 7; d <= 91; d += 7) {
      const x = histLen + d;
      const projDate = addDays(today, d);
      const pv = Math.round(predict(visitorReg, x));
      const { upper, lower } = confidenceBand(visitorReg, x);
      chartData.push({
        date: formatChartLabel(projDate),
        isoDate: projDate,
        actual: null,
        predicted: pv,
        upper: Math.round(upper),
        lower: Math.round(lower),
      });
    }

    // Sort by isoDate and deduplicate
    chartData.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    // Deduplicate by isoDate (keep last occurrence which merges actual+predicted at boundary)
    const seen = new Set<string>();
    const deduped: ChartPoint[] = [];
    for (let i = chartData.length - 1; i >= 0; i--) {
      const pt = chartData[i]!;
      if (!seen.has(pt.isoDate)) {
        seen.add(pt.isoDate);
        deduped.unshift(pt);
      }
    }

    // ── Goals progress ──────────────────────────────────────────────────────

    const goals: GoalProgress[] = goalsRows.map((goal) => {
      let currentValue = 0;
      let predictedHitDate: string | null = null;
      let daysRemaining: number | null = null;
      let willBeatTarget = false;

      if (goal.metricType === 'visitors') {
        currentValue = currentMonthlyVisitors;
        if (goal.targetValue > currentValue && visitorReg.slope > 0) {
          const xTarget = (goal.targetValue / 30 - visitorReg.intercept) / visitorReg.slope;
          const days = Math.round(xTarget - histLen);
          if (days > 0 && days < 730) {
            daysRemaining = days;
            predictedHitDate = addDays(today, days);
            willBeatTarget = goal.targetDate
              ? predictedHitDate <= goal.targetDate
              : true;
          }
        } else if (goal.targetValue <= currentValue) {
          predictedHitDate = today;
          daysRemaining = 0;
          willBeatTarget = true;
        }
      } else if (goal.metricType === 'leads') {
        currentValue = currentMonthlyLeads;
        if (goal.targetValue > currentValue && leadReg.slope > 0) {
          const xTarget = (goal.targetValue / 4 - leadReg.intercept) / leadReg.slope;
          const days = Math.round((xTarget - totalWeeks) * 7);
          if (days > 0 && days < 730) {
            daysRemaining = days;
            predictedHitDate = addDays(today, days);
            willBeatTarget = goal.targetDate
              ? predictedHitDate <= goal.targetDate
              : true;
          }
        } else if (goal.targetValue <= currentValue) {
          predictedHitDate = today;
          daysRemaining = 0;
          willBeatTarget = true;
        }
      } else if (goal.metricType === 'score') {
        currentValue = currentScore;
        if (goal.targetValue > currentValue && scoreReg.slope > 0) {
          const xTarget = (goal.targetValue - scoreReg.intercept) / scoreReg.slope;
          const days = Math.round(xTarget - scorePts.length);
          if (days > 0 && days < 730) {
            daysRemaining = days;
            predictedHitDate = addDays(today, days);
            willBeatTarget = goal.targetDate
              ? predictedHitDate <= goal.targetDate
              : true;
          }
        } else if (goal.targetValue <= currentValue) {
          predictedHitDate = today;
          daysRemaining = 0;
          willBeatTarget = true;
        }
      }

      return {
        id: goal.id,
        metricType: goal.metricType,
        targetValue: goal.targetValue,
        targetDate: goal.targetDate ?? null,
        currentValue,
        predictedHitDate,
        daysRemaining,
        willBeatTarget,
      };
    });

    // ── Assemble metric objects ─────────────────────────────────────────────

    const visitors: MetricPrediction = {
      currentMonthly: currentMonthlyVisitors,
      predicted30d: Math.round(pred30Visitors),
      predicted90d: Math.round(pred90Visitors),
      growthRatePct: visitorGrowthRatePct,
      confidence: Math.round(visitorReg.rSquared * 100) / 100,
      milestoneTarget: milestoneVisitors,
      milestoneDate: visitorMilestoneDate,
      daysToMilestone: daysToVisitorMilestone,
    };

    const leadsMetric: MetricPrediction = {
      currentMonthly: currentMonthlyLeads,
      predicted30d: pred30Leads,
      predicted90d: pred90Leads,
      growthRatePct: leadGrowthRatePct,
      confidence: Math.round(leadReg.rSquared * 100) / 100,
      milestoneTarget: milestoneLead,
      milestoneDate: leadMilestoneDate,
      daysToMilestone: daysToLeadMilestone,
    };

    // ── Claude narrative ────────────────────────────────────────────────────

    const narrative = await generateNarrative(org.name, visitors, leadsMetric, isDemo);

    const response: PredictionsResponse = {
      chartData: deduped,
      visitors,
      leads: leadsMetric,
      score: {
        current: currentScore,
        predicted30d: pred30Score,
        predicted90d: pred90Score,
        nextTarget: nextScoreTarget,
      },
      goals,
      narrative,
      isDemo,
      generatedAt: new Date().toISOString(),
    };

    return jsonResponse(response);
  } catch (err) {
    console.error('GET /api/portal/predictions error:', err);
    return errorResponse('Internal server error', 500);
  }
}
