import { db } from "@/db";
import { organizations, organizationMembers, comments, reports } from "@/db/schema";
import { count, desc, sql } from "drizzle-orm";

export async function getRevenueMetrics() {
  const result = await db
    .select({
      plan: organizations.plan,
      count: count(),
      totalMonthly: sql`count(*) * CASE
        WHEN ${organizations.plan} = 'starter' THEN 99
        WHEN ${organizations.plan} = 'growth' THEN 299
        WHEN ${organizations.plan} = 'enterprise' THEN 999
        ELSE 0
      END`,
    })
    .from(organizations)
    .groupBy(organizations.plan);

  return result;
}

export async function getClientList(
  limit: number = 50,
  offset: number = 0
) {
  const result = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      plan: organizations.plan,
      website: organizations.website,
      createdAt: organizations.createdAt,
      memberCount: count(organizationMembers.id),
    })
    .from(organizations)
    .leftJoin(
      organizationMembers,
      sql`${organizations.id} = ${organizationMembers.organizationId}`
    )
    .groupBy(organizations.id)
    .orderBy(desc(organizations.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getDashboardStats() {
  const totalOrgs = await db
    .select({ count: count() })
    .from(organizations);

  const totalMembers = await db
    .select({ count: count() })
    .from(organizationMembers);

  const openRequests = await db
    .select({ count: count() })
    .from(comments)
    .where(sql`${comments.status} = 'open'`);

  const reportsGenerated = await db
    .select({ count: count() })
    .from(reports);

  return {
    totalOrganizations: totalOrgs?.[0]?.count || 0,
    totalMembers: totalMembers?.[0]?.count || 0,
    openRequests: openRequests?.[0]?.count || 0,
    reportsGenerated: reportsGenerated?.[0]?.count || 0,
  };
}
