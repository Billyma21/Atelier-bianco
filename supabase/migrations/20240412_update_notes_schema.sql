-- Add image_url to olfactory_notes
ALTER TABLE olfactory_notes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update products policy to allow admins to see everything
DROP POLICY IF EXISTS "Active products are viewable by everyone." ON products;
CREATE POLICY "Active products are viewable by everyone." ON products FOR SELECT USING (
  status = 'active' OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ensure olfactory_notes is public
ALTER TABLE olfactory_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Olfactory notes are viewable by everyone." ON olfactory_notes;
CREATE POLICY "Olfactory notes are viewable by everyone." ON olfactory_notes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage olfactory notes." ON olfactory_notes;
CREATE POLICY "Admins can manage olfactory notes." ON olfactory_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ensure product_variants is public
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product variants are viewable by everyone." ON product_variants;
CREATE POLICY "Product variants are viewable by everyone." ON product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage product variants." ON product_variants;
CREATE POLICY "Admins can manage product variants." ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
