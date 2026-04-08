import type { Metadata } from 'next';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsLoader as AnalyticsDashboard } from './_components/analytics-loader';

export const metadata: Metadata = {
  title: 'Analytics | CWS Portal',
  description: 'Track your website performance metrics, visitor insights, and keyword rankings.',
};

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({
        id: organizationsTable.id,
        planTier: organizationsTable.planTier,
      })
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
    .select({
      id: organizationsTable.id,
      planTier: organizationsTable.planTier,
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function AnalyticsPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier: string = "starter";
  let isAdmin = false;

  if (clerkUserId) {
    // Check if user is an admin — admins bypass the plan gate
    const userRows = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);
    isAdmin = userRows[0]?.role === "admin";

    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? "starter";
  }

  const hasAccess = isAdmin || planTier === "growth" || planTier === "domination";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Track performance metrics and visitor insights
        </p>
      </div>

      {hasAccess ? (
        <AnalyticsDashboard />
      ) : (
        /* Locked overlay for Starter plan */
        <div className="relative">
          {/* Blurred placeholder content */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-32"
                />
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-72 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-64" />
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-64" />
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Upgrade to unlock Analytics
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                  Get detailed insights into your website performance, visitor
                  behavior, and conversion metrics. Available on Growth and
                  Domination plans.
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
                  "Real-time visitor tracking",
                  "Traffic source analysis",
                  "Top keyword rankings",
                  "Google Business Profile insights",
                  "Page performance metrics",
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
