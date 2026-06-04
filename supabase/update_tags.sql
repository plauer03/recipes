-- Add tags array to recipes for categorization
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
