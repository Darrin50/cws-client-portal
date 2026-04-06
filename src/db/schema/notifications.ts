import { pgTable, pgEnum, uuid, varchar, text, boolean, timestamp, index, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { organizationsTable } from './organizations';

export const notificationTypeEnum = pgEnum('notification_type', [
  'request_status',
  'new_message',
  'report_uploaded',
  'approval_needed',
  'payment_failed',
  'payment_success',
  'health_alert',
  'new_client',
  'team_invite',
  'new_lead',
]);

export const notificationChannelEnum = pgEnum('notification_channel', ['email', 'sms', 'push']);

export const notificationsTable = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    organizationId: uuid('organization_id'),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    link: varchar('link', { length: 500 }),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    emailSent: boolean('email_sent').default(false).notNull(),
    emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
    smsSent: boolean('sms_sent').default(false).notNull(),
    smsSentAt: timestamp('sms_sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'notifications_user_id_fk',
    }).onDelete('cascade'),
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'notifications_organization_id_fk',
    }).onDelete('cascade'),
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    typeIdx: index('notifications_type_idx').on(table.type),
  }),
);

export const notificationPreferencesTable = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    channel: notificationChannelEnum('channel').notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'notification_preferences_user_id_fk',
    }).onDelete('cascade'),
    userChannelCategoryUnique: uniqueIndex('notification_preferences_user_channel_category_unique').on(
      table.userId,
      table.channel,
      table.category,
    ),
  }),
);

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [notificationsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferencesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationPreferencesTable.userId],
    references: [usersTable.id],
  }),
}));

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
export type NotificationPreference = typeof notificationPreferencesTable.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferencesTable.$inferInsert;
