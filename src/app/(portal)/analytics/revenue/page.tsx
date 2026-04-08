import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RevenueFunnel } from './_components/revenue-funnel';

export const metadata: Metadata = {
  title: 'Revenue Impact | CWS Portal',
  description: 'See the estimated revenue driven by your CWS engagement — from website traffic to closed deals.',
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
  const dbUser = userRows[0];
  if (!dbUser) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUser.id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function RevenueImpactPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
  }

  const hasAccess = planTier === 'growth' || planTier === 'domination';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Revenue Impact</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 ml-10.5">
            See exactly how CWS work converts into real business revenue
          </p>
        </div>
      </div>

      {hasAccess ? (
        <div className="dark">
          <RevenueFunnel />
        </div>
      ) : (
        /* Locked overlay for Starter plan */
        <div className="relative">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-36"
                />
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-40 mb-6" />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-56" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6 max-w-md">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-emerald-500/60" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Unlock Revenue Attribution
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  See exactly how your website changes convert into leads, calls, and closed deals.
                  The "holy shit" screenshot your business partner needs to see.
                  Available on Growth and Domination plans.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/settings/billing">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    Upgrade to Unlock
                  </Button>
                </Link>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 mt-4 text-left inline-block">
                {[
                  "Animated funnel: Visitors → Leads → Deals → Revenue",
                  "Month-over-month revenue comparison",
                  "6-month estimated revenue trend",
                  "CWS quarterly impact total with goal tracking",
                  "Shareable report card for stakeholders",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
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
