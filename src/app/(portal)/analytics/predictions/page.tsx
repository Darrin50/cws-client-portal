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
import { PredictionsLoader } from './_components/predictions-loader';

export const metadata: Metadata = {
  title: 'Growth Predictions | CWS Portal',
  description: 'See where your business is headed. AI-powered predictions for visitors, leads, and growth.',
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

export default async function PredictionsPage() {
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
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Growth Predictions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            AI-powered forecasts based on your traffic trends
          </p>
        </div>
      </div>

      {hasAccess ? (
        <PredictionsLoader />
      ) : (
        <div className="relative">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-32"
                />
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-80 mb-6" />
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-48" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Unlock Growth Predictions
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                  See exactly where your business is headed. AI-powered projections for
                  visitors, leads, and growth score — with confidence intervals and goal tracking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/settings/billing">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 text-left inline-block">
                {[
                  '90-day visitor & lead projections',
                  'Confidence interval forecasting',
                  '"Days to milestone" countdown',
                  'Goal setting & progress tracking',
                  'AI narrative growth summary',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
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
