-- ============================================================================
-- Public RSVP requests (no-token flow)
-- A visitor without an invite token submits a request; an admin approves or
-- rejects it. Approval creates (or updates) the corresponding guest.
-- ============================================================================

create type public.rsvp_request_status as enum ('pending', 'approved', 'rejected');

create table public.rsvp_requests (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  attending   boolean not null,
  message     text,
  status      public.rsvp_request_status not null default 'pending',
  guest_id    uuid references public.guests (id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.rsvp_requests is
  'Self-service RSVP submissions awaiting admin approval. Contains guest PII '
  '(name + email) and is therefore NEVER readable by the publishable key.';

create index rsvp_requests_status_created_at_idx
  on public.rsvp_requests (status, created_at desc);

-- Only one *pending* request per e-mail address (blocks accidental double-submit).
create unique index rsvp_requests_pending_email_idx
  on public.rsvp_requests (lower(email))
  where status = 'pending';

-- Supports the name-matching lookup performed by approve_rsvp_request().
create index guests_name_lower_idx
  on public.guests (lower(first_name), lower(last_name));

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.rsvp_requests_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger rsvp_requests_touch_updated_at
  before update on public.rsvp_requests
  for each row execute function public.rsvp_requests_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS  (AGENTS.md #5: enabled + explicit policies in the same migration)
-- ---------------------------------------------------------------------------
alter table public.rsvp_requests enable row level security;

-- Deliberately NO policy for `anon`. Public submissions are written with the
-- service-role key from src/di/public-container.ts, which bypasses RLS.
revoke all on public.rsvp_requests from anon;

create policy "rsvp_requests_admin_select"
  on public.rsvp_requests for select to authenticated using (true);

create policy "rsvp_requests_admin_update"
  on public.rsvp_requests for update to authenticated using (true) with check (true);

create policy "rsvp_requests_admin_delete"
  on public.rsvp_requests for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Atomic approval: find-or-create guest + stamp the request, in one transaction
-- ---------------------------------------------------------------------------
create or replace function public.approve_rsvp_request(p_request_id uuid)
returns public.rsvp_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req      public.rsvp_requests;
  v_guest    public.guests;
  v_first    text;
  v_last     text;
  v_status   public.guest_status;
  v_found    boolean;
begin
  select * into v_req
    from public.rsvp_requests
   where id = p_request_id
   for update;

  if not found then
    raise exception 'RSVP_REQUEST_NOT_FOUND';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'RSVP_REQUEST_ALREADY_DECIDED';
  end if;

  -- "Ana Maria Souza" -> first_name 'Ana', last_name 'Maria Souza'
  v_first := split_part(btrim(v_req.full_name), ' ', 1);
  v_last  := btrim(substr(btrim(v_req.full_name), length(v_first) + 1));
  if v_last = '' then
    v_last := '-';
  end if;

  v_status := case when v_req.attending then 'going' else 'not_going' end;

  select * into v_guest
    from public.guests
   where lower(first_name) = lower(v_first)
     and lower(last_name)  = lower(v_last)
   order by created_at asc
   limit 1;

  v_found := found;

  if v_found then
    update public.guests
       set status       = v_status,
           confirmed_at = case when v_status = 'going' then now() else confirmed_at end,
           updated_at   = now()
     where id = v_guest.id
    returning * into v_guest;
  else
    insert into public.guests (first_name, last_name, status, notes, confirmed_at)
    values (
      v_first,
      v_last,
      v_status,
      nullif(btrim(coalesce(v_req.message, '')), ''),
      case when v_status = 'going' then now() else null end
    )
    returning * into v_guest;
  end if;

  update public.rsvp_requests
     set status     = 'approved',
         guest_id   = v_guest.id,
         decided_at = now()
   where id = p_request_id
  returning * into v_req;

  return v_req;
end;
$$;

revoke all on function public.approve_rsvp_request(uuid) from public, anon;
grant execute on function public.approve_rsvp_request(uuid) to authenticated, service_role;