import React from "react";

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #1f2937;
              color: #ffffff;
              padding: 32px;
              text-align: center;
              border-bottom: 4px solid #3b82f6;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content {
              padding: 32px;
              color: #374151;
              line-height: 1.6;
            }
            .footer {
              background-color: #f9fafb;
              padding: 24px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
            }
            .unsubscribe {
              color: #3b82f6;
              text-decoration: none;
            }
            .logo {
              font-weight: 700;
              font-size: 20px;
              color: #3b82f6;
            }
          `}
        </style>
      </head>
      <body>
        {previewText && (
          <div style={{ display: "none" }}>
            {previewText}
          </div>
        )}
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "#1f2937",
              color: "#ffffff",
              padding: "32px",
              textAlign: "center",
              borderBottom: "4px solid #3b82f6",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "20px", color: "#3b82f6" }}>
              CWS Portal
            </div>
          </div>

          <div style={{ padding: "32px", color: "#374151", lineHeight: "1.6" }}>
            {children}
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "24px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "12px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p style={{ margin: "0 0 12px 0" }}>
              Caliber Web Studio Client Portal
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              <a
                href="https://cwsportal.com/preferences"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                }}
              >
                Manage Preferences
              </a>
              {" | "}
              <a
                href="https://cwsportal.com/unsubscribe"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                }}
              >
                Unsubscribe
              </a>
            </p>
            <p style={{ margin: "0" }}>
              2024 Caliber Web Studio. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
