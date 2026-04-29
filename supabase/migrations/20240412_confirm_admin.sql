-- Force confirm the admin user email
-- This is necessary because email confirmation is enabled by default in Supabase
-- and we want the admin to be able to log in immediately after registration.

UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()), 
    confirmed_at = COALESCE(confirmed_at, NOW()),
    last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE email = 'Kenzy@ab.be';

-- Also ensure the profile is set to admin (double check)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'Kenzy@ab.be';
