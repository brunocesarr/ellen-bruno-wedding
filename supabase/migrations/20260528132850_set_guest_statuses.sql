create or replace function public.set_guest_statuses(p_updates jsonb)
returns setof public.guests
language plpgsql
as $$
declare
ids uuid[];
begin
update public.guests g
   set status       = u.status,
       confirmed_at = case when u.status = 'going' then now() else null end
  from jsonb_to_recordset(p_updates)
         as u(id uuid, status public.guest_status)
 where g.id = u.id;

select array_agg((x->>'id')::uuid) into ids
  from jsonb_array_elements(p_updates) x;

return query select * from public.guests where id = any(ids);
end;
$$;

revoke all on function public.set_guest_statuses(jsonb) from public, anon;
grant execute on function public.set_guest_statuses(jsonb) to authenticated, service_role;