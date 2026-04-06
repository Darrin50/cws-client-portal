import { pgTable, pgEnum, uuid, varchar, integer, jsonb, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizationsTable } from './organizations';

export const assetTypeEnum = pgEnum('asset_type', [
  'primary_logo',
  'secondary_logo',
  'icon',
  'favicon',
  'color',
  'font',
  'guidelines',
  'photo',
]);

export const brandAssetsTable = pgTable(
  'brand_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    assetType: assetTypeEnum('asset_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    fileUrl: varchar('file_url', { length: 500 }),
    fileName: varchar('file_name', { length: 255 }),
    fileSize: integer('file_size'),
    mimeType: varchar('mime_type', { length: 100 }),
    metadata: jsonb('metadata'),
    sortOrder: integer('sort_order').default(0).notNull(),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orgIdFk: foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationsTable.id],
      name: 'brand_assets_organization_id_fk',
    }).onDelete('cascade'),
    orgIdIdx: index('brand_assets_organization_id_idx').on(table.organizationId),
    assetTypeIdx: index('brand_assets_asset_type_idx').on(table.assetType),
  }),
);

export const brandAssetVersionsTable = pgTable(
  'brand_asset_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brandAssetId: uuid('brand_asset_id').notNull(),
    fileUrl: varchar('file_url', { length: 500 }),
    fileName: varchar('file_name', { length: 255 }),
    fileSize: integer('file_size'),
    version: integer('version').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    brandAssetIdFk: foreignKey({
      columns: [table.brandAssetId],
      foreignColumns: [brandAssetsTable.id],
      name: 'brand_asset_versions_brand_asset_id_fk',
    }).onDelete('cascade'),
    brandAssetIdIdx: index('brand_asset_versions_brand_asset_id_idx').on(table.brandAssetId),
  }),
);

export const brandAssetsRelations = relations(brandAssetsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [brandAssetsTable.organizationId],
    references: [organizationsTable.id],
  }),
  versions: many(brandAssetVersionsTable),
}));

export const brandAssetVersionsRelations = relations(brandAssetVersionsTable, ({ one }) => ({
  brandAsset: one(brandAssetsTable, {
    fields: [brandAssetVersionsTable.brandAssetId],
    references: [brandAssetsTable.id],
  }),
}));

export type BrandAsset = typeof brandAssetsTable.$inferSelect;
export type NewBrandAsset = typeof brandAssetsTable.$inferInsert;
export type BrandAssetVersion = typeof brandAssetVersionsTable.$inferSelect;
export type NewBrandAssetVersion = typeof brandAssetVersionsTable.$inferInsert;
