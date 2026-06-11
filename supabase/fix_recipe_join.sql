-- Fix Recipe Relationship to Profiles
-- This allows easy joining of name/avatar in the feed
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_created_by_fkey;
ALTER TABLE recipes ADD CONSTRAINT recipes_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure RLS allows selecting these profiles (already done in previous step, but just to be sure)
CREATE POLICY "Allow public select on profiles" ON profiles FOR SELECT USING (true);
