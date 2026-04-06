import React from "react";
import { EmailLayout } from "./layout";

interface NewMessageEmailProps {
  senderName: string;
  messagePreview: string;
  messageLink: string;
  subject?: string;
}

export function NewMessageEmail({
  senderName,
  messagePreview,
  messageLink,
  subject,
}: NewMessageEmailProps) {
  return (
    <EmailLayout previewText={`New message from ${senderName}`}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        New Message
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        You have a new message from <strong>{senderName}</strong>.
      </p>

      {subject && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
            SUBJECT
          </p>
          <p style={{ margin: "0", fontWeight: "600", color: "#1f2937" }}>
            {subject}
          </p>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "20px",
          borderLeft: "4px solid #3b82f6",
        }}
      >
        <p style={{ margin: "0", color: "#374151", lineHeight: "1.5" }}>
          {messagePreview}
        </p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <a
          href={messageLink}
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
          Read Full Message
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
