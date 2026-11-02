# Rehab Passport — PROGRESS

Single source of truth for this project. Read this first; open only the file you need.

- **Live:** https://rehab-passport.vercel.app (Vercel project `rehab-passport`, account proudstone-576)
- **Database:** Neon project `rehab-passport` (id `flat-brook-70225776`, aws-us-east-1, Postgres 18)
- **Origin:** 3rd-year BPT college "innovation concept poster" → web app. Built solo, deadline 2026-10-28.
- **Concept:** paper exercise passport + optional QR video/phone page. Flow: Assess → Personalize → Demonstrate → Track → Review. Feasibility evaluation only, *no clinical effectiveness claimed*.

## Stack
- Next.js 16.4 (App Router) + React 19 + TypeScript. Plain CSS (`app/globals.css`). Deps: `qrcode`, `@neondatabase/serverless` (HTTP driver, raw SQL), `bcryptjs`. Font: Noto Sans Gurmukhi via `next/font/google`.
- Env (`.env.local`, also set on Vercel production): `DATABASE_URL`, `SESSION_SECRET` (≥32 chars). `.env*` is git- and vercel-ignored.

## Key decisions
- **Server data, client-shaped API.** UI still edits one in-memory `Data` object via `useStore().update(d => …)`. `lib/store.tsx` diffs old/new (`lib/diff.ts`) and POSTs only changed rows to `/api/sync`; server (`lib/server/repo.ts`) upserts into typed tables. Store refetches `/api/data` on focus + every 20 s (skips while saves pending) so phone ticks appear live.
- **Tables** (`db/schema.sql`): therapists, patients, passports (items jsonb), logs, pain, reviews, feedback, exercises (custom, data jsonb), photos (urls jsonb). Every row has `therapist_id`; all reads/writes scoped to it; upsert `WHERE table.therapist_id = EXCLUDED.therapist_id` blocks cross-account overwrites. Dates stored as text `YYYY-MM-DD`, visits `YYYY-MM-DDTHH:mm` (no TZ conversion). Apply schema: `node --env-file=.env.local db/migrate.mjs` (idempotent).
- **Deterministic ids:** log `passportId:itemId:date`, pain `passportId:date` → phone + clinic writes converge, no duplicates.
- **Auth:** email+password (bcrypt) → httpOnly cookie `rp_session` = base64url payload + HMAC-SHA256 (`lib/server/auth.ts`), 30 days. Client redirects to `/login` on 401. **Demo clinic:** shared account `demo@rehab-passport.test` with random unused password, entered only via "Open demo clinic" button (`/api/auth/demo`), auto-seeded on first use. Real accounts start empty.
- **Patient phone = `/p/<phoneToken>`** (32 hex random per patient, stable across passport versions). `/api/phone/[token]` GET returns `PhoneView` (`lib/phone.ts`): pseudonymous code, plan, therapist photos, ticks, pain, visit period — never name/diagnosis. POST `{type:"tick"|"pain"}` validates date (≥ start, ≤ server today+1) and item.
- **Exercise QR `/e/<payload>` stays stateless** (base64url JSON, no DB): `{e|n+s, q:[sets,reps,perDay,hold], p?, v?, t?, l?}`; defaults omitted.
- **Visit period** (`visitPeriod()` in `lib/logic.ts`): last review of this version (or start) → `passport.nextVisit` (fallback +14 d). Drives: patient-page grid (+ "whole passport" toggle), completion %, phone countdown/strip/progress, printed tick grid (7–28 days, wraps at 14 cols).
- **Next visit:** set in wizard Confirm step, Review form (also sets passport.nextVisit; cleared on discharge), and inline datetime input on patient page stat card.
- **Pain 0–10:** `PainEntry` per passport per day. Paper: "Daily pain score" block on exercise sheet. Phone: 11 buttons, ≥7 shows stop warning. Clinic: pain row selects in grid; dashboard pill when max of last 3 days ≥7; Evaluation "Safety monitoring" table (first-3 vs last-3 avg, ≥7 count, % ticks from phone).
- **Read-aloud:** `components/Listen.tsx` uses `speechSynthesis`; Punjabi voice if phone has one, else English (en-IN) with a note.
- **Languages:** `Patient.language` = en | pa | both, patient-facing only. Strings `lib/i18n.ts`; `<T k>`/`<Pair>` in `components/Bi.tsx`; own Punjabi month/day names (`fmtDateIn`).
- **Animated exercises** (teacher's suggestion, replaces YouTube as the main demo): `lib/animation.ts` blends the two drawn poses by joint ANGLE (limbs keep length), pinned joints by position, planted feet via two-bone IK (`MOTION`: sit-to-stand/bridging `plant`, pendulum `swing`, seated-march `alternate`). Timeline per rep: start 0.6 s → move 1.4 s → hold (item `hold`, 0.5–5 s) → return 1.4 s; end-frame arrows fade in. `components/AnimatedFigure.tsx` (client, rAF): rep counter "Rep n / reps", phase label, Slower (×1.7), Pause/Play, starts paused if reduce-motion. Shown first in `ExerciseView` (QR + phone pages); YouTube kept below as "Video of a real person"; library shows static + animated. No network needed once page loaded.
- **Illustrations:** `lib/figures.ts` pose data → `components/Figure.tsx` SVG (`frame={0|1}` for single frame). Therapist photos (max 3, 640px JPEG data URLs) replace drawing on print and phone.
- **Videos:** verified embeddable YouTube defaults per built-in exercise (`videoSource` credit), checked via oEmbed 2026-10-28.
- Next 16 gotchas: dynamic routes use server `page.tsx` wrapper (`await params`) + `export const instant = false`; route handlers use `RouteContext<"/api/…">`; lint forbids setState in effects (disabled per line where intended) and `Date.now()` in render.

## File map
| File | What |
|---|---|
| `db/schema.sql`, `db/migrate.mjs` | Postgres schema + idempotent apply script |
| `lib/types.ts` | Data types (Exercise, Lang, Patient+phoneToken, Passport+nextVisit, LogEntry, PainEntry, Review, Feedback, Clinic, Data) |
| `lib/exercises.ts` | 12 built-ins: en + pa text, default video + credit |
| `lib/i18n.ts` | Patient-facing en/pa strings, dose/date/precaution helpers |
| `lib/logic.ts` | Dates, `allExercises`, `doseText`, `activePassport`, `adherence`, `logId/painId/newToken`, `visitPeriod`, `nextReviewDate`, `defaultVisit`, `fmtTime`, `recentMaxPain`, `youtubeEmbed` |
| `lib/seed.ts` | `demoData()` — 3 patients, visits booked, logs (paper/phone), pain (P-002 has a 7) |
| `lib/diff.ts` | `diff(prev,next)` → `Changes`; `asChanges(data)` |
| `lib/store.tsx` | Client store: load `/api/data`, optimistic `update`, background `/api/sync`, `reset`, `refresh`, `me`, `saving` |
| `lib/share.ts` | `/e` QR encode/decode, `toShared(item, ex, photos)` |
| `lib/phone.ts` | `PhoneView`, `PhonePost` types |
| `lib/figures.ts` | Illustration pose data |
| `lib/server/db.ts` | Neon client, `query()` |
| `lib/server/auth.ts` | Session cookie sign/verify, `currentTherapist()` |
| `lib/server/repo.ts` | Table mapping, `loadData`, `applyChanges` (batched transactions), `resetToDemo` |
| `lib/server/therapists.ts` | Accounts: create/find/check, demo account, `me()` |
| `app/api/auth/{login,register,logout,demo}/route.ts` | Auth endpoints |
| `app/api/data`, `app/api/sync`, `app/api/reset` | Clinician data load / save / demo reset |
| `app/api/phone/[token]/route.ts` | Patient phone GET/POST |
| `app/login/page.tsx` | Sign in / create account / open demo clinic |
| `app/(clinic)/layout.tsx` | StoreProvider + Nav (name, Saving…/Saved, Sign out) |
| `app/(clinic)/page.tsx` | Dashboard: stats, patients, 7-day completion, next visit+time, pain flag |
| `app/(clinic)/patients/new/page.tsx` | New patient (+ language, phoneToken) |
| `app/(clinic)/patients/[id]/PatientView.tsx` | Patient: language, phone view/copy link, stats (period %, next visit + reschedule), period grid with phone-tick colour + pain row, Review (+next visit), Feedback, history, versions, delete |
| `app/(clinic)/patients/[id]/plan/PlanWizard.tsx` | 4-step wizard; Confirm has next visit + clinician minutes |
| `app/(clinic)/patients/[id]/print/PrintPassport.tsx` | A4 print in patient language: cover (visit date+time, phone QR), exercise blocks, period tick grid, pain sheet, feedback page |
| `app/(clinic)/library/page.tsx` | Library: figures, en+pa, video credit, step photos, add custom (+pa) |
| `app/(clinic)/evaluation/page.tsx` | Feasibility metrics, completion tables, safety/pain + phone-use table, clinic details, CSV/JSON export, reset to demo |
| `app/(clinic)/about/page.tsx` | How it works + privacy |
| `app/e/[code]/page.tsx` | Single-exercise QR page (server, stateless) |
| `app/p/[token]/MyPassport.tsx` | Patient phone: visit countdown + period strip/progress, today ticks, steps/video/read-aloud, pain buttons, call, stop box |
| `lib/animation.ts` | Pose blending, IK, per-exercise motion, rep timeline |
| `components/AnimatedFigure.tsx` | Looping animated stick figure with rep/phase/speed controls |
| `components/{Nav,Qr,Figure,Bi,ExerciseView,Listen}.tsx` | Shared UI (Figure exports `skeleton`, `propEl`, `FrameSvg`, `W`, `H`) |

## Commands
- Dev: `npm run dev` · Check: `npm run lint && npm run build` · Local prod: `npx next start -p 3456` (on Windows kill the node PID on 3456 afterwards — TaskStop leaves it running)
- Deploy: push to `main` on GitHub (proudstone-576/rehab-passport) → Vercel auto-deploys once the repo is connected in Vercel → Settings → Git. Fallback: `npx vercel deploy --prod --yes` from the PC folder (env vars already on Vercel)
- E2E check used: headless Chrome via puppeteer-core script in session scratchpad (demo login, cross-browser save, phone tick+pain → clinic, 401/404 checks)

## Status
- [x] v1 paper passport + QR + evaluation (2026-10-28)
- [x] v2 phone page, Punjabi, illustrations, photos, videos (2026-10-28)
- [x] v3 Neon DB + accounts + demo clinic, live phone sync, next visit date/time, visit-period progress, pain 0–10, read-aloud (2026-10-28) — tested local + production
- [x] v4 animated exercise figures for all 12 (2026-10-29) — frames checked headless, deployed
- [ ] Offline/PWA mode — build only when user says "offline" (see memory)
- [ ] Native speaker to proof-read Punjabi (`lib/i18n.ts`, `lib/exercises.ts`)
- [ ] Optional: record own Punjabi demo videos

## Known limits / ideas
- Demo clinic is shared and editable by anyone; reset via Evaluation page.
- No password reset / email verification. No rate limiting on login.
- Photos stored as data URLs in Postgres (fine for prototype; use blob storage at scale).
- Ideas: SMS/WhatsApp visit reminders, Hindi, large-print mode, offline queue for phone ticks.

## Changelog
- 2026-10-28 — v1 built from poster and deployed.
- 2026-10-28 — v2: patient phone passport, Punjabi/bilingual, illustrations, step photos, verified YouTube videos.
- 2026-10-28 — v3: Postgres backend (fixes "patient missing on other device" — data was per-browser localStorage), therapist accounts + demo clinic, live phone sync (sync codes removed), next visit date/time, visit-period progress, pain score, read-aloud.
- 2026-10-29 — v4: animated exercise figures (rep counter, phases, slow/pause) on phone pages + library; bilingual header label contrast fix; poster + presentation script made as claude.ai artifacts.
- 2026-11-02 — code moved to GitHub (proudstone-576/rehab-passport); Vercel deploys on push to `main`.
