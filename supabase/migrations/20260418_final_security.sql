-- Final Security & Reliability Patch for Atelier Bianco

-- 1. Enable RLS on all remaining tables
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olfactory_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access
CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Anyone can view perfumers" ON public.perfumers FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_collections" ON public.product_collections FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can view olfactory_notes" ON public.olfactory_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can view site_settings" ON public.site_settings FOR SELECT USING (true);

-- 3. Admin Full Access (Global Helper check - using profile role)
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Admin Policies
CREATE POLICY "Admin full access to collections" ON public.collections FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to perfumers" ON public.perfumers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to product_collections" ON public.product_collections FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to product_images" ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to product_variants" ON public.product_variants FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to olfactory_notes" ON public.olfactory_notes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to site_settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to promo_codes" ON public.promo_codes FOR ALL USING (public.is_admin());

-- 4. Special Case: Order Items (Read only if you own the order OR are admin)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order_items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR public.is_admin()
);
-- Allow public insert for checkout (handled by transactions or fallback code)
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 5. Seed initial home_content if not exists
INSERT INTO public.site_settings (key, value)
VALUES ('home_content', '{
  "hero_title": "Une Maison de Haute Parfumerie",
  "hero_subtitle": "L''Art de l''Olfaction",
  "hero_image": "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop",
  "story_title": "Une Maison de Haute Parfumerie",
  "story_text": "Atelier Bianco est né d''une volonté de revenir à l''essence même du parfum. Nos créations sont le fruit d''une quête incessante de pureté et d''émotion, où chaque note raconte une histoire, chaque sillage évoque un souvenir.",
  "promo_banner": "Livraison offerte dès 150€ d''achat • 2 échantillons offerts pour toute commande • Atelier Bianco"
}')
ON CONFLICT (key) DO NOTHING;
