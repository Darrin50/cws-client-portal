import React from "react";
import { EmailLayout } from "./layout";

interface ReferralInviteEmailProps {
  referrerName: string;
  referrerOrgName: string;
  referralLink: string;
  reward?: string;
}

export function ReferralInviteEmail({
  referrerName,
  referrerOrgName,
  referralLink,
  reward = "1 month free",
}: ReferralInviteEmailProps) {
  return (
    <EmailLayout
      previewText={`${referrerName} thinks Caliber Web Studio could grow your business too`}
    >
      <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        A personal recommendation for you
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        <strong>{referrerName}</strong> from <strong>{referrerOrgName}</strong>{" "}
        thinks your business could benefit from the same growth system they use at
        Caliber Web Studio.
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          What you get
        </p>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#1f2937" }}>
          <li style={{ marginBottom: "8px" }}>
            A done-for-you website that converts visitors into leads
          </li>
          <li style={{ marginBottom: "8px" }}>
            Monthly SEO, local search, and AI-search optimization
          </li>
          <li style={{ marginBottom: "8px" }}>
            A real-time client portal showing your growth score
          </li>
          <li style={{ marginBottom: "8px" }}>
            A dedicated team handling your web presence end to end
          </li>
        </ul>
      </div>

      {reward && (
        <div
          style={{
            backgroundColor: "#fefce8",
            border: "1px solid #fde047",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "24px" }}>🎁</span>
          <div>
            <p style={{ margin: "0 0 4px 0", fontWeight: 700, color: "#854d0e", fontSize: "15px" }}>
              Special offer
            </p>
            <p style={{ margin: "0", color: "#92400e", fontSize: "14px" }}>
              Sign up through this referral and receive{" "}
              <strong>{reward}</strong> of service on us.
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <a
          href={referralLink}
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.02em",
          }}
        >
          Claim Your Offer →
        </a>
      </div>

      <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "13px" }}>
        Or copy and paste this link in your browser:
      </p>
      <p
        style={{
          margin: "0 0 24px 0",
          wordBreak: "break-all",
          color: "#2563eb",
          fontSize: "13px",
        }}
      >
        {referralLink}
      </p>

      <p
        style={{
          margin: "0",
          color: "#9ca3af",
          fontSize: "12px",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}
      >
        You received this email because {referrerName} at {referrerOrgName}{" "}
        referred you to Caliber Web Studio. If this doesn&apos;t interest you,
        feel free to ignore it — no further emails will be sent.
      </p>
    </EmailLayout>
  );
}
