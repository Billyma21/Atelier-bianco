-- Alertes opérationnelles (ex. fiche produit introuvable côté client) visibles uniquement par les admins.

CREATE TABLE IF NOT EXISTS public.admin_site_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL DEFAULT 'product_404',
  slug TEXT NOT NULL,
  source_path TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_site_alerts_created ON public.admin_site_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_site_alerts_status ON public.admin_site_alerts (status);

ALTER TABLE public.admin_site_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can report site issues" ON public.admin_site_alerts;
CREATE POLICY "Public can report site issues" ON public.admin_site_alerts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    alert_type = 'product_404'
    AND length(trim(slug)) BETWEEN 1 AND 160
  );

DROP POLICY IF EXISTS "Admins manage site alerts" ON public.admin_site_alerts;
CREATE POLICY "Admins manage site alerts" ON public.admin_site_alerts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
