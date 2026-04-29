-- Seeding Admin User and Initial Site Settings

-- 1. Create Admin User (Note: In a real app, this would be done via Supabase Auth API)
-- For this environment, we assume the user will sign up with this email, 
-- and we'll have a trigger or manual step to set the role to 'admin'.
-- However, we can seed the profile table if the user exists.

-- 2. Initial Site Settings
INSERT INTO site_settings (key, value) VALUES
('theme_colors', '{
  "primary": "#0A0A0A",
  "secondary": "#F8F5F0",
  "accent": "#C9A96E",
  "text": "#0A0A0A",
  "background": "#F8F5F0"
}'),
('typography', '{
  "heading_font": "Cormorant Garamond",
  "body_font": "Inter",
  "base_size": "16px"
}'),
('header_settings', '{
  "logo_type": "text",
  "logo_text": "Atelier Bianco",
  "logo_url": "",
  "show_announcement": true,
  "announcement_text": "Livraison offerte dès 150€ d''achat"
}'),
('footer_settings', '{
  "copyright": "© 2025 Atelier Bianco. Tous droits réservés.",
  "social_links": {
    "instagram": "https://instagram.com/atelierbianco",
    "facebook": "https://facebook.com/atelierbianco"
  }
}'),
('api_keys', '{
  "supabase_url": "https://tqazhmuvmtgfsggdttzc.supabase.co",
  "supabase_anon_key": "sb_publishable_5MsKSWuwDoM-QuKDC_lBhw_WNgA6gB_",
  "supabase_service_role": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYXpobXV2bXRnZnNnZ2R0dHpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc3NjcwMywiZXhwIjoyMDkxMzUyNzAzfQ.dcbjIEPQx9Xwdh0peDCmSE4Yw14WAmVKyyhov14dnM0",
  "stripe_public_key": "pk_test_51TKawYCOwRlqHDT5o7PowdvZBpYwxDbnbXozNCDsakl1DJGWWSEmgQnYWCilU39DiV70UQZ2HHu8Jeck5htXmRsB00U1xJC9Jn",
  "stripe_secret_key": "sk_test_51TKawYCOwRlqHDT5xih00kLmXl4cyxFAvgvZe8085ooiGWmRG09iAesHibRBE36crNLbIbbC5nqyEnPldW3dlKEY00dNJlEyNmsk_test_51TKawYCOwRlqHDT5xih00kLmXl4cyxFAvgvZe8085ooiGWmRG09iAesHibRBE36crNLbIbbC5nqyEnPldW3dlKEY00dNJlEyNm",
  "stripe_webhook_secret": "",
  "resend_api_key": "re_WQJmLbCt_2HxAeids5BBKMNSHpbkiXcDL"
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Secure site_settings RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can see sensitive keys
DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON site_settings;
CREATE POLICY "Public settings are viewable by everyone." ON site_settings FOR SELECT 
USING (key != 'api_keys');

CREATE POLICY "Admins can view all settings." ON site_settings FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update settings." ON site_settings FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Ensure the admin user has the correct role when they sign up
-- We'll create a function to handle new user creation and assign the admin role to the specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'Kenzy@ab.be' THEN 'admin'
      ELSE 'client'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
