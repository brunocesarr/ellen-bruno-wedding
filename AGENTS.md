## Project rules

- Netlify is production. Do NOT add vercel.json or Vercel-specific config.
- Never import SUPABASE_SECRET_KEY outside netlify/functions, route handlers, or
  Server Components. `supabase/admin.ts` is server-only by convention — keep it
  out of anything reachable from a `'use client'` module.
- Use @supabase/ssr helpers for all cookie-aware client/server Supabase clients.
- After any schema change, run `pnpm db:types`. Never hand-edit
  database.types.ts.
- All new tables require RLS enabled + explicit policies in the same migration.
- Guest PII must never be exposed via a policy readable by the publishable key.
  Prefer column-level grants over an RLS-bypassing view (see pix_confirmations).
- Views: always create with `security_invoker = on` unless you are deliberately
  bypassing RLS, and say why in the migration.
- Any change to a table's columns requires dropping and recreating every view
  that selects `t.*` from it, plus any function returning `setof` that view.
- Changing a Postgres function's signature requires `drop function` first —
  `create or replace` leaves a second overload and makes PostgREST ambiguous.
- Netlify free tier is credit-capped: avoid unnecessary production deploys.
  netlify.toml already skips builds for docs-only commits.

## Code rules

- Server Components by default. Add `'use client'` only to the interactive leaf.
- Controllers wrap use cases in `handle()`; never hand-roll try/catch there.
- Use cases throw typed domain errors; never catch/swallow inside them.
- Mutating server actions call `revalidateGroup(...)` — never a hardcoded
  `revalidatePath` list. Add a new group to `src/lib/revalidate.ts` instead.
- Money: validate 2 decimal places with an epsilon compare, never
  `Number.isInteger(n * 100)` (10.99 * 100 === 1099.0000000000002).
- Prefer `z.flattenError(result.error)` over the deprecated
  `result.error.flatten()`.