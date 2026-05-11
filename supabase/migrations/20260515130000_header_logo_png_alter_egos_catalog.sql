-- Logo wordmark PNG + collection Alter Egos reliée à WHY et MASAMVNE dans la base.
-- Fichier attendu : `public/images/logo-atelier-bianco-wordmark.png`.

INSERT INTO public.site_settings (key, value)
VALUES (
  'header_settings',
  jsonb_build_object(
    'logo_type', 'image',
    'logo_url', '/images/logo-atelier-bianco-wordmark.png',
    'logo_text', 'Atelier Bianco',
    'show_announcement', false,
    'announcement_text', ''
  )
)
ON CONFLICT (key) DO UPDATE
SET
  value = COALESCE(public.site_settings.value, '{}'::jsonb)
    || jsonb_build_object(
      'logo_type', 'image',
      'logo_url', '/images/logo-atelier-bianco-wordmark.png',
      'logo_text', 'Atelier Bianco'
    ),
  updated_at = TIMEZONE('utc'::text, NOW());

INSERT INTO public.collections (name, name_it, slug, description, image_url, is_published, sort_order)
VALUES (
  'Alter Egos',
  'Alter Egos',
  'alter-egos',
  'La collection Alter Egos réunit deux extraits — WHY et MASAMVNE — pensés comme des œuvres olfactives, fabriqués en Italie.',
  '/images/why-packshot-hero.png',
  true,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_it = EXCLUDED.name_it,
  description = EXCLUDED.description,
  image_url = COALESCE(
    NULLIF(btrim(EXCLUDED.image_url::text), ''),
    public.collections.image_url
  ),
  is_published = true,
  sort_order = EXCLUDED.sort_order;

DO $$
DECLARE
  cid uuid;
  wid uuid;
  mid uuid;
BEGIN
  SELECT id INTO cid FROM public.collections WHERE slug = 'alter-egos' LIMIT 1;

  SELECT id INTO wid FROM public.products WHERE slug = 'why' LIMIT 1;
  SELECT p.id INTO mid
  FROM public.products p
  WHERE p.slug IN ('masamune', 'masamvne')
  ORDER BY CASE WHEN p.slug = 'masamvne' THEN 0 WHEN p.slug = 'masamune' THEN 1 ELSE 2 END
  LIMIT 1;

  IF cid IS NULL THEN
    RAISE NOTICE 'alter-egos collection missing; run prior migrations';
    RETURN;
  END IF;

  IF wid IS NOT NULL THEN
    DELETE FROM public.product_collections WHERE product_id = wid;
    INSERT INTO public.product_collections (product_id, collection_id) VALUES (wid, cid);
    UPDATE public.products SET is_featured = true, updated_at = TIMEZONE('utc'::text, NOW()) WHERE id = wid;
  END IF;

  IF mid IS NOT NULL THEN
    DELETE FROM public.product_collections WHERE product_id = mid;
    INSERT INTO public.product_collections (product_id, collection_id) VALUES (mid, cid);
    UPDATE public.products SET is_featured = true, updated_at = TIMEZONE('utc'::text, NOW()) WHERE id = mid;
  END IF;
END $$;
