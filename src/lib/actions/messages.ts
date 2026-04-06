"use server";

import { sendMessageSchema } from "@/lib/validators";
import { createMessage, markMessageRead } from "@/lib/data/messages";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/data/audit";
import { requireOrgAccess } from "@/lib/auth";

export async function sendMessage(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const validated = sendMessageSchema.parse(formData);

    // Check authorization
    const { userId } = await requireOrgAccess(validated.organizationId);

    // Create message
    const message = await createMessage({
      organizationId: validated.organizationId,
      senderId: userId,
      recipientId: validated.recipientId,
      content: validated.content,
      subject: validated.subject,
      channel: validated.channel || "in-app",
    });

    if (!message) {
      return { error: "Failed to send message" };
    }

    // Send email notification if configured
    if (validated.channel === "email" || validated.channel === "in-app") {
      await sendEmail({
        to: validated.recipientEmail,
        subject: validated.subject || "New message from CWS Portal",
        react: null, // Email template would go here
      });
    }

    // Log audit event
    await createAuditLog({
      organizationId: validated.organizationId,
      userId,
      action: "message_sent",
      resourceType: "message",
      resourceId: message.id,
      ipAddress,
      userAgent,
    });

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

export async function markAsRead(
  messageId: string,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Check authorization
    await requireOrgAccess(organizationId);

    const message = await markMessageRead(messageId);

    if (!message) {
      return { error: "Message not found" };
    }

    return { success: true, message };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { error: "Failed to mark as read" };
  }
}
