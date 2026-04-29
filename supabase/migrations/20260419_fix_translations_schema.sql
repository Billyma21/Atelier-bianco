-- Migration: Fix Missing Translations Table & Cache
-- This script ensures the translations table exists and forces a schema reload

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.translations (
    key TEXT PRIMARY KEY,
    fr TEXT NOT NULL,
    it TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Anyone can view translations') THEN
        CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Admins can manage translations') THEN
        CREATE POLICY "Admins can manage translations" ON public.translations FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    END IF;
END $$;

-- 4. Force Schema Cache Reload
-- Adding a comment or making a tiny DDL change forces PostgREST to refresh its cache
COMMENT ON TABLE public.translations IS 'UI text translations for Atelier Bianco';

-- 5. Initial Seed (Minimal needed for app to work)
INSERT INTO public.translations (key, fr, it, category)
VALUES 
('nav.home', 'Accueil', 'Home', 'common'),
('nav.catalog', 'Catalogue', 'Catalogo', 'common'),
('product.add_to_cart', 'Ajouter au Panier', 'Aggiungi al carrello', 'product'),
('common.loading', 'Chargement...', 'Caricamento...', 'common')
ON CONFLICT (key) DO NOTHING;
