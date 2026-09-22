-- ============================================================================
-- Guest-manager links
--   A login-free, revocable token that grants exactly one capability: editing
--   the NAME and STATUS of guests that already exist. No insert, no delete,
--   and no access to invite tokens.
--
--   Unlike invite_links, several may be active at once: each helper gets their
--   own labelled link, so revoking one person's access never touches another's.
-- ============================================================================

create table public.guest_manager_links (
  id           uuid primary key default gen_random_uuid(),
  token        uuid not null unique default gen_random_uuid(),
  label        text not null default 'Acesso à lista'
                 check (char_length(label) between 1 and 120),
  is_active    boolean not null default true,
  -- null = never expires. Enforced in every resolver, not just the UI.
  expires_at   timestamptz,
  use_count    integer not null default 0,
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.guest_manager_links is
  'Login-free, revocable tokens letting a trusted helper edit guest names and '
  'statuses. Grants no insert/delete, and is never readable by the publishable '
  'key — lookups go through the service role.';

create index guest_manager_links_active_idx
  on public.guest_manager_links (created_at desc)
  where is_active;

-- set_updated_at() already exists (20260528002717_guests.sql).
create trigger guest_manager_links_set_updated_at
  before update on public.guest_manager_links
  for each row execute function public.set_updated_at();

alter table public.guest_manager_links enable row level security;

-- No `anon` policy by design: the public resolver uses the service-role client,
-- mirroring how invite_links and guest tokens are already resolved in
-- public-container.ts. The token is validated *before* any guest data is read.
revoke all on public.guest_manager_links from anon;

create policy "guest_manager_links_admin_select"
  on public.guest_manager_links for select to authenticated using (true);

create policy "guest_manager_links_admin_insert"
  on public.guest_manager_links for insert to authenticated with check (true);

create policy "guest_manager_links_admin_update"
  on public.guest_manager_links for update to authenticated using (true) with check (true);

-- Atomic usage counter. Returns void: callers must never block on this, and a
-- revoked or expired token silently updates nothing.
create or replace function public.touch_guest_manager_link(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.guest_manager_links
     set use_count    = use_count + 1,
         last_used_at = now()
   where token = p_token
     and is_active
     and (expires_at is null or expires_at > now());
end;
$$;

revoke all on function public.touch_guest_manager_link(uuid) from public, anon;
grant execute on function public.touch_guest_manager_link(uuid) to service_role, authenticated;
