-- Card payments via Mercado Pago, as a second payment rail alongside PIX.
--
-- Unlike PIX (which reserves optimistically via reserve_gift(), trusting the
-- guest will pay, with an admin reconciling later), a card payment is only
-- ever recorded once Mercado Pago's webhook confirms status = 'approved'. So
-- reservation + ledger-row insert happen atomically, already confirmed, via
-- a NEW function below rather than by extending reserve_gift().
--
-- reserve_gift() is deliberately left untouched. It is granted to
-- anon/authenticated so guests can reserve via PIX directly through
-- PostgREST — Postgres grants are not per-argument-value, so adding a
-- `p_confirmed boolean` param to that same function would let anyone with
-- the public anon key call it with p_confirmed := true and fabricate a
-- confirmed reservation for free. reserve_gift_paid() is a distinct
-- function, granted to service_role only (the webhook route uses the admin
-- client, never the anon/publishable client).

------------------------------------------------------------------ 1. ledger columns
alter table public.pix_confirmations
  add column payment_method text not null default 'pix'
    check (payment_method in ('pix', 'card')),
  add column mp_payment_id text unique; -- unique index allows multiple NULLs

------------------------------------------------------------------ 2. RPC
create function public.reserve_gift_paid(
  p_gift_id         uuid,
  p_name            text,
  p_message         text,
  p_amount          numeric,
  p_contribution_id uuid,
  p_payment_method  text,
  p_mp_payment_id   text
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
  -- validated when the Preference was created, and by the time this runs
  -- Mercado Pago has already captured the money — rejecting it here would
  -- strand captured funds with nowhere to go. The caller-supplied id lets
  -- a duplicate webhook delivery collide on this primary key rather than
  -- double-insert (idempotency backstop; the use case also pre-checks
  -- mp_payment_id explicitly).
  insert into pix_confirmations
    (id, gift_id, guest_name, amount, confirmed, payment_method, mp_payment_id)
  values
    (p_contribution_id, p_gift_id, p_name, p_amount, true,
     p_payment_method, p_mp_payment_id);

  if g.kind != 'fund' then
    update gifts set is_reserved      = true,
                     reserved_by_name = p_name,
                     reserved_message = p_message,
                     reserved_at      = now()
     where id = p_gift_id;
  end if;

  return query select * from gifts_with_totals where id = p_gift_id;
end $$;

revoke all     on function public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text) from public;
grant  execute on function public.reserve_gift_paid(uuid, text, text, numeric, uuid, text, text) to service_role;
