import React from "react";

export interface WeeklyDigestData {
  orgName: string;
  weekStart: string; // e.g. "Apr 1"
  weekEnd: string;   // e.g. "Apr 7"
  year: number;
  // Traffic
  visitors: number;
  visitorsChange: number; // percentage change vs prior week
  pageviews: number;
  // Leads
  newLeads: number;
  // Growth score
  growthScore: number;
  growthScoreDelta: number; // +/- pts vs last week
  // Activity
  messagesSent: number;
  requestsDone: number;
  pagesUpdated: number;
  // Milestones hit this week
  milestones: string[];
  // Recommendations / focus items
  recommendations: string[];
  // Unsubscribe token
  unsubscribeUrl: string;
  preferencesUrl: string;
  appUrl: string;
}

function scoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#84cc16";
  if (score >= 50) return "#fbbf24";
  if (score >= 30) return "#f97316";
  return "#dc2626";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Needs Work";
  return "Critical";
}

function deltaText(delta: number, suffix = ""): string {
  if (delta > 0) return `+${delta}${suffix}`;
  if (delta < 0) return `${delta}${suffix}`;
  return `—`;
}

function deltaColor(delta: number): string {
  if (delta > 0) return "#22c55e";
  if (delta < 0) return "#ef4444";
  return "#94a3b8";
}

