-- supabase/migrations/<timestamp>_fix_rsvp_insert_policy.sql

-- 1. Make sure RLS is enabled
alter table public.rsvp enable row level security;

-- 2. Drop any conflicting/old policies (re-runnable)
drop policy if exists "anon insert rsvp"            on public.rsvp;
drop policy if exists "Anyone can insert rsvp"      on public.rsvp;
drop policy if exists "rsvp_anon_insert"            on public.rsvp;
drop policy if exists "auth read rsvp"              on public.rsvp;
drop policy if exists "auth update rsvp"            on public.rsvp;

-- 3. Public guests (unauthenticated) can submit RSVPs
create policy "rsvp_public_insert"
on public.rsvp
for insert
to anon, authenticated   -- 👈 BOTH roles, in case admin tests it while logged in
with check (true);

-- 4. Only authenticated admins can read RSVPs
create policy "rsvp_auth_select"
on public.rsvp
for select
to authenticated
using (true);

-- 5. Only authenticated admins can update / delete
create policy "rsvp_auth_update"
on public.rsvp
for update
to authenticated
using (true)
with check (true);

create policy "rsvp_auth_delete"
on public.rsvp
for delete
to authenticated
using (true);