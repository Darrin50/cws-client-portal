import { pgTable, uuid, varchar, text, jsonb, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { organizationsTable } from './organizations';

export const auditLogTable = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    organizationId: uuid('organization_id'),
    action: varchar('action', { length: 255 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id'),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'audit_log_user_id_fk',
    }).onDelete('set null'),
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'audit_log_organization_id_fk',
    }).onDelete('set null'),
    userIdIdx: index('audit_log_user_id_idx').on(table.userId),
    orgIdIdx: index('audit_log_organization_id_idx').on(table.organizationId),
    entityTypeIdx: index('audit_log_entity_type_idx').on(table.entityType),
    createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
    actionIdx: index('audit_log_action_idx').on(table.action),
  }),
);

export const auditLogRelations = relations(auditLogTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [auditLogTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [auditLogTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type AuditLog = typeof auditLogTable.$inferSelect;
export type NewAuditLog = typeof auditLogTable.$inferInsert;
