-- Make sure RLS is enabled (idempotent)
alter table public.gifts             enable row level security;
alter table public.rsvp              enable row level security;
alter table public.pix_confirmations enable row level security;

-- ── gifts ─────────────────────────────────────────────────────
-- Anyone can READ gifts (public list)
drop policy if exists "Public can read gifts" on public.gifts;
create policy "Public can read gifts"
on public.gifts
for select
to anon, authenticated
using (true);

-- Only authenticated admins can modify
drop policy if exists "Admin can insert gifts" on public.gifts;
create policy "Admin can insert gifts"
on public.gifts for insert to authenticated with check (true);

drop policy if exists "Admin can update gifts" on public.gifts;
create policy "Admin can update gifts"
on public.gifts for update to authenticated using (true);

drop policy if exists "Admin can delete gifts" on public.gifts;
create policy "Admin can delete gifts"
on public.gifts for delete to authenticated using (true);

-- ── rsvp ──────────────────────────────────────────────────────
-- Guests can SUBMIT RSVPs (insert) but NOT read others'
drop policy if exists "Public can submit rsvp" on public.rsvp;
create policy "Public can submit rsvp"
on public.rsvp for insert to anon, authenticated with check (true);

-- Only admins can read/manage all RSVPs
drop policy if exists "Admin can read rsvp" on public.rsvp;
create policy "Admin can read rsvp"
on public.rsvp for select to authenticated using (true);

drop policy if exists "Admin can update rsvp" on public.rsvp;
create policy "Admin can update rsvp"
on public.rsvp for update to authenticated using (true);

drop policy if exists "Admin can delete rsvp" on public.rsvp;
create policy "Admin can delete rsvp"
on public.rsvp for delete to authenticated using (true);

-- ── pix_confirmations ─────────────────────────────────────────
-- Guests can record their Pix confirmation
drop policy if exists "Public can submit pix" on public.pix_confirmations;
create policy "Public can submit pix"
on public.pix_confirmations for insert to anon, authenticated with check (true);

-- Only admins read/update (mark as confirmed) / delete
drop policy if exists "Admin can read pix" on public.pix_confirmations;
create policy "Admin can read pix"
on public.pix_confirmations for select to authenticated using (true);

drop policy if exists "Admin can update pix" on public.pix_confirmations;
create policy "Admin can update pix"
on public.pix_confirmations for update to authenticated using (true);

drop policy if exists "Admin can delete pix" on public.pix_confirmations;
create policy "Admin can delete pix"
on public.pix_confirmations for delete to authenticated using (true);