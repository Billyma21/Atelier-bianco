-- Retire le visuel en double (split rose) de la galerie MASAMVNE.

DELETE FROM public.product_images pi
USING public.products p
WHERE pi.product_id = p.id
  AND p.slug = 'masamvne'
  AND pi.url LIKE '%masamvne-split-rose%';
