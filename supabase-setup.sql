-- ============================================
-- Supabase Auth Setup for Login & Register
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create profiles table (stores username, full_name for display & username login)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert from auth (trigger runs as postgres, bypasses RLS) or from authenticated user for their own id
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Function to get email from username (for login with username)
-- Security definer allows anon to call without exposing other profile data
CREATE OR REPLACE FUNCTION public.get_email_for_username(uname TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM profiles WHERE LOWER(username) = LOWER(uname) LIMIT 1;
$$;

-- 5. Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(LOWER(NEW.raw_user_meta_data->>'username'), SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists (for re-running script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant execute on RPC to anon (needed for login with username before auth)
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO authenticated;

-- ============================================
-- Optional: If Project, Type, Division have RLS enabled,
-- add policies to allow authenticated users:
-- ============================================
-- ALTER TABLE "Type" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated can manage types" ON "Type" FOR ALL USING (auth.role() = 'authenticated');
-- ALTER TABLE "Division" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated can manage divisions" ON "Division" FOR ALL USING (auth.role() = 'authenticated');
-- ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated can manage projects" ON "Project" FOR ALL USING (auth.role() = 'authenticated');
