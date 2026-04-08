import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CommunityHub } from '@/components/community/community-hub';

export const metadata: Metadata = {
  title: 'Community Hub | CWS Portal',
  description: 'See how you compare to peers on the same plan — anonymized benchmarks, no names.',
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

export default async function CommunityPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
  }

  const hasAccess = planTier === 'domination';

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/30">
            <Users className="w-6 h-6 text-[#2563eb]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Community Hub</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          See how you rank against anonymized peers on the Domination plan.
        </p>
      </div>

      {hasAccess ? (
        <CommunityHub />
      ) : (
        /* Upgrade gate */
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-6">
              {[
                { label: "Growth Score", value: "88 pts", pct: "82nd" },
                { label: "Traffic Growth", value: "+24%", pct: "71st" },
                { label: "Lead Conversion", value: "3.4%", pct: "78th" },
              ].map(({ label, value, pct }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-xl font-black text-green-600">{pct}</p>
                      <p className="text-[9px] text-green-500 uppercase tracking-wide">Percentile</p>
                    </div>
                  </div>
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
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
                  See exactly how you rank against your peers — anonymized Growth Score, traffic, and lead
                  conversion benchmarks.
                </p>
              </div>
              <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl">
                <Link href="/settings/billing">Upgrade to Domination</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
