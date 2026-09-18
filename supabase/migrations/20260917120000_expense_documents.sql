-- ============================================================================
-- Documents attached to wedding expenses: the signed contract (one per
-- expense) and payment proofs / comprovantes (one per installment, or loose
-- at the expense level).
--
-- Storage-wise these are the only user-uploaded files in the project that are
-- NOT public: a signed vendor contract carries names, CPFs and bank details.
-- They live in a private bucket read through short-lived signed URLs, unlike
-- 'wedding-images' / 'wedding-audio' which are public-read by design.
-- ============================================================================

create type public.expense_document_kind as enum ('contract', 'payment_proof');

create table public.expense_documents (
  id             uuid primary key default gen_random_uuid(),
  expense_id     uuid not null references public.expenses(id) on delete cascade,
  -- Set only for a comprovante tied to a specific parcela. Null means the
  -- document belongs to the expense as a whole (always the case for a
  -- contract). Cascades, so dropping a parcela drops its proofs with it.
  installment_id uuid references public.expense_installments(id) on delete cascade,
  kind           public.expense_document_kind not null,
  -- Object key inside the 'wedding-documents' bucket. Unique so a row can
  -- never be orphaned from, or share, another row's stored bytes.
  file_path      text not null unique,
  file_name      text not null check (char_length(file_name) between 1 and 255),
  mime_type      text not null,
  -- Stored size after server-side compression. Denormalised on purpose: the
  -- free-tier storage budget is enforced by summing this column, which is a
  -- single Postgres read instead of a listing call per bucket prefix.
  size_bytes     integer not null check (size_bytes > 0),
  created_at     timestamptz not null default now(),

  -- Mirrors the domain rule in expense-document.ts: a contract belongs to the
  -- expense, never to one parcela.
  constraint expense_documents_installment_kind_valid
    check (installment_id is null or kind = 'payment_proof')
);

comment on table public.expense_documents is
  'Signed contracts and payment proofs for wedding expenses. Admin-only; the '
  'bytes live in the private ''wedding-documents'' bucket, this table holds the '
  'metadata and the storage key.';

create index expense_documents_expense_id_idx
  on public.expense_documents (expense_id);

create index expense_documents_installment_id_idx
  on public.expense_documents (installment_id)
  where installment_id is not null;

alter table public.expense_documents enable row level security;
revoke all on public.expense_documents from anon;

-- Same shape as "expenses admin all" — there is no guest-facing read at all.
create policy "expense_documents admin all" on public.expense_documents
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
-- public = false: unlike the image/audio buckets, an unguessable URL is not an
-- acceptable control for a signed contract. Reads go through
-- storage.createSignedUrl() from the authenticated admin session.
--
-- 4 MB per file: PDFs are stored as uploaded (nothing server-side re-encodes
-- them), images are downscaled + re-encoded to WebP before they get here, so
-- in practice a stored document is well under 1 MB. The limit is the backstop.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-documents',
  'wedding-documents',
  false,
  4194304,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wedding_documents_auth_read"   on storage.objects;
drop policy if exists "wedding_documents_auth_insert" on storage.objects;
drop policy if exists "wedding_documents_auth_update" on storage.objects;
drop policy if exists "wedding_documents_auth_delete" on storage.objects;

-- No `to anon` policy anywhere below — that omission is the access control.
create policy "wedding_documents_auth_read"
on storage.objects for select
to authenticated
using (bucket_id = 'wedding-documents');

create policy "wedding_documents_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'wedding-documents');

create policy "wedding_documents_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'wedding-documents')
with check (bucket_id = 'wedding-documents');

create policy "wedding_documents_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'wedding-documents');
