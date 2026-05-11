import { sortSignatureShowcaseProducts } from '@/lib/catalog-quality';
import { getHomeShowcaseFallbackProducts } from '@/lib/home-showcase-fallback';

type CollectionRow = {
  id: string;
  slug?: string;
  name?: string;
  name_it?: string | null;
  sort_order?: number | null;
};

/**
 * Si aucun produit ne passe le filtre vitrine après lecture Supabase, on réutilise
 * le même repli que l’accueil (`getHomeShowcaseFallbackProducts`), en liant les fiches
 * à la collection « alter-egos » quand elle existe en base — ainsi /parfums et les
 * filtres par collection restent cohérents avec la page d’accueil.
 */
export function retailCatalogOrFallback(
  retailProducts: Record<string, unknown>[],
  colsRaw: CollectionRow[]
): Record<string, unknown>[] {
  if (retailProducts.length > 0) return retailProducts;

  const alter = colsRaw.find((c) => c.slug === 'alter-egos');
  const target = alter ?? colsRaw[0];
  const base = getHomeShowcaseFallbackProducts();

  if (!target?.id) {
    return sortSignatureShowcaseProducts(base);
  }

  const withLinks = base.map((p) => ({
    ...p,
    product_collections: [
      {
        collection_id: target.id,
        collections: {
          id: target.id,
          slug: target.slug,
          name: target.name,
          name_it: target.name_it ?? null,
          sort_order: target.sort_order ?? null,
        },
      },
    ],
  }));

  return sortSignatureShowcaseProducts(
    withLinks as { slug?: string; product_collections?: unknown[] }[]
  ) as Record<string, unknown>[];
}
