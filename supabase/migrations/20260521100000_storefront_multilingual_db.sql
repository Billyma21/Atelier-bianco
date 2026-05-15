-- Multilingue vitrine : colonnes IT/EN, textes WHY & MASAMVNE, collections, FAQ, traductions.
-- Idempotent : ADD COLUMN IF NOT EXISTS + UPDATE par slug.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_desc_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_desc_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title_it TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_desc_it TEXT;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_desc_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS story_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_desc_en TEXT;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_desc_en TEXT;

COMMENT ON COLUMN public.products.short_desc_it IS 'Accroche marketing italienne (cartes, grilles).';

UPDATE public.products SET
  short_desc_it = $why_sd$
Perché alcune presenze lasciano un segno senza pronunciare una parola? Perché alcuni ricordi rifiutano di svanire? WHY è una fragranza costruita attorno all’ineffabile.
$why_sd$,
  meta_title_it = 'WHY — Estratto di profumo | Atelier Bianco',
  meta_desc_it = 'WHY di Atelier Bianco: estratto di profumo dal carattere misterioso — concentrazione massima, flacone monolitico, simbolo ¿?, realizzato in Italia.',
  family_it = COALESCE(NULLIF(trim(family_it), ''), 'Estratto di profumo')
WHERE slug = 'why';

UPDATE public.products SET
  description_it = $why_d$
Un estratto di profumo intenso in cui il mistero incontra la precisione. WHY pone la domanda essenziale: una scia ambrata e legnosa, concentrazione massima, flacone monolitico concepito come scultura di vetro. Una firma elegante e avvolgente, pensata per lasciare una traccia più che un’impressione.
$why_d$
WHERE slug = 'why' AND (description_it IS NULL OR trim(description_it) = '');

UPDATE public.products SET
  short_desc_it = $mas_sd$
Una lama silenziosa. Precisa, potente, perfettamente controllata. MASAMVNE evoca l’eleganza di una lama forgiata all’eccellenza: una presenza nitida, raffinata e irresistibilmente magnetica.
$mas_sd$,
  meta_title_it = 'MASAMVNE — Estratto di profumo | Atelier Bianco',
  meta_desc_it = 'MASAMVNE: estratto gourmand e oriental-floreale Atelier Bianco — lampone, cocco, caramello, rosa. Fabbricazione italiana.',
  family_it = COALESCE(NULLIF(trim(family_it), ''), 'Estratto di profumo')
WHERE slug = 'masamvne';

UPDATE public.products SET
  description_it = $mas_d$
Un estratto gourmand e oriental-floreale: lampone e cocco in apertura, un cuore dolce di caramello, zucchero di canna e vaniglia, un fondo vellutato di rosa e muschio. Una silhouette contemporanea dalla tensione perfetta — contrasto, precisione, eleganza. Nulla è eccessivo, tutto è sotto controllo: una firma netta che cattura l’attenzione con naturalezza disarmante.
$mas_d$
WHERE slug = 'masamvne' AND (description_it IS NULL OR trim(description_it) = '');

ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS description_it TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS description_en TEXT;

UPDATE public.collections SET description_it = $col_sig$
Collezione unica: due estratti di profumo — WHY e MASAMVNE — pensati come opere grafiche e olfattive, creati in Italia.
$col_sig$
WHERE slug = 'signature' AND (description_it IS NULL OR trim(description_it) = '');

UPDATE public.collections SET description_it = $col_ae$
Alter Egos riunisce WHY e MASAMVNE: due presenze olfattive forti, firme personali dalla concentrazione massima e dalla produzione italiana.
$col_ae$
WHERE slug = 'alter-egos' AND (description_it IS NULL OR trim(description_it) = '');

ALTER TABLE public.perfumers ADD COLUMN IF NOT EXISTS bio_it TEXT;
ALTER TABLE public.perfumers ADD COLUMN IF NOT EXISTS bio_en TEXT;

ALTER TABLE public.translations ADD COLUMN IF NOT EXISTS en TEXT;

ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS question_en TEXT;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS answer_en TEXT;

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
