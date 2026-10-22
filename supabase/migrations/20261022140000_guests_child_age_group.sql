-- Replaces guests.is_child (boolean) with an age bracket for children:
-- under 5, or 6 to 10 years old. NULL = not a child.
-- Existing is_child = true rows were the "under 5" flag, so they carry over.
create type public.child_age_group as enum ('under_5', 'from_6_to_10');

alter table public.guests add column child_age_group public.child_age_group;

update public.guests set child_age_group = 'under_5' where is_child;

alter table public.guests drop column is_child;
