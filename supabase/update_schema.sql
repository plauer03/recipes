-- Add base_portions to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS base_portions INTEGER DEFAULT 2;

-- Add unit_type to ingredients (to distinguish between weight and volume)
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'g'; -- 'g' or 'ml'

-- Add unit to recipe_ingredients to store EL, TL etc.
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'g';
