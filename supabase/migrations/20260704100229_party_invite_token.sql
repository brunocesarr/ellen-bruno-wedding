-- Add a shared invite token per party (all members of the same party share it).
-- Individual invite_token stays for per-person links.
ALTER TABLE public.guests
  ADD COLUMN party_invite_token uuid NOT NULL DEFAULT gen_random_uuid();

-- For existing rows: pick the oldest member's generated token as the canonical one per party.
WITH canonical AS (
  SELECT DISTINCT ON (party_id)
    party_id,
    party_invite_token
  FROM public.guests
  ORDER BY party_id, created_at ASC
)
UPDATE public.guests g
SET party_invite_token = c.party_invite_token
FROM canonical c
WHERE g.party_id = c.party_id;

CREATE INDEX guests_party_invite_token_idx ON public.guests (party_invite_token);

-- Trigger: when a new guest is inserted into an existing party,
-- copy the party's canonical party_invite_token instead of generating a new one.
CREATE OR REPLACE FUNCTION public.inherit_party_invite_token()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  existing_token uuid;
BEGIN
  SELECT party_invite_token INTO existing_token
  FROM public.guests
  WHERE party_id = NEW.party_id
  LIMIT 1;

  IF existing_token IS NOT NULL THEN
    NEW.party_invite_token := existing_token;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guests_inherit_party_invite_token
BEFORE INSERT ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.inherit_party_invite_token();
