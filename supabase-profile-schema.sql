-- ============================================
-- Profile Management Schema
-- Run in Supabase SQL Editor
-- Creates profiles table (if missing) + extended profile fields
-- ============================================

-- 1. Create profiles table if it doesn't exist (base auth setup)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies (create if missing)
DO $$
BEGIN
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- get_email_for_username function (for username login)
CREATE OR REPLACE FUNCTION public.get_email_for_username(uname TEXT)
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$ SELECT email FROM profiles WHERE LOWER(username) = LOWER(uname) LIMIT 1; $$;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO authenticated;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add extended profile columns (run only if columns don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'image_url') THEN
    ALTER TABLE public.profiles ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birthday') THEN
    ALTER TABLE public.profiles ADD COLUMN birthday DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE public.profiles ADD COLUMN address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'title') THEN
    ALTER TABLE public.profiles ADD COLUMN title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'summary') THEN
    ALTER TABLE public.profiles ADD COLUMN summary TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'education') THEN
    ALTER TABLE public.profiles ADD COLUMN education JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'work_experience') THEN
    ALTER TABLE public.profiles ADD COLUMN work_experience JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'portfolios') THEN
    ALTER TABLE public.profiles ADD COLUMN portfolios JSONB DEFAULT '[]';
  END IF;
END $$;

-- 3. Storage bucket for profile images (create in Dashboard)
-- In Dashboard: Storage -> New bucket -> name: 'avatars', Public: true
-- Then add policy: Allow authenticated users to upload

-- RLS policy for avatars bucket (run after creating bucket in Dashboard):
-- INSERT: authenticated users can upload
-- SELECT: public read for avatar URLs
-- UPDATE/DELETE: only owner

-- Example policy (Storage -> avatars -> Policies):
-- Policy name: "Allow authenticated uploads"
-- Allowed operation: INSERT
-- Policy definition: (bucket_id = 'avatars') AND (auth.role() = 'authenticated')

-- Policy name: "Public read"
-- Allowed operation: SELECT
-- Policy definition: (bucket_id = 'avatars')
