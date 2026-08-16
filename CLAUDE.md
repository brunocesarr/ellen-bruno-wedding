This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

@AGENTS.md

## Commands

```
bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Lint (eslint CLI — `next lint` was removed in Next 16)
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Check formatting
pnpm format:fix   # Fix formatting
pnpm test         # Run all tests (Vitest)
pnpm test:ci      # Run once, no watch
pnpm test:ui      # Vitest with browser UI
```

Run a single test file:

```
bash
pnpm test src/application/use-cases/gifts/__tests__/reserve-gift.use-case.test.ts
```

Database (requires Supabase CLI):

```
bash
pnpm db:types       # Regenerate types from linked Supabase project
pnpm db:types:local # Same, but from local Supabase instance
pnpm db:push        # Push migrations to linked project
pnpm db:reset       # Reset local DB and re-run migrations
```

## Architecture

Clean Architecture with strict layer boundaries:

```
src/
entities/          # Domain models (Zod schemas) + typed error classes
application/
  repositories/    # Repository interfaces (contracts only)
  services/        # Service interfaces (contracts only)
  use-cases/       # Business logic; depend only on interfaces
infrastructure/
  repositories/    # Supabase implementations
  services/        # nodemailer, pix-utils, supabase-auth
  supabase/        # Client factories (server, client, admin, public)
interface-adapters/
  controllers/     # Thin wrappers: parse input → use case → result
  view-models/     # Transform domain models to UI-friendly shapes
di/
  container.ts         # Server-only DI; 11 deps off the SSR client
  public-container.ts  # DI for unauthenticated public routes
lib/                   # Shared server + client utilities
```

**Data flow:** Server Action → controller → use case → repository → Supabase.

**Naming:** related operations are grouped per file, not split one-per-file.
`manage-gift.use-case.ts` exports `createGiftUseCase`, `updateGiftUseCase` and
`deleteGiftUseCase`; `manage-gift.controller.ts` exports the three matching
controllers. There is no `create-gift.controller.ts`. Check the actual file
before importing.

**Controllers** wrap their use case in `handle()` from
`src/interface-adapters/controllers/_handle.ts`, returning the canonical
`ActionResult<T>` (`{ ok: true, data } | { ok: false, error, issues? }`).
`handle()` maps `UnauthenticatedError → 'unauthorized'`,
`ValidationError → { error: 'Dados inválidos', issues }`, and any other
`Error → error.message`. Domain error messages are user-facing pt-BR strings, so
they surface unchanged. The exception is a page-orchestration read like
`get-gift-detail.controller.ts`, which throws so the page can call `notFound()`.

**Use cases** are `export function xUseCase(deps) { return async (input) => … }`
factories. They validate raw input with Zod and throw typed domain errors
(`ValidationError` carrying `z.flattenError(...)`, `GiftNotFoundError`,
`InvalidInviteTokenError`, …). Admin-facing use cases call
`authService.getCurrentUser()` and throw `UnauthenticatedError` themselves —
`manage-gift.use-case.ts` is the reference. Note `listGiftsUseCase` does **not**;
it relies on the authenticated layout.

**`getContainer()` / `getPublicContainer()`** are wrapped in React `cache()`, so
the Supabase client + repositories are built once per request even when several
controllers resolve the container in one render.

**`getPublicContainer()` splits clients by sensitivity** — `siteImagesRepo` and
`storageRepo` get the public (publishable-key) client, while `guestsRepo`,
`rsvpRequestsRepo` and `inviteLinksRepo` get the **admin** client. Guest PII stays
unreadable by the publishable key, so public reads go through server-side admin
access rather than loosened RLS. Preserve this split.

### Shared utilities (`src/lib/`)

- **`server-action-result.ts`** — `ActionResult<T>` + `unwrapForPage()`
  (redirect-on-unauthorized / throw / return data), used by every admin page.
- **`revalidate.ts`** — `revalidateGroup(group)`. Groups: `guests`, `gifts`,
  `messages`, `siteImages`, `invite`, `rsvpRequests`, `inviteLinks`. Single
  source of truth for which paths a mutation invalidates.
