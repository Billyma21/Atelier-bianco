-- Add multilingual support to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS family_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_it TEXT;

-- Add olfactory profile enhancement
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS olfactory_diagram_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS olfactory_profile_title_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS olfactory_profile_title_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS olfactory_profile_description_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS olfactory_profile_description_it TEXT;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  question_fr TEXT NOT NULL,
  answer_fr TEXT NOT NULL,
  question_it TEXT NOT NULL,
  answer_it TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  display_order INTEGER DEFAULT 0
);

-- Create Translations table for UI
CREATE TABLE IF NOT EXISTS public.translations (
  key TEXT PRIMARY KEY,
  fr TEXT NOT NULL,
  it TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for FAQs
CREATE POLICY "Anyone can view FAQs" ON public.faqs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for Translations
CREATE POLICY "Anyone can view translations" ON public.translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage translations" ON public.translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
