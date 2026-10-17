-- Private bucket for the nightly JSON backup written by
-- netlify/functions/backup-data.ts. No storage.objects policies are created on
-- purpose: with RLS on and no policy, only the service role can read/write it,
-- so guest PII in the dump is never reachable with the publishable key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('backups', 'backups', false, 52428800, array['application/json'])
on conflict (id) do nothing;
