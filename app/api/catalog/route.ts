import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import {
  DEV_PLACEHOLDER_SUPABASE_URL,
  isValidUrl,
  resolvePublicSupabaseKeyForServer,
} from '@/lib/supabase';
import { fetchActiveProductsCatalog, fetchPublishedCollectionsCompat } from '@/lib/supabase-catalog-compat';

export const runtime = 'nodejs';

/**
 * Catalogue public : lecture côté serveur (souvent plus fiable que le navigateur → Supabase)
 * et mise en cache CDN / Next pour des navigations plus fluides.
 */
export async function GET() {
  const admin = tryGetSupabaseAdmin();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicKey = resolvePublicSupabaseKeyForServer();

  const client =
    admin ||
    (url &&
    isValidUrl(url) &&
    url !== DEV_PLACEHOLDER_SUPABASE_URL &&
    publicKey
      ? createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } })
      : null);

  if (!client) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message:
          'Variables Supabase manquantes ou invalides. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ou SUPABASE_SERVICE_ROLE_KEY pour la lecture catalogue côté serveur.',
        products: [],
      },
      { status: 503 }
    );
  }

  const [{ data: products, error: pErr }, { data: collections, error: cErr }] = await Promise.all([
    fetchActiveProductsCatalog(client),
    fetchPublishedCollectionsCompat(client),
  ]);

  if (pErr) {
    return NextResponse.json(
      { error: 'fetch_failed', message: pErr.message, code: pErr.code, products: [], collections: [] },
      { status: 502 }
    );
  }

  const cols = collections ?? [];
  if (cErr) {
    return NextResponse.json(
      {
        error: 'fetch_failed',
        message: cErr.message,
        code: cErr.code,
        products: products ?? [],
        collections: [],
      },
      { status: 502 }
    );
  }

  const res = NextResponse.json({ products: products ?? [], collections: cols, error: null });
  res.headers.set(
    'Cache-Control',
    'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
  );
  return res;
}