- **`form-data.ts`** — typed extractors (`getString`, `getOptionalString`,
  `getBoolean`, `getNumber`, `getFile`). All use `fd.get()`, which returns the
  **first** match — if duplicate keys are possible, read `fd.getAll()` yourself.
- **`storage-upload.ts`** — `uploadImageIfPresent(storageRepo, file, prefix)`
  returns `{ ok, imagePath?, cleanup? } | { ok: false, error }`. Callers must
  `await upload.cleanup?.()` when the subsequent write fails. 5 MB, JPG/PNG/WEBP.
- **`class-names.ts`** — `buttonPrimary`, `inputField` shared Tailwind strings.
- **`constants.ts`** — `WEDDING_DETAILS` (date 2026-10-24, venue, timeline,
  dress-code palette) and `SECTION_IDS`. Types live in root `types/`.
- **`invite-redirect.ts`** — `redirectInvalidInvite()` for bad/absent tokens.
- **`utils.ts`** — `cn()` (clsx + tailwind-merge).

## App Router structure

```
app/
layout.tsx              # Root layout; 4 Google fonts, NuqsAdapter, MusicToggle
globals.css             # Tailwind v4
(public)/
  page.tsx              # Landing (revalidate = 60)
  invite/full/          # Full invitation; ?token= searchParam, noindex
  presentes/            # Gift registry (list + detail [id])
  rsvp/                 # Public RSVP form
  _actions/             # gifts.actions.ts, rsvp.actions.ts,
                        # guests.actions.ts, invite-access.actions.ts
admin/
  login/                # Client page; signInWithPassword + router.replace
  (authenticated)/      # Auth gate lives HERE (see below)
    page.tsx            # Dashboard
    convidados/         # Guest management
    presentes/          # Gift management
    mensagens/          # Guest messages
    imagens/            # Site image uploads
    solicitacoes/       # Public RSVP requests awaiting approval
    resumo/             # Stats summary
  _actions/             # gifts.actions.ts, rsvp-requests.actions.ts, …
  auth/callback/route.ts # exchangeCodeForSession → /admin
api/
  invitation/route.tsx  # OG image via next/og — .tsx, it returns JSX
  keep-alive/route.ts   # Bearer CRON_SECRET; selects 1 row from gifts

components/
ui/                     # Design-system primitives
sections/               # Landing + invitation sections
gifts/                  # Public registry components
admin/                  # Admin tables, dialogs, charts
invite/                 # InvitationPageShell
rsvp/                   # RSVP form
layout/                 # FloralFrame, MotionWrapper, …
```

**There is no `middleware.ts`.** Admin auth is enforced in
`app/admin/(authenticated)/layout.tsx`, which calls `supabase.auth.getUser()` and
`redirect('/admin/login')`. Adding a page under `(authenticated)/` protects it;
adding it elsewhere does not.

**Two independent keep-alive paths, with different env vars:**
`netlify/functions/supabase-keep-alive.ts` (scheduled `0 6 * * *`, reads
`SUPABASE_URL` + `SUPABASE_SECRET_KEY`, upserts into `keep_alive`) and
`app/api/keep-alive/route.ts` (reads `NEXT_PUBLIC_SUPABASE_URL` via the admin
client, requires `Bearer ${CRON_SECRET}`). The URL env var name differs between
them and nothing enforces they match — a known drift risk.

## Database

Tables: `gifts`, `guests`, `rsvp`, `rsvp_requests`, `invite_links`,
`pix_confirmations`, `site_images`, `keep_alive`.
Enums: `gift_category`, `guest_status`, `rsvp_request_status`, `gift_kind`.
View: `gifts_with_totals`.

**Gift kinds** (`gift_kind`) — the `gifts_kind_valid` CHECK makes the meaningless
fourth combination unrepresentable:

