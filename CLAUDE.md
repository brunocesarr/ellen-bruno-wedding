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

CI (`.github/workflows/ci.yml`) runs `lint`, `format`, `test:ci`, then `build` on
every PR and push to `main`.

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
it relies on the authenticated layout. (Its `Deps` still lists `pixRepo` — the
field is dead, kept only because deleting it isn't worth a signature churn; the
file itself says so.)

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
- **`site-images-catalog.ts`** — static registry of every uploadable image slot
  (`key`, `section`, `label`, `fallback`, aspect). Drives both the admin
  `/admin/imagens` upload UI and public rendering; adding a new image slot
  anywhere on the site means adding an entry here first.
- **`get-site-image.ts`** — `server-only`; `getSiteImage(key)` /
  `getOrderedSiteImages(keys)` resolve a catalog key to whichever image an
  admin uploaded (via the public container + `resolveStorageUrl`), falling
  back to the catalog's static `fallback` path. Wrapped in React `cache()`.
  Swallows every error except Next's `DYNAMIC_SERVER_USAGE` digest, so a
  Supabase outage degrades to fallback images instead of failing the render.
- **`journey-catalog.ts`** — static content for the "Nossa Jornada" photo-story
  feature (books/pages/photo layouts); photos reference `site-images-catalog`
  keys rather than embedding URLs.
- **`email-templates.ts`** — HTML bodies for the nodemailer service.
- **`format.ts`**, **`guests.ts`** — small formatting / guest-shape helpers.
- **`pix-sanitize.ts`** / **`br-code.ts`** — see PIX section below.
- **`admin/gifts.ts`, `admin/messages.ts`** — legacy, see the callout above;
  do not add to this directory.

## App Router structure

```
app/
layout.tsx              # Root layout; 4 Google fonts, NuqsAdapter, MusicToggle
globals.css             # Tailwind v4
(public)/
  page.tsx              # Landing (revalidate = 60)
  invite/                # Envelope reveal animation; ?token=, noindex
  invite/full/          # Full invitation; ?token= searchParam, noindex
  nossa-jornada/         # Standalone "Our journey" photo-story book
  presentes/            # Gift registry (list + detail [id])
  rsvp/                 # Public RSVP form
  _actions/             # gifts.actions.ts, rsvp.actions.ts,
                        # guests.actions.ts, invite-access.actions.ts,
                        # rsvp-requests.actions.ts
admin/
  login/                # Client page; signInWithPassword + router.replace
  (authenticated)/      # Auth gate lives HERE (see below)
    page.tsx            # Dashboard
    convidados/         # Guest management
    presentes/          # Gift management
    mensagens/          # Guest messages
    imagens/            # Site image uploads
    solicitacoes/       # Public RSVP requests + shareable invite link admin
    resumo/             # Stats summary
  _actions/             # gifts.actions.ts, rsvp-requests.actions.ts,
                        # invite-links.actions.ts, dashboard.actions.ts, …
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
envelope/               # Envelope open/reveal animation shown at /invite
journey/                # JourneyBook/JourneyLibrary — the /nossa-jornada UI
photo-gallery/          # PhotoGallery
public/                 # HomeButton, InvalidInviteNotice — small shared bits
                        # reused across (public) pages
rsvp/                   # RSVP form
layout/                 # FloralFrame, MotionWrapper, …
```

**There is no `middleware.ts`.** Admin auth is enforced in
`app/admin/(authenticated)/layout.tsx`, which calls `supabase.auth.getUser()` and
`redirect('/admin/login')`. Adding a page under `(authenticated)/` protects it;
adding it elsewhere does not.

**Two independent keep-alive paths, with different env vars:**
`netlify/functions/supabase-keep-alive.ts` (scheduled `*/5 * * * *` — bumped
from once a day after intermittent Netlify edge-function timeouts on admin
pages traced to Supabase cold-start latency; reads `SUPABASE_URL` +
`SUPABASE_SECRET_KEY`, upserts into `keep_alive`) and
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

| kind         | price                     | claimers                         |
| ------------ | ------------------------- | -------------------------------- |
| `fixed_item` | required                  | one                              |
| `open_item`  | null, buyer chooses       | one                              |
| `fund`       | null, contributor chooses | many; `is_reserved` pinned false |

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
- `reserved_by_email` is dropped as of
  `20260904180000_drop_reserved_by_email.sql` — it was never populated by any
  current `reserve_gift`/`reserve_gift_paid` signature. Run `pnpm db:push` and
  `pnpm db:types` to apply.

**Party-based invitations:** each guest carries `invite_token`,
`party_invite_token` and `party_id`. One link resolves a household —
`getInviteContextUseCase` accepts either token and returns
`{ guest, partyMembers }`; `confirmAttendanceUseCase` validates every submitted
`guestId` belongs to the owner's party before writing.

