
-- 1) Restrict base-table SELECT to the row owner
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) Safe discovery view (excludes email, emotional_state, support_needs, capacity)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id,
  user_id,
  name,
  role,
  campus,
  program,
  languages,
  expertise,
  interests,
  buddy_style,
  mentoring_style,
  availability,
  bio,
  avatar,
  onboarded,
  account_created_at,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;

-- 3) Prevent privilege escalation via UPDATE
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Immutable provenance fields
  IF NEW.original_role IS DISTINCT FROM OLD.original_role THEN
    RAISE EXCEPTION 'original_role is immutable';
  END IF;
  IF NEW.account_created_at IS DISTINCT FROM OLD.account_created_at THEN
    RAISE EXCEPTION 'account_created_at is immutable';
  END IF;

  -- Role transitions: must remain in the allowed set
  IF NEW.role NOT IN ('new-student', 'senior-buddy') THEN
    RAISE EXCEPTION 'invalid role value: %', NEW.role;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow new-student -> senior-buddy after 2 years on the account
    IF NOT (
      OLD.role = 'new-student'
      AND NEW.role = 'senior-buddy'
      AND COALESCE(OLD.original_role, 'new-student') = 'new-student'
      AND OLD.account_created_at <= now() - interval '2 years'
    ) THEN
      RAISE EXCEPTION 'role change not permitted';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role_update ON public.profiles;
CREATE TRIGGER profiles_guard_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_role();

-- 4) Constrain values on INSERT too
CREATE OR REPLACE FUNCTION public.profiles_guard_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role NOT IN ('new-student', 'senior-buddy') THEN
    RAISE EXCEPTION 'invalid role value: %', NEW.role;
  END IF;
  IF NEW.original_role IS NOT NULL AND NEW.original_role NOT IN ('new-student', 'senior-buddy') THEN
    RAISE EXCEPTION 'invalid original_role value: %', NEW.original_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_insert_trg ON public.profiles;
CREATE TRIGGER profiles_guard_insert_trg
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_insert();
