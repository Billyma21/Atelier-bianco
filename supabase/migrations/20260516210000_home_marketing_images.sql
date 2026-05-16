-- Visuels marketing accueil : WHY en main (hero + story) & duo Alter Egos.

UPDATE public.collections
SET
  image_url = '/images/collections/alter-egos-duo.png',
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug IN ('alter-egos', 'le-shirance', 'signature');

UPDATE public.site_settings
SET
  value = COALESCE(value, '{}'::jsonb)
    || jsonb_build_object(
      'hero_image', '/images/why/why-lifestyle-hand.png',
      'hero_product_image', '/images/why/why-lifestyle-hand.png'
    ),
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE key = 'home_content';
