-- Lecture catalogue : garantir SELECT public pour les produits actifs (et prévisualisation admin).
-- Certaines bases n’avaient que la politique admin « FOR ALL », ce qui masquait tout le catalogue anonyme.

DROP POLICY IF EXISTS "Active products are viewable by everyone." ON public.products;

CREATE POLICY "Active products are viewable by everyone." ON public.products
  FOR SELECT
  USING (
    status = 'active'
    OR public.is_admin()
  );
