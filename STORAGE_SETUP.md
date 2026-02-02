# Supabase Storage Setup (Avatar Upload)

**Required:** The `avatars` bucket must be created manually in the Supabase Dashboard. It cannot be created from the app (RLS blocks it).

## Step 1: Open Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project

## Step 2: Create the Bucket

1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Configure:
   - **Name:** `avatars` (exactly, lowercase)
   - **Public bucket:** Turn **ON** (so profile images are viewable)
4. Click **Create bucket**

## Step 3: Add Policies

**Required:** Without policies, uploads fail with "new row violates row-level security policy".

**Quick way:** Run `supabase-storage-policies.sql` in Supabase Dashboard → **SQL Editor** → paste and run.

**Manual way:**
1. Click the `avatars` bucket you just created
2. Click **Policies** tab
3. Click **New policy** → **For full customization**

**Policy 1 – Allow uploads (authenticated users):**
- **Policy name:** `Allow authenticated uploads`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **Policy definition:** `(bucket_id = 'avatars') AND (auth.role() = 'authenticated')`
- Click **Review** → **Save policy**

**Policy 2 – Allow public read:**
- **Policy name:** `Public read`
- **Allowed operation:** `SELECT`
- **Target roles:** (leave default or use `public`)
- **Policy definition:** `bucket_id = 'avatars'`
- Click **Review** → **Save policy**

## Alternative: Quick Policies

You can also use **New policy** → **Get started quickly** and choose:
- "Allow public read access"
- "Allow authenticated uploads"

## Fallback

If you can't create the bucket, you can still add a profile image by pasting an image URL in the "Or paste image URL" field (e.g., from Imgur, your website, or a CDN).
