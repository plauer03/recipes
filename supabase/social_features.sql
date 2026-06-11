-- 1. Create Follows Table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 2. Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows." ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others." ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others." ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 3. Update Recipe Policies to allow followers to see recipes
-- First, drop the old restricted policy
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;

-- New policy: See own recipes OR recipes of people you follow
CREATE POLICY "Recipes are viewable by owner or followers" ON recipes
  FOR SELECT USING (
    auth.uid() = created_by 
    OR 
    EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() 
      AND following_id = recipes.created_by
    )
  );

-- 4. Recipe Ingredients access
DROP POLICY IF EXISTS "Users can manage their recipe links" ON recipe_ingredients;

CREATE POLICY "Recipe ingredients are viewable by owner or followers" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND (
        recipes.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = recipes.created_by
        )
      )
    )
  );
  
CREATE POLICY "Recipe ingredients are manageable by owner" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.created_by = auth.uid()
    )
  );
