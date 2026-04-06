import { pgTable, pgEnum, uuid, varchar, text, integer, boolean, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pagesTable } from './pages';
import { commentsTable } from './comments';
import { brandAssetsTable } from './brand-assets';
import { messagesTable } from './messages';
import { socialPostsTable } from './social-posts';
import { reportsTable } from './reports';
import { analyticsSnapshotsTable, leadsTable } from './analytics';
import { organizationMembersTable } from './organization-members';

export const planTierEnum = pgEnum('plan_tier', ['starter', 'growth', 'domination']);

export const organizationsTable = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    planTier: planTierEnum('plan_tier').default('starter').notNull(),
    websiteUrl: varchar('website_url', { length: 255 }),
    businessPhone: varchar('business_phone', { length: 20 }),
    businessEmail: varchar('business_email', { length: 255 }),
    businessAddress: text('business_address'),
    businessHours: jsonb('business_hours'),
    businessDescription: text('business_description'),
    industry: varchar('industry', { length: 255 }),
    healthScore: integer('health_score').default(100).notNull(),
    healthBreakdown: jsonb('health_breakdown'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('organizations_slug_idx').on(table.slug),
    clerkOrgIdIdx: uniqueIndex('organizations_clerk_org_id_idx').on(table.clerkOrgId),
    isActiveIdx: index('organizations_is_active_idx').on(table.isActive),
  }),
);

export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  pages: many(pagesTable),
  comments: many(commentsTable),
  brandAssets: many(brandAssetsTable),
  messages: many(messagesTable),
  socialPosts: many(socialPostsTable),
  reports: many(reportsTable),
  analyticsSnapshots: many(analyticsSnapshotsTable),
  leads: many(leadsTable),
  organizationMembers: many(organizationMembersTable),
}));

export type Organization = typeof organizationsTable.$inferSelect;
export type NewOrganization = typeof organizationsTable.$inferInsert;