| kind | price | claimers |
|---|---|---|
| `fixed_item` | required | one |
| `open_item` | null, buyer chooses | one |
| `fund` | null, contributor chooses | many; `is_reserved` pinned false |

Consequences to respect everywhere:

- **`gifts.price` is nullable.** Use `GiftViewModel.amountLabel` for display
  rather than formatting `price` directly.
- **Funds never lock.** Never branch on `isReserved` / `status` alone — use
  `isGiftClosed()` from `gift.view-model.ts`. Status for a fund derives from
  `confirmedTotal > 0`, mirrored identically in `listGiftsUseCase`,
  `get-gift-detail.controller.ts` and `get-stats.use-case.ts`. All three must
  change together.
- **Reads go through `gifts_with_totals`**, writes go to `gifts`; inserts cannot
  return view columns, so `create`/`update` write then re-read via `getById`.
- **Every view column is typed nullable** — Supabase cannot infer NOT NULL
  through a view. `mapRow` coalesces each one; do not "fix" with `!`.
- **Reservation is atomic in Postgres.** `reserve_gift(uuid, text, text, numeric,
  uuid)` locks `for update`, validates the amount, inserts the ledger row, and
  only sets `is_reserved` for non-funds. It raises sentinel strings
  (`GIFT_ALREADY_RESERVED`, `GIFT_AMOUNT_REQUIRED`,
  `GIFT_AMOUNT_TOO_LOW:<min>`, `GIFT_NOT_FOUND`) which the repository maps to
  typed errors via `error.message.includes(...)`. Triggers add
  `GIFT_KIND_LOCKED` and `GIFT_HAS_CONTRIBUTIONS`.
- **`pix_confirmations` is the contributions ledger.** `anon` has column-level
  grants on `(gift_id, amount, confirmed)` only — `guest_name` is denied by
  Postgres. Never add a PII column to `gifts_with_totals`.
- **`confirmedTotal` vs `pledgedTotal`:** PIX confirmation is manual. Guests only
  ever see `confirmedTotal`; `pledgedTotal` is admin-facing.
- `reserved_by_email` exists on the table but nothing can populate it — the
  reserve flow never sets it. Dead column pending removal.

**Party-based invitations:** each guest carries `invite_token`,
`party_invite_token` and `party_id`. One link resolves a household —
`getInviteContextUseCase` accepts either token and returns
`{ guest, partyMembers }`; `confirmAttendanceUseCase` validates every submitted
`guestId` belongs to the owner's party before writing.

**`rsvp_requests` is an outbox/retry:** `notify_attempts` / `notify_error` /
`notified_at` make email failures retryable, with `status` + `decided_at` as an
admin approval step before a request becomes a real guest.

## Key conventions

- **Path aliases:** `@/` → project root; `@/src/`, `@/app/`, `@/components/`,
  `@/lib/`, `@/types/`. Note `@/components/*` resolves to **both**
  `./components/*` and `./src/components/*`.
- **Two files named `gifts.actions.ts`** — `app/admin/_actions/` (create/update/
  delete/list) and `app/(public)/_actions/` (reserve/generate PIX). Always check
  which one you are editing.
- **Two field components:** `components/ui/FormField.tsx` (admin;
  `label`/`error`) and `components/ui/Field.tsx` (public; adds `htmlFor`/`hint`).
  Both render a `<label>` wrapper — never put more than one form control inside
  either. Nested `<label>`s forward every click to the first labelable
  descendant, which silently corrupts radio groups.
- **Server actions in forms:** when `action` is a function, React sets
  `method`/`encType` itself. Do not set `encType="multipart/form-data"` — it
  warns and is ignored; `File` values still serialise.
- **Admin dialogs** use `useActionState` with the
  `(prevState, formData) => Promise<ActionResult>` signature and uncontrolled
  `defaultValue` inputs. Conditionally rendered inputs simply drop out of
  `FormData`, so derive dependent fields server-side rather than trusting the
  client to clear them.
