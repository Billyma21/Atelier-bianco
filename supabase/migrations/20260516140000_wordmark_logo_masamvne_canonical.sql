-- Logo wordmark (PNG transparent) + second extrait : nom MASAMVNE, slug URL masamvne.

UPDATE public.site_settings
SET
  value = COALESCE(value, '{}'::jsonb)
    || jsonb_build_object(
      'logo_type', 'image',
      'logo_url', '/images/logo-atelier-bianco-wordmark.png',
      'logo_text', 'Atelier Bianco'
    ),
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE key = 'header_settings';

UPDATE public.collections
SET description = 'La collection Alter Egos réunit deux extraits — WHY et MASAMVNE — pensés comme des œuvres olfactives, fabriqués en Italie.'
WHERE slug = 'alter-egos';

UPDATE public.products
SET
  slug = 'masamvne',
  name = 'MASAMVNE',
  name_it = 'MASAMVNE',
  og_image = '/images/masamvne-packshot.png',
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug = 'masamune';

UPDATE public.products
SET
  name = 'MASAMVNE',
  name_it = 'MASAMVNE',
  og_image = COALESCE(NULLIF(btrim(og_image::text), ''), '/images/masamvne-packshot.png'),
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug = 'masamvne';

UPDATE public.product_images pi
SET url = '/images/masamvne-packshot.png'
FROM public.products p
WHERE pi.product_id = p.id AND p.slug = 'masamvne' AND (pi.is_primary = true OR pi.display_order = 0);
