import { db } from '@/db';
import { commentsTable, analyticsSnapshotsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface HealthMetrics {
  uptime?: number;
  pageSpeed?: number;
  seoScore?: number;
  sslCertificate?: boolean;
  contentFreshness?: number;
  analyticsTracking?: boolean;
}

interface HealthScoreBreakdown {
  totalScore: number;
  uptime: number;
  speed: number;
  seo: number;
  ssl: number;
  freshness: number;
  analytics: number;
  breakdown: Record<string, { score: number; weight: number }>;
}

export function calculateHealthScore(metrics: HealthMetrics): HealthScoreBreakdown {
  const weights = {
    uptime: 25,
    speed: 20,
    seo: 20,
    ssl: 10,
    freshness: 15,
    analytics: 10,
  };

  // Uptime (0-25 points): uptime percentage × 0.25
  const uptimeScore = Math.round((metrics.uptime || 0) * 0.25);

  // Speed (0-20 points): ideal < 2000ms
  const speedMs = metrics.pageSpeed || 5000;
  let speedScore = 20;
  if (speedMs > 2000) {
    speedScore = Math.max(0, 20 - Math.floor((speedMs - 2000) / 250));
  }

  // SEO (0-20 points): score 0-100, scaled
  const seoScore = Math.round((metrics.seoScore || 0) * 0.2);

  // SSL (0-10 points)
  const sslScore = metrics.sslCertificate ? 10 : 0;

  // Content freshness (0-15 points): freshness 0-100, scaled
  const freshnessScore = Math.round((metrics.contentFreshness || 0) * 0.15);

  // Analytics (0-10 points)
  const analyticsScore = metrics.analyticsTracking ? 10 : 0;

  const totalScore =
    uptimeScore + speedScore + seoScore + sslScore + freshnessScore + analyticsScore;

  return {
    totalScore: Math.min(100, totalScore),
    uptime: uptimeScore,
    speed: speedScore,
    seo: seoScore,
    ssl: sslScore,
    freshness: freshnessScore,
    analytics: analyticsScore,
    breakdown: {
      uptime: { score: uptimeScore, weight: weights.uptime },
      speed: { score: speedScore, weight: weights.speed },
      seo: { score: seoScore, weight: weights.seo },
      ssl: { score: sslScore, weight: weights.ssl },
      freshness: { score: freshnessScore, weight: weights.freshness },
      analytics: { score: analyticsScore, weight: weights.analytics },
    },
  };
}

/**
 * Calculate the content freshness score (0-100) based on the most recently
 * completed comment/revision for an org.
 */
function calculateFreshnessScore(lastCompletedAt: Date | null): number {
  if (!lastCompletedAt) return 0;

  const daysSince = Math.floor(
    (Date.now() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 7) return 100;
  if (daysSince <= 30) return 66;
  if (daysSince <= 90) return 33;
  return 0;
}

/**
 * Calculate health score for a specific organization using DB data.
 * External checks (uptime, page speed, SEO, SSL) are stubbed with reasonable defaults.
 */
export async function calculateOrgHealthScore(orgId: string): Promise<HealthScoreBreakdown> {
  // Get last completed comment for content freshness
  const lastCompleted = await db.query.commentsTable.findFirst({
    where: and(
      eq(commentsTable.organizationId, orgId),
      eq(commentsTable.status, 'completed')
    ),
    orderBy: [desc(commentsTable.completedAt)],
    columns: { completedAt: true },
  });

  // Check if GA4 analytics snapshots exist
  const ga4Snapshot = await db.query.analyticsSnapshotsTable.findFirst({
    where: and(
      eq(analyticsSnapshotsTable.organizationId, orgId),
      eq(analyticsSnapshotsTable.source, 'ga4')
    ),
    columns: { id: true },
  });

  const freshnessScore = calculateFreshnessScore(
    lastCompleted?.completedAt ?? null
  );
  const analyticsConnected = ga4Snapshot !== null && ga4Snapshot !== undefined;

  // Stub external checks with reasonable defaults
  const metrics: HealthMetrics = {
    uptime: 88,           // 88% → 22pts
    pageSpeed: 2200,      // slightly over ideal → 18pts
    seoScore: 75,         // decent SEO → 15pts
    sslCertificate: true, // assume SSL → 10pts
    contentFreshness: freshnessScore,
    analyticsTracking: analyticsConnected,
  };

  return calculateHealthScore(metrics);
}

export function getHealthGrade(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  status: string;
} {
  if (score >= 90) return { grade: 'A', color: '#10b981', status: 'Excellent' };
  if (score >= 80) return { grade: 'B', color: '#3b82f6', status: 'Good' };
  if (score >= 70) return { grade: 'C', color: '#f59e0b', status: 'Fair' };
  if (score >= 60) return { grade: 'D', color: '#ef5350', status: 'Poor' };
  return { grade: 'F', color: '#dc2626', status: 'Critical' };
}

export function getHealthRecommendations(score: HealthScoreBreakdown): string[] {
  const recommendations: string[] = [];

  if (score.uptime < 20) {
    recommendations.push(
      'Improve uptime - consider upgrading your hosting or implementing redundancy'
    );
  }

  if (score.speed < 15) {
    recommendations.push(
      'Optimize page speed - minify assets, enable caching, and optimize images'
    );
  }

  if (score.seo < 15) {
    recommendations.push(
      'Improve SEO - add meta tags, optimize content, and fix any crawl errors'
    );
  }

  if (score.ssl === 0) {
    recommendations.push('Enable SSL/TLS certificate for secure connections');
  }

  if (score.freshness < 12) {
    recommendations.push(
      'Update your content regularly - aim for updates at least monthly'
    );
  }

  if (score.analytics === 0) {
    recommendations.push(
      'Enable analytics tracking to monitor your site performance'
    );
  }

  return recommendations;
}
