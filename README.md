# BetterCanvas

BetterCanvas is a student-first Canvas LMS companion built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Auth.js, and Gemini. This repository is currently at milestone `M1`: the app shell, navigation, design system, route scaffold, Auth.js entry points, Prisma placeholder, and baseline tests are in place.

## Current status

- Midnight Pulse visual system applied across the landing page and app shell.
- Prototype routes wired for `dashboard`, `calendar`, `todo`, `notifications`, `inbox`, `tutors`, `onboarding/canvas`, and `settings/canvas`.
- Auth.js route and config stubbed for future Resend magic links.
- Prisma initialized with a starter schema ready for the full v1 data model in M2.
- Vitest + React Testing Library scaffolded so milestone verification can run from the start.

## Tech stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS v4
- shadcn/ui components with Radix primitives
- Prisma ORM
- Auth.js (NextAuth v5 beta)
- Lucide icons
- Vitest + React Testing Library
- pnpm

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Start the app:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Set these in `.env`:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_RESEND_KEY`
- `EMAIL_FROM`
- `TOKEN_ENC_KEY`
- `GEMINI_API_KEY`
- `CRON_SECRET`
- `APP_URL`

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm format`

## Design references

The initial visual direction comes from the `stitch_canvas_scholar_hub` folder in the workspace, especially the Midnight Pulse design language and the dashboard/calendar/tutor static mockups.

## Next milestone

M2 will add the real Prisma schema, pgvector migration groundwork, Auth.js email adapter wiring, and server-side session helpers.
