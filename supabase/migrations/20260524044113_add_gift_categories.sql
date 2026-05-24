-- supabase/migrations/<ts>_add_gift_categories.sql
do $$ begin
create type gift_category as enum ('home', 'kitchen', 'travel', 'experience', 'other');
exception when duplicate_object then null; end $$;

alter table public.gifts
add column if not exists category gift_category not null default 'other';

create index if not exists idx_gifts_category on public.gifts(category);