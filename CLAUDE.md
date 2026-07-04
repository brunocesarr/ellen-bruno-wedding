# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Lint
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Check formatting
pnpm format:fix   # Fix formatting
pnpm test         # Run all tests (Vitest)
pnpm test:ui      # Vitest with browser UI
```

Run a single test file:
```bash
pnpm test src/application/use-cases/gifts/__tests__/reserve-gift.use-case.test.ts
```

Database (requires Supabase CLI):
```bash
pnpm db:types       # Regenerate TypeScript types from linked Supabase project
pnpm db:types:local # Same, but from local Supabase instance
pnpm db:push        # Push migrations to linked project
pnpm db:reset       # Reset local DB and re-run migrations
```

## Architecture

This project follows Clean Architecture with strict layer boundaries:

```
src/
  entities/          # Domain models (Zod schemas) + typed error classes
  application/
    repositories/    # Repository interfaces (contracts only)
    services/        # Service interfaces (contracts only)
    use-cases/       # Business logic; depend only on interfaces
  infrastructure/
    repositories/    # Supabase implementations of repository interfaces
    services/        # Supabase auth + pix-utils implementations
    supabase/        # Supabase client factories (server, client, admin, public)
  interface-adapters/
    controllers/     # Thin wrappers: parse raw input → call use case → return result
    view-models/     # Transform domain models to UI-friendly shapes
  di/
    container.ts     # Server-only DI: instantiates all infra + injects into use cases
    public-container.ts  # DI for unauthenticated public routes
```

**Data flow:** Next.js Server Action → controller → use case → repository → Supabase.

**Controllers** all wrap their use case in `handle()` from `src/interface-adapters/controllers/_handle.ts`, which returns the canonical `ActionResult<T>` (`{ ok: true, data } | { ok: false, error, issues? }`). Never hand-roll try/catch in a controller — `handle()` maps `UnauthenticatedError → 'unauthorized'`, `ValidationError → { error, issues }`, and any other `Error → error.message`. The one exception is a page-orchestration read like `get-gift-detail.controller.ts`, which throws so the page can call `notFound()`.

**Use cases** are `export function xUseCase(deps) { return async (input) => … }` factories. They validate raw input with Zod and throw typed domain errors (`ValidationError` carrying `z.flattenError(...)`, `GiftNotFoundError`, etc.) — never catch/swallow inside a use case.

**`getContainer()` / `getPublicContainer()`** are wrapped in React `cache()`, so the Supabase client + repositories are built once per request even when several controllers resolve the container in one render.

### Shared utilities (`src/lib/`)

Server actions and controllers compose these instead of re-implementing them:
- **`server-action-result.ts`** — the `ActionResult<T>` type + `unwrapForPage()` (redirect-on-unauthorized / throw / return data) used by every admin page.
- **`revalidate.ts`** — `revalidateGroup('gifts' | 'guests' | 'messages' | 'siteImages' | 'invite')`; the single source of truth for which paths a mutation invalidates. Never hardcode `revalidatePath` lists in actions.
- **`form-data.ts`** — typed `FormData` extractors (`getString`, `getOptionalString`, `getBoolean`, `getNumber`, `getFile`).
- **`storage-upload.ts`** — `uploadImageIfPresent(storageRepo, file, pathPrefix)` (validation + upload + `cleanup()` on failure), shared by gift and site-image uploads.

## App Router structure

```
app/
  layout.tsx              # Root layout
  globals.css             # Global styles (Tailwind v4)
  (public)/               # Guest-facing pages (no auth required)
    page.tsx              # Landing / home
    invite/               # Personalized invitations by guest slug
    presentes/            # Gift registry (list + detail [id])
    rsvp/                 # RSVP form
    _actions/             # Public server actions (gifts, guests, rsvp)
  admin/                  # Admin panel
    login/                # Auth page
    (authenticated)/      # Protected layout (redirects if not logged in)
      page.tsx            # Dashboard
      convidados/         # Guest management
      presentes/          # Gift management
      mensagens/          # Guest messages
      imagens/            # Site image uploads
      resumo/             # Stats summary
    _actions/             # Admin server actions
    auth/callback/        # Supabase OAuth callback route
  api/
    invitation/           # SSR invitation card image route
    keep-alive/           # Supabase keep-alive ping

components/
  ui/                     # Generic design-system primitives
  sections/               # Homepage content sections
  gifts/                  # Gift registry components
  admin/                  # Admin panel components (tables, dialogs, charts)
  invite/                 # Invitation shell
  rsvp/                   # RSVP form component
  layout/                 # Shared layout wrappers (FloralFrame, MotionWrapper, etc.)
```

## Key conventions

- **Path aliases:** `@/` resolves to project root; `@/src/`, `@/app/`, `@/components/`, `@/types/` also available.
- **Styling:** Tailwind CSS v4 via PostCSS. Class merging uses `clsx` + `tailwind-merge` (exposed as `cn()` in `src/lib/utils.ts`).
- **Animations:** `motion` (Motion for React) — used for page transitions and scroll reveals.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + Zod for validation.
- **URL state:** `nuqs` for type-safe search param state.
- **Images:** Use `<SmartImage>` (`components/ui/SmartImage.tsx`) wrapper instead of raw `<img>` or `next/image` directly — it handles Supabase storage URLs and fallback logic. Remote images must come from `*.supabase.co` (configured in `next.config.ts`).
- **Server Actions body limit:** 5 MB (set in `next.config.ts` `serverActions.bodySizeLimit`).
- **Server-first components:** components are Server Components by default. Add `'use client'` only to the interactive leaf that needs state/effects/event handlers/browser APIs — keep static parents on the server.
- **Clipboard:** use the `useCopyToClipboard()` hook (`hooks/`) rather than re-implementing `navigator.clipboard` + timeout state.
- **Linting:** `next lint` was removed in Next 16 — the `lint` script runs the ESLint CLI (`eslint .`) directly. `eslint.config.mjs` pins the React version to avoid an eslint-plugin-react/ESLint 10 crash.

## Testing

Tests live next to their subject in `__tests__/` folders. Only use-case layer has tests; infrastructure and UI have none. Vitest + `@testing-library/react` + `jsdom`. The setup file is `vitest.setup.ts`.

## Supabase

Three client modes, each for a specific context:
- `createSupabaseServerClient()` — SSR/server actions (reads auth cookies)
- `createSupabaseAdminClient()` — admin operations that bypass RLS
- `createSupabasePublicClient()` — unauthenticated public reads

Generated DB types live in `types/database.types.ts` — regenerate with `pnpm db:types` after any schema migration.
