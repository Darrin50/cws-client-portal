"use server";

import { createCommentSchema, updateCommentStatusSchema } from "@/lib/validators";
import { createComment, updateCommentStatus, getPage } from "@/lib/data";
import { createNotification, sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/data/audit";
import { requireOrgAccess, requireAuth } from "@/lib/auth";

export async function submitRequest(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Validate input
    const validated = createCommentSchema.parse(formData);

    // Check authorization
    const { userId } = await requireOrgAccess(validated.organizationId);

    // Get page info for email context
    const page = await getPage(validated.pageId);

    if (!page) {
      return { error: "Page not found" };
    }

    // Create comment/request
    const comment = await createComment({
      organizationId: validated.organizationId,
      pageId: validated.pageId,
      authorId: userId,
      content: validated.content,
      type: "request",
      priority: validated.priority,
      x: validated.x,
      y: validated.y,
      screenshot: validated.screenshot,
    });

    if (!comment) {
      return { error: "Failed to create request" };
    }

    // Create notification for team
    await createNotification({
      userId: validated.organizationId, // This would need to be changed to actual team member IDs
      type: "request",
      title: "New request submitted",
      description: `${validated.priority || "medium"} priority request on ${page.title}`,
      relatedId: comment.id,
      link: `/portal/pages/${page.id}#comment-${comment.id}`,
      priority: (validated.priority as any) || "medium",
    });

    // Send email notification
    await sendEmail({
      to: "team@example.com", // Should be dynamic based on org settings
      subject: `New ${validated.priority || "medium"} priority request on ${page.title}`,
      react: null, // Email template would go here
    });

    // Log audit event
    await createAuditLog({
      organizationId: validated.organizationId,
      userId,
      action: "request_submitted",
      resourceType: "comment",
      resourceId: comment.id,
      ipAddress,
      userAgent,
    });

    return { success: true, commentId: comment.id };
  } catch (error) {
    console.error("Error submitting request:", error);
    return { error: "Failed to submit request" };
  }
}

export async function updateRequestStatus(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const validated = updateCommentStatusSchema.parse(formData);

    // Check authorization
    const { userId } = await requireOrgAccess(validated.organizationId);

    // Update status
    const updated = await updateCommentStatus(
      validated.commentId,
      validated.status,
      validated.status === "resolved" ? userId : undefined,
      validated.resolutionNote
    );

    if (!updated) {
      return { error: "Comment not found" };
    }

    // Create audit log
    await createAuditLog({
      organizationId: validated.organizationId,
      userId,
      action: "request_status_updated",
      resourceType: "comment",
      resourceId: validated.commentId,
      changes: {
        status: validated.status,
        note: validated.resolutionNote,
      },
      ipAddress,
      userAgent,
    });

    return { success: true, updated };
  } catch (error) {
    console.error("Error updating request status:", error);
    return { error: "Failed to update status" };
  }
}
