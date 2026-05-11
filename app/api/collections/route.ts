import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import {
  DEV_PLACEHOLDER_SUPABASE_URL,
  isValidUrl,
  resolvePublicSupabaseKeyForServer,
} from '@/lib/supabase';
import { fetchPublishedCollectionsCompat } from '@/lib/supabase-catalog-compat';
import { pickStorefrontCollections } from '@/lib/catalog-quality';

export const runtime = 'nodejs';

/** Collections publiées pour le footer et raccourcis (cache long). */
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
    return NextResponse.json({ collections: [] }, { status: 200 });
  }

  const { data, error } = await fetchPublishedCollectionsCompat(client);

  if (error) {
    const res = NextResponse.json({ collections: [], error: error.message });
    res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120');
    return res;
  }

  const storefront = pickStorefrontCollections((data ?? []) as { slug?: string }[]);
  const res = NextResponse.json({ collections: storefront, error: null });
  res.headers.set('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=600');
  return res;
}
