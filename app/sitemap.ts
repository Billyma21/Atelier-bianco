import type { MetadataRoute } from 'next';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

const STATIC_PATHS = [
  '',
  '/parfums',
  '/la-maison',
  '/faq',
  '/panier',
  '/checkout',
  '/suivi',
  '/mentions-legales',
  '/cgv',
  '/confidentialite',
  '/auth/login',
  '/auth/register',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = baseUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${host}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));

  const admin = tryGetSupabaseAdmin();
  if (admin) {
    const { data: products } = await admin
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'active');

    for (const p of products || []) {
      if (!p.slug) continue;
      entries.push({
        url: `${host}/produits/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  return entries;
}
