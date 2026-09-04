-- Allow re-associating an existing guest with a different party (admin/convidados
-- "mover para outro grupo") without leaving a stale party_invite_token behind.
--
-- inherit_party_invite_token() previously only ran BEFORE INSERT, so a guest
-- moved between parties via UPDATE ... SET party_id = ... kept their old
-- party_invite_token — which would silently point their "group link" (and the
-- /invite flow, keyed by party_invite_token) at the wrong party.

CREATE OR REPLACE FUNCTION public.inherit_party_invite_token()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  existing_token uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.party_id = OLD.party_id THEN
    RETURN NEW;
  END IF;

  SELECT party_invite_token INTO existing_token
  FROM public.guests
  WHERE party_id = NEW.party_id AND id <> NEW.id
  LIMIT 1;

  IF existing_token IS NOT NULL THEN
    NEW.party_invite_token := existing_token;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Moved into a party of one (no other member to inherit from) — mint a
    -- fresh token so this guest stops sharing the old party's group link.
    NEW.party_invite_token := gen_random_uuid();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER guests_inherit_party_invite_token ON public.guests;

CREATE TRIGGER guests_inherit_party_invite_token
BEFORE INSERT OR UPDATE OF party_id ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.inherit_party_invite_token();
