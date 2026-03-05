# AdPulse

## Project Overview
AdPulse is a SaaS app that tracks Meta (Facebook) ad creative fatigue and alerts users when ads are underperforming. Prevents wasted ad spend by monitoring ROAS decline, CTR drops, CPC increases, and frequency saturation.

## Tech Stack
- **Framework:** Next.js (latest stable, App Router, Server Components)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase PostgreSQL via Prisma (session pooler connection)
- **Auth:** Next-Auth v5 (Google OAuth via `next-auth/providers/google`)
- **UI:** React 19 + Shadcn/UI (New York style) + Tailwind CSS 4
- **Charts:** Recharts
- **Email:** Resend
- **Meta SDK:** facebook-nodejs-business-sdk
- **Encryption:** AES-256-GCM for token storage
- **Deployment:** Vercel + GitHub

## Design Guidelines
- Use the `/frontend-design` skill for all UI components and pages
- Aim for a polished, production-grade look — not generic AI aesthetics
- Dark mode support from day one
- Clean, modern dashboard aesthetic with clear data hierarchy

## Deployment & Infrastructure
- **GitHub:** Initialize as a git repo, push to GitHub
- **Vercel:** Deploy via Vercel (connected to GitHub repo)
- **Supabase:** PostgreSQL database (use session pooler connection string for Prisma compatibility)
  - Connection string format: `postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:5432/postgres`
  - Do NOT use the direct `db.*` hostname (IPv6 only, won't work locally)
  - Do NOT use transaction pooler (port 6543) — use session pooler (port 5432)

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Dashboard - ad overview with health summary + account selector
│   ├── layout.tsx            # Root layout with nav
│   ├── login/page.tsx        # Login page (Google OAuth)
│   ├── ads/[id]/page.tsx     # Ad detail - charts, metrics, fatigue breakdown
│   ├── settings/
│   │   ├── page.tsx          # Account mgmt, sync, alert prefs
│   │   └── sync-button.tsx   # Client-side sync trigger
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # Next-Auth handlers
│       │   └── meta/
│       │       ├── route.ts            # Meta OAuth initiation
│       │       └── callback/route.ts   # Meta OAuth callback
│       ├── sync/route.ts              # Manual sync endpoint
│       └── cron/sync/route.ts         # Daily cron (11 AM UTC)
├── components/
│   ├── account-selector.tsx   # Ad account filter dropdown (client, URL param state)
│   ├── ad-card.tsx           # Ad summary card with health badge
│   ├── landing-page.tsx      # Public landing page (AdPulse branded)
│   ├── summary-bar.tsx       # Dashboard stats bar
│   ├── health-badge.tsx      # Color-coded health indicator
│   ├── fatigue-breakdown.tsx # Signal breakdown with progress bars
│   ├── performance-chart.tsx # Recharts line chart wrapper
│   ├── metrics-table.tsx     # Daily metrics data table
│   └── ui/                   # Shadcn components
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── meta-client.ts        # Meta Graph API wrapper (v21.0)
│   ├── sync.ts               # Data sync logic (campaigns -> ads -> metrics)
│   ├── fatigue.ts            # Fatigue scoring algorithm
│   ├── score-all-ads.ts      # Batch scoring orchestration
│   ├── email.ts              # Daily digest email (Resend, AdPulse branded)
│   ├── encryption.ts         # AES-256-GCM token encryption
│   └── utils.ts              # cn() helper
├── types/index.ts            # Meta API + internal types
├── auth.ts                   # Next-Auth config (Google OAuth + PrismaAdapter + JWT)
└── auth.config.ts            # Auth config (Google provider, edge-compatible)
prisma/
├── schema.prisma             # Full schema with auth + business models
└── seed.ts                   # Demo data seeder (demo@adpulse.app)
```

## Key Architecture Decisions
- **Auth:** Google OAuth via NextAuth. `auth.config.ts` is edge-compatible (used by middleware), `auth.ts` adds PrismaAdapter + JWT callbacks. Env vars: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Redirect URI: `{APP_URL}/api/auth/callback/google`.
- **Account Selector:** Dashboard (`page.tsx`) accepts async `searchParams`. URL param `?account=<id>` filters ads to a specific AdAccount. `AccountSelector` component only renders when user has 2+ accounts.
- **Fatigue Algorithm:** 4-factor weighted score (ROAS 40%, CTR 25%, CPC 20%, Frequency 15%). Skips ads < 72hrs old. Needs >= 4 days of data.
- **Status Thresholds:** HEALTHY (0-30), WATCH (31-60), CRITICAL (61+)
- **Token Security:** Meta tokens encrypted with AES-256-GCM, stored as encrypted + IV + auth tag
- **Cron:** Vercel cron at `0 11 * * *` (6 AM EST). Syncs all accounts -> scores all ads -> sends email alerts
- **Data Sync:** Last 7 days of metrics, upserted hierarchically

## Database Schema (Prisma)

### Auth Models (NextAuth required)
- **User** - id, name, email (unique), emailVerified, image, alertEmail, alertsEnabled
- **Account** - OAuth provider accounts (unique on provider+providerAccountId)
- **Session** - User sessions (sessionToken unique)
- **VerificationToken** - Email verification (unique on identifier+token)

### Business Models
- **AdAccount** - userId, metaAccountId, accountName, encryptedToken/tokenIv/tokenTag, tokenExpiresAt, status (ACTIVE/TOKEN_EXPIRED/DISCONNECTED). Unique on userId+metaAccountId.
- **Campaign** - metaCampaignId, adAccountId, name, status, objective, dailyBudget, lifetimeBudget. Unique on adAccountId+metaCampaignId.
- **AdSet** - metaAdSetId, campaignId, name, status, targeting (Json). Unique on campaignId+metaAdSetId.
- **Ad** - metaAdId, adSetId, name, status, thumbnailUrl, creativeBody, metaCreatedTime. Unique on adSetId+metaAdId.
- **AdDailyMetric** - adId, date, spend, impressions, clicks, ctr, cpc, cpm, frequency, reach, conversions, revenue, roas. Unique on adId+date.
- **FatigueScore** - adId, date, score, status (HEALTHY/WATCH/CRITICAL), signals (Json), recommendation. Unique on adId+date.
- **AlertHistory** - userId, type, email, subject, adIds (Json), sentAt, status.

All business models cascade delete from parent. All have appropriate indexes.

## Environment Variables
```
DATABASE_URL=             # Supabase session pooler connection string
AUTH_GOOGLE_ID=           # Google OAuth client ID
AUTH_GOOGLE_SECRET=       # Google OAuth client secret
AUTH_SECRET=              # NextAuth secret (openssl rand -base64 32)
META_APP_ID=              # Facebook Developer App ID
META_APP_SECRET=          # Facebook Developer App Secret
META_REDIRECT_URI=        # http://localhost:3000/api/auth/meta/callback
ENCRYPTION_KEY=           # 32-byte hex key (openssl rand -hex 32)
RESEND_API_KEY=           # Resend email API key
CRON_SECRET=              # Secret for cron endpoint auth
NEXT_PUBLIC_APP_URL=      # http://localhost:3000
```

## Build Rules
- All API routes MUST export `export const dynamic = "force-dynamic"` to prevent static prerendering errors
- Use `NODE_OPTIONS="--max-old-space-size=4096"` for builds if Node hangs
- Never put spaces in directory names
- Keep `node_modules` clean — never kill `npm install` mid-run
- Prisma output goes to `src/generated/prisma` (configured in schema.prisma generator)
- Mark `pg` as a server external package in `next.config.ts`: `serverExternalPackages: ["pg"]`

## Local Development Setup
After cloning or initializing the project, run these steps in order:
```bash
npm install                # Install all dependencies (let it finish completely!)
npx prisma generate        # Generate Prisma client
npx prisma db push          # Push schema to Supabase
npx prisma db seed          # Seed demo data
npm run dev                 # Start dev server on http://localhost:3000
```

The dev server uses Turbopack and supports hot reload — save a file and the browser updates instantly. Keep it running while developing.

### Viewing the site locally
- `npm run dev` starts the server at **http://localhost:3000**
- The dev server stays running and auto-reloads on file changes
- To stop: `Ctrl+C` in the terminal
- To restart: just run `npm run dev` again
- If port 3000 is already in use: `lsof -ti:3000 | xargs kill -9` then retry

### DB connection must fail fast
The `db.ts` Prisma client MUST have a connection timeout. If Supabase is unreachable, the app should throw an error immediately — not hang forever. Use `connectionTimeoutMillis: 5000` on the pg Pool and wrap the connection in error handling.

## Commands
```bash
npm run dev          # Dev server (Turbopack) — http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed demo data
npx prisma studio    # Visual DB browser at http://localhost:5555
```
