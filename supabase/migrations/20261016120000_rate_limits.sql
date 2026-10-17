-- ============================================================================
-- Rate limiting for public server actions (RSVP, gift reservation, PIX/card).
--   Fixed-window counter keyed by "<bucket>:<sha256(ip)>". The raw IP is never
--   stored. Only the service role can call check_rate_limit(); the table has
--   RLS enabled and deliberately no policies, so anon/authenticated can't read
--   or write it.
-- ============================================================================

create table public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);

comment on table public.rate_limits is
  'Fixed-window hit counters for public actions. Written only through '
  'check_rate_limit() by the service role.';

alter table public.rate_limits enable row level security;

-- Returns true while the caller is within p_max hits per p_window_seconds.
create function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  -- Opportunistic cleanup so the table never grows unbounded.
  if random() < 0.01 then
    delete from public.rate_limits
     where window_start < now() - interval '1 day';
  end if;

  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
            then now() else r.window_start end,
        hits = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
            then 1 else r.hits + 1 end
  returning hits into v_hits;

  return v_hits <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
