-- Champs italien pour notes olfactives (+ pas de fuite FR dans family_it produits courants)
ALTER TABLE public.olfactory_notes ADD COLUMN IF NOT EXISTS name_it TEXT;

UPDATE public.olfactory_notes SET name_it = CASE trim(name)
  WHEN 'Caramel' THEN 'Caramello'
  WHEN 'Safran' THEN 'Zafferano'
  WHEN 'Pêche' THEN 'Pesca'
  WHEN 'Fruits rouges' THEN 'Frutti rossi'
  WHEN 'Poivre rose' THEN 'Pepe rosa'
  WHEN 'Gingembre' THEN 'Zenzero'
  WHEN 'Ciste' THEN 'Cisto'
  WHEN 'Notes boisées' THEN 'Note legnose'
  WHEN 'Vanille' THEN 'Vaniglia'
  WHEN 'Musc' THEN 'Muschio'
  WHEN 'Benjoin' THEN 'Benzoino'
  WHEN 'Framboise' THEN 'Lampone'
  WHEN 'Noix de coco' THEN 'Noce di cocco'
  WHEN 'Sucre roux' THEN 'Zucchero di canna'
  WHEN 'Rose' THEN 'Rosa'
  ELSE name_it
END
WHERE name_it IS NULL OR trim(COALESCE(name_it, '')) = '';

UPDATE public.products
SET family_it = 'Estratto di profumo'
WHERE family_it IS NULL
   OR trim(family_it) = ''
   OR trim(family_it) ILIKE 'Extrait de Parfum'
   OR trim(family_it) ILIKE 'Extrait de parfum';