export function WeeklyDigestEmail({ d }: { d: WeeklyDigestData }) {
  const sc = scoreColor(d.growthScore);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>

        {/* Preheader (hidden preview text) */}
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", color: "#f1f5f9" }}>
          Your weekly portal digest — {d.weekStart}–{d.weekEnd} · {d.orgName}
        </div>

        {/* Wrapper */}
        <table cellPadding={0} cellSpacing={0} style={{ width: "100%", backgroundColor: "#f1f5f9" }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>

                {/* Card */}
                <table cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, width: "100%", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                  <tbody>

                    {/* ── Header ────────────────────────────────────────── */}
                    <tr>
                      <td style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #131b2e 100%)", padding: "28px 32px 24px" }}>
                        <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td>
                                <div style={{ fontWeight: 800, fontSize: 18, color: "#2563eb", letterSpacing: "-0.3px" }}>
                                  CWS Portal
                                </div>
                                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  Caliber Web Studio
                                </div>
                              </td>
                              <td align="right">
                                <div style={{ backgroundColor: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "4px 12px", display: "inline-block", color: "#93c5fd", fontSize: 11, fontWeight: 600 }}>
                                  Weekly Digest
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div style={{ marginTop: 20 }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
                            Your Week in Review
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                            {d.weekStart}–{d.weekEnd}, {d.year} &nbsp;·&nbsp; {d.orgName}
                          </div>
                        </div>

                        {/* Accent bar */}
                        <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb, #0d9488)", borderRadius: 2, marginTop: 20 }} />
                      </td>
                    </tr>

                    {/* ── Body ──────────────────────────────────────────── */}
                    <tr>
                      <td style={{ padding: "28px 32px" }}>

                        {/* ── Top metrics row ── */}
                        <table cellPadding={0} cellSpacing={0} style={{ width: "100%", marginBottom: 24 }}>
                          <tbody>
                            <tr>
                              {/* Visitors */}
                              <td style={{ width: "33.3%", paddingRight: 8 }}>
                                <MetricCard
                                  label="Visitors"
                                  value={d.visitors.toLocaleString()}
                                  change={deltaText(d.visitorsChange, "%")}
                                  changeColor={deltaColor(d.visitorsChange)}
                                  accent="#2563eb"
                                />
                              </td>
                              {/* New Leads */}
                              <td style={{ width: "33.3%", paddingRight: 4, paddingLeft: 4 }}>
                                <MetricCard
                                  label="New Leads"
                                  value={String(d.newLeads)}
                                  change={d.newLeads > 0 ? "this week" : "no new leads"}
                                  changeColor="#94a3b8"
                                  accent="#0d9488"
                                />
                              </td>
                              {/* Growth Score */}
                              <td style={{ width: "33.3%", paddingLeft: 8 }}>
                                <MetricCard
                                  label="Growth Score"
                                  value={`${d.growthScore}`}
                                  change={deltaText(d.growthScoreDelta, " pts")}
                                  changeColor={deltaColor(d.growthScoreDelta)}
                                  accent={sc}
                                  subNote={scoreLabel(d.growthScore)}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* ── Activity summary ── */}
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 24, border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                            This Week's Activity
                          </div>
                          <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                            <tbody>
                              <tr>
                                <ActivityRow emoji="💬" label="Messages with your team" value={d.messagesSent} />
                              </tr>
                              <tr>
                                <ActivityRow emoji="✅" label="Requests completed" value={d.requestsDone} />
                              </tr>
                              <tr>
                                <ActivityRow emoji="📝" label="Pages updated" value={d.pagesUpdated} isLast />
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* ── Milestones ── */}
                        {d.milestones.length > 0 && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                              🏆 Milestones Hit
                            </div>
                            {d.milestones.map((m, i) => (
                              <div
                                key={i}
                                style={{
                                  backgroundColor: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  borderLeft: "4px solid #22c55e",
                                  borderRadius: "0 8px 8px 0",
                                  padding: "10px 14px",
                                  marginBottom: 6,
                                  fontSize: 13,
                                  color: "#14532d",
                                  lineHeight: 1.5,
                                }}
                              >
                                🎉 {m}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── Recommendations ── */}
                        {d.recommendations.length > 0 && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                              💡 Recommendations
                            </div>
                            {d.recommendations.map((r, i) => (
                              <div
                                key={i}
                                style={{
                                  backgroundColor: "#fffbeb",
                                  border: "1px solid #fde68a",
                                  borderLeft: "4px solid #f59e0b",
                                  borderRadius: "0 8px 8px 0",
                                  padding: "10px 14px",
                                  marginBottom: 6,
                                  fontSize: 13,
                                  color: "#78350f",
                                  lineHeight: 1.5,
                                }}
                              >
                                {r}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── CTA ── */}
                        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 4 }}>
                          <a
                            href={d.appUrl}
                            style={{
                              display: "inline-block",
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              fontWeight: 700,
                              fontSize: 14,
                              textDecoration: "none",
                              borderRadius: 10,
                              padding: "13px 32px",
                            }}
                          >
                            View Your Dashboard →
                          </a>
                        </div>

                      </td>
                    </tr>

                    {/* ── Footer ──────────────────────────────────────────── */}
                    <tr>
                      <td style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "20px 32px", textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
                          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                            Caliber Web Studio Client Portal
                          </div>
                          <div>
                            <a href={d.preferencesUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
                              Manage Preferences
                            </a>
                            {" · "}
                            <a href={d.unsubscribeUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
                              Unsubscribe
                            </a>
                          </div>
                          <div style={{ marginTop: 6 }}>
                            © {d.year} Caliber Web Studio. All rights reserved.
                          </div>
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  changeColor,
  accent,
  subNote,
}: {
  label: string;
  value: string;
  change: string;
  changeColor: string;
  accent: string;
  subNote?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderTop: `3px solid ${accent}`,
        borderRadius: "0 0 10px 10px",
        padding: "14px 12px 12px",
        textAlign: "center" as const,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginTop: 4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 11, color: changeColor, fontWeight: 600, marginTop: 3 }}>{change}</div>
      {subNote && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{subNote}</div>}
    </div>
  );
}

function ActivityRow({
  emoji,
  label,
  value,
  isLast,
}: {
  emoji: string;
  label: string;
  value: number;
  isLast?: boolean;
}) {
  return (
    <td style={{ paddingBottom: isLast ? 0 : 8 }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ fontSize: 13, color: "#475569" }}>
              <span style={{ marginRight: 6 }}>{emoji}</span>
              {label}
            </td>
            <td align="right" style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {value}
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}
