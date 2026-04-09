# CWS Client Portal — Deployment Guide

**Domain:** portal.caliberwebstudio.com  
**Stack:** Next.js 15, Clerk, Neon Postgres, Drizzle ORM, Stripe, Pusher, Resend, Vercel Blob, ScreenshotOne, Firecrawl, Anthropic

---

## Prerequisites

- Vercel account (Pro or higher — needed for cron jobs)
- GitHub repo connected to Vercel
- All service accounts created (see Step 1)

---

## Step 1 — Create service accounts

### 1.1 Neon (Database)
1. Go to [neon.tech](https://neon.tech) → New Project → name it `cws-client-portal`
2. Select region closest to your users (e.g., `us-east-1`)
3. Copy the **Connection string** → this is your `DATABASE_URL`
   - Format: `postgresql://user:password@host/database?sslmode=require`

### 1.2 Clerk (Auth)
1. Go to [clerk.com](https://clerk.com) → Create application → name it `CWS Client Portal`
2. Enable **Email** sign-in (disable social providers unless desired)
3. Under **API Keys** copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)
4. Under **Webhooks** → Add endpoint:
   - URL: `https://portal.caliberwebstudio.com/api/auth/webhook`
   - Events to subscribe: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → this is NOT a separate env var (handled by Svix in the webhook route)
5. Under **Paths** set:
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`

### 1.3 Stripe (Billing)
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → make sure you're in **Live mode**
2. Copy API keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_live_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)
3. Create Products (Products → Add product):

   | Product Name | Price | Billing | Description |
   |---|---|---|---|
   | Starter | $197.00/mo | Recurring monthly | Starter plan |
   | Growth | $397.00/mo | Recurring monthly | Growth plan |
   | Domination | $697.00/mo | Recurring monthly | Domination plan |

4. Copy each **Price ID** (starts with `price_`) — you'll need these when creating clients in the admin panel
5. Webhooks → Add endpoint:
   - URL: `https://portal.caliberwebstudio.com/api/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

### 1.4 Pusher (Real-time)
1. Go to [pusher.com](https://pusher.com) → Create app → name it `cws-client-portal`
2. Select cluster closest to your users (e.g., `mt1` for US East)
3. Under **App Keys** copy:
   - `NEXT_PUBLIC_PUSHER_APP_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER` (e.g., `mt1`)
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`

### 1.5 Resend (Email)
1. Go to [resend.com](https://resend.com) → API Keys → Create API key
2. Copy the key → `RESEND_API_KEY`
3. Domains → Add domain → add `caliberwebstudio.com`
4. Add the DNS records shown to your domain registrar
5. Wait for verification (usually < 5 min)
6. Sender email used in code: `noreply@caliberwebstudio.com` (verify this matches your verified domain)

### 1.6 Vercel Blob (File uploads)
1. In your Vercel project → Storage → Create Database → Blob
2. Name it `cws-portal-blob`
3. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` — no manual copy needed if deploying to Vercel
4. For local dev: copy the token from Vercel dashboard → `.env.local` as `BLOB_READ_WRITE_TOKEN`

### 1.7 ScreenshotOne (Website screenshots)
1. Go to [screenshotone.com](https://screenshotone.com) → Sign up → API Keys
2. Copy your API key → `SCREENSHOTONE_API_KEY`
3. This is optional — the app gracefully degrades if missing

### 1.8 Firecrawl (Competitor Pulse + AI Auditor)
1. Go to [firecrawl.dev](https://firecrawl.dev) → Sign up → API Keys
2. Copy your key → `FIRECRAWL_API_KEY`
3. Required for Competitor Pulse and AI Website Auditor features

### 1.9 Anthropic (Claude AI)
1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create key
2. Copy → `ANTHROPIC_API_KEY`
3. Required for Morning Brief AI summaries, Strategy Brief generation, Case Study generator

### 1.10 UploadThing (Brand asset uploads)
1. Go to [uploadthing.com](https://uploadthing.com) → Create app → name it `cws-client-portal`
2. Under **API Keys** copy:
   - `UPLOADTHING_SECRET`
   - `NEXT_PUBLIC_UPLOADTHING_APP_ID`

---

## Step 2 — Configure environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add all of the following for **Production** (and optionally Preview):

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
PUSHER_APP_ID=...
PUSHER_SECRET=...

# UploadThing
UPLOADTHING_SECRET=sk_...
NEXT_PUBLIC_UPLOADTHING_APP_ID=...

# Screenshots (optional)
SCREENSHOTONE_API_KEY=...

# Firecrawl
FIRECRAWL_API_KEY=fc-...

# Cron auth (generate a random 32-char string, e.g. openssl rand -hex 16)
CRON_SECRET=your_random_secret_here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://portal.caliberwebstudio.com
NODE_ENV=production
```

> **Note:** `BLOB_READ_WRITE_TOKEN` is auto-injected by Vercel when you connect a Blob store. You do not need to add it manually.

---

## Step 3 — Deploy to Vercel

1. Push the `master` branch to GitHub (if not already done)
2. In Vercel → New Project → Import from GitHub → select `cws-client-portal`
3. Framework: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. Build command: `npm run build` (default)
6. Output directory: `.next` (default)
7. Click **Deploy**

### Custom domain
1. Vercel → Project → Settings → Domains
2. Add `portal.caliberwebstudio.com`
3. Add the DNS records shown to your registrar (CNAME or A record)
4. Wait for SSL provisioning (usually < 2 min)

---

## Step 4 — Run database migrations

After deploy, run once to create all tables:

```bash
# From your local machine with DATABASE_URL set in .env.local
npm run db:push
```

Or use Drizzle Kit migrate if you prefer migration files:
```bash
npm run db:migrate
```

> **Important:** Only run this once against the production database. All 30 tables use the `cws_` prefix.

---

## Step 5 — Seed admin user

1. Sign up via `https://portal.caliberwebstudio.com/signup` with your email
2. In Neon console (or any Postgres client), run:
   ```sql
   UPDATE cws_users SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. The admin panel is at `/admin`

---

## Step 6 — Verify cron jobs

The following cron jobs are configured in `vercel.json` (Vercel Pro required):

| Cron | Schedule | Purpose |
|---|---|---|
| `/api/cron/morning-brief` | 7am daily | Generate AI morning briefs |
| `/api/cron/analytics-sync` | 5am daily | Sync analytics data |
| `/api/cron/health-scores` | 4am daily | Recalculate client health scores |
| `/api/cron/weekly-digest` | Mon 8am | Send weekly digest emails |
| `/api/cron/calculate-streaks` | Mon 8am | Update growth streaks |
| `/api/cron/competitor-scan` | Mon 7am | Scan competitor sites |
| `/api/cron/screenshots` | Sun 3am | Refresh website screenshots |
| `/api/cron/site-audit` | 1st of month 6am | Run full site audits |
| `/api/cron/generate-strategy-briefs` | 1st of month 9am | Generate monthly strategy briefs |

Each cron route checks the `Authorization: Bearer $CRON_SECRET` header. Make sure `CRON_SECRET` is set in Vercel env vars.

---

## Step 7 — Smoke test checklist

- [ ] `https://portal.caliberwebstudio.com` redirects to `/login`
- [ ] Sign up creates a user (check Clerk dashboard + Neon `cws_users` table)
- [ ] `/dashboard` loads with sidebar and health score
- [ ] `/settings/billing` shows Stripe plans
- [ ] `/messages` — send a test message (Pusher real-time)
- [ ] `/brand/logos` — upload a logo (UploadThing)
- [ ] `/competitors` — add a competitor (Firecrawl scan)
- [ ] `/audit` — run a site audit
- [ ] Admin panel `/admin` accessible with admin role
- [ ] Stripe webhook fires on test subscription (use Stripe CLI: `stripe trigger customer.subscription.created`)

---

## Troubleshooting

**Build fails locally:** Run `npm install` then `npm run build`. TypeScript errors are the only real blockers.

**DB connection fails:** Make sure `DATABASE_URL` includes `?sslmode=require` for Neon.

**Clerk webhook 400s:** Check the webhook URL is exactly `/api/auth/webhook` and the endpoint is active in Clerk dashboard.

**Pusher not connecting:** Verify `NEXT_PUBLIC_PUSHER_CLUSTER` matches the cluster your Pusher app is on.

**Crons not firing:** Vercel Pro required. Check `CRON_SECRET` is set. Test manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://portal.caliberwebstudio.com/api/cron/health-scores`

**"Upgrade required" gates showing incorrectly:** Client's Stripe subscription status in `cws_organizations.plan` must match their subscription. Check the Stripe webhook is configured and firing.
