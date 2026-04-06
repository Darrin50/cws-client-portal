// Plan Tier Enum
export const enum PlanTier {
  STARTER = "starter",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

// Priority Enum
export const enum Priority {
  NICE_TO_HAVE = "nice-to-have",
  IMPORTANT = "important",
  URGENT = "urgent",
}

// Comment Status Enum
export const enum CommentStatus {
  OPEN = "open",
  RESOLVED = "resolved",
  PENDING = "pending",
}

// Post Status Enum
export const enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
  ARCHIVED = "archived",
}

// Notification Type Enum
export const enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  REQUEST = "request",
}

// Lead Status Enum
export const enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  NEGOTIATING = "negotiating",
  WON = "won",
  LOST = "lost",
}

// User Type
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "admin" | "client" | "team"
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

// Organization Type
export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  planTier: PlanTier
  website?: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

// Page Type
export interface Page {
  id: string
  organizationId: string
  title: string
  slug: string
  content: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

// Comment Type
export interface Comment {
  id: string
  pageId: string
  userId: string
  content: string
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
}

// Brand Asset Type
export interface BrandAsset {
  id: string
  organizationId: string
  name: string
  type: "logo" | "color" | "font" | "image" | "document"
  url: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Message Type
export interface Message {
  id: string
  organizationId: string
  senderId: string
  recipientId: string
  subject: string
  body: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

// Notification Type
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Social Post Type
export interface SocialPost {
  id: string
  organizationId: string
  content: string
  status: PostStatus
  scheduledAt?: Date
  platform: "twitter" | "facebook" | "instagram" | "linkedin"
  engagementMetrics?: {
    likes: number
    comments: number
    shares: number
  }
  createdAt: Date
  updatedAt: Date
}

// Report Type
export interface Report {
  id: string
  organizationId: string
  title: string
  type: "analytics" | "performance" | "traffic" | "conversion"
  generatedAt: Date
  data: Record<string, unknown>
  url?: string
  createdAt: Date
  updatedAt: Date
}

// Lead Type
export interface Lead {
  id: string
  organizationId: string
  name: string
  email: string
  phone?: string
  company?: string
  status: LeadStatus
  source: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// FAQ Article Type
export interface FaqArticle {
  id: string
  category: string
  question: string
  answer: string
  viewCount: number
  helpful: number
  unhelpful: number
  createdAt: Date
  updatedAt: Date
}

// Activity Type
export interface Activity {
  id: string
  organizationId: string
  userId: string
  type:
    | "request_created"
    | "request_updated"
    | "message_received"
    | "report_uploaded"
    | "comment_added"
    | "status_changed"
    | "file_shared"
  title: string
  description?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Utility Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
}

export interface ApiError {
  code: string
  message: string
  field?: string
}

// Request Type
export interface Request {
  id: string
  organizationId: string
  userId: string
  title: string
  description: string
  priority: Priority
  status: "open" | "in-progress" | "completed" | "cancelled"
  dueDate?: Date
  attachments?: string[]
  comments?: Comment[]
  createdAt: Date
  updatedAt: Date
}
