# Fareback Project Master Guide

Last updated: March 30, 2026

## 1. Project Summary

Fareback is a full-stack cashback platform where users:
- Sign in with Google
- Click partner merchant links
- Get click records tracked
- Receive approved cashback credits in wallet
- Submit UPI withdrawal requests

Admins can:
- Track and moderate click records
- Approve rewards
- Credit/debit user wallets manually
- Review and process withdrawal requests
- Send platform notifications

---

## 2. Core Architecture

### Frontend Layer
- Next.js App Router pages under src/app
- React components under src/components
- Tailwind v4 styling from src/app/globals.css

### Backend Layer
- Next.js Route Handlers under src/app/api
- Next.js Server Actions under src/app/actions
- Business/domain logic in src/lib

### Data Layer
- PostgreSQL (Neon)
- Drizzle ORM schema in src/lib/db/schema.ts
- SQL migrations in drizzle/

### Optional Infra
- Upstash Redis for high-concurrency affiliate rotation

---

## 3. Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4 + PostCSS
- Drizzle ORM + drizzle-kit
- Neon Postgres
- Zod validation
- next-themes (dark/light)
- Vitest (unit tests)
- ESLint (quality checks)
- GitHub Actions + Vercel deployment

---

## 4. Runtime and Scripts

Main scripts from package.json:
- dev: start dev server
- build: production build
- start: start production server
- lint: lint codebase
- test / test:run: run tests
- db:push / db:migrate / db:generate / db:studio
- db:seed
- load-test / load-test:quick / load-test:stress

---

## 5. Environment Variables (What they do)

Database:
- DATABASE_URL: pooled Neon URL for app runtime queries
- DATABASE_URL_UNPOOLED: direct Neon URL for migrations

App/Auth:
- NEXT_PUBLIC_APP_URL: app base URL
- ADMIN_EMAIL / ADMIN_EMAILS: admin account bootstrap
- GOOGLE_CLIENT_ID: Google OAuth client id
- GOOGLE_CLIENT_SECRET: Google OAuth secret

Affiliate/Scaling:
- AMAZON_AFFILIATE_BASE_URL: fallback Amazon affiliate base
- UPSTASH_REDIS_REST_URL: Redis endpoint
- UPSTASH_REDIS_REST_TOKEN: Redis auth token

Brand/social:
- NEXT_PUBLIC_GITHUB_URL
- NEXT_PUBLIC_TWITTER_URL
- NEXT_PUBLIC_INSTAGRAM_URL

---

## 6. End-to-End Functional Flows

### A) Sign-in Flow
1. User opens sign-in page
2. Route sends user to Google OAuth
3. Callback verifies state and exchanges code for tokens
4. App creates/updates user in DB
5. App creates session row + HTTP-only cookie
6. User redirected to target page

### B) Merchant Click and Redirect Flow
1. Logged-in user clicks merchant CTA
2. /api/redirect validates merchant and user
3. App applies idempotency lock to avoid duplicate rapid clicks
4. Click record saved in clicks table
5. For Amazon, affiliate link rotates by counter
6. User redirected to merchant destination URL

### C) Cashback Approval and Wallet Flow
1. Admin marks click tracked or approved
2. Approved click creates wallet credit transaction
3. Wallet balance updates
4. User sees balance in dashboard/navbar APIs

### D) Withdrawal Flow
1. User submits UPI + amount
2. Server validates input and wallet balance
3. Pending withdrawal request created
4. Admin approve/reject/mark-paid actions
5. On approval, wallet gets debited

### E) Notifications Flow
1. Admin sends alert to one user or all users
2. Notification rows stored in DB
3. Navbar bell fetches unread count
4. Notifications page marks unread as read

---

## 7. Database Model (Business Meaning)

- users: account profile, admin flag
- sessions: auth sessions and expiry
- networks: affiliate networks
- merchants: merchant links and cashback rates
- clicks: user merchant clicks + tracking status
- wallets: per-user wallet balance
- wallet_transactions: credit/debit ledger
- withdrawal_requests: UPI cashout requests
- notifications: admin-to-user alerts
- affiliate_link_counter: global rotation counter

Key click statuses:
- unreviewed
- tracked
- approved
- deleted

Key withdrawal statuses:
- pending
- approved
- rejected
- paid

