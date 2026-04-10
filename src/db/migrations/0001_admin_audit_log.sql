-- Migration: 0001_admin_audit_log
-- Creates the admin_audit_log table for impersonation + manual trigger audit trail.
-- Run with: npx drizzle-kit push  OR apply this SQL directly against your Neon DB.

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_clerk_user_id" varchar(255) NOT NULL,
  "action" varchar(100) NOT NULL,
  "target_org_id" uuid,
  "details" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_audit_log_admin_user_idx"
  ON "admin_audit_log" ("admin_clerk_user_id");

CREATE INDEX IF NOT EXISTS "admin_audit_log_target_org_idx"
  ON "admin_audit_log" ("target_org_id");

CREATE INDEX IF NOT EXISTS "admin_audit_log_created_at_idx"
  ON "admin_audit_log" ("created_at");

CREATE INDEX IF NOT EXISTS "admin_audit_log_action_idx"
  ON "admin_audit_log" ("action");
