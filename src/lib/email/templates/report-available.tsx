import React from "react";
import { EmailLayout } from "./layout";

interface ReportAvailableEmailProps {
  organizationName: string;
  reportPeriod: string;
  reportLink: string;
  summary?: string;
}

export function ReportAvailableEmail({
  organizationName,
  reportPeriod,
  reportLink,
  summary,
}: ReportAvailableEmailProps) {
  return (
    <EmailLayout previewText={`Your ${reportPeriod} report is ready`}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        Your Report is Ready
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        The {reportPeriod} report for <strong>{organizationName}</strong> has been
        generated and is ready for review.
      </p>

      <div
        style={{
          backgroundColor: "#f0f9ff",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "20px",
          borderLeft: "4px solid #0ea5e9",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
          REPORT PERIOD
        </p>
        <p style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
          {reportPeriod}
        </p>
      </div>

      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
            SUMMARY
          </p>
          <p style={{ margin: "0", color: "#374151", lineHeight: "1.5" }}>
            {summary}
          </p>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <a
          href={reportLink}
          style={{
            display: "inline-block",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Download Report
        </a>
      </div>

      <p
        style={{
          margin: "24px 0 0 0",
          fontSize: "12px",
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}
      >
        Reports are automatically generated and sent to your account. You can also
        access them anytime in your portal.
      </p>
    </EmailLayout>
  );
}
