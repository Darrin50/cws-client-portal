import React from "react";
import { EmailLayout } from "./layout";

interface TeamInviteEmailProps {
  inviterName: string;
  organizationName: string;
  joinLink: string;
  role?: string;
}

export function TeamInviteEmail({
  inviterName,
  organizationName,
  joinLink,
  role,
}: TeamInviteEmailProps) {
  return (
    <EmailLayout previewText={`${inviterName} invited you to join ${organizationName}`}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        You're Invited!
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{organizationName}</strong> on Caliber Web Studio Portal.
      </p>

      {role && (
        <div
          style={{
            backgroundColor: "#f3f4f6",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
            YOUR ROLE
          </p>
          <p style={{ margin: "0", fontWeight: "600", color: "#1f2937" }}>
            {role}
          </p>
        </div>
      )}

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        Once you join, you'll be able to:
      </p>

      <ul style={{ margin: "0 0 20px 0", paddingLeft: "20px", color: "#374151" }}>
        <li style={{ marginBottom: "8px" }}>View and comment on pages</li>
        <li style={{ marginBottom: "8px" }}>Submit requests and feedback</li>
        <li style={{ marginBottom: "8px" }}>Track the status of your work</li>
        <li style={{ marginBottom: "8px" }}>Download reports and assets</li>
      </ul>

      <div style={{ marginTop: "24px" }}>
        <a
          href={joinLink}
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
          Accept Invitation
        </a>
      </div>

      <p style={{ margin: "16px 0 0 0", color: "#6b7280" }}>
        Or copy and paste this link in your browser:{" "}
        <span style={{ wordBreak: "break-all", color: "#3b82f6" }}>
          {joinLink}
        </span>
      </p>

      <p
        style={{
          margin: "24px 0 0 0",
          fontSize: "12px",
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}
      >
        This invitation expires in 30 days. If you don't recognize the sender or
        organization, you can safely ignore this email.
      </p>
    </EmailLayout>
  );
}