---

## 8. Folder-by-Folder Purpose

### Root
- Project config, docs, lockfiles, branding assets

### .github/workflows
- CI/CD and manual DB seed workflows

### drizzle
- SQL migrations and migration metadata

### public
- Public static assets (logos/favicons)

### scripts
- Seed/load-test/admin-debug scripts

### src/app
- Routes, pages, API endpoints, server actions

### src/components
- Shared UI and feature components

### src/hooks
- Custom hooks

### src/lib
- Domain logic, db wiring, utilities, validation schemas

---

## 9. File-by-File Purpose Catalog

## Root files
- .env.example: environment variable template and deployment notes
- .gitignore: ignored files and folders for git
- .node-version: node version pin
- .nvmrc: node version pin
- Brandnameblack.svg: branding asset
- Brandnamewhite.svg: branding asset
- Favicon Black.svg: branding asset
- Favicon White.svg: branding asset
- amazonlinks.csv: affiliate link source data (Amazon rotation)
- briefinfo.txt: project business + technical summary
- drizzle.config.ts: drizzle-kit config and DB credentials source
- eslint.config.mjs: eslint setup
- next-env.d.ts: Next.js TypeScript ambient declarations
- next.config.ts: security headers, redirects, image behavior
- OPTIMIZATION_REPORT.md: optimization history and rationale
- package.json: dependencies and scripts
- PERFORMANCE_IMPROVEMENTS.md: performance implementation guide
- postcss.config.mjs: Tailwind PostCSS integration
- PROJECT_FULL_GUIDE.md: this master document
- QUICK_REFERENCE.md: affiliate system quick operation notes
- README.md: setup, env, DB and deployment instructions
- tsconfig.json: TypeScript compiler config
- vitest.config.ts: vitest test config
- bun.lock: dependency lockfile

## GitHub workflows
- .github/workflows/deploy.yml: lint/test/build + vercel preview/prod deploy + db sync/seed
- .github/workflows/db-seed.yml: manual workflow to push schema and seed selected merchants

## Drizzle migrations and metadata
- drizzle/0000_cloudy_dagger.sql: initial DB schema
- drizzle/0001_click_tracking_controls.sql: click tracking control columns + enums
- drizzle/0002_click_deleted_notifications.sql: deleted click state + notifications table
- drizzle/0003_performance_indexes.sql: performance indexes
- drizzle/0004_affiliate_link_tracking.sql: click affiliate link metadata columns
- drizzle/0005_affiliate_link_counter.sql: affiliate counter table
- drizzle/neon-init.sql: SQL init snapshot for Neon
- drizzle/meta/_journal.json: migration run journal
- drizzle/meta/0000_snapshot.json: schema snapshot metadata

## Public assets
- public/brand-name-dark.svg: dark mode brand text/logo
- public/brand-name-light.svg: light mode brand text/logo
- public/favicon-black.svg: light mode favicon
- public/favicon-white.svg: dark mode favicon

## Scripts
- scripts/affiliate-admin.ts: CLI for affiliate status/stats/reset
- scripts/load-test.js: load testing utility with capacity estimate
- scripts/seed-merchants.mjs: merchant seed/update script
- scripts/test-affiliate-rotation.js: concurrent affiliate rotation test script

## App routes and pages
- src/app/icon.svg: app icon
- src/app/layout.tsx: global html/body layout and metadata
- src/app/globals.css: global style tokens and theme variables
- src/app/loading.tsx: app-level loading state
- src/app/error.tsx: app-level error boundary UI
- src/app/not-found.tsx: 404 page
- src/app/page.tsx: homepage and offers/tracking sections
- src/app/(auth)/sign-in/page.tsx: sign-in UI page
- src/app/admin/page.tsx: admin panel
- src/app/affiliate-rates/page.tsx: cashback rates explanatory page
- src/app/dashboard/page.tsx: user dashboard/wallet/withdraw form
- src/app/merchants/page.tsx: merchant launch transition page
- src/app/notifications/page.tsx: user notification center
- src/app/privacy/page.tsx: privacy policy page
- src/app/terms/page.tsx: terms page

## Server actions
- src/app/actions/auth.ts: sign-out action
- src/app/actions/notifications.ts: send alerts + mark read
- src/app/actions/wallet.ts: wallet updates, click moderation, withdrawals

