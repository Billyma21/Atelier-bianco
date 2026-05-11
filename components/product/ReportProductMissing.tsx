'use client';

import { useEffect, useRef } from 'react';

/** Une fois par affichage : signale une fiche produit introuvable pour la console admin (table admin_site_alerts). */
export function ReportProductMissing({ slug }: { slug: string }) {
  const done = useRef(false);

  useEffect(() => {
    if (!slug || done.current) return;
    done.current = true;
    void fetch('/api/report-site-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert_type: 'product_404',
        slug,
        source_path:
          typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '',
      }),
    }).catch(() => {});
  }, [slug]);

  return null;
}
