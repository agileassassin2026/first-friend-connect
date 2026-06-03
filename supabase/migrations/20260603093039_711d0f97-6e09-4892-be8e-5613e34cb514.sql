UPDATE public.profiles
SET id = user_id
WHERE id IS DISTINCT FROM user_id;

ALTER TABLE public.profiles
ALTER COLUMN id DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_matches_user_id'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_matches_user_id CHECK (id = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.profiles_sync_primary_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.id := NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_primary_id_before_write ON public.profiles;
CREATE TRIGGER profiles_sync_primary_id_before_write
BEFORE INSERT OR UPDATE OF user_id, id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_sync_primary_id();