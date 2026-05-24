-- Table
create table if not exists public.site_images (
 id uuid primary key default gen_random_uuid(),
 key text not null unique,
 section text not null,
 image_path text,
 alt text,
 display_order int not null default 0,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index if not exists site_images_section_idx on public.site_images(section, display_order);
create index if not exists site_images_key_idx     on public.site_images(key);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_site_images_updated_at on public.site_images;
create trigger trg_site_images_updated_at
 before update on public.site_images
 for each row execute function public.set_updated_at();

-- RLS
alter table public.site_images enable row level security;

drop policy if exists "Public can read active site images" on public.site_images;
create policy "Public can read active site images"
 on public.site_images for select
 to anon, authenticated
 using (is_active = true);

drop policy if exists "Admin can manage site images" on public.site_images;
create policy "Admin can manage site images"
 on public.site_images for all
 to authenticated
 using (true) with check (true);

-- Storage bucket (reuses existing 'gifts' bucket via 'site/' folder).
-- If you prefer a dedicated bucket, run this instead:
--   insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true);
--   then mirror the existing 'gifts' storage policies for it.