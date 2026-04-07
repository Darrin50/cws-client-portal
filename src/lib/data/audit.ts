import { db } from "@/db";
import { auditLogTable } from "@/db/schema";
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
    .insert(auditLogTable)
    .values({
      organizationId: params.organizationId || null,
      userId: params.userId,
      action: params.action,
      entityType: params.resourceType,
      entityId: params.resourceId || null,
      details: params.changes ? { ...params.changes, userAgent: params.userAgent } : null,
      ipAddress: params.ipAddress,
    })
    .returning();

  return result?.[0] || null;
}

export async function getAuditLogs(
  orgId?: string,
  limit: number = 100,
  offset: number = 0
) {
  const conditions = orgId ? [eq(auditLogTable.organizationId, orgId)] : [];

  const result = await db
    .select()
    .from(auditLogTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(auditLogTable.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}
