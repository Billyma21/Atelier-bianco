/** Visuels marketing page d’accueil (fichiers dans /public). */

/** WHY en main — section storytelling uniquement. */
export const WHY_LIFESTYLE_HAND_IMAGE = '/images/why/why-lifestyle-hand.png';

/** Duo sur fond crème — colonne droite du hero d’accueil. */
export const HERO_HOME_PRODUCT_IMAGE = '/images/hero/alter-egos-duo.png';

/** Duo sur marbre — bannière collection Alter Egos. */
export const ALTER_EGOS_COLLECTION_IMAGE = '/images/collections/alter-egos-duo.png';

const LEGACY_HERO_FRAGMENTS = ['hero-why-studio', 'hero-why-lifestyle', 'why-lifestyle-2', 'unsplash.com'];
const LEGACY_COLLECTION_FRAGMENTS = ['why-packshot-hero', 'why-gallery', 'masamvne-packshot'];

/** Image colonne droite du hero (duo extraits). */
export function resolveHeroProductImage(url: string | undefined | null): string {
  const u = (url ?? '').trim();
  if (!u) return HERO_HOME_PRODUCT_IMAGE;
  const lower = u.toLowerCase();
  if (
    LEGACY_HERO_FRAGMENTS.some((f) => lower.includes(f)) ||
    lower.includes('why-lifestyle-hand') ||
    lower.includes('collections/alter-egos-duo')
  ) {
    return HERO_HOME_PRODUCT_IMAGE;
  }
  return u;
}

/** Image section storytelling (WHY en main). */
export function resolveStoryImage(url: string | undefined | null): string {
  const u = (url ?? '').trim();
  if (!u) return WHY_LIFESTYLE_HAND_IMAGE;
  const lower = u.toLowerCase();
  if (LEGACY_HERO_FRAGMENTS.some((f) => lower.includes(f))) return WHY_LIFESTYLE_HAND_IMAGE;
  if (lower.includes('alter-egos-duo') || lower.includes('collections/alter-egos')) {
    return WHY_LIFESTYLE_HAND_IMAGE;
  }
  return u;
}

/** @deprecated Utiliser resolveHeroProductImage ou resolveStoryImage. */
export function resolveHomeHeroImage(url: string | undefined | null): string {
  return resolveHeroProductImage(url);
}

export function resolveAlterEgosCollectionImage(url: string | undefined | null): string {
  const u = (url ?? '').trim();
  if (!u) return ALTER_EGOS_COLLECTION_IMAGE;
  const lower = u.toLowerCase();
  if (LEGACY_COLLECTION_FRAGMENTS.some((f) => lower.includes(f))) return ALTER_EGOS_COLLECTION_IMAGE;
  return u;
}
