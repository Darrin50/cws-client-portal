import { db } from "@/db";
import { analyticsSnapshotsTable, leadsTable } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface DateRange {
  start: Date;
  end: Date;
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export async function getAnalyticsSnapshots(
  orgId: string,
  source: string,
  dateRange: DateRange
) {
  const result = await db
    .select()
    .from(analyticsSnapshotsTable)
    .where(
      and(
        eq(analyticsSnapshotsTable.organizationId, orgId),
        eq(analyticsSnapshotsTable.source, source as any),
        gte(analyticsSnapshotsTable.snapshotDate, toDateString(dateRange.start)),
        lte(analyticsSnapshotsTable.snapshotDate, toDateString(dateRange.end))
      )
    )
    .orderBy(analyticsSnapshotsTable.snapshotDate);

  return result;
}

export async function getLeads(orgId: string, status?: string) {
  const conditions = [eq(leadsTable.organizationId, orgId)];

  if (status) {
    conditions.push(eq(leadsTable.status, status as any));
  }

  const result = await db
    .select()
    .from(leadsTable)
    .where(and(...conditions))
    .orderBy(desc(leadsTable.createdAt));

  return result;
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
    .insert(leadsTable)
    .values({
      organizationId: data.organizationId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      formSource: data.source,
      message: data.message,
      status: "new",
    })
    .returning();

  return result?.[0] || null;
}

export async function updateLeadStatus(
  id: string,
  status: "new" | "contacted" | "converted" | "closed"
) {
  const result = await db
    .update(leadsTable)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(leadsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function getTrafficData(
  orgId: string,
  dateRange: DateRange
) {
  const result = await db
    .select()
    .from(analyticsSnapshotsTable)
    .where(
      and(
        eq(analyticsSnapshotsTable.organizationId, orgId),
        gte(analyticsSnapshotsTable.snapshotDate, toDateString(dateRange.start)),
        lte(analyticsSnapshotsTable.snapshotDate, toDateString(dateRange.end))
      )
    )
    .orderBy(analyticsSnapshotsTable.snapshotDate);

  return result;
}

export async function getSourcesData(orgId: string) {
  const result = await db
    .select()
    .from(analyticsSnapshotsTable)
    .where(eq(analyticsSnapshotsTable.organizationId, orgId))
    .orderBy(desc(analyticsSnapshotsTable.snapshotDate));

  // Group by source and return latest snapshot per source
  const sourceMap = new Map();
  result.forEach((snapshot) => {
    if (!sourceMap.has(snapshot.source)) {
      sourceMap.set(snapshot.source, snapshot);
    }
  });

  return Array.from(sourceMap.values());
}
