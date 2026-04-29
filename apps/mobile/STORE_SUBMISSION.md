# BetterCanvas TestFlight-to-Submission Checklist

Target: iOS TestFlight first, using Canvas personal access token onboarding for
review and internal testing. Google Play work is intentionally deferred until
the iOS path is stable.

## Local stabilization

- [x] Ignore nested Next build output such as `apps/api/.next/`.
- [x] Remove prototype mobile copy from the home and dashboard screens.
- [x] Add account deletion support to the mobile API surface.
- [x] Add privacy, support, and account deletion links in mobile settings.
- [x] Replace Expo starter icon, adaptive icon, favicon, and splash assets.
- [x] Add draft public Privacy Policy, Support, and Delete Account pages.
- [ ] Commit or checkpoint the current workspace restructure after review.

## Automated verification

- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] `pnpm build:api`

## Production API setup

- [ ] Deploy `apps/api` to the public URL used by EAS.
- [ ] Configure `DATABASE_URL` with PostgreSQL and `pgvector`.
- [ ] Configure `AUTH_SECRET`.
- [ ] Configure `TOKEN_ENC_KEY`.
- [ ] Configure `APP_URL`.
- [ ] Configure `CRON_SECRET`.
- [ ] Configure `GEMINI_API_KEY` if tutor AI should be live in TestFlight.
- [ ] Run Prisma migrations against the production database.
- [ ] Manually verify `POST /api/cron/canvas-sync`.

## EAS and TestFlight

- [x] Add `EXPO_PUBLIC_API_URL` to preview and production EAS profiles.
- [ ] Confirm `https://bettercanvas.app` is the correct deployed API URL.
- [ ] Run `pnpm --filter @bettercanvas/mobile eas:build:preview`.
- [ ] Install the iOS preview build on a real device.
- [ ] Run one full device QA pass before uploading to TestFlight.
- [ ] Run `pnpm --filter @bettercanvas/mobile eas:build:production`.
- [ ] Upload the production build to TestFlight.
- [ ] Invite internal testers.

## Real-device QA

- [ ] Fresh install starts at Canvas connect.
- [ ] Invalid Canvas domain/token shows a useful error.
- [ ] Valid personal access token connects and syncs.
- [ ] App restart restores the secure session.
- [ ] Expired or invalid session returns to Canvas connect.
- [ ] Dashboard, calendar, todo, notifications, inbox, tutors, and settings load.
- [ ] Todo create/edit/complete/delete works.
- [ ] Inbox reply sends to Canvas.
- [ ] Tutor ingestion and tutor question flow work.
- [ ] Manual sync updates data.
- [ ] Disconnect Canvas clears the session.
- [ ] Delete BetterCanvas account removes access and data.
- [ ] Poor network/API failure states are recoverable.

## App Store submission assets

- [x] App name: BetterCanvas.
- [ ] Subtitle / short positioning line.
- [ ] App Store description.
- [ ] Final privacy policy URL.
- [ ] Final support URL.
- [ ] Final account deletion URL.
- [ ] Marketing/download landing page.
- [ ] iPhone screenshots from the production/TestFlight build.
- [ ] Optional app preview video after screenshots are final.
- [ ] App Store Connect app record for `com.bettercanvas.app`.
- [ ] App Store privacy answers for data linked to the user.
- [ ] Reviewer notes explaining personal access token onboarding and any Canvas
      test-account/domain requirements.

## Public App Store blockers after TestFlight

- [ ] Have legal/product review the draft privacy policy.
- [ ] Confirm whether iPad support should remain enabled before public
      submission.
- [ ] Provide a reliable Canvas reviewer account/token or a reviewer-access
      workaround.
- [ ] Complete at least one TestFlight feedback cycle.
