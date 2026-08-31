-- Table
create table if not exists public.songs (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 audio_path text not null,
 display_order int not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index if not exists songs_display_order_idx on public.songs(display_order);

-- updated_at trigger (reuses the shared function from 20260528002717_guests.sql)
drop trigger if exists trg_songs_updated_at on public.songs;
create trigger trg_songs_updated_at
 before update on public.songs
 for each row execute function public.set_updated_at();

-- RLS
alter table public.songs enable row level security;

drop policy if exists "Public can read songs" on public.songs;
create policy "Public can read songs"
 on public.songs for select
 to anon, authenticated
 using (true);

drop policy if exists "Admin can manage songs" on public.songs;
create policy "Admin can manage songs"
 on public.songs for all
 to authenticated
 using (true) with check (true);

-- Storage: dedicated bucket, since audio needs different mime types/limits
-- than the 'wedding-images' bucket (see 20260523044906_new-migration.sql).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-audio',
  'wedding-audio',
  true,                                 -- public read
  15728640,                             -- 15 MB per file
  array['audio/mpeg', 'audio/mp3']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wedding_audio_public_read" on storage.objects;
drop policy if exists "wedding_audio_auth_insert" on storage.objects;
drop policy if exists "wedding_audio_auth_update" on storage.objects;
drop policy if exists "wedding_audio_auth_delete" on storage.objects;

create policy "wedding_audio_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'wedding-audio');

create policy "wedding_audio_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'wedding-audio');

create policy "wedding_audio_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'wedding-audio')
with check (bucket_id = 'wedding-audio');

create policy "wedding_audio_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'wedding-audio');
