
-- 1) Restore table-level grants so PostgREST can insert/update/select cleanly
REVOKE ALL ON public.profiles FROM authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Clear column-level grants left behind by the previous migration
DO $$
DECLARE c text;
BEGIN
  FOR c IN SELECT attname FROM pg_attribute
    WHERE attrelid = 'public.profiles'::regclass AND attnum > 0 AND NOT attisdropped
  LOOP
    EXECUTE format('REVOKE ALL (%I) ON public.profiles FROM authenticated, anon', c);
  END LOOP;
END $$;

-- 2) Lock base-table SELECT to the row owner only (sensitive fields stay private)
DROP POLICY IF EXISTS "Authenticated can view profile rows" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) Harden UPDATE policy: WITH CHECK prevents role/original_role/user_id tampering
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Safe public discovery via SECURITY DEFINER functions (no email / emotional_state / support_needs / capacity)
CREATE OR REPLACE FUNCTION public.list_public_profiles()
RETURNS TABLE (
  user_id uuid, name text, role text, original_role text,
  campus text, program text, languages text[], expertise text[],
  interests text[], buddy_style text[], mentoring_style text[],
  availability text[], bio text, avatar text, onboarded boolean,
  account_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.name, p.role, p.original_role,
         p.campus, p.program, p.languages, p.expertise,
         p.interests, p.buddy_style, p.mentoring_style,
         p.availability, p.bio, p.avatar, p.onboarded,
         p.account_created_at
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (
  user_id uuid, name text, role text, original_role text,
  campus text, program text, languages text[], expertise text[],
  interests text[], buddy_style text[], mentoring_style text[],
  availability text[], bio text, avatar text, onboarded boolean,
  account_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.name, p.role, p.original_role,
         p.campus, p.program, p.languages, p.expertise,
         p.interests, p.buddy_style, p.mentoring_style,
         p.availability, p.bio, p.avatar, p.onboarded,
         p.account_created_at
  FROM public.profiles p
  WHERE p.user_id = _user_id AND auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.list_public_profiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
