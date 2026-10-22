-- Marks guests under 5 years old, so reports can count them separately
-- (typically no seat/plate cost). Additive: existing rows default to false.
-- guests already has RLS + admin-only policies; no new grants needed, and no
-- view selects guests.*, so nothing else to recreate.
alter table public.guests
  add column is_child boolean not null default false;
