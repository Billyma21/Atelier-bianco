-- Visuels marketing du profil olfactif (1 panneau narration + 1 schéma pyramide par produit)
-- Relation 1-N contrôlée par `kind` unique par produit.

CREATE TABLE IF NOT EXISTS public.product_olfactory_visuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('story_panel', 'pyramid_diagram')),
  image_url TEXT NOT NULL,
  caption_fr TEXT,
  caption_it TEXT,
  alt_fr TEXT,
  alt_it TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT product_olfactory_visuals_product_kind_unique UNIQUE (product_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_olfactory_visuals_product ON public.product_olfactory_visuals (product_id);

COMMENT ON TABLE public.product_olfactory_visuals IS 'Visuels haute couture du bloc profil olfactif : panneau narration (story_panel) et schéma pyramide (pyramid_diagram).';

ALTER TABLE public.product_olfactory_visuals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read olfactory visuals" ON public.product_olfactory_visuals;
CREATE POLICY "Anyone can read olfactory visuals" ON public.product_olfactory_visuals
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access olfactory visuals" ON public.product_olfactory_visuals;
CREATE POLICY "Admin full access olfactory visuals" ON public.product_olfactory_visuals
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bucket public pour les images (téléversement côté admin authentifié)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-olfactory',
  'product-olfactory',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "product_olfactory_select_public" ON storage.objects;
CREATE POLICY "product_olfactory_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-olfactory');

DROP POLICY IF EXISTS "product_olfactory_insert_auth" ON storage.objects;
CREATE POLICY "product_olfactory_insert_auth" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-olfactory');

DROP POLICY IF EXISTS "product_olfactory_update_auth" ON storage.objects;
CREATE POLICY "product_olfactory_update_auth" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-olfactory');

DROP POLICY IF EXISTS "product_olfactory_delete_auth" ON storage.objects;
CREATE POLICY "product_olfactory_delete_auth" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-olfactory');
