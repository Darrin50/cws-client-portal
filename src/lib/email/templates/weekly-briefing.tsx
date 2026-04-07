import React from 'react';
import { EmailLayout } from './layout';
import type { WeekInReviewData } from '@/components/dashboard/week-in-review';

interface WeeklyBriefingEmailProps {
  orgName: string;
  data: WeekInReviewData;
}

export function WeeklyBriefingEmail({ orgName, data }: WeeklyBriefingEmailProps) {
  return (
    <EmailLayout previewText={`Your Caliber Weekly — ${data.weekStart}–${data.weekEnd}`}>
      {/* Header greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
          Your Caliber Weekly
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          {data.weekStart} – {data.weekEnd} · {orgName}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0d9488, #10B981)', borderRadius: '2px', marginBottom: '28px' }} />

      {/* Stats grid */}
      <table
        cellPadding={0}
        cellSpacing={0}
        style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}
      >
        <tbody>
          <tr>
            <td style={{ width: '50%', paddingRight: '8px', paddingBottom: '8px' }}>
              <StatCell label="Messages" value={data.messagesSent} sub="this week" />
            </td>
            <td style={{ width: '50%', paddingLeft: '8px', paddingBottom: '8px' }}>
              <StatCell
                label="Requests Done"
                value={data.requestsDone}
                sub={data.requestsOpen > 0 ? `${data.requestsOpen} still open` : 'all clear'}
              />
            </td>
          </tr>
          <tr>
            <td style={{ width: '50%', paddingRight: '8px' }}>
              <StatCell label="Pages Updated" value={data.pagesUpdated} sub="this week" />
            </td>
            <td style={{ width: '50%', paddingLeft: '8px' }}>
              <StatCell label="Days Active" value={data.daysActive} sub="out of 7" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
            This Week&apos;s Insights
          </p>
          {data.insights.map((insight, i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                marginBottom: '8px',
                borderLeft: `4px solid ${insight.type === 'warning' ? '#F59E0B' : '#10B981'}`,
                backgroundColor: insight.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                borderRadius: '0 8px 8px 0',
                fontSize: '13px',
                color: insight.type === 'warning' ? '#92400e' : '#14532d',
                lineHeight: '1.5',
              }}
            >
              {insight.type === 'warning' ? '💡 ' : '🎉 '}
              {insight.text}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <a
          href={process.env.NEXT_PUBLIC_APP_URL ?? 'https://cwsportal.com'}
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            borderRadius: '8px',
          }}
        >
          View Your Dashboard →
        </a>
      </div>
    </EmailLayout>
  );
}

function StatCell({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center' as const,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}
