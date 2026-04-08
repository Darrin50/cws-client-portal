import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  organizationsTable,
  organizationMembersTable,
  usersTable,
  strategyBriefsTable,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BriefClient } from "./_components/brief-client";

export const metadata: Metadata = {
  title: "Strategy Brief | CWS Portal",
  description:
    "Your AI-generated monthly strategy brief — review before your strategy call with the CWS team.",
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

export default async function StrategyBriefPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier: string = "starter";
  let orgId: string | null = null;

  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? "starter";
    orgId = org?.id ?? null;
  }

  const hasAccess = planTier === "growth" || planTier === "domination";

  // Compute current month string
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = monthDate.toISOString().split("T")[0];
  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Load latest brief for this month if access granted
  let latestBrief = null;
  if (hasAccess && orgId) {
    const briefs = await db
      .select()
      .from(strategyBriefsTable)
      .where(
        and(
          eq(strategyBriefsTable.orgId, orgId),
          eq(strategyBriefsTable.month, monthStr)
        )
      )
      .orderBy(desc(strategyBriefsTable.generatedAt))
      .limit(1);
    latestBrief = briefs[0] ?? null;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/reports"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Reports
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm text-slate-900 dark:text-white font-medium">
              Strategy Brief
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            AI Strategy Brief
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Monthly briefing document — auto-generated before your strategy call
          </p>
        </div>
        {hasAccess && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {planTier === "domination" ? "Domination" : "Growth"} Plan
            </span>
          </div>
        )}
      </div>

      {hasAccess ? (
        <BriefClient initialBrief={latestBrief} monthLabel={monthLabel} />
      ) : (
        /* Locked overlay for Starter plan */
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="space-y-6">
              <div className="h-48 rounded-2xl bg-slate-800" />
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="h-16 bg-slate-50 dark:bg-slate-800" />
                  <div className="bg-white dark:bg-slate-900 h-32" />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0e1a]/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Upgrade to unlock Strategy Briefs
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                  Get an AI-generated briefing document before every monthly strategy call.
                  Includes accomplishments, metric analysis, and prioritized recommendations.
                  Available on Growth and Domination plans.
                </p>
              </div>
              <Link href="/settings/billing">
                <Button className="bg-[#1d4ed8] hover:bg-blue-700 text-white">
                  View Upgrade Options
                </Button>
              </Link>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4 text-left inline-block">
                {[
                  "Auto-generated before each monthly call",
                  "AI-powered accomplishments summary",
                  "Metric impact analysis (↑ ↓ →)",
                  "Prioritized recommendations for next month",
                  "Download as PDF, share with team",
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
