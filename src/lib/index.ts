// Auth
export { getCurrentUser, requireAuth, requireAdmin, requireOrgAccess, getUserOrganization, AuthError } from "./auth";

// Data Access Layer - Organizations
export { getOrganization, getOrganizationBySlug, updateOrganization, getOrganizationMembers, getAllOrganizations, getOrganizationStats } from "./data/organizations";

// Data Access Layer - Pages
export { getPages, getPage, createPage, updatePage, deletePage, getPagesWithCommentCounts } from "./data/pages";

// Data Access Layer - Comments
export { getComments, getComment, createComment, updateCommentStatus, deleteComment, getOpenRequestsCount, getQueueData, type CommentFilters } from "./data/comments";

// Data Access Layer - Brand Assets
export { getBrandAssets, createBrandAsset, deleteBrandAsset, createAssetVersion } from "./data/brand-assets";

// Data Access Layer - Messages
export { getMessages, createMessage, markMessageRead, getUnreadCount } from "./data/messages";

// Data Access Layer - Notifications
export { getNotifications, createNotification, markRead, markAllRead, getUnreadCount as getNotificationUnreadCount, getNotificationPreferences, updateNotificationPreference } from "./data/notifications";

// Data Access Layer - Reports
export { getReports, getReport, createReport, getLatestReport } from "./data/reports";

// Data Access Layer - Social Posts
export { getSocialPosts, createSocialPost, updateSocialPost, approveSocialPost, rejectSocialPost } from "./data/social-posts";

// Data Access Layer - Analytics
export { getAnalyticsSnapshots, getLeads, createLead, updateLeadStatus, getTrafficData, getSourcesData, type DateRange } from "./data/analytics";

// Data Access Layer - FAQ
export { getFaqArticles, getFaqArticle, createFaqArticle, updateFaqArticle, deleteFaqArticle, markHelpful } from "./data/faq";

// Data Access Layer - Audit
export { createAuditLog, getAuditLogs, type AuditLogParams } from "./data/audit";

// Data Access Layer - Admin
export { getRevenueMetrics, getClientList, getDashboardStats } from "./data/admin";

// Server Actions
export { submitRequest, updateRequestStatus } from "./actions/comments";
export { sendMessage, markAsRead } from "./actions/messages";
export { uploadBrandAsset, removeBrandAsset } from "./actions/brand-assets";
export { updateBusinessInfo, updateNotificationPreferences, inviteTeamMember, removeTeamMember } from "./actions/settings";
export { updateCommentStatusAdmin, uploadReport, createFaqItem, sendBroadcast } from "./actions/admin";

// Email
export { sendEmail, sendEmailBatch } from "./email";
export { EmailLayout } from "./email/templates/layout";
export { RequestStatusEmail } from "./email/templates/request-status";
export { NewMessageEmail } from "./email/templates/new-message";
export { WelcomeEmail } from "./email/templates/welcome";
export { ReportAvailableEmail } from "./email/templates/report-available";
export { PaymentFailedEmail } from "./email/templates/payment-failed";
export { TeamInviteEmail } from "./email/templates/team-invite";

// Utilities
export { uploadFile, deleteFile, getSignedUrl } from "./upload";
export { stripe, createBillingSession, getSubscription, getInvoices, cancelSubscription, updateSubscription } from "./stripe";
export { pusherServer, pusherClientConfig, getPusherClient, triggerEvent, triggerPresence } from "./pusher";
export { captureScreenshot, captureScreenshotAndUpload } from "./screenshot";
export { calculateHealthScore, getHealthGrade, getHealthRecommendations, type HealthMetrics } from "./health-score";

// Constants
export * from "./constants";

// Validators
export * from "./validators";
