import React from "react";
import { EmailLayout } from "./layout";

interface WelcomeEmailProps {
  organizationName: string;
  userName: string;
  dashboardLink: string;
}

export function WelcomeEmail({
  organizationName,
  userName,
  dashboardLink,
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to Caliber Web Studio Portal">
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        Welcome to CWS Portal, {userName}!
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        You've been invited to the CWS Portal for <strong>{organizationName}</strong>.
        We're excited to have you on board!
      </p>

      <h3 style={{ margin: "24px 0 12px 0", color: "#1f2937", fontSize: "16px" }}>
        Getting Started
      </h3>

      <ol style={{ margin: "0 0 20px 0", paddingLeft: "20px", color: "#374151" }}>
        <li style={{ marginBottom: "8px" }}>
          <strong>Access Your Dashboard</strong> - Log in to view your portal
        </li>
        <li style={{ marginBottom: "8px" }}>
          <strong>Review Your Pages</strong> - See all pages under management
        </li>
        <li style={{ marginBottom: "8px" }}>
          <strong>Submit Requests</strong> - Add comments and requests to pages
        </li>
        <li style={{ marginBottom: "8px" }}>
          <strong>Track Progress</strong> - Monitor the status of your requests
        </li>
      </ol>

      <div style={{ marginTop: "24px" }}>
        <a
          href={dashboardLink}
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
          Go to Dashboard
        </a>
      </div>

      <div
        style={{
          backgroundColor: "#f0f9ff",
          padding: "16px",
          borderRadius: "6px",
          marginTop: "24px",
          borderLeft: "4px solid #0ea5e9",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#1f2937" }}>
          Need Help?
        </p>
        <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
          Check out our{" "}
          <a href="https://cwsportal.com/help" style={{ color: "#3b82f6" }}>
            help center
          </a>
          {" "}or contact support at{" "}
          <a href="mailto:support@cwsportal.com" style={{ color: "#3b82f6" }}>
            support@cwsportal.com
          </a>
        </p>
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
