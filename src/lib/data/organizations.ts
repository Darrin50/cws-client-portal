import { db } from "@/db";
import {
  organizations,
  organizationMembers,
  pages,
  comments,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function getOrganization(id: string) {
  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function getOrganizationBySlug(slug: string) {
  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
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
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getOrganizationMembers(orgId: string) {
  const members = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, orgId));

  return members;
}

export async function getAllOrganizations() {
  const result = await db.select().from(organizations);
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
    .from(pages)
    .where(eq(pages.organizationId, orgId));

  // Count open requests
  const requestCount = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.organizationId, orgId),
        eq(comments.status, "open"),
        eq(comments.type, "request")
      )
    );

  // Count team members
  const memberCount = await db
    .select({ count: count() })
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, orgId));

  return {
    id: org.id,
    name: org.name,
    plan: org.plan,
    createdAt: org.createdAt,
    pages: pageCount?.[0]?.count || 0,
    openRequests: requestCount?.[0]?.count || 0,
    teamMembers: memberCount?.[0]?.count || 0,
  };
}
