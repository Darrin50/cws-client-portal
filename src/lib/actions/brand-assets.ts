"use server";

import { uploadAssetSchema } from "@/lib/validators";
import { createBrandAsset, deleteBrandAsset, getBrandAssets } from "@/lib/data/brand-assets";
import { uploadFile, deleteFile } from "@/lib/upload";
import { createAuditLog } from "@/lib/data/audit";
import { requireOrgAccess } from "@/lib/auth";

export async function uploadBrandAsset(
  formData: FormData,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Check authorization
    const { userId } = await requireOrgAccess(organizationId);

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return { error: "No file provided" };
    }

    // Validate
    const validated = uploadAssetSchema.parse({
      name,
      type,
      description,
      fileSize: file.size,
    });

    // Upload to Vercel Blob
    const url = await uploadFile(file, `brand-assets/${organizationId}`);

    // Create brand asset record
    const asset = await createBrandAsset({
      organizationId,
      type: validated.type as any,
      name: validated.name,
      url,
      description: validated.description,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    if (!asset) {
      // Clean up uploaded file if record creation fails
      await deleteFile(url);
      return { error: "Failed to create asset record" };
    }

    // Log audit event
    await createAuditLog({
      organizationId,
      userId,
      action: "brand_asset_uploaded",
      resourceType: "brand_asset",
      resourceId: asset.id,
      changes: {
        name: asset.name,
        type: asset.assetType,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, asset };
  } catch (error) {
    console.error("Error uploading brand asset:", error);
    return { error: "Failed to upload asset" };
  }
}

export async function removeBrandAsset(
  assetId: string,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Check authorization
    const { userId } = await requireOrgAccess(organizationId);

    // Get asset to retrieve URL for deletion
    const assets = await getBrandAssets(organizationId);
    const asset = assets.find((a) => a.id === assetId);

    if (!asset) {
      return { error: "Asset not found" };
    }

    // Delete from blob storage if URL exists
    if (asset.fileUrl) {
      await deleteFile(asset.fileUrl);
    }

    // Delete record
    const deleted = await deleteBrandAsset(assetId);

    // Log audit event
    await createAuditLog({
      organizationId,
      userId,
      action: "brand_asset_deleted",
      resourceType: "brand_asset",
      resourceId: assetId,
      changes: {
        name: asset.name,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, deleted };
  } catch (error) {
    console.error("Error deleting brand asset:", error);
    return { error: "Failed to delete asset" };
  }
}
