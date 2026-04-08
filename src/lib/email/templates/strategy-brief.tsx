import React from "react";
import { EmailLayout } from "./layout";

interface StrategyBriefEmailProps {
  organizationName: string;
  monthLabel: string;
  briefLink: string;
  previewAccomplishments?: string;
}

export function StrategyBriefEmail({
  organizationName,
  monthLabel,
  briefLink,
  previewAccomplishments,
}: StrategyBriefEmailProps) {
  return (
    <EmailLayout previewText={`Your ${monthLabel} strategy brief is ready — review before your call`}>
      <h2 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "22px" }}>
        Your Strategy Brief is Ready
      </h2>
      <p style={{ margin: "0 0 24px 0", color: "#6b7280", fontSize: "14px" }}>
        {monthLabel} · {organizationName}
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "#93c5fd", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          Monthly Strategy Brief
        </p>
        <p style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>
          {monthLabel}
        </p>
        <p style={{ margin: "0", fontSize: "13px", color: "#bfdbfe" }}>
          {organizationName}
        </p>
      </div>

      <p style={{ margin: "0 0 16px 0", color: "#374151", lineHeight: "1.6" }}>
        Your AI-powered strategy brief for <strong>{monthLabel}</strong> has been generated
        and is ready to review before your monthly call with the CWS team.
      </p>

      <p style={{ margin: "0 0 20px 0", color: "#374151", lineHeight: "1.6" }}>
        The brief covers:
      </p>

      <ul style={{ margin: "0 0 24px 0", paddingLeft: "0", listStyle: "none" }}>
        {[
          { icon: "✅", label: "What We Did This Month", desc: "Accomplishments and completed work" },
          { icon: "📈", label: "What Moved", desc: "Metric changes and impact analysis" },
          { icon: "🎯", label: "What We Recommend Next", desc: "Prioritized action items for next month" },
        ].map((item) => (
          <li
            key={item.label}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px 16px",
              background: "#f9fafb",
              borderRadius: "6px",
              marginBottom: "8px",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ margin: "0 0 2px 0", fontWeight: "600", color: "#1f2937", fontSize: "14px" }}>
                {item.label}
              </p>
              <p style={{ margin: "0", color: "#6b7280", fontSize: "13px" }}>
                {item.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {previewAccomplishments && (
        <div
          style={{
            background: "#f0f9ff",
            borderRadius: "6px",
            padding: "16px",
            marginBottom: "24px",
            borderLeft: "4px solid #0ea5e9",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#0369a1", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
            Highlights
          </p>
          <p style={{ margin: "0", color: "#374151", fontSize: "13px", lineHeight: "1.6" }}>
            {previewAccomplishments.substring(0, 200)}
            {previewAccomplishments.length > 200 ? "..." : ""}
          </p>
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        <a
          href={briefLink}
          style={{
            display: "inline-block",
            backgroundColor: "#1d4ed8",
            color: "#ffffff",
            padding: "14px 28px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          View Strategy Brief →
        </a>
      </div>

      <p
        style={{
          margin: "24px 0 0 0",
          fontSize: "12px",
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
          lineHeight: "1.5",
        }}
      >
        This brief is generated automatically at the start of each month using your portal data.
        Review it before your strategy call to make the most of your time with the CWS team.
      </p>
    </EmailLayout>
  );
}