**Shared invite links (`invite_links` table)** cover guests who never got a
personal token — e.g. a link posted in a group chat. At most one link is
active at a time; `createInviteLinkUseCase` revokes any predecessor before
creating a new one, so "generate new" doubles as rotation if a link leaks.
`resolveInviteAccessAction` (`app/(public)/_actions/invite-access.actions.ts`)
tries the guest-token path first via `getInviteContextController`, and only
falls back to `getSharedInviteLinkController` if that fails — a shared token
can never shadow a real guest token. The result is a discriminated
`InviteAccess` (`{ kind: 'guest', guest, partyMembers }` or
`{ kind: 'shared', link }`); a `'shared'` visit lands on the full invitation
but the RSVP section falls back to the "request pending approval" flow, same
as having no token at all. `touchInviteLinkAction` (visit counter) is fired
from `after()` in `invite/full/page.tsx`, never awaited in render. Admin
generates/revokes the active link from `/admin/solicitacoes` via
`ShareableInviteLinkCard`.

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
`PIX_KEY`, `PIX_KEY_TYPE` (optional — `cpf`/`cnpj`/`phone`/`email`/`evp`; only
matters to disambiguate an 11-digit key, which is otherwise assumed CPF),
`PIX_MERCHANT_NAME`, `PIX_MERCHANT_CITY`, `NEXT_PUBLIC_SITE_URL`.

Card payments: `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET` (Mercado
Pago) and `PAGBANK_TOKEN`, `PAGBANK_ENVIRONMENT` (optional — `sandbox`/
`production`, defaults to `sandbox`) for PagBank. `CARD_PAYMENT_PROVIDER`
(optional — `mercado_pago`/`pagbank`, defaults to `mercado_pago`) picks which
one new checkouts are created with — see the Card payments section below.
`ENABLE_CARD_PAYMENT_TYPE` (optional — `'true'` to enable, anything else/unset
disables) is the master feature flag for the card payment option; see
`isCardPaymentFeatureEnabled()` / `isCardPaymentAvailable()` in
`get-card-payment-service.ts`.

Email is sent via Gmail SMTP + OAuth2
(`src/infrastructure/services/nodemailer-email.service.ts`), not plain
credentials: `GMAIL_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_REFRESH_TOKEN`, plus optional `EMAIL_FROM` / `EMAIL_REPLY_TO`. The
transporter is a module-scoped singleton, not built per-request — `getContainer()`
is per-request via React `cache()`, and rebuilding it every call would mean
re-fetching an OAuth access token from Google before every send. If `EMAIL_FROM`
doesn't resolve to the same address as `GMAIL_USER`, it logs a DMARC-alignment
warning but still sends.

`.env.example` lists every var name (no values) and is committed via an
explicit `!.env.example` negation in `.gitignore` (which otherwise excludes
all `.env*`) — keep it in sync when adding/removing an env var.

Admin alert for new RSVP requests is sent via a Telegram bot
(`src/infrastructure/services/telegram-notification.service.ts`):
`TELEGRAM_BOT_TOKEN` (from @BotFather) and `TELEGRAM_CHAT_ID` (the couple's
chat with that bot). Both optional — missing either falls back to a no-op that
only logs, same pattern as `createEmailService()`. Fired from
`submitRsvpRequestUseCase` right after the request row is created, before the
auto-approve check; never blocks the submission on failure.

## PIX

`PixUtilsService.generateStaticQr({ amount, description })` (no `txid` param)
is defensive because BR Code is a fixed-length EMV format that fails silently
on bad input. The sanitization primitives live in `src/lib/pix-sanitize.ts`,
not the service itself — do not "simplify" or inline them:

- `normalizePixKey(raw, type?)` — canonicalizes a PIX key by type (`cpf`,
  `cnpj`, `phone`, `email`, `evp`); an 11-digit key is ambiguous between CPF
  and a DDD+mobile number, so pass `type` (`PIX_KEY_TYPE`) explicitly when the
  key could be either.
- `toAsciiField(value, maxBytes)` — NFD-strips diacritics, uppercases, strips
  `&`, clamps to a byte budget.
- `merchantTemplateSize()` / `infoAdicionalBudget(pixKey)` — computes exactly
  how many bytes tag 26 (the merchant account template) will occupy and how
  much of that is left for `infoAdicional`, since pix-utils nests it inside
  tag 26 and an overflow past 99 bytes makes the library emit a 3-digit
  length that every bank rejects.
- `validatePixInputs()` — preflight check called before `createStaticPix`;
  throws `InvalidPixCodeError` (not the older `PixError` class in
  `entities/errors/pix.ts`, which is now dead code).
- `toPixAmount()` / `requirePixAmount()` — coerces Postgres `numeric` (arrives
  from supabase-js as a string) to a 2-decimal number; the throwing variant is
  used here because every gift has a chosen amount by the time a QR is built.

**A second line of defense runs after generation.** `pix-utils`'s own
`hasError()` only validates inputs — it never inspects the emitted payload,
which is how a tag-26 overflow used to pass silently. `PixUtilsService`
additionally runs the finished BR Code through `src/lib/br-code.ts`
(`validateBRCode` — reparses the TLV structure byte-by-byte and recomputes the
CRC16) before returning it, and logs `dumpBRCode()`'s full field-by-field dump
on failure. This pairing is the result of several recent fixes to the PIX flow
(see git log) — if a new bug surfaces here, reproduce it with `dumpBRCode`
before changing the sanitizer.

