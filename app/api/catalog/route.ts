import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import {
  DEV_PLACEHOLDER_SUPABASE_URL,
  isValidUrl,
  resolvePublicSupabaseKeyForServer,
} from '@/lib/supabase';
import { fetchActiveProductsCatalog, fetchPublishedCollectionsCompat } from '@/lib/supabase-catalog-compat';
import {
  filterRetailProducts,
  pickStorefrontCollections,
  sortSignatureShowcaseProducts,
} from '@/lib/catalog-quality';
import { retailCatalogOrFallback } from '@/lib/catalog-api-fallback';

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

  const colsRaw = collections ?? [];
  const retailFiltered = sortSignatureShowcaseProducts(filterRetailProducts(products ?? []));
  const storefrontProducts = retailCatalogOrFallback(retailFiltered, colsRaw as { id: string; slug?: string; name?: string; name_it?: string | null; sort_order?: number | null }[]);

  if (cErr) {
    /** Produits OK mais collections en échec : ne pas bloquer tout le catalogue (onglets vides = « Toutes les créations » uniquement). */
    const res = NextResponse.json({
      products: storefrontProducts,
      collections: [],
      error: null,
      warning: `collections_unavailable:${cErr.message}`,
    });
    res.headers.set(
      'Cache-Control',
      'public, max-age=15, s-maxage=30, stale-while-revalidate=120'
    );
    return res;
  }

  const storefrontCols = pickStorefrontCollections(colsRaw as { slug?: string }[]);

  const res = NextResponse.json({
    products: storefrontProducts,
    collections: storefrontCols,
    error: null,
  });
  res.headers.set(
    'Cache-Control',
    'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
  );
  return res;
}
