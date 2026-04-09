import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, SearchCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuditView } from './audit-view';

export const metadata: Metadata = {
  title: 'AI Website Auditor | CWS Portal',
};

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  if (!userRows[0]) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userRows[0].id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function AuditPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
  }

  const hasAccess = planTier === 'domination';

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            AI Website Auditor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monthly AI-powered audit of your website — content, SEO, CTA, mobile, and speed.
          </p>
        </div>

        {/* Upgrade gate */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="space-y-4 p-6">
              {[
                { grade: "B", label: "Overall Grade: B", date: "Apr 1, 2026", pages: "8 pages audited" },
                { grade: "C", label: "Overall Grade: C", date: "Mar 1, 2026", pages: "6 pages audited" },
              ].map(({ grade, label, date, pages }) => (
                <div
                  key={grade + date}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-700">{grade}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{date} · {pages}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px]">
            <div className="text-center space-y-4 px-6 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Domination Plan Only
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Get monthly AI-powered audits of your website — scoring content quality, SEO, CTAs,
                  mobile-friendliness, and page speed with actionable recommendations.
                </p>
              </div>
              <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl">
                <Link href="/settings/billing">Upgrade to Domination</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AuditView />;
}
