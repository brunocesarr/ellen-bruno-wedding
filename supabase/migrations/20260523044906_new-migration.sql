-- ============================================================
-- Database schema for wedding website
-- Public read · Authenticated write/update/delete
-- ============================================================

-- ===== RSVP =====
create table public.rsvp (
id uuid primary key default gen_random_uuid(),
full_name text not null check (length(full_name) > 0),
email text,
phone text,
attending boolean not null,
companions int not null default 0 check (companions >= 0 and companions <= 5),
dietary_restrictions text,
message text,
created_at timestamptz default now()
);

-- ===== Gifts =====
create table public.gifts (
id uuid primary key default gen_random_uuid(),
name text not null,
description text,
price numeric(10,2) not null check (price > 0),
image_path text,                    -- Supabase Storage path
is_reserved boolean default false,
reserved_by_name text,
reserved_by_email text,
reserved_at timestamptz,
created_at timestamptz default now()
);

-- ===== Pix Confirmations =====
create table public.pix_confirmations (
id uuid primary key default gen_random_uuid(),
gift_id uuid references public.gifts(id) on delete set null,
guest_name text not null,
amount numeric(10,2) not null,
confirmed boolean default false,
created_at timestamptz default now()
);

-- ===== RLS =====
alter table public.rsvp enable row level security;
alter table public.gifts enable row level security;
alter table public.pix_confirmations enable row level security;

-- Public can submit RSVP, only authed admins can read/manage
create policy "anon insert rsvp" on public.rsvp for insert to anon with check (true);
create policy "auth read rsvp"    on public.rsvp for select to authenticated using (true);
create policy "auth update rsvp"  on public.rsvp for update to authenticated using (true);

-- Public can read gifts; reserve flow uses RPC (see below); admin edits
create policy "public read gifts"    on public.gifts for select to anon, authenticated using (true);
create policy "auth manage gifts"    on public.gifts for all    to authenticated using (true) with check (true);

create policy "anon insert pix"      on public.pix_confirmations for insert to anon with check (true);
create policy "auth manage pix"      on public.pix_confirmations for all    to authenticated using (true) with check (true);

-- ===== Atomic gift reservation (avoids race conditions) =====
create or replace function public.reserve_gift(
p_gift_id uuid, p_name text, p_email text
) returns public.gifts language plpgsql security definer as $$
declare g public.gifts;
begin
update public.gifts
   set is_reserved = true,
       reserved_by_name = p_name,
       reserved_by_email = p_email,
       reserved_at = now()
 where id = p_gift_id and is_reserved = false
returning * into g;
if g.id is null then
  raise exception 'GIFT_ALREADY_RESERVED';
end if;
return g;
end $$;

grant execute on function public.reserve_gift(uuid, text, text) to anon, authenticated;

-- ============================================================
-- Storage: wedding-images bucket
-- Public read · Authenticated write/update/delete
-- ============================================================

-- 1. Create the bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
'wedding-images',
'wedding-images',
true,                                              -- public read
5242880,                                           -- 5 MB per file
array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2. Enable RLS on storage.objects (already on by default, but explicit is good)
alter table storage.objects enable row level security;

-- 3. Drop existing policies (so this migration is re-runnable)
drop policy if exists "wedding_images_public_read"   on storage.objects;
drop policy if exists "wedding_images_auth_insert"   on storage.objects;
drop policy if exists "wedding_images_auth_update"   on storage.objects;
drop policy if exists "wedding_images_auth_delete"   on storage.objects;

-- 4. Public can READ any object in the bucket
create policy "wedding_images_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'wedding-images');

-- 5. Only authenticated admins can UPLOAD
create policy "wedding_images_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'wedding-images');

-- 6. Only authenticated admins can REPLACE / move objects
create policy "wedding_images_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'wedding-images')
with check (bucket_id = 'wedding-images');

-- 7. Only authenticated admins can DELETE
create policy "wedding_images_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'wedding-images');