import { pgTable, pgEnum, uuid, timestamp, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';
import { usersTable } from './users';

export const memberRoleEnum = pgEnum('member_role', ['owner', 'member']);

export const organizationMembersTable = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: memberRoleEnum('role').default('member').notNull(),
    invitedById: uuid('invited_by_id'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgUserUnique: uniqueIndex('organization_members_org_user_unique').on(table.organizationId, table.userId),
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'organization_members_organization_id_fk',
    }).onDelete('cascade'),
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'organization_members_user_id_fk',
    }).onDelete('cascade'),
    invitedByIdFk: foreignKey({
      columns: [table.invitedById],
      foreignColumns: [usersTable.id],
      name: 'organization_members_invited_by_id_fk',
    }).onDelete('set null'),
  }),
);

export const organizationMembersRelations = relations(organizationMembersTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [organizationMembersTable.organizationId],
    references: [organizationsTable.id],
  }),
  user: one(usersTable, {
    fields: [organizationMembersTable.userId],
    references: [usersTable.id],
  }),
  invitedBy: one(usersTable, {
    fields: [organizationMembersTable.invitedById],
    references: [usersTable.id],
  }),
}));

export type OrganizationMember = typeof organizationMembersTable.$inferSelect;
export type NewOrganizationMember = typeof organizationMembersTable.$inferInsert;
