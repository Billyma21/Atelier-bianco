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
      family_it: 'Extrait de Parfum',
      status: 'active',
      is_featured: true,
      description:
        'Un extrait où le mystère rencontre la précision : caramel, safran, pêche et fruits rouges ; cœur épicé-floral ; fond boisé, vanille, musc et benjoin. Symbole ¿? gravé sur le flacon.',
      short_desc: 'Extrait de parfum — pyramide complète · Made in Italy.',
      product_images: [
        { url: '/images/why-packshot-hero.png', is_primary: true, type: 'packshot' },
        { url: '/images/why-pyramid-editorial.png', is_primary: false, type: 'detail' },
      ],
      product_variants: [
        { price: 219, size_ml: 50, is_active: true },
        { price: 319, size_ml: 100, is_active: true },
      ],
    },
    {
      id: 'local-fallback-masamvne',
      name: 'MASAMVNE',
      name_it: 'MASAMVNE',
      slug: 'masamvne',
      family: 'Extrait de Parfum',
      family_it: 'Extrait de Parfum',
      status: 'active',
      is_featured: true,
      description:
        'Framboise et noix de coco en tête, cœur caramel–sucre roux–vanille, fond rose et musc. Une ligne précise, inspirée de l’estampe et du katana.',
      short_desc: 'Extrait de parfum — fabrication italienne.',
      product_images: [
        { url: '/images/masamvne-packshot.png', is_primary: true, type: 'packshot' },
        { url: '/images/masamune-lifestyle.png', is_primary: false, type: 'lifestyle' },
      ],
      product_variants: [
        { price: 209, size_ml: 50, is_active: true },
        { price: 299, size_ml: 100, is_active: true },
      ],
    },
  ];
}
