import React from "react";
import { EmailLayout } from "./layout";

interface PaymentFailedEmailProps {
  organizationName: string;
  amount: number;
  paymentLink: string;
}

export function PaymentFailedEmail({
  organizationName,
  amount,
  paymentLink,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout previewText="Payment failed - action required">
      <h2 style={{ margin: "0 0 16px 0", color: "#ef4444" }}>
        Payment Failed
      </h2>

      <p style={{ margin: "0 0 20px 0", color: "#6b7280" }}>
        We weren't able to process the payment for <strong>{organizationName}</strong>.
        Please update your payment method to avoid service interruption.
      </p>

      <div
        style={{
          backgroundColor: "#fef2f2",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "20px",
          borderLeft: "4px solid #ef4444",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#991b1b" }}>
          OUTSTANDING AMOUNT
        </p>
        <p
          style={{
            margin: "0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#dc2626",
          }}
        >
          ${(amount / 100).toFixed(2)}
        </p>
      </div>

      <p
        style={{
          margin: "0 0 16px 0",
          padding: "12px",
          backgroundColor: "#fef2f2",
          borderRadius: "4px",
          color: "#991b1b",
          fontSize: "14px",
        }}
      >
        If payment is not received within 7 days, your service may be suspended.
      </p>

      <div style={{ marginTop: "24px" }}>
        <a
          href={paymentLink}
          style={{
            display: "inline-block",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Update Payment Method
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
        If you believe this is an error or have questions, please contact support at{" "}
        <a href="mailto:support@cwsportal.com" style={{ color: "#3b82f6" }}>
          support@cwsportal.com
        </a>
      </p>
    </EmailLayout>
  );
}
