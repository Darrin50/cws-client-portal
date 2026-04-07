import { db } from "@/db";
import { organizationsTable, organizationMembersTable, commentsTable, reportsTable } from "@/db/schema";
import { count, desc, sql } from "drizzle-orm";

export async function getRevenueMetrics() {
  const result = await db
    .select({
      plan: organizationsTable.planTier,
      count: count(),
      totalMonthly: sql`count(*) * CASE
        WHEN ${organizationsTable.planTier} = 'starter' THEN 99
        WHEN ${organizationsTable.planTier} = 'growth' THEN 299
        WHEN ${organizationsTable.planTier} = 'domination' THEN 999
        ELSE 0
      END`,
    })
    .from(organizationsTable)
    .groupBy(organizationsTable.planTier);

  return result;
}

export async function getClientList(
  limit: number = 50,
  offset: number = 0
) {
  const result = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      plan: organizationsTable.planTier,
      website: organizationsTable.websiteUrl,
      createdAt: organizationsTable.createdAt,
      memberCount: count(organizationMembersTable.id),
    })
    .from(organizationsTable)
    .leftJoin(
      organizationMembersTable,
      sql`${organizationsTable.id} = ${organizationMembersTable.organizationId}`
    )
    .groupBy(organizationsTable.id)
    .orderBy(desc(organizationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getDashboardStats() {
  const totalOrgs = await db
    .select({ count: count() })
    .from(organizationsTable);

  const totalMembers = await db
    .select({ count: count() })
    .from(organizationMembersTable);

  const openRequests = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(sql`${commentsTable.status} = 'open'`);

  const reportsGenerated = await db
    .select({ count: count() })
    .from(reportsTable);

  return {
    totalOrganizations: totalOrgs?.[0]?.count || 0,
    totalMembers: totalMembers?.[0]?.count || 0,
    openRequests: openRequests?.[0]?.count || 0,
    reportsGenerated: reportsGenerated?.[0]?.count || 0,
  };
}
