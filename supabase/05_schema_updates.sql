-- Ensure all necessary columns exist on the recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- We also make sure the shopping list can store custom string ingredients
ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS ingredient_name TEXT;
ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS original_amount NUMERIC;
ALTER TABLE shopping_list ADD COLUMN IF NOT EXISTS unit TEXT;

-- Notify Supabase to refresh schema cache
NOTIFY pgrst, 'reload schema';
