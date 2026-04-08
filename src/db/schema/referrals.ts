import { pgTable, pgEnum, uuid, varchar, boolean, timestamp, index, foreignKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const referralStatusEnum = pgEnum('referral_status', ['pending', 'active', 'rewarded', 'expired']);

export const referralsTable = pgTable(
  'referrals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referrerOrgId: uuid('referrer_org_id').notNull(),
    referralCode: varchar('referral_code', { length: 50 }).notNull(),
    referredEmail: varchar('referred_email', { length: 255 }),
    referredOrgId: uuid('referred_org_id'),
    status: referralStatusEnum('status').default('pending').notNull(),
    rewardIssued: boolean('reward_issued').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
  },
  (table) => ({
    referrerOrgIdFk: foreignKey({
      columns: [table.referrerOrgId],
      foreignColumns: [organizationsTable.id],
      name: 'referrals_referrer_org_id_fk',
    }).onDelete('cascade'),
    referralCodeIdx: uniqueIndex('referrals_referral_code_idx').on(table.referralCode),
    referrerOrgIdx: index('referrals_referrer_org_idx').on(table.referrerOrgId),
    statusIdx: index('referrals_status_idx').on(table.status),
  }),
);

export const referralsRelations = relations(referralsTable, ({ one }) => ({
  referrerOrg: one(organizationsTable, {
    fields: [referralsTable.referrerOrgId],
    references: [organizationsTable.id],
  }),
}));

export type Referral = typeof referralsTable.$inferSelect;
export type NewReferral = typeof referralsTable.$inferInsert;
