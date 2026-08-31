-- PagBank as a second card-payment provider, running alongside Mercado Pago
-- during a transition period (not a replacement — both stay live, selected
-- per-checkout by an app-level env flag; see getCardPaymentService()).
--
-- Additive only: mp_payment_id and the existing 'pix'/'card' payment_method
-- check are untouched. A new payment_provider column disambiguates which
-- rail a 'card' row came down, and pagbank_payment_id is PagBank's own id —
-- kept as a separate column rather than repurposing mp_payment_id, since
-- that name is Mercado-Pago-specific and dual-writing into it would make a
-- future "which provider actually processed this" query ambiguous.

------------------------------------------------------------------ 1. ledger columns
alter table public.pix_confirmations
  add column payment_provider text
    check (payment_provider in ('mercado_pago', 'pagbank')),
  add column pagbank_payment_id text unique; -- unique index allows multiple NULLs

-- Backfill: every existing 'card' row was processed by Mercado Pago (PagBank
-- didn't exist yet). Pix rows get no provider — the column is card-specific.
update public.pix_confirmations
  set payment_provider = 'mercado_pago'
  where payment_method = 'card' and mp_payment_id is not null;

------------------------------------------------------------------ 2. RPC
-- Signature change: drop first, or PostgREST ends up with two overloads.
drop function if exists public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text);

create function public.reserve_gift_paid(
  p_gift_id           uuid,
  p_name              text,
  p_message           text,
  p_amount            numeric,
  p_contribution_id   uuid,
  p_payment_method    text,
  p_mp_payment_id     text,
  p_payment_provider  text default null,
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

  -- Amount is NOT re-validated against min_amount here: it was already
  -- validated when the checkout/preference was created, and by the time
  -- this runs the provider has already captured the money — rejecting it
  -- here would strand captured funds with nowhere to go. The
  -- caller-supplied id lets a duplicate webhook delivery collide on this
  -- primary key rather than double-insert (idempotency backstop; the use
  -- case also pre-checks mp_payment_id/pagbank_payment_id explicitly).
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
