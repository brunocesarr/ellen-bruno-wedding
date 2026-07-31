# Ellen & Bruno — Wedding Site

Next.js 16 + Supabase wedding site: RSVP confirmation, PIX gift
registry with generated QR codes, and guest photo uploads.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind v4 ·
shadcn/ui · Supabase (Postgres + Storage) · Vitest · Netlify

## Local setup

pnpm install
cp .env.example .env.local # fill in values
pnpm dev

## Database

pnpm db:push # apply migrations to linked project
pnpm db:types # regenerate types/database.types.ts
pnpm db:reset # reset local DB

## Deployment

Production: Netlify (auto-deploy from `main`)
Keep-alive: netlify/functions/supabase-keep-alive.ts (daily, 06:00 UTC)

⚠️ Regenerate types after ANY schema change.
⚠️ SUPABASE_SECRET_KEY is server-side only — never import client-side.
