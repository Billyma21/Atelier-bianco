-- Add phone and payment_method to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';

-- Ensure ALL admins can manage orders
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow anonymous inserts for checkout (guests)
CREATE POLICY "Enable insert for everyone for guest checkout" ON public.orders FOR INSERT WITH CHECK (true);
