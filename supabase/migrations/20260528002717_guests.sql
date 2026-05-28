-- Status enum
create type public.guest_status as enum ('going', 'pending', 'not_going');

-- Main table
create table public.guests (
id            uuid primary key default gen_random_uuid(),
first_name    text not null check (char_length(first_name) between 1 and 80),
last_name     text not null check (char_length(last_name)  between 1 and 80),
status        public.guest_status not null default 'pending',
invite_token  uuid not null unique default gen_random_uuid(),
party_id      uuid not null default gen_random_uuid(), -- groups associated guests
notes         text,
confirmed_at  timestamptz,
created_at    timestamptz not null default now(),
updated_at    timestamptz not null default now()
);

create index guests_party_id_idx     on public.guests (party_id);
create index guests_invite_token_idx on public.guests (invite_token);
create index guests_status_idx       on public.guests (status);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
new.updated_at := now();
return new;
end;
$$;

create trigger guests_set_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

-- (optional) link an rsvp to the guest that produced it, for traceability
alter table public.rsvp
add column if not exists guest_id uuid references public.guests(id) on delete set null;

-- RLS — strict by default
alter table public.guests enable row level security;

-- Only authenticated admins (already the project convention) can read/write directly.
create policy "guests admin all"
on public.guests
for all
to authenticated
using (true) with check (true);

-- NO anon policies. The public invite/full flow goes through the
-- service-role client on the server (supabase/admin.ts), where
-- the token is validated *before* any data is exposed.