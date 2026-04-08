/**
 * One-time migration: adds missing columns/tables to the Neon DB.
 * Run from project root: node scripts/migrate-missing.mjs
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
  for (const line of env.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
} catch { /* use existing env */ }

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const sql = neon(DATABASE_URL);

// Build a frozen TemplateStringsArray so neon treats it as a literal SQL string
function mkStrings(s) {
  return Object.freeze(Object.assign([s], { raw: Object.freeze([s]) }));
}
async function exec(query) {
  return sql(mkStrings(query));
}

async function run() {
  console.log('Running migration…\n');

  for (const [col, type] of [
    ['health_breakdown',      'jsonb'],
    ['weekly_focus',          'jsonb'],
    ['last_briefing_sent_at', 'timestamptz'],
    ['white_label',           'jsonb'],
  ]) {
    await exec(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    console.log(`  organizations.${col} — OK`);
  }

  await exec(`CREATE TABLE IF NOT EXISTS growth_streaks (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    current_streak           integer DEFAULT 0 NOT NULL,
    longest_streak           integer DEFAULT 0 NOT NULL,
    streak_freeze_available  boolean DEFAULT true NOT NULL,
    last_calculated_at       timestamptz,
    created_at               timestamptz DEFAULT now() NOT NULL,
    updated_at               timestamptz DEFAULT now() NOT NULL
  )`);
  await exec(`CREATE INDEX IF NOT EXISTS growth_streaks_org_idx ON growth_streaks(org_id)`);
  console.log('  growth_streaks — OK');

  await exec(`CREATE TABLE IF NOT EXISTS growth_streak_weeks (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week_start     date NOT NULL,
    growth_score   integer NOT NULL,
    previous_score integer,
    improved       boolean DEFAULT false NOT NULL,
    freeze_used    boolean DEFAULT false NOT NULL,
    created_at     timestamptz DEFAULT now() NOT NULL
  )`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS growth_streak_weeks_org_week_idx ON growth_streak_weeks(org_id, week_start)`);
  console.log('  growth_streak_weeks — OK');

  try {
    await exec(`CREATE TYPE metric_type AS ENUM ('growth_score','traffic_growth_rate','lead_conversion_rate')`);
  } catch { /* already exists */ }
  await exec(`CREATE TABLE IF NOT EXISTS benchmark_snapshots (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_type     varchar(50) NOT NULL,
    metric_type   metric_type NOT NULL,
    value         real NOT NULL,
    percentile    integer NOT NULL,
    snapshot_date varchar(10) NOT NULL,
    created_at    timestamptz DEFAULT now() NOT NULL
  )`);
  await exec(`CREATE INDEX IF NOT EXISTS benchmark_snapshots_org_date_idx ON benchmark_snapshots(org_id, snapshot_date)`);
  console.log('  benchmark_snapshots — OK');

  await exec(`CREATE TABLE IF NOT EXISTS revenue_settings (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    average_deal_value  integer DEFAULT 1500 NOT NULL,
    close_rate          integer DEFAULT 20 NOT NULL,
    lead_to_call_rate   integer DEFAULT 30 NOT NULL,
    created_at          timestamptz DEFAULT now() NOT NULL,
    updated_at          timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  revenue_settings — OK');

  await exec(`CREATE TABLE IF NOT EXISTS revenue_snapshots (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month             date NOT NULL,
    visitors          integer DEFAULT 0 NOT NULL,
    leads             integer DEFAULT 0 NOT NULL,
    calls             integer DEFAULT 0 NOT NULL,
    deals             integer DEFAULT 0 NOT NULL,
    estimated_revenue integer DEFAULT 0 NOT NULL,
    created_at        timestamptz DEFAULT now() NOT NULL
  )`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS revenue_snapshots_org_month_idx ON revenue_snapshots(org_id, month)`);
  console.log('  revenue_snapshots — OK');

  await exec(`CREATE TABLE IF NOT EXISTS strategy_briefs (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brief_date date NOT NULL,
    content    text,
    ai_summary text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  strategy_briefs — OK');

  await exec(`CREATE TABLE IF NOT EXISTS growth_predictions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prediction_date date NOT NULL,
    predictions     jsonb,
    created_at      timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  growth_predictions — OK');

  await exec(`CREATE TABLE IF NOT EXISTS growth_goals (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    goal_type  varchar(100) NOT NULL,
    target     integer NOT NULL,
    current    integer DEFAULT 0 NOT NULL,
    due_date   date,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  growth_goals — OK');

  await exec(`CREATE TABLE IF NOT EXISTS page_feedback (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    page_id       uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    rating        integer,
    feedback_text text,
    created_at    timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  page_feedback — OK');

  await exec(`CREATE TABLE IF NOT EXISTS notification_preferences (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferences jsonb,
    created_at  timestamptz DEFAULT now() NOT NULL,
    updated_at  timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  notification_preferences — OK');

  await exec(`CREATE TABLE IF NOT EXISTS brand_asset_versions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    uuid NOT NULL REFERENCES brand_assets(id) ON DELETE CASCADE,
    version     integer DEFAULT 1 NOT NULL,
    file_url    varchar(500),
    uploaded_at timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  brand_asset_versions — OK');

  await exec(`CREATE TABLE IF NOT EXISTS message_attachments (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url   varchar(500) NOT NULL,
    file_name  varchar(255),
    file_size  integer,
    created_at timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  message_attachments — OK');

  await exec(`CREATE TABLE IF NOT EXISTS referrals (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    referral_code  varchar(50) UNIQUE NOT NULL,
    referred_name  varchar(255),
    referred_email varchar(255),
    status         varchar(50) DEFAULT 'pending' NOT NULL,
    reward_paid    boolean DEFAULT false NOT NULL,
    created_at     timestamptz DEFAULT now() NOT NULL,
    updated_at     timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  referrals — OK');

  await exec(`CREATE TABLE IF NOT EXISTS case_studies (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title      varchar(500) NOT NULL,
    content    text,
    published  boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  case_studies — OK');

  await exec(`CREATE TABLE IF NOT EXISTS client_wins (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title       varchar(500) NOT NULL,
    description text,
    win_date    date,
    created_at  timestamptz DEFAULT now() NOT NULL
  )`);
  console.log('  client_wins — OK');

  console.log('\nMigration complete! ✓');
}

run().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
