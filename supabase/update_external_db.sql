-- Add external database toggle to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_external_db BOOLEAN DEFAULT FALSE;
