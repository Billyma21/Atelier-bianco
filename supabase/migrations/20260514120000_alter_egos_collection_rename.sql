-- Collection renommée « Alter Egos » (slug alter-egos) ; logo SVG header.

UPDATE public.collections
SET
  slug = 'alter-egos',
  name = 'Alter Egos',
  name_it = 'Alter Egos',
  description = 'La collection Alter Egos réunit deux extraits — WHY et MASAMUNE — pensés comme des œuvres olfactives, fabriqués en Italie.',
  image_url = COALESCE(NULLIF(trim(image_url), ''), '/images/why-packshot-hero.png')
WHERE slug = 'le-shirance';

UPDATE public.collections
SET
  slug = 'alter-egos',
  name = 'Alter Egos',
  name_it = 'Alter Egos',
  description = 'La collection Alter Egos réunit deux extraits — WHY et MASAMUNE — pensés comme des œuvres olfactives, fabriqués en Italie.',
  image_url = COALESCE(NULLIF(trim(image_url), ''), '/images/why-packshot-hero.png')
WHERE slug = 'signature'
  AND NOT EXISTS (SELECT 1 FROM public.collections c2 WHERE c2.slug = 'alter-egos');

UPDATE public.site_settings
SET value = COALESCE(value, '{}'::jsonb) || '{"logo_type":"image","logo_url":"/images/logo-atelier-bianco.svg"}'::jsonb
WHERE key = 'header_settings';
