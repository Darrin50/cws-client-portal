"use server";

import { updateCommentStatusSchema, createFaqSchema } from "@/lib/validators";
import { updateCommentStatus } from "@/lib/data/comments";
import { createFaqArticle, updateFaqArticle } from "@/lib/data/faq";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/data/audit";
import { uploadFile } from "@/lib/upload";
import { createReport } from "@/lib/data/reports";
import { requireAdmin } from "@/lib/auth";

export async function updateCommentStatusAdmin(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const adminId = await requireAdmin();
    const validated = updateCommentStatusSchema.parse(formData);

    const updated = await updateCommentStatus(
      validated.commentId,
      validated.status,
      adminId,
      validated.resolutionNote
    );

    if (!updated) {
      return { error: "Comment not found" };
    }

    // Log audit event
    await createAuditLog({
      userId: adminId,
      action: "admin_comment_status_updated",
      resourceType: "comment",
      resourceId: validated.commentId,
      changes: {
        status: validated.status,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, updated };
  } catch (error) {
    console.error("Error updating comment status:", error);
    return { error: "Unauthorized" };
  }
}

export async function uploadReport(
  formData: FormData,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const adminId = await requireAdmin();

    const file = formData.get("file") as File;
    const period = formData.get("period") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    if (!file) {
      return { error: "No file provided" };
    }

    // Upload file
    const fileUrl = await uploadFile(file, `reports/${organizationId}`);

    // Create report record
    const report = await createReport({
      organizationId,
      period: period as "monthly" | "quarterly" | "yearly",
      startDate,
      endDate,
      metrics: {},
      fileUrl,
    });

    if (!report) {
      return { error: "Failed to create report" };
    }

    // Log audit event
    await createAuditLog({
      organizationId,
      userId: adminId,
      action: "report_uploaded",
      resourceType: "report",
      resourceId: report.id,
      ipAddress,
      userAgent,
    });

    return { success: true, report };
  } catch (error) {
    console.error("Error uploading report:", error);
    return { error: "Failed to upload report" };
  }
}

export async function createFaqItem(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const adminId = await requireAdmin();
    const validated = createFaqSchema.parse(formData);

    const article = await createFaqArticle({
      title: validated.title,
      content: validated.content,
      category: validated.category,
      keywords: validated.keywords,
      published: validated.published || false,
    });

    if (!article) {
      return { error: "Failed to create FAQ article" };
    }

    // Log audit event
    await createAuditLog({
      userId: adminId,
      action: "faq_article_created",
      resourceType: "faq_article",
      resourceId: article.id,
      ipAddress,
      userAgent,
    });

    return { success: true, article };
  } catch (error) {
    console.error("Error creating FAQ article:", error);
    return { error: "Failed to create FAQ article" };
  }
}

export async function sendBroadcast(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const adminId = await requireAdmin();

    const data = formData as any;
    const { subject, content, recipientFilter } = data;

    // Get recipients based on filter (would fetch from DB based on plan, etc.)
    // For now, placeholder implementation

    // Send email to all matching recipients
    // This would be batched in production
    await sendEmail(
      "broadcast@example.com",
      subject,
      null // Email template would go here
    );

    // Log audit event
    await createAuditLog({
      userId: adminId,
      action: "broadcast_sent",
      resourceType: "broadcast",
      resourceId: "broadcast-" + Date.now(),
      changes: {
        subject,
        filter: recipientFilter,
      },
      ipAddress,
      userAgent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending broadcast:", error);
    return { error: "Failed to send broadcast" };
  }
}
