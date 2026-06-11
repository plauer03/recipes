-- Profile Picture Support
-- 1. Add avatar_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create Storage Bucket for avatars (Run this in the Supabase Dashboard under Storage -> New Bucket named 'avatars')
-- Ensure the bucket is 'Public'

-- 3. Storage Policies (Allow users to upload their own avatar)
-- Note: These need to be run in the SQL Editor, assuming the bucket 'avatars' exists.
/*
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Anyone can update their own avatar." ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
*/
