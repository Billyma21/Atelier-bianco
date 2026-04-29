-- Catalogue boutique : ordre d’affichage, libellé IT, visibilité, collection par défaut SIGNATURE
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS name_it TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_collections_catalog ON public.collections (is_published, sort_order, name);

COMMENT ON COLUMN public.collections.sort_order IS 'Ordre des onglets sur /parfums (plus petit = plus à gauche).';
COMMENT ON COLUMN public.collections.is_published IS 'Si false, la collection reste gérable en admin mais n’apparaît pas sur le site.';

INSERT INTO public.collections (name, name_it, slug, description, sort_order, is_published)
SELECT
  'SIGNATURE',
  'SIGNATURE',
  'signature',
  'Les créations emblématiques de la maison.',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.collections WHERE slug = 'signature');
