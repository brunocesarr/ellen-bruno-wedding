-- reserve_gift_paid's original p_mp_payment_id had no default (it was the
-- only id column that existed when that function was first written). The
-- PagBank migration gave p_payment_provider/p_pagbank_payment_id a default
-- of null but left p_mp_payment_id required — so a PagBank-only call has no
-- valid value to pass for it. Supabase's generated types reflect this
-- exactly (p_mp_payment_id: string, no `| null`), which is what actually
-- surfaced the bug: passing null there fails to type-check against the real
-- schema, and passing '' instead would silently break the `unique` index on
-- mp_payment_id (empty string isn't NULL — a second PagBank row would
-- collide on uniqueness). The real fix is giving it a default, same as its
-- PagBank counterpart, so callers can omit whichever id doesn't apply.

drop function if exists public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text, text, text);

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
