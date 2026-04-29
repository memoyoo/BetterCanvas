# @bettercanvas/api operations

This runbook covers deployment-time configuration for the API app.

## Required env vars

- `DATABASE_URL`: PostgreSQL connection string with `pgvector` support.
- `AUTH_SECRET`: Auth.js session/encryption secret.
- `AUTH_RESEND_KEY`: Resend API key for magic-link email.
- `EMAIL_FROM`: sender identity used by Resend auth emails.
- `TOKEN_ENC_KEY`: base64-encoded 32-byte key for Canvas token AES-256-GCM encryption.

## AI/tutor env vars

- `GEMINI_API_KEY`: required for live tutor generation and embedding retrieval.
- `GEMINI_MODEL` (optional): defaults to `gemini-2.0-flash-lite`.
- `GEMINI_EMBEDDING_MODEL` (optional): defaults to `text-embedding-004`.

Without `GEMINI_API_KEY`, tutor routes still work with fallback behavior.

## CORS and app URL

- `APP_URL` is required in production and used as CORS allow-origin.
- If `APP_URL` is missing in production, API requests fail with a configuration error.

Use the full public origin, for example:

- `https://bettercanvas.app`

## Canvas OAuth (mobile onboarding)

Canvas OAuth uses a **developer key on the same Canvas instance** your students sign into. The client ID and secret are not portable across unrelated Canvas domains; configure them on the API deployment that serves those users (for example one deployment per school).

1. In Canvas: Admin -> Developer Keys -> create a new key.
2. Set **Redirect URI** to exactly the value of `CANVAS_OAUTH_REDIRECT_URI` (for example `bettercanvas://oauth`, matching the Expo `scheme` in `apps/mobile/app.json` plus path).
3. Enable the key and copy **Client ID** and **Client secret** into the API environment:

- `CANVAS_OAUTH_CLIENT_ID`
- `CANVAS_OAUTH_CLIENT_SECRET`
- `CANVAS_OAUTH_REDIRECT_URI` (must match the developer key)

Public routes:

- `GET /api/v1/auth/canvas-oauth/config` - `{ enabled, redirectUri }` for the mobile app.
- `GET /api/v1/auth/canvas-oauth/start?domain=<host>` - `{ authorizeUrl }`.
- `POST /api/v1/auth/canvas-oauth/complete` - body `{ domain, code, state }`; returns the same mobile session payload as `canvas-connect`.

If these variables are omitted, the mobile app falls back to the personal access token flow.

## Cron sync

- Route: `POST /api/cron/canvas-sync`
- Auth: `Authorization: Bearer <CRON_SECRET>`
- Schedule: hourly via `apps/api/vercel.json`

Required env vars for cron sync:

- `CRON_SECRET`
- `DATABASE_URL`
- `TOKEN_ENC_KEY`

### Manual trigger

```bash
curl -X POST "https://<your-api-host>/api/cron/canvas-sync" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Expected response:

- `200`: sync executed, includes `accountCount`, `successCount`, `failureCount`, `results`, `ranAt`.
- `401`: secret mismatch/missing bearer token.
- `429`: rate-limited, respect `Retry-After`.
- `503`: sync not configured (`CRON_SECRET`, `DATABASE_URL`, or `TOKEN_ENC_KEY` issue).

## Deploy verification checklist

1. `pnpm --filter @bettercanvas/api typecheck`
2. `pnpm --filter @bettercanvas/api test`
3. Verify `APP_URL` matches deployed origin.
4. Trigger cron route manually once and confirm successful response.
5. Connect a Canvas account and run tutor ingestion on one course.
