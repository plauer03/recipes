-- Migration to add real data fields to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_time INTEGER DEFAULT 15;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_time INTEGER DEFAULT 20;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- We don't need likes anymore. If there was a likes column, we could drop it, 
-- but we never added one (we only had is_favorite in the UI state).
