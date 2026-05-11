-- Collection unique « signature » : WHY + MASAMVNE (extraits), notes olfactives complètes, FAQ si vide.

UPDATE public.collections
SET
  name = 'L''Élégance Intemporelle',
  name_it = 'L''Eleganza Senza Tempo',
  description = 'Une collection unique : deux extraits de parfum — WHY et MASAMVNE — pensés comme des œuvres graphiques et olfactives, fabriqués en Italie.',
  image_url = '/images/why-packshot-hero.png',
  is_published = true
WHERE slug = 'signature';

UPDATE public.site_settings
SET value = COALESCE(value, '{}'::jsonb) || '{"logo_type":"image","logo_url":"/images/logo-atelier-bianco.png"}'::jsonb
WHERE key = 'header_settings';

DO $$
DECLARE
  wid uuid;
  mid uuid;
  sig_id uuid;
  perf_id uuid;
BEGIN
  SELECT id INTO sig_id FROM public.collections WHERE slug = 'signature' LIMIT 1;
  SELECT id INTO perf_id FROM public.perfumers ORDER BY created_at NULLS LAST LIMIT 1;

  SELECT id INTO wid FROM public.products WHERE slug = 'why' LIMIT 1;

  IF wid IS NOT NULL THEN
    UPDATE public.products SET
      is_featured = true,
      olfactory_profile_description_fr = 'Tête : caramel, safran, pêche, fruits rouges. Cœur : poivre rose, gingembre, ciste. Fond : notes boisées, vanille, musc, benjoin.',
      olfactory_profile_description_it = 'Testa: caramello, zafferano, pesca, frutti rossi. Cuore: pepe rosa, zenzero, cisto. Fondo: note legnose, vaniglia, muschio, benzoino.',
      olfactory_diagram_url = '/images/why-pyramid-editorial.png',
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = wid;

    DELETE FROM public.olfactory_notes WHERE product_id = wid;
    INSERT INTO public.olfactory_notes (product_id, type, name, position) VALUES
      (wid, 'head', 'Caramel', 0),
      (wid, 'head', 'Safran', 1),
      (wid, 'head', 'Pêche', 2),
      (wid, 'head', 'Fruits rouges', 3),
      (wid, 'heart', 'Poivre rose', 4),
      (wid, 'heart', 'Gingembre', 5),
      (wid, 'heart', 'Ciste', 6),
      (wid, 'base', 'Notes boisées', 7),
      (wid, 'base', 'Vanille', 8),
      (wid, 'base', 'Musc', 9),
      (wid, 'base', 'Benjoin', 10);
  END IF;

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
    short_desc,
    meta_title,
    meta_desc,
    og_image
  ) VALUES (
    'MASAMVNE',
    'MASAMVNE',
    'masamvne',
    'Extrait de Parfum',
    'Extrait de Parfum',
    'active',
    5,
    true,
    true,
    false,
    $masd$
Un extrait gourmand et floral oriental : framboise et noix de coco en ouverture, cœur sucré (caramel, sucre roux, vanille), fond velouté rose et musc. Une silhouette contemporaine inspirée de la précision du katana — contraste, tension, élégance.
$masd$,
    $masdit$
Un estratto gourmand e floral-oriental: lampone e cocco in apertura, cuore dolce (caramello, zucchero di canna, vaniglia), fondo vellutato di rosa e muschio.
$masdit$,
    $masstory$
Écrit comme une estampe : ligne nette, contraste mat/brillant, liquidité pêche-rose. Fabriqué en Italie — une présence olfactive aussi incisive qu’un geste maîtrisé.
$masstory$,
    $masstoryit$
Scritto come un'incisione: linea netta, contrasto, liquido pesca-rosa. Realizzato in Italia.
$masstoryit$,
    COALESCE(perf_id, (SELECT id FROM public.perfumers ORDER BY created_at NULLS LAST LIMIT 1)),
    'La ligne et la matière',
    'La linea e la materia',
    'Tête : framboise, noix de coco. Cœur : caramel, sucre roux, vanille. Fond : rose, musc.',
    'Testa: lampone, cocco. Cuore: caramello, zucchero di canna, vaniglia. Fondo: rosa, muschio.',
    '/images/masamvne-packshot.png',
    'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Coumarin, Citronellol, Geraniol, Eugenol, Citral, Benzyl Alcohol, Farnesol.',
    $maslong$
MASAMVNE explore la rencontre entre gourmandise précise et florale veloutée : un extrait dense, lumineux, pensé pour un sillage racé du jour comme du soir.
$maslong$,
    'Extrait de parfum — fabrication italienne.',
    'MASAMVNE — Extrait de Parfum | Atelier Bianco',
    'Découvrez MASAMVNE : extrait de parfum Atelier Bianco — pyramide framboise, caramel, rose.',
    '/images/masamvne-packshot.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    name_it = EXCLUDED.name_it,
    family = EXCLUDED.family,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    description = EXCLUDED.description,
    description_it = EXCLUDED.description_it,
    story = EXCLUDED.story,
    story_it = EXCLUDED.story_it,
    olfactory_profile_title_fr = EXCLUDED.olfactory_profile_title_fr,
    olfactory_profile_description_fr = EXCLUDED.olfactory_profile_description_fr,
    olfactory_profile_description_it = EXCLUDED.olfactory_profile_description_it,
    long_desc = EXCLUDED.long_desc,
    short_desc = EXCLUDED.short_desc,
    updated_at = TIMEZONE('utc'::text, NOW());

  SELECT id INTO mid FROM public.products WHERE slug = 'masamvne' LIMIT 1;

  IF mid IS NOT NULL THEN
    DELETE FROM public.product_variants WHERE product_id = mid;
    INSERT INTO public.product_variants (product_id, size_ml, price, stock, sku, is_active)
    VALUES
      (mid, 50, 209.00, 45, 'AB-MASAMVNE-50', true),
      (mid, 100, 299.00, 28, 'AB-MASAMVNE-100', true);

    DELETE FROM public.product_images WHERE product_id = mid;
    INSERT INTO public.product_images (product_id, url, position, type, is_primary, display_order)
    VALUES
      (mid, '/images/masamvne-packshot.png', 0, 'packshot', true, 0),
      (mid, '/images/why-lifestyle-2.png', 1, 'lifestyle', false, 1);

    DELETE FROM public.olfactory_notes WHERE product_id = mid;
    INSERT INTO public.olfactory_notes (product_id, type, name, position) VALUES
      (mid, 'head', 'Framboise', 0),
      (mid, 'head', 'Noix de coco', 1),
      (mid, 'heart', 'Caramel', 2),
      (mid, 'heart', 'Sucre roux', 3),
      (mid, 'heart', 'Vanille', 4),
      (mid, 'base', 'Rose', 5),
      (mid, 'base', 'Musc', 6);

    IF sig_id IS NOT NULL THEN
      DELETE FROM public.product_collections WHERE product_id = mid;
      INSERT INTO public.product_collections (product_id, collection_id) VALUES (mid, sig_id);
    END IF;
  END IF;

  IF wid IS NOT NULL AND sig_id IS NOT NULL THEN
    DELETE FROM public.product_collections WHERE product_id = wid;
    INSERT INTO public.product_collections (product_id, collection_id) VALUES (wid, sig_id);
  END IF;
END $$;

DO $$
BEGIN
  IF (SELECT COUNT(*)::int FROM public.faqs) = 0 THEN
    INSERT INTO public.faqs (question_fr, answer_fr, question_it, answer_it, display_order) VALUES
      ('Quels sont les délais et frais de livraison ?', 'Les commandes sont préparées sous 48 h (jours ouvrés), puis expédiées avec suivi. Livraison offerte en France métropolitaine à partir de 150 €.', 'Quali sono tempi e costi di spedizione?', 'Ordini preparati entro 48 ore lavorative, spedizione tracciata. Spedizione gratuita in Francia metropolitana da 150 €.', 0),
      ('Puis-je recevoir des échantillons ?', 'Deux échantillons sont offerts pour toute commande sur le site, selon disponibilité.', 'Posso ricevere campioni?', 'Due campioni in omaggio con ogni ordine, secondo disponibilità.', 1),
      ('Quelle est votre politique de retour ?', 'Produits scellés retournables sous 14 jours (CGV). Flacons ouverts non repris pour raisons d''hygiène.', 'Qual è la politica di reso?', 'Prodotti sigillati restituibili entro 14 giorni. Flaconi aperti non idonei al reso.', 2),
      ('WHY et MASAMVNE sont-ils authentiques ?', 'Oui : extraits formulés pour la Maison, fabrication italienne et traçabilité.', 'WHY e MASAMVNE sono autentici?', 'Sì: estratti formulati per la Maison, produzione italiana.', 3),
      ('Comment contacter le service client ?', 'Via la page Contact ou en répondant à l''e-mail de confirmation de commande.', 'Come contattare il servizio clienti?', 'Tramite la pagina Contatto o rispondendo alla mail di conferma.', 4);
  END IF;
END $$;
