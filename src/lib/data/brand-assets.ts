import { db } from "@/db";
import { brandAssetsTable, brandAssetVersionsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getBrandAssets(orgId: string, assetType?: string) {
  const conditions = [eq(brandAssetsTable.organizationId, orgId)];

  if (assetType) {
    conditions.push(eq(brandAssetsTable.assetType, assetType as any));
  }

  const result = await db
    .select()
    .from(brandAssetsTable)
    .where(and(...conditions));

  return result;
}

export async function createBrandAsset(data: {
  organizationId: string;
  type: string;
  name: string;
  url?: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const result = await db
    .insert(brandAssetsTable)
    .values({
      organizationId: data.organizationId,
      assetType: data.type as any,
      name: data.name,
      fileUrl: data.url,
      metadata: data.metadata || null,
    })
    .returning();

  // Create initial version
  if (result?.[0]) {
    await db.insert(brandAssetVersionsTable).values({
      brandAssetId: result[0].id,
      version: 1,
      fileUrl: data.url,
    });
  }

  return result?.[0] || null;
}

export async function deleteBrandAsset(id: string) {
  // Delete versions first
  await db.delete(brandAssetVersionsTable).where(eq(brandAssetVersionsTable.brandAssetId, id));

  // Delete asset
  const result = await db
    .delete(brandAssetsTable)
    .where(eq(brandAssetsTable.id, id))
    .returning();

  return result?.[0] || null;
}

export async function createAssetVersion(data: {
  assetId: string;
  version: number;
  url: string;
  metadata?: Record<string, any>;
}) {
  const result = await db
    .insert(brandAssetVersionsTable)
    .values({
      brandAssetId: data.assetId,
      version: data.version,
      fileUrl: data.url,
    })
    .returning();

  return result?.[0] || null;
}
