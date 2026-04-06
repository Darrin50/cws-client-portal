import { db } from "@/db";
import { analyticsSnapshots, leads } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface DateRange {
  start: Date;
  end: Date;
}

export async function getAnalyticsSnapshots(
  orgId: string,
  source: string,
  dateRange: DateRange
) {
  const result = await db
    .select()
    .from(analyticsSnapshots)
    .where(
      and(
        eq(analyticsSnapshots.organizationId, orgId),
        eq(analyticsSnapshots.source, source),
        gte(analyticsSnapshots.capturedAt, dateRange.start),
        lte(analyticsSnapshots.capturedAt, dateRange.end)
      )
    )
    .orderBy(analyticsSnapshots.capturedAt);

  return result;
}

export async function getLeads(orgId: string, status?: string) {
  let query = db.select().from(leads).where(eq(leads.organizationId, orgId));

  if (status) {
    query = query.where(eq(leads.status, status));
  }

  query = query.orderBy(desc(leads.createdAt));

  return query;
}

export async function createLead(data: {
  organizationId: string;
  source: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  metadata?: Record<string, any>;
}) {
  const result = await db
    .insert(leads)
    .values({
      ...data,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function updateLeadStatus(
  id: string,
  status: "new" | "contacted" | "qualified" | "converted" | "rejected"
) {
  const result = await db
    .update(leads)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getTrafficData(
  orgId: string,
  dateRange: DateRange
) {
  const result = await db
    .select()
    .from(analyticsSnapshots)
    .where(
      and(
        eq(analyticsSnapshots.organizationId, orgId),
        gte(analyticsSnapshots.capturedAt, dateRange.start),
        lte(analyticsSnapshots.capturedAt, dateRange.end)
      )
    )
    .orderBy(analyticsSnapshots.capturedAt);

  return result;
}

export async function getSourcesData(orgId: string) {
  const result = await db
    .select()
    .from(analyticsSnapshots)
    .where(eq(analyticsSnapshots.organizationId, orgId))
    .orderBy(desc(analyticsSnapshots.capturedAt));

  // Group by source and return latest snapshot per source
  const sourceMap = new Map();
  result.forEach((snapshot) => {
    if (!sourceMap.has(snapshot.source)) {
      sourceMap.set(snapshot.source, snapshot);
    }
  });

  return Array.from(sourceMap.values());
}
