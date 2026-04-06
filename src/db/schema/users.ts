import { pgTable, pgEnum, uuid, varchar, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationMembersTable } from './organization-members';
import { commentsTable } from './comments';
import { messagesTable } from './messages';
import { notificationsTable } from './notifications';
import { socialPostsTable } from './social-posts';
import { faqArticlesTable } from './faq';
import { auditLogTable } from './audit-log';

export const userRoleEnum = pgEnum('user_role', ['admin', 'client', 'team_member']);

export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkUserId: varchar('clerk_user_id', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    phone: varchar('phone', { length: 20 }),
    role: userRoleEnum('role').default('client').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    clerkUserIdIdx: uniqueIndex('users_clerk_user_id_idx').on(table.clerkUserId),
    emailIdx: index('users_email_idx').on(table.email),
    isActiveIdx: index('users_is_active_idx').on(table.isActive),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  organizationMembers: many(organizationMembersTable),
  comments: many(commentsTable),
  messages: many(messagesTable),
  notifications: many(notificationsTable),
  socialPostsCreated: many(socialPostsTable, { relationName: 'createdBy' }),
  socialPostsApproved: many(socialPostsTable, { relationName: 'approvedBy' }),
  faqArticles: many(faqArticlesTable),
  auditLogs: many(auditLogTable),
}));

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
