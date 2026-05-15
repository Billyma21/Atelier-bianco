import {
  MASAMVNE_DESCRIPTION_FR,
  MASAMVNE_DESCRIPTION_IT,
  MASAMVNE_SHORT_DESC_FR,
  MASAMVNE_SHORT_DESC_IT,
  WHY_DESCRIPTION_FR,
  WHY_DESCRIPTION_IT,
  WHY_SHORT_DESC_FR,
  WHY_SHORT_DESC_IT,
} from '@/lib/brand-copy';

/**
 * Repli vitrine accueil lorsque Supabase ne renvoie aucun produit « retail »
 * (pas de produits mis en avant, données manquantes, ou instance vide).
 */
export function getHomeShowcaseFallbackProducts(): Record<string, unknown>[] {
  return [
    {
      id: 'local-fallback-why',
      name: 'WHY',
      name_it: 'WHY',
      slug: 'why',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      status: 'active',
      is_featured: true,
      description: WHY_DESCRIPTION_FR,
      description_it: WHY_DESCRIPTION_IT,
      short_desc: WHY_SHORT_DESC_FR,
      short_desc_it: WHY_SHORT_DESC_IT,
      product_images: [
        { url: '/images/why-packshot-hero.png', is_primary: true, type: 'packshot' },
        { url: '/images/why-pyramid-editorial.png', is_primary: false, type: 'detail' },
      ],
      product_variants: [
        { price: 219, size_ml: 50, is_active: true, stock: 0 },
        { price: 319, size_ml: 100, is_active: true, stock: 0 },
      ],
    },
    {
      id: 'local-fallback-masamvne',
      name: 'MASAMVNE',
      name_it: 'MASAMVNE',
      slug: 'masamvne',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      status: 'active',
      is_featured: true,
      description: MASAMVNE_DESCRIPTION_FR,
      description_it: MASAMVNE_DESCRIPTION_IT,
      short_desc: MASAMVNE_SHORT_DESC_FR,
      short_desc_it: MASAMVNE_SHORT_DESC_IT,
      product_images: [
        { url: '/images/masamvne-packshot.png', is_primary: true, type: 'packshot' },
        { url: '/images/masamune-lifestyle.png', is_primary: false, type: 'lifestyle' },
      ],
      product_variants: [
        { price: 209, size_ml: 50, is_active: true, stock: 0 },
        { price: 299, size_ml: 100, is_active: true, stock: 0 },
      ],
    },
  ];
}