`generateStaticQr` throws `InvalidPixCodeError` on a non-positive amount —
which is why the QR **cannot** be generated at render time for `open_item` /
`fund`. Those go through `generateGiftPixAction` once the guest picks a value;
`get-gift-detail.controller.ts` returns `pix: null` for them.

The txid is hardcoded to `'***'` in `PixUtilsService` because the QR is
generated before the contribution row exists. `reserveGiftUseCase` already
generates a `contributionId` (`randomUUID()`) and the `reserve_gift` RPC
accepts it as `p_contribution_id`, but nothing wires that id into the PIX
payload yet — and since the client generates a fresh UUID per call rather than
reusing one, a resubmitted form would still create a second ledger row. Wiring
txid to the contribution id for bank-statement reconciliation still needs that
duplicate-submit story solved first.

**Two use cases already exist for this but are not wired up anywhere:**
`src/application/use-cases/pix/generate-pix-qr.use-case.ts` and
`list-untied-pix.use-case.ts` (would let admin see PIX payments with no
`gift_id` — i.e. paid but unmatched to a gift). No controller, action, or UI
calls either one. If you need "list untied PIX" for the admin dashboard, this
is the use case to wire in — check it still matches `IPixConfirmationsRepository`
before assuming it's ready to use as-is.

## Card payments (Mercado Pago / PagBank)

Two providers run side by side behind `ICardPaymentService`
(`src/application/services/card-payment.service.interface.ts`):
`MercadoPagoService` and `PagBankService`
(`src/infrastructure/services/*.service.ts`). Neither is being retired —
`getCardPaymentService()` (`src/infrastructure/services/get-card-payment-service.ts`)
picks which one **new** checkouts are created with, based on
`CARD_PAYMENT_PROVIDER` (defaults to `mercado_pago`). Both providers' webhook
routes (`app/api/mercado-pago/webhook`, `app/api/pagbank/webhook`) stay live
regardless of the flag, since a checkout already created under the other
provider still needs its webhook processed.

`confirmCardPaymentUseCase` takes an explicit `provider` dependency (set by
whichever webhook route calls it) that picks the idempotency lookup
(`findByMpPaymentId` vs `findByPagbankPaymentId`) and which ledger column the
payment id is written to. `pix_confirmations` carries both `mp_payment_id`
and `pagbank_payment_id` as separate nullable columns (plus a
`payment_provider` discriminator) rather than one shared column — additive,
so Mercado Pago's existing rows/behavior are untouched.

PagBank's webhook signature scheme differs from Mercado Pago's: it hashes the
**raw, unparsed** request body (`SHA256("${token}-${rawBody}")`, compared
against `x-authenticity-token`), so `app/api/pagbank/webhook/route.ts` calls
`req.text()` before any JSON parsing — reordering that to parse first breaks
every signature check.

`PagBankService`'s field mapping (metadata round-trip, whether
`GET /checkouts/{id}` actually returns a `charges` array) is inferred from
PagBank's docs, not yet confirmed against a real sandbox response — see the
`TODO(pagbank)` comments in `pagbank.service.ts` before trusting it in
production. Notably, the guest's optional gift message has no field to
round-trip through PagBank's Checkout API the way Mercado Pago's `metadata`
does — it comes back `null` from `PagBankService.getPayment()` today.

**Card payment is gated by a flag and a minimum amount.**
`isCardPaymentFeatureEnabled()` reads `ENABLE_CARD_PAYMENT_TYPE`;
`isCardPaymentAvailable(amount)` additionally requires `amount >
MIN_CARD_PAYMENT_AMOUNT` (`src/lib/constants.ts`, currently R$10). Both the UI
(`GiftPaymentSection`, which greys out the Cartão tab with a hint rather than
hiding it) and `createGiftCardPaymentUseCase` (injected as
`isCardPaymentAvailable` — a use case must not import infrastructure
directly) enforce this, so the checkout action can't be reached below the
threshold or with the flag off even by calling it directly.

**`gifts.payment_link`** (fixed_item only — CHECK-constrained, see
`gifts_payment_link_kind_valid`) lets an admin attach an external checkout
URL to a specific gift. When set, the guest is redirected straight there
instead of through `CardPaymentForm`/the configured provider. This is a
one-way door with no webhook: the gift stays unreserved until an admin uses
the "Marcar como pago" action in `GiftsTable` (`markGiftPaidManuallyAction` →
`markGiftPaidManuallyUseCase` → `giftsRepo.markReservedManually`), which
writes `is_reserved`/`reserved_by_name`/`reserved_at` directly — bypassing the
`reserve_gift`/`reserve_gift_paid` RPCs and their `pix_confirmations` ledger
row entirely, since there is no payment event to record.
