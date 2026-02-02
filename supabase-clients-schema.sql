-- ============================================
-- Clients Table Schema
-- Run in Supabase SQL Editor
-- Stores client information (not app user profiles)
-- ============================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  image_url TEXT,
  birthday DATE,
  address TEXT,
  phone_number TEXT,
  country TEXT,
  title TEXT,
  summary TEXT,
  education JSONB DEFAULT '[]',
  work_experience JSONB DEFAULT '[]',
  portfolios JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Add tech_stack column if missing (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'tech_stack') THEN
    ALTER TABLE public.clients ADD COLUMN tech_stack JSONB DEFAULT '[]';
  END IF;
END $$;

-- Add password column if missing (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'password') THEN
    ALTER TABLE public.clients ADD COLUMN password TEXT;
  END IF;
END $$;

-- Add account_state column if missing (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'account_state') THEN
    ALTER TABLE public.clients ADD COLUMN account_state TEXT;
  END IF;
END $$;

-- Add proxy_info column if missing (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'proxy_info') THEN
    ALTER TABLE public.clients ADD COLUMN proxy_info JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add comment column if missing (for storing user's opinion/notes about the client)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'comment') THEN
    ALTER TABLE public.clients ADD COLUMN comment TEXT;
  END IF;
END $$;

-- Add description column if missing (for Upwork profile description)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'description') THEN
    ALTER TABLE public.clients ADD COLUMN description TEXT;
  END IF;
END $$;

-- RLS: Users can only access their own clients
DO $$
BEGIN
  CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
