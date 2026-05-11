import { normalizeProductSlug } from '@/lib/product-slug';

/** Chaînes typiques de brouillon / tests admin à ne jamais afficher en vitrine. */
const JUNK_SLUGS = new Set(['test', 'demo', 'slug', 'temp', 'brouillon']);
const JUNK_NAME_TOKEN = /^(test|demo|tbd|xxx|temp|brouillon)$/i;
const JUNK_SUBSTR = ['agezagfeafeazd'];

function nameLooksLikeDraft(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (n.length < 2) return true;
  if (JUNK_NAME_TOKEN.test(n)) return true;
  if (JUNK_SUBSTR.some((s) => n.includes(s))) return true;
  return false;
}

/** Produit affichable boutique : actif, slug valide, nom sérieux, au moins un tarif &gt; 0. */
export function isRetailReadyProduct(p: Record<string, unknown> | null | undefined): boolean {
  if (!p || p.status !== 'active') return false;
  const slug = normalizeProductSlug(String(p.slug ?? ''));
  if (slug.length < 2 || JUNK_SLUGS.has(slug)) return false;
  const name = String(p.name ?? '').trim();
  if (nameLooksLikeDraft(name)) return false;

  const variants = p.product_variants as
    | { price?: number | string; is_active?: boolean }[]
    | undefined;
  const activePrices = (variants ?? [])
    .filter((v) => v?.is_active !== false)
    .map((v) => Number(v?.price ?? NaN))
    .filter((x) => Number.isFinite(x) && x > 0);

  const fallbackPrice = Number((p as { price?: number }).price ?? 0);
  const minPrice =
    activePrices.length > 0 ? Math.min(...activePrices) : Number.isFinite(fallbackPrice) ? fallbackPrice : 0;

  if (!Number.isFinite(minPrice) || minPrice <= 0) return false;

  return true;
}

export function filterRetailProducts<T extends Record<string, unknown>>(products: T[]): T[] {
  return products.filter((p) => isRetailReadyProduct(p));
}

/** Collection vitrine : Alter Egos (slug alter-egos), puis anciens slugs le-shirance / signature. */
export function pickStorefrontCollections<T extends { slug?: string }>(collections: T[]): T[] {
  if (!collections?.length) return [];
  const alter = collections.find((c) => c.slug === 'alter-egos');
  if (alter) return [alter];
  const shirance = collections.find((c) => c.slug === 'le-shirance');
  if (shirance) return [shirance];
  const sig = collections.find((c) => c.slug === 'signature');
  if (sig) return [sig];
  return [collections[0]];
}

const SHOWCASE_SLUG_ORDER = ['why', 'masamvne', 'masamune'];

/** Ordre vitrine : WHY puis MASAMVNE (slug masamvne), alias URL masamune en dernier. */
export function sortSignatureShowcaseProducts<T extends { slug?: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const sa = normalizeProductSlug(String(a.slug ?? ''));
    const sb = normalizeProductSlug(String(b.slug ?? ''));
    const ia = SHOWCASE_SLUG_ORDER.indexOf(sa);
    const ib = SHOWCASE_SLUG_ORDER.indexOf(sb);
    const pa = ia === -1 ? 999 : ia;
    const pb = ib === -1 ? 999 : ib;
    if (pa !== pb) return pa - pb;
    return sa.localeCompare(sb);
  });
}

export function sortWhyFirst<T extends { slug?: string }>(products: T[]): T[] {
  return sortSignatureShowcaseProducts(products);
}
