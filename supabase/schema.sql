-- FINAL CLEAN SCHEMA
-- First, drop everything to start fresh
DROP TABLE IF EXISTS shopping_list CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Ingredients Table (Personal Ingredient DB)
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_100g FLOAT DEFAULT 0,
  unit_type TEXT DEFAULT 'g', -- 'g' or 'ml'
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ingredients" ON ingredients FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own ingredients" ON ingredients FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own ingredients" ON ingredients FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own ingredients" ON ingredients FOR DELETE USING (auth.uid() = created_by);

-- 3. Recipes Table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  instructions TEXT,
  base_portions INTEGER DEFAULT 2,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recipes" ON recipes FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = created_by);

-- 4. Recipe Ingredients (Link table)
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  unit TEXT DEFAULT 'g' -- 'g', 'ml', 'EL', 'TL'
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their recipe links" ON recipe_ingredients 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.created_by = auth.uid()
    )
  );

-- 5. Shopping List
CREATE TABLE shopping_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  amount_in_grams FLOAT DEFAULT 0,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their shopping list" ON shopping_list FOR ALL USING (auth.uid() = user_id);
