-- Optional external checkout link for fixed_item gifts, letting the guest be
-- redirected straight to it instead of going through the configured card
-- provider (Mercado Pago / PagBank). Only meaningful when a set price
-- exists, so it is invalid for open_item / fund — mirrors gifts_kind_valid's
-- style rather than folding into that CHECK, since payment_link is additive
-- and independent of the existing price/min_amount/goal_amount invariants.

alter table public.gifts add column payment_link text;

alter table public.gifts add constraint gifts_payment_link_kind_valid check (
  payment_link is null or kind = 'fixed_item'
);

-- gifts_with_totals selects `g.*`, which freezes the column list at creation
-- time (see 20260816120000_gift_pricing_kinds.sql) — must drop/recreate to
-- pick up payment_link. Both RPCs `returns setof gifts_with_totals`, so
-- Postgres ties their return type to the view and blocks a bare drop; drop
-- them first (same final signatures as 20260816120000 /
-- 20260831130000_reserve_gift_paid_optional_ids.sql) and recreate identically
-- afterward — bodies are unchanged, both already `select * from
-- gifts_with_totals`.
drop function if exists public.reserve_gift(uuid, text, text, numeric, uuid);
drop function if exists public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text, text, text);
drop view if exists public.gifts_with_totals;

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
  select * into g from gifts where id = p_gift_id for update;
  if not found then raise exception 'GIFT_NOT_FOUND'; end if;

  if g.kind = 'fixed_item' then
    if g.is_reserved then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  else
    if p_amount is null then raise exception 'GIFT_AMOUNT_REQUIRED'; end if;
    if p_amount <= 0 or (g.min_amount is not null and p_amount < g.min_amount)
    then raise exception 'GIFT_AMOUNT_TOO_LOW:%', coalesce(g.min_amount, 0); end if;
    if g.kind = 'open_item' and g.is_reserved
    then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  end if;

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

create function public.reserve_gift_paid(
  p_gift_id            uuid,
  p_name               text,
  p_message            text,
  p_amount             numeric,
  p_contribution_id    uuid,
  p_payment_method     text,
  p_mp_payment_id      text default null,
  p_payment_provider   text default null,
  p_pagbank_payment_id text default null
)
returns setof public.gifts_with_totals
language plpgsql security definer set search_path = public as $$
declare g public.gifts;
begin
  select * into g from gifts where id = p_gift_id for update;
  if not found then raise exception 'GIFT_NOT_FOUND'; end if;

  if g.kind = 'fixed_item' then
    if g.is_reserved then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  else
    if g.kind = 'open_item' and g.is_reserved
    then raise exception 'GIFT_ALREADY_RESERVED'; end if;
  end if;

  insert into pix_confirmations
    (id, gift_id, guest_name, amount, confirmed, payment_method,
     mp_payment_id, payment_provider, pagbank_payment_id)
  values
    (p_contribution_id, p_gift_id, p_name, p_amount, true,
     p_payment_method, p_mp_payment_id, p_payment_provider, p_pagbank_payment_id);

  if g.kind != 'fund' then
    update gifts set is_reserved      = true,
                     reserved_by_name = p_name,
                     reserved_message = p_message,
                     reserved_at      = now()
     where id = p_gift_id;
  end if;

  return query select * from gifts_with_totals where id = p_gift_id;
end $$;

revoke all     on function public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text, text, text) from public;
grant  execute on function public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text, text, text) to service_role;
