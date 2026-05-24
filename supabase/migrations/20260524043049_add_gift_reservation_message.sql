-- ============================================================
-- 1. Add the new column (idempotent)
-- ============================================================
alter table public.gifts
add column if not exists reserved_message text;

-- ============================================================
-- 2. Drop the OLD reserve_gift function (any signature variant)
--    We must DROP because the parameter name is changing
--    (CREATE OR REPLACE cannot rename parameters — error 42P13)
-- ============================================================
drop function if exists public.reserve_gift(uuid, text, text);
drop function if exists public.reserve_gift(uuid, text);

-- ============================================================
-- 3. Recreate with the new signature (name + optional message)
-- ============================================================
create function public.reserve_gift(
p_gift_id uuid,
p_name text,
p_message text default null
) returns public.gifts
language plpgsql
security definer
set search_path = public
as $$
declare
g public.gifts;
begin
update public.gifts
   set is_reserved      = true,
       reserved_by_name = p_name,
       reserved_message = p_message,
       reserved_at      = now()
 where id = p_gift_id and is_reserved = false
returning * into g;

if g.id is null then
  raise exception 'GIFT_ALREADY_RESERVED';
end if;

return g;
end
$$;

-- ============================================================
-- 4. Re-grant execution to anonymous and authenticated roles
--    (DROP also removes grants — we must re-add them)
-- ============================================================
grant execute on function public.reserve_gift(uuid, text, text) to anon, authenticated;