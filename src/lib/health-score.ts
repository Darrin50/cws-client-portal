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
  // Points distribution
  const weights = {
    uptime: 25,
    speed: 20,
    seo: 20,
    ssl: 10,
    freshness: 15,
    analytics: 10,
  };

  // Calculate uptime score (0-25 points)
  // Uptime percentage to points conversion
  const uptimeScore = Math.round((metrics.uptime || 0) * 0.25);

  // Calculate speed score (0-20 points)
  // Page speed in ms - ideal is under 2 seconds
  const speedMs = metrics.pageSpeed || 5000;
  let speedScore = 20;
  if (speedMs > 2000) {
    speedScore = Math.max(0, 20 - Math.floor((speedMs - 2000) / 250));
  }

  // SEO score (0-20 points)
  // Score from 0-100, scaled to 0-20
  const seoScore = Math.round((metrics.seoScore || 0) * 0.2);

  // SSL certificate (0-10 points)
  const sslScore = metrics.sslCertificate ? 10 : 0;

  // Content freshness (0-15 points)
  // Days since last update - ideal is within 7 days
  const freshnessScore = Math.round((metrics.contentFreshness || 0) * 0.15);

  // Analytics tracking (0-10 points)
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

export function getHealthGrade(score: number): {
  grade: "A" | "B" | "C" | "D" | "F";
  color: string;
  status: string;
} {
  if (score >= 90) {
    return { grade: "A", color: "#10b981", status: "Excellent" };
  } else if (score >= 80) {
    return { grade: "B", color: "#3b82f6", status: "Good" };
  } else if (score >= 70) {
    return { grade: "C", color: "#f59e0b", status: "Fair" };
  } else if (score >= 60) {
    return { grade: "D", color: "#ef5350", status: "Poor" };
  } else {
    return { grade: "F", color: "#dc2626", status: "Critical" };
  }
}

export function getHealthRecommendations(
  score: HealthScoreBreakdown
): string[] {
  const recommendations: string[] = [];

  if (score.uptime < 20) {
    recommendations.push(
      "Improve uptime - consider upgrading your hosting or implementing redundancy"
    );
  }

  if (score.speed < 15) {
    recommendations.push(
      "Optimize page speed - minify assets, enable caching, and optimize images"
    );
  }

  if (score.seo < 15) {
    recommendations.push(
      "Improve SEO - add meta tags, optimize content, and fix any crawl errors"
    );
  }

  if (score.ssl === 0) {
    recommendations.push("Enable SSL/TLS certificate for secure connections");
  }

  if (score.freshness < 12) {
    recommendations.push(
      "Update your content regularly - aim for updates at least monthly"
    );
  }

  if (score.analytics === 0) {
    recommendations.push(
      "Enable analytics tracking to monitor your site performance"
    );
  }

  return recommendations;
}
