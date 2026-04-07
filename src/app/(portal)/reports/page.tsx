import type { Metadata } from 'next';
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: 'Reports | CWS Portal',
  description: 'View your monthly website performance reports including traffic, rankings, and lead metrics.',
};
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
import { ReportsArchive } from "./_components/archive";

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

export default async function ReportsPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier: string = "starter";
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? "starter";
  }

  const hasAccess = planTier === "growth" || planTier === "domination";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Monthly Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Report Archive — your monthly performance summaries
        </p>
      </div>

      {hasAccess ? (
        <ReportsArchive />
      ) : (
        /* Locked overlay for Starter plan */
        <div className="relative">
          {/* Blurred placeholder content */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 h-52"
                />
              ))}
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Upgrade to unlock Reports
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                  Get access to detailed monthly performance reports with key
                  metrics, SEO data, and AI-generated recommendations. Available
                  on Growth and Domination plans.
                </p>
              </div>
              <Link href="/settings/billing">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  View Upgrade Options
                </Button>
              </Link>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 text-left inline-block">
                {[
                  "Monthly performance summary",
                  "Visitors, leads & keyword data",
                  "Auto-generated PDF reports",
                  "Downloadable archives",
                  "AI-powered recommendations",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
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
