-- Supabase Storage RLS Policies for avatars bucket
-- Run this in Supabase Dashboard → SQL Editor
-- Fixes: "new row violates row-level security policy" on upload

DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;

-- 1. Allow authenticated users to INSERT (upload) into avatars bucket
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 2. Allow authenticated users to UPDATE (for upsert overwrite)
CREATE POLICY "Allow authenticated updates to avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 3. Allow public read access (so profile images load without auth)
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
