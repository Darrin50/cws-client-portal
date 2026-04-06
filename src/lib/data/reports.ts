import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getReports(orgId: string) {
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.organizationId, orgId))
    .orderBy(desc(reports.generatedAt));

  return result;
}

export async function getReport(id: string) {
  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);

  return result?.[0] || null;
}

export async function createReport(data: {
  organizationId: string;
  period: "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate: Date;
  metrics: Record<string, any>;
  summary?: string;
  fileUrl?: string;
}) {
  const result = await db
    .insert(reports)
    .values({
      ...data,
      generatedAt: new Date(),
      createdAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function getLatestReport(orgId: string, period?: string) {
  let query = db
    .select()
    .from(reports)
    .where(eq(reports.organizationId, orgId))
    .orderBy(desc(reports.generatedAt))
    .limit(1);

  if (period) {
    query = db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.organizationId, orgId),
          eq(reports.period, period as any)
        )
      )
      .orderBy(desc(reports.generatedAt))
      .limit(1);
  }

  const result = await query;
  return result?.[0] || null;
}
