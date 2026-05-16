-- Hero : visuel duo fond crème (distinct de la bannière collection marbre).

UPDATE public.site_settings
SET
  value = COALESCE(value, '{}'::jsonb)
    || jsonb_build_object('hero_product_image', '/images/hero/alter-egos-duo.png'),
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE key = 'home_content';
