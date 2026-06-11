-- Add email to profiles for friend search
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a trigger to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You might need to manually update existing profiles:
-- UPDATE profiles SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id);
