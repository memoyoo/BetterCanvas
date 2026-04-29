# BetterCanvas

BetterCanvas is a student-first Canvas LMS companion built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Auth.js, and Canvas-backed server sync. The current repo state is past the original shell milestone: users can authenticate with magic links, connect a Canvas account, encrypt the Canvas token at rest, sync courses and coursework into Postgres, and render the main app surfaces from Prisma.

## Current status

- Midnight Pulse visual system is applied across the landing page and authenticated app shell.
- Live routes exist for `dashboard`, `calendar`, `todo`, `notifications`, `inbox`, `tutors`, `onboarding/canvas`, and `settings/canvas`.
- Auth.js is wired for Prisma-backed email magic links via Resend when the required env vars are present.
- Prisma migrations and generated client are checked in for the current schema foundation.
- Canvas onboarding performs a real initial sync for courses, assignments, planner items, activity, conversations, and upcoming events.
- Vitest + React Testing Library are in place for baseline verification.

## Tech stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS v4
- shadcn/ui components with Radix primitives
- Prisma ORM
- PostgreSQL + pgvector
- Auth.js (NextAuth v5 beta)
- Resend magic-link delivery
- Lucide icons
- Vitest + React Testing Library
- pnpm

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL with the `pgvector` extension available
- Resend credentials for live magic-link sign-in
- A Canvas access token for end-to-end sync testing

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Fill in the required environment variables in `.env`.

4. Apply Prisma migrations and generate the client:

   ```bash
   pnpm db:migrate
   pnpm db:generate
   ```

5. Start the app:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

7. Sign in, connect a Canvas account, and run the initial sync.

## Environment variables

### Required for the real app

- `DATABASE_URL`: PostgreSQL connection string. The target database must support `pgvector`.
- `AUTH_SECRET`: Auth.js secret.
- `AUTH_RESEND_KEY`: Resend API key for magic-link delivery.
- `EMAIL_FROM`: sender address for auth emails, for example `BetterCanvas <noreply@example.com>`.
- `TOKEN_ENC_KEY`: 32-byte base64 key used for AES-256-GCM Canvas token encryption.
- `GEMINI_API_KEY`: required for real tutor AI responses and embedding-based tutor retrieval.

### Optional / future-facing

- `GEMINI_MODEL`: optional override for the tutor response model. Defaults to `gemini-2.0-flash-lite`.
- `GEMINI_EMBEDDING_MODEL`: optional override for tutor embedding generation. Defaults to `text-embedding-004`.
- `CRON_SECRET`: required once cron-triggered background sync is enabled.
- `APP_URL`: recommended for deployed environments and future cron/background workflows. Keep this aligned with the public app URL.
- `CANVAS_OAUTH_CLIENT_ID`, `CANVAS_OAUTH_CLIENT_SECRET`, `CANVAS_OAUTH_REDIRECT_URI`: optional; enable password-based Canvas sign-in for the native app when a matching developer key exists on that Canvas instance (see `apps/api/README.md`).

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm format`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:deploy`
- `pnpm db:studio`

## Database notes

- The migration at `prisma/migrations/20260422132500_m2_foundation/migration.sql` runs `CREATE EXTENSION IF NOT EXISTS "vector";`.
- Use a PostgreSQL host where `pgvector` is available before running migrations locally or in production.
- If your host does not support `pgvector`, tutor embeddings and related schema setup will fail during migration.

## Auth and deploy notes

- BetterCanvas uses Auth.js email magic links through Resend when `DATABASE_URL`, `AUTH_SECRET`, `AUTH_RESEND_KEY`, and `EMAIL_FROM` are all configured.
- The authenticated app shell falls back to prototype-friendly behavior when those env vars are missing, but real user data and Canvas sync require the full auth + database setup.
- In production, keep your deployment host, Resend sender domain, and public app URL aligned so email sign-in links resolve back to the correct environment.
- API cron sync route is `POST /api/cron/canvas-sync` and requires `Authorization: Bearer <CRON_SECRET>`.
- Production API CORS requires `APP_URL` to be set to your deployed origin.
- See `apps/api/README.md` for API operations runbook and cron/deploy verification.

## Design references

The initial visual direction came from the original Midnight Pulse design language and dashboard/calendar/tutor static mockups (design reference files have been removed from the repo to reduce workspace size).

## Next milestones

- Personal task CRUD on top of the synced todo queue
- Background/cron-driven Canvas refresh
- Real Gemini-backed briefings, inbox assist, and tutor responses
- Course content ingestion, embeddings, and citation-backed tutor threads
