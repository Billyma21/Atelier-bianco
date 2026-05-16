-- Hero : duo WHY + MASAMVNE ; storytelling : WHY en main.

UPDATE public.site_settings
SET
  value = COALESCE(value, '{}'::jsonb)
    || jsonb_build_object(
      'hero_product_image', '/images/hero/alter-egos-duo.png',
      'hero_image', '/images/why/why-lifestyle-hand.png'
    ),
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE key = 'home_content';
