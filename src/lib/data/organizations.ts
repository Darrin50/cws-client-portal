import { db } from "@/db";
import {
  organizationsTable,
  organizationMembersTable,
  pagesTable,
  commentsTable,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getOrganization(id: string) {
  const result = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function getOrganizationBySlug(slug: string) {
  const result = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, slug))
    .limit(1);

  return result?.[0] || null;
}

export async function updateOrganization(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    plan?: string;
    customDomain?: string;
    timezone?: string;
  }
) {
  const result = await db
    .update(organizationsTable)
    .set({
      name: data.name,
      websiteUrl: data.website,
      updatedAt: new Date(),
    })
    .where(eq(organizationsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getOrganizationMembers(orgId: string) {
  const members = await db
    .select()
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.organizationId, orgId));

  return members;
}

export async function getAllOrganizations() {
  const result = await db.select().from(organizationsTable);
  return result;
}

export async function getOrganizationStats(orgId: string) {
  const org = await getOrganization(orgId);

  if (!org) {
    return null;
  }

  // Count pages
  const pageCount = await db
    .select({ count: count() })
    .from(pagesTable)
    .where(eq(pagesTable.organizationId, orgId));

  // Count open requests
  const requestCount = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(
      and(
        eq(commentsTable.organizationId, orgId),
        eq(commentsTable.status, "new")
      )
    );

  // Count team members
  const memberCount = await db
    .select({ count: count() })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.organizationId, orgId));

  return {
    id: org.id,
    name: org.name,
    plan: org.planTier,
    createdAt: org.createdAt,
    pages: pageCount?.[0]?.count || 0,
    openRequests: requestCount?.[0]?.count || 0,
    teamMembers: memberCount?.[0]?.count || 0,
  };
}
