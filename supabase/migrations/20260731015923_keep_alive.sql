create table if not exists public.keep_alive (
  id        smallint primary key default 1,
  pinged_at timestamptz not null default now(),
  source    text,
  constraint keep_alive_single_row check (id = 1)
);

insert into public.keep_alive (id) values (1) on conflict do nothing;

-- RLS on, zero policies → only the secret key (bypasses RLS) can touch it
alter table public.keep_alive enable row level security;