## API endpoints
- src/app/api/auth/google/route.ts: start google oauth flow
- src/app/api/auth/google/callback/route.ts: oauth callback handler
- src/app/api/health/db/route.ts: DB health endpoint
- src/app/api/redirect/route.ts: tracking + affiliate redirect endpoint
- src/app/api/user/notifications/unread-count/route.ts: unread notifications count API
- src/app/api/user/wallet/route.ts: current user wallet API

## Components
- src/components/dashboard-toggle-button.tsx: dashboard/home toggle button
- src/components/footer-nav-link.tsx: smart client navigation/anchor handling
- src/components/footer.tsx: global footer
- src/components/hero-carousel.tsx: how-it-works carousel
- src/components/navbar-wallet-client.tsx: client wallet badge fetch/display
- src/components/navbar.tsx: top navigation
- src/components/notification-bell-client.tsx: unread bell and notifications open/close
- src/components/providers.tsx: app providers (theme)
- src/components/shop-now-button.tsx: CTA to offers section
- src/components/theme-switcher.tsx: dark/light toggle
- src/components/tracked-history.tsx: tracked rewards cards

Admin components:
- src/components/admin/admin-alert-form.tsx: admin alert form
- src/components/admin/admin-interactive-sections.tsx: click and wallet management UI
- src/components/admin/admin-wallet-adjust-form.tsx: wallet adjustment form

Auth components:
- src/components/auth/sign-in-form.tsx: google sign-in button + oauth errors

Wallet components:
- src/components/wallet/withdraw-request-form.tsx: user withdrawal request form

UI primitives:
- src/components/ui/button.tsx: button variants
- src/components/ui/card.tsx: card primitives
- src/components/ui/input.tsx: input primitive

## Hooks
- src/hooks/use-theme.ts: theme state helper hook

## Library files
- src/lib/admin.ts: admin checks/bootstrap by configured emails
- src/lib/affiliate-links.ts: load/normalize affiliate links from Excel
- src/lib/affiliate-rotation.ts: rotate affiliate links with Redis/DB fallback
- src/lib/auth.ts: sessions, cookies, current user helpers
- src/lib/revalidate.ts: shared revalidation helpers
- src/lib/session-cookie.test.ts: tests for session cookie helper
- src/lib/session-cookie.ts: cookie name and request extractor
- src/lib/utils.ts: class merge + INR/date formatting helpers
- src/lib/wallet.ts: ensure wallet and adjust balance transactionally

Data and DB:
- src/lib/data/merchants.ts: cached merchant queries
- src/lib/db/index.ts: drizzle DB client init
- src/lib/db/schema.ts: full schema definitions

Validation:
- src/lib/validations/auth.ts: zod schemas for forms/actions

---

## 10. Operational Commands Cheat Sheet

Development:
- bun install
- bun run dev

Quality:
- bun run lint
- bun run test:run

Database:
- bun run db:push
- bun run db:migrate
- bun run db:seed
- bun run db:studio

Performance:
- bun run load-test:quick
- bun run load-test:stress

Affiliate admin:
- bun scripts/affiliate-admin.ts status
- bun scripts/affiliate-admin.ts stats
- bun scripts/affiliate-admin.ts reset

---

## 11. Suggested Maintenance Routine

Daily:
- Check deploy health and error logs
- Verify DB health endpoint

Weekly:
- Run lint and tests
- Run quick load-test
- Validate admin click processing and withdrawals

Before release:
- Run db:push for schema consistency
- Run db:seed for merchant updates
- Verify OAuth redirect URIs and env variables

---

## 12. Notes and Gaps to Track

- Some folders appear as placeholders in project tree without committed files yet (for example sign-up, forgot-password, reset-password).
- neon-init.sql and early migration snapshot include password_reset_tokens legacy references not present in current runtime schema file; treat as migration history context.
- Keep merchant URL entries controlled/admin-reviewed due broad remote image pattern.

---

## 13. Optional Next Docs You Can Add

If you want this guide to become enterprise-grade, add:
- API contract document (request/response per endpoint)
- ER diagram image for DB schema
- Runbook for incident handling
- Role-based permissions matrix
- Feature roadmap and changelog
