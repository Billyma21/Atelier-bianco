-- RLS : harmonisation idempotente (Supabase Advisor, FOR ALL avec WITH CHECK, search_path sur is_admin).
-- À appliquer sur le projet distant si le schéma a été créé sans toutes les migrations.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Catalogue & contenu (lecture publique + admin)
-- ---------------------------------------------------------------------------
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olfactory_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view collections" ON public.collections;
DROP POLICY IF EXISTS "Admin full access to collections" ON public.collections;
CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admin full access to collections" ON public.collections
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view perfumers" ON public.perfumers;
DROP POLICY IF EXISTS "Admin full access to perfumers" ON public.perfumers;
CREATE POLICY "Anyone can view perfumers" ON public.perfumers FOR SELECT USING (true);
CREATE POLICY "Admin full access to perfumers" ON public.perfumers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view product_collections" ON public.product_collections;
DROP POLICY IF EXISTS "Admin full access to product_collections" ON public.product_collections;
CREATE POLICY "Anyone can view product_collections" ON public.product_collections FOR SELECT USING (true);
CREATE POLICY "Admin full access to product_collections" ON public.product_collections
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admin full access to product_images" ON public.product_images;
CREATE POLICY "Anyone can view product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin full access to product_images" ON public.product_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin full access to product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants are viewable by everyone." ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage product variants." ON public.product_variants;
CREATE POLICY "Anyone can view product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admin full access to product_variants" ON public.product_variants
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view olfactory_notes" ON public.olfactory_notes;
DROP POLICY IF EXISTS "Admin full access to olfactory_notes" ON public.olfactory_notes;
DROP POLICY IF EXISTS "Olfactory notes are viewable by everyone." ON public.olfactory_notes;
DROP POLICY IF EXISTS "Admins can manage olfactory notes." ON public.olfactory_notes;
CREATE POLICY "Anyone can view olfactory_notes" ON public.olfactory_notes FOR SELECT USING (true);
CREATE POLICY "Admin full access to olfactory_notes" ON public.olfactory_notes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin full access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON public.site_settings;
DROP POLICY IF EXISTS "Admins can view all settings." ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings." ON public.site_settings;
CREATE POLICY "Anyone can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to site_settings" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view promo_codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admin full access to promo_codes" ON public.promo_codes;
CREATE POLICY "Admin full access to promo_codes" ON public.promo_codes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Produits (admin FOR ALL avec WITH CHECK)
-- ---------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to products." ON public.products;
CREATE POLICY "Admins have full access to products." ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Commandes & lignes (comportement invité conservé pour /confirmation)
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public insert for orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for everyone for guest checkout" ON public.orders;
CREATE POLICY "Allow public insert for orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders." ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Allow public insert for order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order_items" ON public.order_items;
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
    OR public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Avis, FAQ, traductions, alertes stock
-- ---------------------------------------------------------------------------
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
  FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
CREATE POLICY "Anyone can view FAQs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admins can manage FAQs" ON public.faqs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view translations" ON public.translations;
DROP POLICY IF EXISTS "Admins can manage translations" ON public.translations;
CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins can manage translations" ON public.translations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert to stock_notifications" ON public.stock_notifications;
DROP POLICY IF EXISTS "Allow admin full access to stock_notifications" ON public.stock_notifications;
CREATE POLICY "Allow public insert to stock_notifications" ON public.stock_notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access to stock_notifications" ON public.stock_notifications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMENT ON FUNCTION public.is_admin() IS 'RLS : rôle admin (profiles.role = admin), search_path figé.';
