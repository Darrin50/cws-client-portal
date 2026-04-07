import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  organizationsTable,
  usersTable,
  organizationMembersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { SocialHubClient } from "./social-hub-client";

async function getOrgPlan(clerkUserId: string, clerkOrgId: string | null) {
  let org: typeof organizationsTable.$inferSelect | undefined;

  if (clerkOrgId) {
    const rows = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    org = rows[0];
  }

  if (!org) {
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
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, memberRows[0].organizationId))
      .limit(1);
    org = orgRows[0];
  }

  return org ?? null;
}

export default async function SocialPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const org = await getOrgPlan(clerkUserId, clerkOrgId ?? null);
  const planTier = org?.planTier ?? "starter";
  const isGrowthPlus = planTier === "growth" || planTier === "domination";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Social Media Hub</h1>
        <p className="text-slate-400 mt-2">
          Manage and schedule social media content
        </p>
      </div>

      {isGrowthPlus ? (
        <SocialHubClient />
      ) : (
        <>
          {/* Upgrade Overlay */}
          <div className="relative">
            <div className="blur-sm pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6 h-40 bg-slate-700" />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <Lock className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Upgrade to unlock Social Media Hub
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-sm">
                    Plan, schedule, and manage your social media content across
                    all platforms in one place.
                  </p>
                </div>
                <Link href="/settings/billing">
                  <Button>View Upgrade Options</Button>
                </Link>
              </div>
            </div>
          </div>

          <Card className="p-6 bg-blue-900/10 border-blue-700">
            <h3 className="font-semibold text-white mb-4">
              Social Media Features (Growth+ Plan)
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Multi-platform scheduling (Facebook, Instagram, LinkedIn)</li>
              <li>✓ Content calendar view</li>
              <li>✓ Approval workflow</li>
              <li>✓ Analytics integration</li>
              <li>✓ Team collaboration</li>
              <li>✓ Brand asset library</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
