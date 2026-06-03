
-- Drop the SECURITY DEFINER view flagged by the linter
DROP VIEW IF EXISTS public.profiles_public;

-- Replace owner-only SELECT with broad SELECT + column-level grants
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated can view profile rows"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Column-level grants: hide sensitive columns from all readers
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, user_id, name, role, campus, program,
  languages, expertise, interests, buddy_style, mentoring_style,
  availability, bio, avatar, onboarded,
  account_created_at, created_at, updated_at
) ON public.profiles TO authenticated;

-- Switch guard triggers to SECURITY INVOKER (they only validate OLD/NEW)
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.original_role IS DISTINCT FROM OLD.original_role THEN
    RAISE EXCEPTION 'original_role is immutable';
  END IF;
  IF NEW.account_created_at IS DISTINCT FROM OLD.account_created_at THEN
    RAISE EXCEPTION 'account_created_at is immutable';
  END IF;
  IF NEW.role NOT IN ('new-student', 'senior-buddy') THEN
    RAISE EXCEPTION 'invalid role value: %', NEW.role;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
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

CREATE OR REPLACE FUNCTION public.profiles_guard_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
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
