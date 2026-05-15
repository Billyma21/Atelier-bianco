-- Rupture de stock globale (demande métier) : tous les formats passent à 0.
-- L’admin peut réaugmenter `stock` par variante depuis le back-office.
-- Idempotent : exécuter une ou plusieurs fois produit le même état « tout à zéro ».

UPDATE public.product_variants
SET stock = 0;
