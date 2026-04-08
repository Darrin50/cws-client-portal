import { pgTable, uuid, varchar, text, jsonb, timestamp, index, foreignKey, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const timelineEventTypeEnum = pgEnum('timeline_event_type', [
  'website_launch',
  'website_change',
  'traffic_milestone',
  'lead_milestone',
  'growth_score_change',
  'monthly_report',
  'strategy_brief',
  'team_message',
  'milestone_earned',
  'competitor_alert',
  'streak_achievement',
]);

export const timelineEventsTable = pgTable(
  'cws_timeline_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    eventType: timelineEventTypeEnum('event_type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    metadata: jsonb('metadata'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'timeline_events_organization_id_fk',
    }).onDelete('cascade'),
    orgOccurredIdx: index('timeline_events_org_occurred_idx').on(table.organizationId, table.occurredAt),
    orgTypeIdx: index('timeline_events_org_type_idx').on(table.organizationId, table.eventType),
  }),
);

export const timelineEventsRelations = relations(timelineEventsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [timelineEventsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type TimelineEvent = typeof timelineEventsTable.$inferSelect;
export type NewTimelineEvent = typeof timelineEventsTable.$inferInsert;
