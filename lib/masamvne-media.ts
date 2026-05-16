/** Médias vitrine & fiche produit MASAMVNE (fichiers dans /public). */

export const MASAMVNE_HERO_VIDEO = '/videos/Bianco-MASAMVNE.mp4';

export const MASAMVNE_IMAGE_HERO = '/images/masamvne/masamvne-image-une.png';

export const MASAMVNE_GALLERY: string[] = [
  MASAMVNE_IMAGE_HERO,
  '/images/masamvne/masamvne-hero-dark.png',
  '/images/masamvne/masamvne-marble.png',
  '/images/masamvne/masamvne-split-light.png',
];

export function isMasamvneSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  return s === 'masamvne' || s === 'masamune';
}

/** Lignes `product_images` pour fallbacks locaux & seeds. */
export function masamvneProductImageRows(): {
  url: string;
  is_primary: boolean;
  type: string;
  display_order: number;
}[] {
  return MASAMVNE_GALLERY.map((url, i) => ({
    url,
    is_primary: i === 0,
    type: i === 0 ? 'packshot' : 'editorial',
    display_order: i,
  }));
}
