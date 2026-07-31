## Project rules

- Netlify is production. Do NOT add vercel.json or Vercel-specific config.
- Never import SUPABASE_SECRET_KEY outside netlify/functions or Server Components.
- Use @supabase/ssr helpers for all client/server Supabase clients.
- After any schema change, run `pnpm db:types`. Never hand-edit database.types.ts.
- All new tables require RLS enabled + explicit policies in the same migration.
- Guest PII must never be exposed via a policy readable by the publishable key.
- Netlify free tier is credit-capped: avoid unnecessary production deploys.
