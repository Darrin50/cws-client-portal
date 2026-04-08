import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WinsWall } from '@/components/wins/wins-wall';

export const metadata: Metadata = {
  title: 'Wins Wall | CWS Portal',
  description: 'Celebrate your milestones and share branded win cards on social media.',
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

export default async function WinsPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
  }

  const hasAccess = planTier === 'growth' || planTier === 'domination';

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/30">
            <Trophy className="w-6 h-6 text-[#2563eb]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Wins Wall</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          Celebrate your achievements and share branded cards on social media.
        </p>
      </div>

      {hasAccess ? (
        <WinsWall />
      ) : (
        /* Upgrade gate */
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {[
                { title: "1,000 Monthly Visitors", metric: "1,000", label: "Monthly Visitors" },
                { title: "First Lead Captured!", metric: "1st", label: "Qualified Lead" },
                { title: "Growth Streak: 4 Weeks", metric: "4", label: "Week Streak" },
              ].map(({ title, metric, label }) => (
                <div
                  key={title}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-[#0d9488]/30 p-5 space-y-4"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[#0d9488] to-[#2563eb] rounded-full" />
                  <p className="text-xs text-slate-400">Apr 8, 2026</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <div className="rounded-xl p-3 text-center bg-[#0d9488]/10 border border-[#0d9488]/20">
                    <p className="text-3xl font-black text-[#0d9488]">{metric}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                  <div className="w-full py-2.5 rounded-xl border border-[#0d9488]/20 text-center text-sm text-[#0d9488] bg-[#0d9488]/8">
                    Share this win
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
                  Growth Plan & Above
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Celebrate milestones with beautiful shareable cards. Every share spreads the word
                  about your business growth with Caliber Web Studio.
                </p>
              </div>
              <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl">
                <Link href="/settings/billing">Upgrade to Growth</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
