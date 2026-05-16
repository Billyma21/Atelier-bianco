-- Galerie MASAMVNE : image hero « masamvne-image-une » + visuels éditoriaux.

UPDATE public.products
SET
  og_image = '/images/masamvne/masamvne-image-une.png',
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE slug IN ('masamvne', 'masamune');

DO $$
DECLARE
  mid UUID;
BEGIN
  SELECT id INTO mid FROM public.products WHERE slug = 'masamvne' LIMIT 1;
  IF mid IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.product_images WHERE product_id = mid;

  INSERT INTO public.product_images (product_id, url, position, type, is_primary, display_order)
  VALUES
    (mid, '/images/masamvne/masamvne-image-une.png', 0, 'packshot', true, 0),
    (mid, '/images/masamvne/masamvne-hero-dark.png', 1, 'editorial', false, 1),
    (mid, '/images/masamvne/masamvne-marble.png', 2, 'editorial', false, 2),
    (mid, '/images/masamvne/masamvne-split-light.png', 3, 'editorial', false, 3);
END $$;
