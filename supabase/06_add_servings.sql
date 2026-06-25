-- Add default_servings to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS default_servings INTEGER DEFAULT 1;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
