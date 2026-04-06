import { db } from "@/db";
import { brandAssets, assetVersions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getBrandAssets(orgId: string, type?: string) {
  let query = db.select().from(brandAssets).where(eq(brandAssets.organizationId, orgId));

  if (type) {
    query = query.where(eq(brandAssets.type, type));
  }

  return query;
}

export async function createBrandAsset(data: {
  organizationId: string;
  type: "logo" | "color" | "font" | "image" | "icon" | "other";
  name: string;
  url?: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const result = await db
    .insert(brandAssets)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create initial version
  if (result?.[0]) {
    await db.insert(assetVersions).values({
      assetId: result[0].id,
      version: 1,
      url: data.url || "",
      metadata: data.metadata || {},
      createdAt: new Date(),
    });
  }

  return result?.[0] || null;
}

export async function deleteBrandAsset(id: string) {
  // Delete versions first
  await db.delete(assetVersions).where(eq(assetVersions.assetId, id));

  // Delete asset
  const result = await db
    .delete(brandAssets)
    .where(eq(brandAssets.id, id))
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
    .insert(assetVersions)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return result?.[0] || null;
}
