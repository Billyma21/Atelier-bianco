-- Une collection catalogue visible + produit WHY cohérent (slug why), images locales /public/images/
-- Idempotent sur une base déjà seedée (Le Jocker → WHY).

UPDATE public.collections
SET is_published = false
WHERE slug IN ('orientale', 'florale', 'boisee');

UPDATE public.collections
SET
  name = 'L''Élégance Intemporelle',
  name_it = 'L''Eleganza Senza Tempo',
  description = 'La collection signature Atelier Bianco : WHY, extrait de parfum fabriqué en Italie — une vision olfactive unique, symbole ¿? gravé sur le flacon.',
  image_url = '/images/why-packshot-hero.png',
  sort_order = 0,
  is_published = true
WHERE slug = 'signature';

UPDATE public.site_settings
SET value = COALESCE(value, '{}'::jsonb) || '{"logo_type":"image","logo_url":"/images/logo-atelier-bianco.png"}'::jsonb
WHERE key = 'header_settings';

UPDATE public.site_settings
SET value = COALESCE(value, '{}'::jsonb) || jsonb_build_object(
  'hero_image', '/images/why-lifestyle-2.png',
  'hero_image_alt', 'WHY — Extrait de Parfum, Atelier Bianco',
  'story_title', 'L''élégance intemporelle',
  'story_text', 'WHY incarne l''essence d''Atelier Bianco : un extrait de parfum conçu comme une œuvre — concentration maximale, flacon monolithique, fabrication italienne, symbole ¿? au cœur du verre.'
)
WHERE key = 'home_content';

DO $$
DECLARE
  pid uuid;
  sig_id uuid;
  perf_id uuid;
BEGIN
  SELECT id INTO sig_id FROM public.collections WHERE slug = 'signature' LIMIT 1;
  SELECT id INTO perf_id FROM public.perfumers ORDER BY created_at NULLS LAST LIMIT 1;

  SELECT id INTO pid FROM public.products WHERE slug = 'le-jocker' LIMIT 1;
  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.products WHERE slug = 'why' LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    RAISE NOTICE 'single_collection_why_catalog: aucun produit le-jocker/why — exécuter d''abord 20260426120000_le_jocker_signature_collections_home.sql';
    RETURN;
  END IF;

  UPDATE public.products
  SET slug = 'legacy-' || id::text
  WHERE slug = 'why' AND id <> pid;

  UPDATE public.products
  SET
    name = 'WHY',
    name_it = 'WHY',
    slug = 'why',
    family = 'Extrait de Parfum',
    family_it = 'Extrait de Parfum',
    status = 'active',
    intensity = 5,
    is_featured = true,
    is_new = true,
    is_limited = false,
    description = $desc$
Un extrait de parfum intense où le mystère rencontre la précision. WHY pose la question essentielle : un sillage ambré et boisé, une concentration maximale, un flacon monolithique pensé comme une sculpture de verre.
$desc$,
    description_it = $descit$
Un estratto di profumo intenso in cui il mistero incontra la precisione. WHY pone la domanda essenziale: una scia ambrata e legnosa, concentrazione massima, flacone monolitico concepito come una scultura di vetro.
$descit$,
    story = $story$
Fabriqué en Italie. Au centre du flacon, le symbole ¿? — deux fragments de curiosité qui se rejoignent. Pas une réponse : une présence.
$story$,
    story_it = $storyit$
Realizzato in Italia. Al centro del flacone, il simbolo ¿? — due frammenti di curiosità che si incontrano. Non una risposta: una presenza.
$storyit$,
    perfumer_id = COALESCE(perfumer_id, perf_id),
    olfactory_profile_title_fr = '¿? — Une présence, pas une réponse',
    olfactory_profile_title_it = '¿? — Una presenza, non una risposta',
    olfactory_profile_description_fr = 'Tête : bergamote de Calabre, poivre rose, cardamome. Cœur : iris pallida, rose de Mai, encens. Fond : ambre gris, cèdre Atlas, vanille de Madagascar, mousse sèche.',
    olfactory_profile_description_it = 'Testa: bergamotto di Calabria, pepe rosa, cardamomo. Cuore: iris pallida, rosa di Maggio, incenso. Fondo: ambra grigia, cedro dell''Atlante, vaniglia del Madagascar, muschio secco.',
    olfactory_diagram_url = '/images/why-gallery-03.png',
    ingredients = 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Coumarin, Citronellol, Geraniol, Eugenol, Citral, Benzyl Alcohol, Farnesol.',
    long_desc = $long$
WHY est une énigme portée sur la peau : une pyramide oriental-boisée structurée comme une architecture olfactive — tension, contraste et tenue exceptionnelle. Extrait de parfum, concentration maximale, pensé pour laisser une empreinte durable.
$long$,
    short_desc = 'Extrait de parfum — concentration maximale, Made in Italy.',
    meta_title = 'WHY — Extrait de Parfum | Atelier Bianco',
    meta_desc = 'Découvrez WHY : extrait de parfum Atelier Bianco. Symbole ¿?, flacon monolithique, fabrication italienne.',
    og_image = '/images/why-packshot-hero.png',
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = pid;

  DELETE FROM public.product_variants WHERE product_id = pid;
  INSERT INTO public.product_variants (product_id, size_ml, price, stock, sku, is_active)
  VALUES
    (pid, 50, 219.00, 60, 'AB-WHY-50', true),
    (pid, 100, 319.00, 35, 'AB-WHY-100', true);

  DELETE FROM public.product_images WHERE product_id = pid;
  INSERT INTO public.product_images (product_id, url, position, type, is_primary, display_order)
  VALUES
    (pid, '/images/why-packshot-hero.png', 0, 'packshot', true, 0),
    (pid, '/images/why-lifestyle-2.png', 1, 'lifestyle', false, 1),
    (pid, '/images/why-gallery-01.png', 2, 'lifestyle', false, 2),
    (pid, '/images/why-gallery-02.png', 3, 'detail', false, 3),
    (pid, '/images/why-gallery-04.png', 4, 'detail', false, 4),
    (pid, '/images/why-gallery-05.png', 5, 'lifestyle', false, 5);

  DELETE FROM public.product_collections WHERE product_id = pid;
  IF sig_id IS NOT NULL THEN
    INSERT INTO public.product_collections (product_id, collection_id) VALUES (pid, sig_id);
  END IF;

  IF to_regclass('public.product_olfactory_visuals') IS NOT NULL THEN
    DELETE FROM public.product_olfactory_visuals WHERE product_id = pid;
    INSERT INTO public.product_olfactory_visuals (product_id, kind, image_url, caption_fr, caption_it, alt_fr, alt_it, sort_order)
    VALUES
      (
        pid,
        'story_panel',
        '/images/why-packshot-hero.png',
        'Monolithique, graphique, essentiel — WHY impose sa silhouette.',
        'Monolitico, grafico, essenziale — WHY impone la sua silhouette.',
        'WHY — packshot studio',
        'WHY — packshot studio',
        0
      ),
      (
        pid,
        'pyramid_diagram',
        '/images/why-gallery-03.png',
        'Pyramide olfactive : tête épicée, cœur floral-poudré, fond ambré-boisé.',
        'Piramide olfattiva: testa speziata, cuore floreale-polveroso, fondo ambrato-legnoso.',
        'Schéma pyramide olfactive WHY',
        'Schema piramide olfattiva WHY',
        1
      );
  END IF;
END $$;
