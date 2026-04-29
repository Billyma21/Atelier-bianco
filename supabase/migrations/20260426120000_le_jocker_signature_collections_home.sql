-- Le Jocker (SIGNATURE) + collections accueil (SIGNATURE, Orientale, Florale, Boisée)
-- Exécuter sur le projet Supabase (SQL Editor) ou via `supabase db push`.

-- Colonnes catalogue collections (idempotent)
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS name_it TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- Champs alignés formulaire admin / fiche produit
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS story_it TEXT;

ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'packshot';

ALTER TABLE public.olfactory_notes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Collections « Nos Collections » (visuels + slug pour /parfums?collection=)
INSERT INTO public.collections (name, name_it, slug, description, image_url, sort_order, is_published)
VALUES
  (
    'SIGNATURE',
    'SIGNATURE',
    'signature',
    'Les créations emblématiques de la maison — pièces d''exception et silhouettes reconnaissables.',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
    0,
    true
  ),
  (
    'Collection Orientale',
    'Collezione Orientale',
    'orientale',
    'Ambre, résines, épices et balsamiques : chaleur, profondeur et sillage mystérieux.',
    'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1200&auto=format&fit=crop',
    1,
    true
  ),
  (
    'Collection Florale',
    'Collezione Fioreale',
    'florale',
    'Pétales veloutés, nectars et poudres florales : élégance, lumière et sensualité.',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
    2,
    true
  ),
  (
    'Collection Boisée',
    'Collezione Legnosa',
    'boisee',
    'Cèdre, santal, vétiver et fumées nobles : structure, caractère et tenue.',
    'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1200&auto=format&fit=crop',
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_it = EXCLUDED.name_it,
  description = EXCLUDED.description,
  image_url = COALESCE(EXCLUDED.image_url, public.collections.image_url),
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published;

-- Parfumeur maison (optionnel)
INSERT INTO public.perfumers (name, bio, photo_url)
SELECT
  'Atelier Bianco — Composition',
  'Direction de création Atelier Bianco. Extrait de parfum conçu comme une œuvre graphique et olfactive.',
  'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=400&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.perfumers WHERE name = 'Atelier Bianco — Composition');

-- Nécessite la migration `20260421_product_olfactory_visuals.sql` (table + bucket) pour les deux lignes visuelles.
DO $$
DECLARE
  perf_id UUID;
  sig_id UUID;
  pid UUID;
BEGIN
  SELECT id INTO perf_id FROM public.perfumers WHERE name = 'Atelier Bianco — Composition' LIMIT 1;
  IF perf_id IS NULL THEN
    SELECT id INTO perf_id FROM public.perfumers ORDER BY created_at NULLS LAST LIMIT 1;
  END IF;

  SELECT id INTO sig_id FROM public.collections WHERE slug = 'signature' LIMIT 1;

  INSERT INTO public.products (
    name,
    name_it,
    slug,
    family,
    family_it,
    status,
    intensity,
    is_featured,
    is_new,
    is_limited,
    description,
    description_it,
    story,
    story_it,
    perfumer_id,
    olfactory_profile_title_fr,
    olfactory_profile_title_it,
    olfactory_profile_description_fr,
    olfactory_profile_description_it,
    olfactory_diagram_url,
    ingredients,
    long_desc,
    short_desc
  ) VALUES (
    'Le Jocker',
    'Le Jocker',
    'le-jocker',
    'Oriental énigmatique',
    'Orientale enigmatico',
    'active',
    5,
    true,
    true,
    false,
    'Extrait de parfum qui joue avec les attentes : un sillage dense et lumineux, entre ambre blond, épices précieuses et une signature boisée presque graphique. Comme un joker dans un jeu parfaitement maîtrisé.',
    'Estratto di profumo che gioca con le attese: una scia densa e luminosa, tra ambra dorata, spezie preziose e una firma legnosa quasi grafica. Come un jolly in un gioco perfettamente orchestrato.',
    'Le Jocker est né d''une obsession : celle du symbole qui déplace les règles. Une double interrogation — ¿? — gravée dans l''imaginaire, un flacon monolithique, un extrait fabriqué en Italie. Pas une réponse : une présence.',
    'Le Jocker nasce da un''ossessione: il simbolo che sposta le regole. Una doppia interrogazione — ¿? — nell''immaginario, un flacone monolitico, un estratto realizzato in Italia. Non una risposta: una presenza.',
    perf_id,
    '¿? — L''énigme en sillage',
    '¿? — L''enigma nella scia',
    'Tête : bergamote calabraise, poivre rose, cardamome. Cœur : iris pallida, rose de Mai, résinoïde d''encens. Fond : ambre gris, cèdre Atlas, vanille de Madagascar, mousse sèche.',
    'Testa: bergamotto di Calabria, pepe rosa, cardamomo. Cuore: iris pallida, rosa di Maggio, resinoide d''incenso. Fondo: ambra grigia, cedro dell''Atlante, vaniglia del Madagascar, muschio secco.',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1400&auto=format&fit=crop',
    'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Coumarin, Citronellol, Geraniol, Eugenol, Citral, Benzyl Alcohol, Farnesol.',
    'Un extrait de parfum oriental-boisé structuré comme une architecture olfactive : tension, contraste et tenue exceptionnelle sur peau.',
    'Extrait de parfum — concentration maximale, tenue longue durée.'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    name_it = EXCLUDED.name_it,
    family = EXCLUDED.family,
    family_it = EXCLUDED.family_it,
    status = EXCLUDED.status,
    intensity = EXCLUDED.intensity,
    is_featured = EXCLUDED.is_featured,
    is_new = EXCLUDED.is_new,
    description = EXCLUDED.description,
    description_it = EXCLUDED.description_it,
    story = EXCLUDED.story,
    story_it = EXCLUDED.story_it,
    perfumer_id = EXCLUDED.perfumer_id,
    olfactory_profile_title_fr = EXCLUDED.olfactory_profile_title_fr,
    olfactory_profile_title_it = EXCLUDED.olfactory_profile_title_it,
    olfactory_profile_description_fr = EXCLUDED.olfactory_profile_description_fr,
    olfactory_profile_description_it = EXCLUDED.olfactory_profile_description_it,
    olfactory_diagram_url = EXCLUDED.olfactory_diagram_url,
    ingredients = EXCLUDED.ingredients,
    long_desc = EXCLUDED.long_desc,
    short_desc = EXCLUDED.short_desc,
    updated_at = TIMEZONE('utc'::text, NOW())
  RETURNING id INTO pid;

  DELETE FROM public.product_variants WHERE product_id = pid;
  INSERT INTO public.product_variants (product_id, size_ml, price, stock, sku, is_active)
  VALUES
    (pid, 50, 285.00, 40, 'AB-LE-JOCKER-50', true),
    (pid, 100, 420.00, 25, 'AB-LE-JOCKER-100', true);

  DELETE FROM public.product_images WHERE product_id = pid;
  INSERT INTO public.product_images (product_id, url, position, type, is_primary, display_order)
  VALUES
    (pid, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop', 0, 'packshot', true, 0),
    (pid, 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop', 1, 'lifestyle', false, 1),
    (pid, 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1600&auto=format&fit=crop', 2, 'detail', false, 2);

  DELETE FROM public.olfactory_notes WHERE product_id = pid;
  INSERT INTO public.olfactory_notes (product_id, type, name, position, image_url)
  VALUES
    (pid, 'head', 'Bergamote de Calabre', 0, 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=400&auto=format&fit=crop'),
    (pid, 'head', 'Poivre rose', 1, NULL),
    (pid, 'heart', 'Iris pallida', 2, 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=400&auto=format&fit=crop'),
    (pid, 'heart', 'Rose de Mai', 3, NULL),
    (pid, 'base', 'Ambre gris', 4, 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=400&auto=format&fit=crop'),
    (pid, 'base', 'Cèdre Atlas', 5, NULL);

  IF to_regclass('public.product_olfactory_visuals') IS NOT NULL THEN
    DELETE FROM public.product_olfactory_visuals WHERE product_id = pid;
    INSERT INTO public.product_olfactory_visuals (product_id, kind, image_url, caption_fr, caption_it, alt_fr, alt_it, sort_order)
    VALUES
      (
        pid,
        'story_panel',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop',
        'Monolithique, graphique, essentiel — Le Jocker impose sa silhouette.',
        'Monolitico, grafico, essenziale — Le Jocker impone la sua silhouette.',
        'Flacon Le Jocker — packshot studio',
        'Flacone Le Jocker — packshot studio',
        0
      ),
      (
        pid,
        'pyramid_diagram',
        'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop',
        'Pyramide olfactive : tête épicée, cœur floral-poudré, fond ambré-boisé.',
        'Piramide olfattiva: testa speziata, cuore floreale-polveroso, fondo ambrato-legnoso.',
        'Schéma pyramide olfactive Le Jocker',
        'Schema piramide olfattiva Le Jocker',
        0
      );
  END IF;

  DELETE FROM public.product_collections WHERE product_id = pid;
  IF sig_id IS NOT NULL THEN
    INSERT INTO public.product_collections (product_id, collection_id) VALUES (pid, sig_id);
  END IF;
END $$;
