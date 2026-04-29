-- Seed initial products for Atelier Bianco
INSERT INTO products (name, slug, family, description, long_description, story, ingredients, status)
VALUES 
('Mûre Iris', 'mure-iris', 'Floral', 'Une rencontre poétique entre la gourmandise sauvage de la mûre et l''élégance poudrée de l''iris de Florence.', 'Mûre Iris est une fragrance de contrastes, où la fraîcheur acidulée des baies sauvages rencontre la sophistication veloutée de l''iris.', 'Inspiré par les souvenirs d''enfance de notre parfumeur dans les collines de Toscane.', 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Benzyl Salicylate.', 'active'),
('Ambre Nuit', 'ambre-nuit', 'Oriental', 'Un ambre mystérieux et enveloppant, sublimé par des notes de rose turque et de poivre rose.', 'Ambre Nuit est une invitation au voyage au cœur de l''Orient, une fragrance chaude et sensuelle.', 'Une nuit étoilée dans le désert, où les effluves d''encens se mêlent à la douceur du sable chaud.', 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Coumarin, Linalool, Limonene.', 'active'),
('Bois d''Ébène', 'bois-ebene', 'Boisé', 'La force brute du bois d''ébène mariée à la douceur du bois de santal et à la fraîcheur de la bergamote.', 'Un parfum de caractère, boisé et profond, qui évoque la noblesse des bois précieux.', 'L''atelier d''un ébéniste, où les copeaux de bois libèrent leur parfum boisé et fumé.', 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral.', 'active'),
('Cuir Sacré', 'cuir-sacre', 'Cuiré', 'Un cuir noble et sophistiqué, réchauffé par des notes de safran et de bois de gaïac.', 'Cuir Sacré est une fragrance audacieuse qui capture l''essence du cuir tanné à l''ancienne.', 'Une bibliothèque ancienne, où l''odeur des vieux livres se mêle à celle des fauteuils en cuir.', 'Alcohol Denat, Parfum (Fragrance), Aqua (Water), Benzyl Benzoate, Eugenol.', 'active');

-- Seed variants
INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 100, 185, 50 FROM products WHERE slug = 'mure-iris';
INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 50, 125, 30 FROM products WHERE slug = 'mure-iris';
INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 2, 15, 100 FROM products WHERE slug = 'mure-iris';

INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 100, 195, 40 FROM products WHERE slug = 'ambre-nuit';
INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 100, 210, 35 FROM products WHERE slug = 'bois-ebene';
INSERT INTO product_variants (product_id, size_ml, price, stock_quantity)
SELECT id, 100, 225, 25 FROM products WHERE slug = 'cuir-sacre';

-- Seed images
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', true FROM products WHERE slug = 'mure-iris';
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', true FROM products WHERE slug = 'ambre-nuit';
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop', true FROM products WHERE slug = 'bois-ebene';
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop', true FROM products WHERE slug = 'cuir-sacre';
