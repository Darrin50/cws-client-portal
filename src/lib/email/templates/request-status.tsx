import React from "react";
import { EmailLayout } from "./layout";

interface RequestStatusEmailProps {
  pageName: string;
  status: "open" | "in-progress" | "resolved";
  pageLink: string;
  resolutionNote?: string;
}

export function RequestStatusEmail({
  pageName,
  status,
  pageLink,
  resolutionNote,
}: RequestStatusEmailProps) {
  const statusColors = {
    open: "#ef4444",
    "in-progress": "#f59e0b",
    resolved: "#10b981",
  };

  const statusLabels = {
    open: "Open",
    "in-progress": "In Progress",
    resolved: "Resolved",
  };

  return (
    <EmailLayout previewText={`Your request has been ${statusLabels[status]}`}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        Request Update
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        Your request on <strong>{pageName}</strong> has been updated.
      </p>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "20px",
          borderLeft: `4px solid ${statusColors[status]}`,
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
          STATUS
        </p>
        <p
          style={{
            margin: "0",
            fontSize: "18px",
            fontWeight: "600",
            color: statusColors[status],
          }}
        >
          {statusLabels[status]}
        </p>
      </div>

      {resolutionNote && (
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
            RESOLUTION NOTE
          </p>
          <p
            style={{
              margin: "0",
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {resolutionNote}
          </p>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <a
          href={pageLink}
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
          View Details
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
        This is an automated message from Caliber Web Studio Portal. Do not reply
        directly to this email.
      </p>
    </EmailLayout>
  );
}