- **Styling:** Tailwind v4 via PostCSS; `cn()` for merging.
- **Animations:** `motion` (`motion/react`).
- **Forms:** react-hook-form + `@hookform/resolvers` + Zod (admin login, some
  admin forms) or plain server actions elsewhere. Both exist; match the file.
- **URL state:** `nuqs` (`parseAsStringLiteral` + `useQueryStates`).
- **Images:** use `<SmartImage>` rather than raw `<img>` / `next/image`. Remote
  images must be `*.supabase.co`.
- **Server Action body limit:** 5 MB.
- **Deferred work:** `after()` from `next/server` (see `invite/full/page.tsx`
  touching the invite link after render).
- **Clipboard:** `useCopyToClipboard()` from `hooks/`.
- **Linting:** `eslint.config.mjs` pins React to `19.2` to avoid an
  eslint-plugin-react/ESLint 10 crash, and turns off `no-explicit-any` and
  `react/no-unescaped-entities`.
- **Dev-only headers:** `next.config.ts` returns `[]` from `headers()` outside
  production — an `immutable` header makes Turbopack serve stale chunks and
  produce "module factory is not available".

## Testing

Vitest + `@testing-library/react` + jsdom; setup file `vitest.setup.ts`. Tests
live in `__tests__/` beside their subject. Coverage is the **use-case layer**
plus pure `interface-adapters` logic (e.g. `gift-ranking`); infrastructure, RPCs
and UI are untested — verify those manually.

Zod gotcha: `.optional()` **omits absent keys** rather than setting them to
`undefined`, and `expect.objectContaining({ k: undefined })` requires the key to
exist. Assert absence on the received payload
(`expect(payload?.price).toBeUndefined()`).

Manual checks that no test covers:

1. Two simultaneous claims on one `open_item` → exactly one winner.
2. Two simultaneous fund contributions → two ledger rows, `is_reserved` false.
3. Fund with confirmed + pending → public progress shows confirmed only.
4. As `anon`: `select * from pix_confirmations` → permission denied for column
   `guest_name`; the same query on `gifts_with_totals` succeeds.
5. Editing a fund that has contributions → `GIFT_KIND_LOCKED`; deleting →
   `GIFT_HAS_CONTRIBUTIONS`.

## Supabase

Four client factories, each for a specific context:

- `createSupabaseServerClient()` — SSR/server actions, reads auth cookies
  (`@supabase/ssr`, publishable key)
- `createSupabaseBrowserClient()` — client components (e.g. admin login)
- `createSupabaseAdminClient()` — bypasses RLS; `SUPABASE_SECRET_KEY`
- `createSupabasePublicServerClient()` — unauthenticated public reads;
  module-level singleton, no session persistence

Generated DB types live in `types/database.types.ts` — regenerate with
`pnpm db:types` after any migration, including view and function signature
changes.

## Env vars

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY`, `SUPABASE_URL` (Netlify function only), `CRON_SECRET`,
`PIX_KEY`, `PIX_MERCHANT_NAME`, `PIX_MERCHANT_CITY`, `NEXT_PUBLIC_SITE_URL`,
plus nodemailer credentials. See `.env.example`.

## PIX

`PixUtilsService.generateStaticQr({ amount, description, txid? })` is defensive
because BR Code is a fixed-length EMV format that fails silently on bad input:
NFD-strips diacritics to ASCII, clamps merchant name to 25 / city to 15, and
computes the remaining payload budget as
`99 - ('br.gov.bcb.pix'.length + pixKey.length + 8)` before truncating
`infoAdicional`. Do not "simplify" these.

It throws `PixError` on a non-positive amount — which is why the QR **cannot** be
generated at render time for `open_item` / `fund`. Those go through
`generateGiftPixAction` once the guest picks a value;
`get-gift-detail.controller.ts` returns `pix: null` for them.

`sanitizeTxid` currently falls back to `'***'` because the QR is generated before
the contribution row exists. Passing the contribution id as txid would make
multi-contributor funds reconcilable against a bank statement, but needs a
duplicate-submit story first (the RPC would hit a PK violation on replay).
