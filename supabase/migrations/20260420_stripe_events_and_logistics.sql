-- Stripe webhook idempotency + logistics fields + abandoned checkouts
-- Apply via Supabase SQL editor or CLI.

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.stripe_events IS 'Ids d''événements Stripe traités (idempotence). Accès réservé au service role côté serveur.';

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_carrier TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_checkout_session_id_key
  ON public.orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  email TEXT,
  cart_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  locale TEXT DEFAULT 'fr',
  recovered BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert abandoned checkout" ON public.abandoned_checkouts;
CREATE POLICY "Anyone can insert abandoned checkout" ON public.abandoned_checkouts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read abandoned checkouts" ON public.abandoned_checkouts;
CREATE POLICY "Admins can read abandoned checkouts" ON public.abandoned_checkouts
  FOR SELECT USING (public.is_admin());
