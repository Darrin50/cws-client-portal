import { pgTable, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const adminAuditLogTable = pgTable(
  'admin_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminClerkUserId: varchar('admin_clerk_user_id', { length: 255 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    targetOrgId: uuid('target_org_id'),
    details: jsonb('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    adminUserIdx: index('admin_audit_log_admin_user_idx').on(table.adminClerkUserId),
    targetOrgIdx: index('admin_audit_log_target_org_idx').on(table.targetOrgId),
    createdAtIdx: index('admin_audit_log_created_at_idx').on(table.createdAt),
    actionIdx: index('admin_audit_log_action_idx').on(table.action),
  }),
);

export type AdminAuditLog = typeof adminAuditLogTable.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogTable.$inferInsert;
