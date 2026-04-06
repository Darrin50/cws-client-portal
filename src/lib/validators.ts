import { z } from "zod";

// Comment/Request validators
export const createCommentSchema = z.object({
  organizationId: z.string().min(1),
  pageId: z.string().min(1),
  content: z.string().min(1).max(5000),
  type: z.enum(["comment", "request"]),
  priority: z.enum(["low", "medium", "high"]).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  screenshot: z.string().url().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentStatusSchema = z.object({
  organizationId: z.string().min(1),
  commentId: z.string().min(1),
  status: z.enum(["open", "in-progress", "resolved"]),
  resolutionNote: z.string().max(1000).optional(),
});

export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusSchema>;

// Message validators
export const sendMessageSchema = z.object({
  organizationId: z.string().min(1),
  recipientId: z.string().min(1),
  recipientEmail: z.string().email(),
  content: z.string().min(1).max(5000),
  subject: z.string().min(1).max(200).optional(),
  channel: z.enum(["in-app", "email", "sms"]).optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Business info validator
export const updateBusinessInfoSchema = z.object({
  name: z.string().min(1).max(255),
  website: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  timezone: z.string().optional(),
});

export type UpdateBusinessInfoInput = z.infer<typeof updateBusinessInfoSchema>;

// Team member invite validator
export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
  message: z.string().max(500).optional(),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

// Brand asset validators
export const uploadAssetSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["logo", "color", "font", "image", "icon", "other"]),
  description: z.string().max(1000).optional(),
  fileSize: z.number().max(50 * 1024 * 1024), // 50MB max
});

export type UploadAssetInput = z.infer<typeof uploadAssetSchema>;

// FAQ validators
export const createFaqSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(10000),
  category: z.string().min(1).max(100),
  keywords: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;

// Report validators
export const createReportSchema = z.object({
  organizationId: z.string().min(1),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.record(z.any()).optional(),
  summary: z.string().max(2000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// Social post validators
export const createSocialPostSchema = z.object({
  organizationId: z.string().min(1),
  content: z.string().min(1).max(5000),
  platforms: z.array(z.string()),
  scheduledFor: z.date().optional(),
  imageUrl: z.string().url().optional(),
  caption: z.string().max(500).optional(),
});

export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;

export const updateSocialPostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  platforms: z.array(z.string()).optional(),
  scheduledFor: z.date().optional(),
  imageUrl: z.string().url().optional(),
  caption: z.string().max(500).optional(),
});

export type UpdateSocialPostInput = z.infer<typeof updateSocialPostSchema>;

// Notification preference validator
export const notificationPreferencesSchema = z.object({
  emailRequests: z.boolean().optional(),
  emailMessages: z.boolean().optional(),
  emailReports: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  smsRequests: z.boolean().optional(),
  smsUrgent: z.boolean().optional(),
  inAppAll: z.boolean().optional(),
  digestFrequency: z.enum(["immediate", "daily", "weekly", "off"]).optional(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;

// Page validators
export const createPageSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  screenshot: z.string().url().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  screenshot: z.string().url().optional(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

// Pagination validator
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  cursor: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Date range validator
export const dateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
