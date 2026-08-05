-- ============================================================================
-- 1. Shareable generic invite links
--    A token not bound to any guest. Grants access to the full invitation and
--    routes the RSVP screen to the "request pending approval" flow.
-- ============================================================================

create table public.invite_links (
  id              uuid primary key default gen_random_uuid(),
  token           uuid not null unique default gen_random_uuid(),
  label           text not null default 'Link compartilhável',
  is_active       boolean not null default true,
  visit_count     integer not null default 0,
  last_visited_at timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.invite_links is
  'Generic shareable invite tokens. Contains no guest PII, but is still not '
  'readable by the publishable key — lookups go through the service role.';

create index invite_links_active_idx
  on public.invite_links (created_at desc)
  where is_active;

create or replace function public.invite_links_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger invite_links_touch_updated_at
  before update on public.invite_links
  for each row execute function public.invite_links_set_updated_at();

alter table public.invite_links enable row level security;

-- No `anon` policy by design: the public resolver uses the service-role client,
-- mirroring how guest tokens are already resolved in public-container.ts.
revoke all on public.invite_links from anon;

create policy "invite_links_admin_select"
  on public.invite_links for select to authenticated using (true);

create policy "invite_links_admin_insert"
  on public.invite_links for insert to authenticated with check (true);

create policy "invite_links_admin_update"
  on public.invite_links for update to authenticated using (true) with check (true);

-- Atomic visit counter. Returns void: callers must never block on this.
create or replace function public.touch_invite_link(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invite_links
     set visit_count     = visit_count + 1,
         last_visited_at = now()
   where token = p_token
     and is_active;
end;
$$;

revoke all on function public.touch_invite_link(uuid) from public, anon;
grant execute on function public.touch_invite_link(uuid) to service_role, authenticated;

-- ============================================================================
-- 2. Notification state on rsvp_requests
--    The decision is now committed independently of e-mail delivery, so we
--    must track whether the guest was actually told.
-- ============================================================================

alter table public.rsvp_requests
  add column notified_at     timestamptz,
  add column notify_attempts integer not null default 0,
  add column notify_error    text;

comment on column public.rsvp_requests.notified_at is
  'Set when the decision e-mail was delivered. NULL on a decided row means the '
  'guest has NOT been told yet and the notification should be retried.';

-- Drives the "needs notification" badge and filter.
create index rsvp_requests_unnotified_idx
  on public.rsvp_requests (decided_at desc)
  where status <> 'pending' and notified_at is null;

-- Backfill: under the previous send-first design a decision could only be
-- committed AFTER the e-mail was delivered, so every existing decided row was
-- necessarily notified. Without this, history would look like a backlog.
update public.rsvp_requests
   set notified_at     = decided_at,
       notify_attempts = 1
 where status <> 'pending'
   and decided_at is not null;

-- Atomic bookkeeping: increments the attempt counter and records the outcome.
create or replace function public.record_rsvp_notification(
  p_request_id uuid,
  p_ok         boolean,
  p_error      text default null
)
returns public.rsvp_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.rsvp_requests;
begin
  update public.rsvp_requests
     set notify_attempts = notify_attempts + 1,
         notified_at     = case when p_ok then now() else notified_at end,
         notify_error    = case when p_ok then null else p_error end
   where id = p_request_id
  returning * into v_req;

  if not found then
    raise exception 'RSVP_REQUEST_NOT_FOUND';
  end if;

  return v_req;
end;
$$;

revoke all on function public.record_rsvp_notification(uuid, boolean, text) from public, anon;
grant execute on function public.record_rsvp_notification(uuid, boolean, text) to authenticated, service_role;