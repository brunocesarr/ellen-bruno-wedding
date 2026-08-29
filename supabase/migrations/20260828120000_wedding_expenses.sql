-- ============================================================================
-- Wedding planning expenses (admin-only budget tracker).
-- Money going OUT (vendors, venue, etc.) — separate from `gifts`, which is
-- guest money coming IN. One expense has 1+ installments; a single up-front
-- payment is just an expense with exactly one installment.
-- ============================================================================

create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  description  text not null check (char_length(description) between 1 and 200),
  total_amount numeric(10,2) not null check (total_amount > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.expense_installments (
  id           uuid primary key default gen_random_uuid(),
  expense_id   uuid not null references public.expenses(id) on delete cascade,
  due_date     date not null,
  amount       numeric(10,2) not null check (amount > 0),
  paid_amount  numeric(10,2) not null default 0
               check (paid_amount >= 0 and paid_amount <= amount),
  paid_by      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.expenses is
  'Wedding planning costs owed to vendors/venue/etc. Admin-only, no guest-facing use.';
comment on table public.expense_installments is
  'Payment schedule + tracking for one expense. sum(amount) == expenses.total_amount '
  'is enforced once in the manage-expense use case (Zod), not with a DB trigger — '
  'this table has exactly one writer (the admin panel), so a cross-row CHECK isn''t '
  'worth the complexity.';

create index expense_installments_expense_id_idx
  on public.expense_installments (expense_id);

-- Reuses the existing shared public.set_updated_at() (see guests.sql / site_images.sql).
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

create trigger expense_installments_set_updated_at
  before update on public.expense_installments
  for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;
alter table public.expense_installments enable row level security;
revoke all on public.expenses, public.expense_installments from anon;

-- Admin-only data, no guest-facing use at all — same pattern as `guests admin all`.
create policy "expenses admin all" on public.expenses
  for all to authenticated using (true) with check (true);

create policy "expense_installments admin all" on public.expense_installments
  for all to authenticated using (true) with check (true);
