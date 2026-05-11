import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Body = {
  alert_type?: string;
  slug?: string;
  source_path?: string;
};

/**
 * Signalement anonyme (404 produit, etc.) pour la console admin — insertion via client Supabase anon côté serveur.
 */
export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const alertType = body.alert_type === 'product_404' ? 'product_404' : null;
  const slug = typeof body.slug === 'string' ? body.slug.trim().slice(0, 160) : '';
  const sourcePath = typeof body.source_path === 'string' ? body.source_path.trim().slice(0, 500) : null;

  if (!alertType || !slug) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const { isValidUrl, resolvePublicSupabaseKeyForServer } = await import('@/lib/supabase');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = resolvePublicSupabaseKeyForServer();

  if (!url || !isValidUrl(url) || !key) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { error } = await supabase.from('admin_site_alerts').insert({
    alert_type: alertType,
    slug,
    source_path: sourcePath,
    message: `Visite : page produit introuvable`,
    status: 'open',
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
