-- Extra migration to ensure columns and trigger schema reload
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';

-- Re-verify RLS
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Enable insert for everyone for guest checkout" ON public.orders;
CREATE POLICY "Enable insert for everyone for guest checkout" ON public.orders FOR INSERT WITH CHECK (true);

-- Dummy change to force PostgREST cache refresh in some environments
COMMENT ON TABLE public.orders IS 'Store for Atelier Bianco orders';

-- In Supabase/PostgREST, DDL usually triggers a reload.
-- If PGRST204 persists, the client fallback handles it.
