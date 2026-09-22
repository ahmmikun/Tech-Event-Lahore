-- ==============================================================================
-- MIGRATION: CREATE 'event-images' STORAGE BUCKET & RLS POLICIES
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uvggwzauotvdhdbwuqil/sql
-- ==============================================================================

-- 1. Ensure the public storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- 2. Drop existing policies for this bucket to avoid duplicates or conflicts
DROP POLICY IF EXISTS "Public Event Images Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Event Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- 3. Allow EVERYONE (public & authenticated) to read/view images
CREATE POLICY "Public Event Images Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- 4. Allow uploads to 'event-images' bucket (public & authenticated)
CREATE POLICY "Allow uploads to event-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');

-- 5. Allow updating images in 'event-images' bucket
CREATE POLICY "Allow updates to event-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

-- 6. Allow deleting images in 'event-images' bucket
CREATE POLICY "Allow deletes to event-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'event-images');
