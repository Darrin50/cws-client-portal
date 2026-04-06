export const PLAN_LIMITS = {
  starter: {
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    teamMembers: 3,
    pages: 10,
    brandAssets: 50,
    requestsPerMonth: 100,
    monthlyReports: false,
    analyticsRetention: 30, // days
  },
  growth: {
    storage: 50 * 1024 * 1024 * 1024, // 50GB
    teamMembers: 10,
    pages: 50,
    brandAssets: 200,
    requestsPerMonth: 500,
    monthlyReports: true,
    analyticsRetention: 90, // days
  },
  enterprise: {
    storage: 500 * 1024 * 1024 * 1024, // 500GB
    teamMembers: 100,
    pages: 500,
    brandAssets: 2000,
    requestsPerMonth: 5000,
    monthlyReports: true,
    analyticsRetention: 365, // days
  },
};

export const SLA_THRESHOLDS = {
  uptime: 99.5,
  responseTime: 2000, // milliseconds
  reportDelivery: 1, // day
  supportResponse: 4, // hours
};

export const FEATURE_GATES = {
  starter: {
    basicComments: true,
    screenshots: false,
    teamCollaboration: false,
    advancedAnalytics: false,
    customBranding: false,
    apiAccess: false,
    sso: false,
  },
  growth: {
    basicComments: true,
    screenshots: true,
    teamCollaboration: true,
    advancedAnalytics: true,
    customBranding: false,
    apiAccess: false,
    sso: false,
  },
  enterprise: {
    basicComments: true,
    screenshots: true,
    teamCollaboration: true,
    advancedAnalytics: true,
    customBranding: true,
    apiAccess: true,
    sso: true,
  },
};

export const NOTIFICATION_CATEGORIES = {
  request: {
    label: "Requests",
    description: "Notifications about submitted requests and updates",
    default: true,
  },
  message: {
    label: "Messages",
    description: "Direct messages from team members",
    default: true,
  },
  report: {
    label: "Reports",
    description: "Monthly and quarterly reports",
    default: true,
  },
  alert: {
    label: "Alerts",
    description: "System alerts and important notices",
    default: true,
  },
  team: {
    label: "Team",
    description: "Team member activities and invitations",
    default: false,
  },
  billing: {
    label: "Billing",
    description: "Billing and payment notifications",
    default: true,
  },
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  documents: ["application/pdf", "application/msword"],
  videos: ["video/mp4", "video/webm"],
};

export const ORGANIZATION_ROLES = {
  owner: {
    label: "Owner",
    permissions: [
      "manage_organization",
      "manage_members",
      "manage_billing",
      "view_all_content",
      "manage_requests",
    ],
  },
  admin: {
    label: "Admin",
    permissions: [
      "manage_members",
      "view_all_content",
      "manage_requests",
      "manage_settings",
    ],
  },
  member: {
    label: "Member",
    permissions: ["view_content", "create_requests", "view_own_content"],
  },
  viewer: {
    label: "Viewer",
    permissions: ["view_content"],
  },
};

export const COMMENT_STATUSES = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

export const COMMENT_PRIORITIES = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const REPORT_PERIODS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const PAYMENT_STATUSES = {
  pending: "Pending",
  processing: "Processing",
  succeeded: "Succeeded",
  failed: "Failed",
  refunded: "Refunded",
};
