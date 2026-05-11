-- Collection « Le Shirance » + slug catalogue ; MASAMUNE (slug masamune) ; logo typo locale.

UPDATE public.collections
SET
  slug = 'le-shirance',
  name = 'Le Shirance',
  name_it = 'Le Shirance',
  description = 'La collection Le Shirance réunit deux extraits — WHY et MASAMUNE — pensés comme des œuvres olfactives, fabriqués en Italie.',
  image_url = '/images/why-packshot-hero.png',
  is_published = true
WHERE slug = 'signature';

UPDATE public.site_settings
SET value = COALESCE(value, '{}'::jsonb) || '{"logo_type":"image","logo_url":"/images/logo-atelier-bianco.png"}'::jsonb
WHERE key = 'header_settings';

UPDATE public.products
SET
  slug = 'masamune',
  name = 'MASAMUNE',
  name_it = 'MASAMUNE',
  og_image = '/images/masamune-packshot.png',
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug = 'masamvne';

UPDATE public.product_images pi
SET url = '/images/masamune-packshot.png'
FROM public.products p
WHERE pi.product_id = p.id AND p.slug = 'masamune' AND (pi.is_primary = true OR pi.display_order = 0);

UPDATE public.product_images pi
SET url = '/images/masamune-lifestyle.png'
FROM public.products p
WHERE pi.product_id = p.id AND p.slug = 'masamune' AND pi.display_order = 1;
