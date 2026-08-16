-- Three gift kinds:
--   fixed_item : fixed price, one claimer          (all existing rows)
--   open_item  : buyer chooses amount, one claimer
--   fund       : contributor chooses amount, many contributors

------------------------------------------------------------------ 1. enum
create type gift_kind as enum ('fixed_item', 'open_item', 'fund');

------------------------------------------------------------------ 2. columns
alter table public.gifts
  add column kind              gift_kind not null default 'fixed_item',
  add column min_amount        numeric,
  add column suggested_amounts numeric[] not null default '{}',
  add column goal_amount       numeric;

alter table public.gifts alter column price drop not null;

------------------------------------------------------------------ 3. tighten nullable booleans
-- Must precede the CHECK, which asserts is_reserved = false for funds.
update public.gifts set is_reserved = false where is_reserved is null;
alter table public.gifts
  alter column is_reserved set default false,
  alter column is_reserved set not null;

update public.pix_confirmations set confirmed = false where confirmed is null;
alter table public.pix_confirmations
  alter column confirmed set default false,
  alter column confirmed set not null;

------------------------------------------------------------------ 4. invariants
-- Makes the meaningless 4th cell (fixed price + many contributors)
-- unrepresentable, so there is no guard code to write anywhere above.
alter table public.gifts add constraint gifts_kind_valid check (
  case kind
    when 'fixed_item' then
      price is not null and price > 0
      and min_amount is null
      and goal_amount is null
      and coalesce(array_length(suggested_amounts, 1), 0) = 0
    when 'open_item' then
      price is null
      and goal_amount is null
      and (min_amount is null or min_amount > 0)
    when 'fund' then
      price is null
      and is_reserved = false          -- a fund can never lock
      and (min_amount is null or min_amount > 0)
      and (goal_amount is null or goal_amount > 0)
  end
);

alter table public.gifts add constraint gifts_suggested_amounts_valid check (
  coalesce(array_length(suggested_amounts, 1), 0) <= 4
  and 0 < all(suggested_amounts)       -- true for '{}'
);

------------------------------------------------------------------ 5. guards
create or replace function public.guard_gift_kind()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.kind is distinct from new.kind
     and exists (select 1 from pix_confirmations where gift_id = old.id)
  then raise exception 'GIFT_KIND_LOCKED'; end if;
  return new;
end $$;

drop trigger if exists gifts_kind_locked on public.gifts;
create trigger gifts_kind_locked
  before update of kind on public.gifts
  for each row execute function public.guard_gift_kind();

create or replace function public.guard_gift_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from pix_confirmations where gift_id = old.id)
  then raise exception 'GIFT_HAS_CONTRIBUTIONS'; end if;
  return old;
end $$;

drop trigger if exists gifts_delete_guarded on public.gifts;
create trigger gifts_delete_guarded
  before delete on public.gifts
  for each row execute function public.guard_gift_delete();

------------------------------------------------------------------ 6. ledger access
-- Column-level grants rather than an RLS-bypassing view: anon can aggregate
-- `amount` but Postgres itself denies `guest_name`. Satisfies the AGENTS.md
-- guest-PII rule without a security-definer override.
alter table public.pix_confirmations enable row level security;

drop policy if exists pix_confirmations_admin_all on public.pix_confirmations;
create policy pix_confirmations_admin_all on public.pix_confirmations
  for all to authenticated using (true) with check (true);

drop policy if exists pix_confirmations_public_totals on public.pix_confirmations;
create policy pix_confirmations_public_totals on public.pix_confirmations
  for select to anon using (true);

revoke select on public.pix_confirmations from anon;
grant  select (gift_id, amount, confirmed) on public.pix_confirmations to anon;

------------------------------------------------------------------ 7. totals view
-- security_invoker = on → inherits gifts' existing anon policy, so `g.*`
-- exposes nothing a direct select does not already.
-- NOTE: `g.*` freezes the column list at creation time. Any future column on
-- `gifts` requires dropping and recreating this view AND the RPC below.
create view public.gifts_with_totals with (security_invoker = on) as
select
  g.*,
  coalesce(c.confirmed_total, 0)   as confirmed_total,
  coalesce(c.pledged_total, 0)     as pledged_total,
  coalesce(c.contributor_count, 0) as contributor_count
from public.gifts g
left join (
  select gift_id,
         sum(amount) filter (where confirmed) as confirmed_total,
         sum(amount)                          as pledged_total,
         count(*)    filter (where confirmed) as contributor_count
  from public.pix_confirmations
  where gift_id is not null
  group by gift_id
) c on c.gift_id = g.id;

grant select on public.gifts_with_totals to anon, authenticated;

------------------------------------------------------------------ 8. RPC
-- Signature changes, so `create or replace` would leave a second overload and
-- make PostgREST ambiguous. Drop + create is safe: migrations are transactional.
drop function if exists public.reserve_gift(uuid, text, text);

create function public.reserve_gift(
  p_gift_id         uuid,
  p_name            text,
  p_message         text,
  p_amount          numeric default null,
  p_contribution_id uuid    default null
)
returns setof public.gifts_with_totals
language plpgsql security definer set search_path = public as $$
declare g public.gifts;
begin
  -- `for update` is what makes exclusivity correct under two simultaneous
  -- clicks. Funds do not need it, but one code path beats saving microseconds.
  select * into g from gifts where id = p_gift_id for update;
  if not found then raise exception 'GIFT_NOT_FOUND'; end if;

  if g.kind = 'fixed_item' then
    if g.is_reserved then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  else
    if p_amount is null then raise exception 'GIFT_AMOUNT_REQUIRED'; end if;
    -- min embedded in the sentinel so the repository can build an exact message
    if p_amount <= 0 or (g.min_amount is not null and p_amount < g.min_amount)
    then raise exception 'GIFT_AMOUNT_TOO_LOW:%', coalesce(g.min_amount, 0); end if;
    if g.kind = 'open_item' and g.is_reserved
    then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  end if;

  -- Caller supplies the id so it can build the PIX txid without a 2nd round-trip.
  insert into pix_confirmations (id, gift_id, guest_name, amount, confirmed)
  values (coalesce(p_contribution_id, gen_random_uuid()),
          p_gift_id, p_name, coalesce(p_amount, g.price), false);

  if g.kind != 'fund' then
    update gifts set is_reserved      = true,
                     reserved_by_name = p_name,
                     reserved_message = p_message,
                     reserved_at      = now()
     where id = p_gift_id;
  end if;

  return query select * from gifts_with_totals where id = p_gift_id;
end $$;

revoke all    on function public.reserve_gift(uuid, text, text, numeric, uuid) from public;
grant  execute on function public.reserve_gift(uuid, text, text, numeric, uuid) to anon, authenticated;