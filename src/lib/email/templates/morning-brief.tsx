import React from 'react';
import { EmailLayout } from './layout';
import type { MorningBriefData } from '@/db/schema/morning-briefs';

interface MorningBriefEmailProps {
  data: MorningBriefData;
  aiSummary: string | null;
}

export function MorningBriefEmail({ data, aiSummary }: MorningBriefEmailProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cwsportal.com';

  const summary = aiSummary ?? buildFallbackSummary(data);

  return (
    <EmailLayout previewText={`Your Morning Brief is ready — ${data.newLeadsOvernight} new lead${data.newLeadsOvernight !== 1 ? 's' : ''} overnight`}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', borderRadius: '6px', padding: '4px 10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Morning Brief
          </span>
        </div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
          {greeting}. Here&rsquo;s your business overnight.
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          {data.orgName}
        </p>
      </div>

      {/* Gradient divider */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '2px', marginBottom: '28px' }} />

      {/* AI summary */}
      {summary && (
        <div style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0', padding: '14px 16px', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e', lineHeight: 1.6 }}>{summary}</p>
        </div>
      )}

      {/* Metric grid */}
      <table cellPadding={0} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', paddingRight: '8px', paddingBottom: '8px' }}>
              <MetricCell label="New Leads" value={data.newLeadsOvernight} sub="overnight" color="#10b981" />
            </td>
            <td style={{ width: '50%', paddingLeft: '8px', paddingBottom: '8px' }}>
              <MetricCell label="New Messages" value={data.newMessagesOvernight} sub="from your team" color="#3b82f6" />
            </td>
          </tr>
          <tr>
            <td style={{ width: '50%', paddingRight: '8px' }}>
              <MetricCell
                label="Growth Score"
                value={data.growthScore}
                sub={data.growthScoreDelta !== null
                  ? `${data.growthScoreDelta > 0 ? '+' : ''}${data.growthScoreDelta} vs yesterday`
                  : 'out of 100'}
                color={data.growthScoreDelta != null && data.growthScoreDelta > 0 ? '#10b981' : '#6366f1'}
              />
            </td>
            <td style={{ width: '50%', paddingLeft: '8px' }}>
              <MetricCell label="Open Requests" value={data.openRequests} sub="awaiting review" color="#f59e0b" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Alerts */}
      {(data.competitorAlert || data.milestoneHit) && (
        <div style={{ marginBottom: '24px' }}>
          {data.competitorAlert && (
            <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                <strong>Competitor alert: </strong>{data.competitorAlert}
              </p>
            </div>
          )}
          {data.milestoneHit && (
            <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.5 }}>
                <strong>🎉 Milestone: </strong>{data.milestoneHit}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommended action */}
      {data.recommendedAction && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '28px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today&rsquo;s Recommended Action
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>{data.recommendedAction}</p>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <a
          href={`${appUrl}/dashboard`}
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            borderRadius: '8px',
          }}
        >
          Open Your Dashboard →
        </a>
      </div>
    </EmailLayout>
  );
}

function MetricCell({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', textAlign: 'center' as const, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

function buildFallbackSummary(data: MorningBriefData): string {
  const parts: string[] = [];
  if (data.newLeadsOvernight > 0) parts.push(`${data.newLeadsOvernight} new lead${data.newLeadsOvernight > 1 ? 's' : ''} came in overnight`);
  if (data.newMessagesOvernight > 0) parts.push(`${data.newMessagesOvernight} new team message${data.newMessagesOvernight > 1 ? 's' : ''}`);
  if (!parts.length) return `Your website health is ${data.healthScore}/100 and everything is running smoothly.`;
  const s = parts.join(' and ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
