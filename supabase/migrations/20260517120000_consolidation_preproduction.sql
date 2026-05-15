-- FIX: consolidation pré-production — newsletter, index, RLS, contraintes

-- Newsletter footer
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  language TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Admin full access newsletter" ON public.newsletter_subscribers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Perfumers unique name (seed ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'perfumers_name_unique'
  ) THEN
    ALTER TABLE public.perfumers ADD CONSTRAINT perfumers_name_unique UNIQUE (name);
  END IF;
END $$;

-- Collections slug index
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_olfactory_notes_product_id ON public.olfactory_notes (product_id);

-- wishlists RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- addresses RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin can view all addresses" ON public.addresses;
CREATE POLICY "Admin can view all addresses" ON public.addresses
  FOR SELECT USING (public.is_admin());

-- promo_codes: lecture des codes actifs pour validation checkout
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT USING (
    is_active = true AND (ends_at IS NULL OR ends_at > now())
  );

COMMENT ON TABLE public.newsletter_subscribers IS 'Abonnés newsletter (footer boutique).';
