import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface AuditLogParams {
  organizationId?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  const result = await db
    .insert(auditLogs)
    .values({
      organizationId: params.organizationId || "",
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}

export async function getAuditLogs(
  orgId?: string,
  limit: number = 100,
  offset: number = 0
) {
  let query = db.select().from(auditLogs);

  if (orgId) {
    query = query.where(eq(auditLogs.organizationId, orgId));
  }

  query = query
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return query;
}
