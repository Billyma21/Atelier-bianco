-- Add image_url to olfactory_notes
ALTER TABLE olfactory_notes ADD COLUMN image_url TEXT;

-- Add some sample products if they don't exist
-- We need a perfumer first
INSERT INTO perfumers (name, bio, photo_url)
VALUES ('Elena Bianco', 'Elena Bianco est une créatrice visionnaire, formée à Grasse.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- Get the perfumer id
DO $$
DECLARE
    p_id UUID;
BEGIN
    SELECT id INTO p_id FROM perfumers LIMIT 1;

    -- Insert products
    INSERT INTO products (name, slug, short_desc, long_desc, story, perfumer_id, family, status, is_featured)
    VALUES 
    ('Mûre Iris', 'mure-iris', 'Un floral fruité poudré.', 'Une rencontre poétique entre la gourmandise sauvage de la mûre et l''élégance poudrée de l''iris.', 'Inspiré par les souvenirs d''enfance...', p_id, 'Floral', 'active', true),
    ('Bois d''Ébène', 'bois-ebene', 'Un boisé oriental mystérieux.', 'La profondeur du bois d''ébène mêlée à des notes épicées.', 'Un voyage au cœur des forêts sacrées...', p_id, 'Boisé', 'active', true),
    ('Ambre Nuit', 'ambre-nuit', 'Un ambré poudré sophistiqué.', 'L''ambre gris rencontre la rose turque dans un ballet nocturne.', 'Une nuit étoilée sur le Bosphore...', p_id, 'Oriental', 'active', true)
    ON CONFLICT (slug) DO NOTHING;

    -- Add images for products
    INSERT INTO product_images (product_id, url, position)
    SELECT id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', 0 FROM products WHERE slug = 'mure-iris'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO product_images (product_id, url, position)
    SELECT id, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1000&auto=format&fit=crop', 0 FROM products WHERE slug = 'bois-ebene'
    ON CONFLICT DO NOTHING;

    INSERT INTO product_images (product_id, url, position)
    SELECT id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', 0 FROM products WHERE slug = 'ambre-nuit'
    ON CONFLICT DO NOTHING;

    -- Add variants
    INSERT INTO product_variants (product_id, size_ml, price, stock)
    SELECT id, 100, 185, 50 FROM products WHERE slug = 'mure-iris'
    ON CONFLICT DO NOTHING;

    INSERT INTO product_variants (product_id, size_ml, price, stock)
    SELECT id, 100, 210, 30 FROM products WHERE slug = 'bois-ebene'
    ON CONFLICT DO NOTHING;

    INSERT INTO product_variants (product_id, size_ml, price, stock)
    SELECT id, 100, 195, 40 FROM products WHERE slug = 'ambre-nuit'
    ON CONFLICT DO NOTHING;

    -- Add olfactory notes with images
    INSERT INTO olfactory_notes (product_id, type, name, image_url, position)
    SELECT id, 'head', 'Mûre', 'https://cdn-icons-png.flaticon.com/512/1155/1155283.png', 0 FROM products WHERE slug = 'mure-iris'
    ON CONFLICT DO NOTHING;

    INSERT INTO olfactory_notes (product_id, type, name, image_url, position)
    SELECT id, 'heart', 'Iris', 'https://cdn-icons-png.flaticon.com/512/1047/1047461.png', 0 FROM products WHERE slug = 'mure-iris'
    ON CONFLICT DO NOTHING;

    INSERT INTO olfactory_notes (product_id, type, name, image_url, position)
    SELECT id, 'base', 'Musc', 'https://cdn-icons-png.flaticon.com/512/3050/3050222.png', 0 FROM products WHERE slug = 'mure-iris'
    ON CONFLICT DO NOTHING;

END $$;
