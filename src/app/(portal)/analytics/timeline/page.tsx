import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TimelineClient } from './_components/timeline-client';

export const metadata: Metadata = {
  title: 'Growth Timeline | CWS Portal',
  description: 'Your complete business intelligence timeline — every milestone, change, and win mapped to your growth story.',
};

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
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
  const dbUser = userRows[0];
  if (!dbUser) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier, name: organizationsTable.name })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function TimelinePage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  let orgName = 'Your Business';

  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
    orgName = org?.name ?? 'Your Business';
  }

  const hasAccess = planTier === 'growth' || planTier === 'domination';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Your Growth Story
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Every milestone, change, and win — mapped in one place. This is {orgName}&apos;s complete business intelligence timeline.
          </p>
        </div>
      </div>

      {hasAccess ? (
        <TimelineClient />
      ) : (
        <div className="relative">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none space-y-4" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-20 bg-white dark:bg-slate-900" />
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Unlock your Growth Timeline
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                  See every milestone, traffic win, lead capture, and team action mapped to a living timeline.
                  Leaving CWS means losing this entire history.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/settings/billing">
                  <Button className="bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white w-full sm:w-auto">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 text-left inline-block">
                {[
                  'Chronological growth events',
                  'Traffic & lead milestones',
                  'Website change history',
                  'Team messages & actions',
                  'Growth Score over time',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
