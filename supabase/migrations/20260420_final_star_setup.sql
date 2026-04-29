-- Migration: Final Star Setup for WHY and Logo
-- 1. Update Header & Home Settings
INSERT INTO public.site_settings (key, value)
VALUES 
('header_settings', '{
  "logo_type": "text",
  "logo_text": "Atelier Bianco",
  "logo_url": "",
  "show_announcement": true,
  "announcement_text": "Lancement Exclusif : WHY - L''Extrait de Parfum • Atelier Bianco"
}'),
('home_content', '{
  "hero_title": "WHY",
  "hero_subtitle": "L''Énigme Olfactive",
  "hero_image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop",
  "story_title": "Une Question Sans Réponse",
  "story_text": "Pourquoi le parfum nous transporte-t-il ? WHY explore l''invisible et le subconscient, capturant l''essence d''une émotion pure et insaisissable.",
  "promo_banner": "Lancement Exclusif : WHY - L''Extrait de Parfum • Livraison Offerte • Atelier Bianco"
}')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;

-- 2. Insert "Why" Product as the Flagship
DO $$
DECLARE
    perfumer_id_val UUID;
    product_id_val UUID;
BEGIN
    -- Ensure perfumer
    INSERT INTO public.perfumers (name, bio, photo_url)
    VALUES ('Jean-Christophe Hérault', 'Maître parfumeur passionné par les contrastes.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400')
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO perfumer_id_val FROM public.perfumers WHERE name = 'Jean-Christophe Hérault' LIMIT 1;

    -- Insert product
    INSERT INTO public.products (
        name, 
        name_it,
        slug, 
        family, 
        family_it,
        status, 
        intensity, 
        is_featured, 
        description, 
        description_it,
        story,
        story_it,
        perfumer_id,
        olfactory_profile_title_fr,
        olfactory_profile_title_it,
        olfactory_profile_description_fr,
        olfactory_profile_description_it
    ) VALUES (
        'Why',
        'Why',
        'why',
        'Oriental Mystérieux',
        'Orientale Misterioso',
        'active',
        5,
        true,
        'Une fragrance énigmatique qui défie les conventions. Un sillage puissant et mystérieux où les notes s''entremêlent pour créer un sillage inoubliable.',
        'Una fragranza enigmatica che sfida le convenzioni. Una scia potente e misteriosa dove le note si intrecciano per creare una scia indimenticabile.',
        'Pourquoi le parfum nous transporte-t-il ? "Why" explore l''invisible et le subconscient, capturant l''essence d''une question sans réponse.',
        'Perché il profumo ci trasporta? "Why" esplora l''invisibile e il subconscio, catturando l''essenza di une question sans réponse.',
        perfumer_id_val,
        'L''Art du Mystère',
        'L''Arte del Mistero',
        'Une exploration olfactive des profondeurs de l''âme.',
        'Un''esplorazione olfattiva delle profondità de l''anima.'
    ) 
    ON CONFLICT (slug) DO UPDATE SET is_featured = true, intensity = 5
    RETURNING id INTO product_id_val;

    -- Variants
    INSERT INTO public.product_variants (product_id, size_ml, price, stock)
    VALUES (product_id_val, 100, 195, 50), (product_id_val, 50, 125, 30)
    ON CONFLICT DO NOTHING;

    -- Images
    INSERT INTO public.product_images (product_id, url, type, display_order, is_primary)
    VALUES (product_id_val, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800', 'packshot', 1, true)
    ON CONFLICT DO NOTHING;

    -- Notes
    INSERT INTO public.olfactory_notes (product_id, name, type, image_url)
    VALUES 
    (product_id_val, 'Bergamote de Sicile', 'head', 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=200'),
    (product_id_val, 'Iris de Florence', 'heart', 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=200'),
    (product_id_val, 'Patchouli d''Indonésie', 'base', 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=200')
    ON CONFLICT DO NOTHING;

END $$;
