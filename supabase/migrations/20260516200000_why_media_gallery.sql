-- Galerie WHY : image hero + visuels éditoriaux (vidéo servie côté app).

UPDATE public.products
SET
  og_image = '/images/why/why-image-une.png',
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug = 'why';

DO $$
DECLARE
  wid UUID;
BEGIN
  SELECT id INTO wid FROM public.products WHERE slug = 'why' LIMIT 1;
  IF wid IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.product_images WHERE product_id = wid;

  INSERT INTO public.product_images (product_id, url, position, type, is_primary, display_order)
  VALUES
    (wid, '/images/why/why-image-une.png', 0, 'packshot', true, 0),
    (wid, '/images/why/why-hero-dark.png', 1, 'editorial', false, 1),
    (wid, '/images/why/why-split-light.png', 2, 'editorial', false, 2);
END $$;

-- Retire les anciennes URLs legacy encore en base.
DELETE FROM public.product_images pi
USING public.products p
WHERE pi.product_id = p.id
  AND p.slug = 'why'
  AND (
    pi.url LIKE '%why-lifestyle%'
    OR pi.url LIKE '%why-gallery-%'
    OR pi.url LIKE '%why-pyramid%'
  );
