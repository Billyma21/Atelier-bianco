/** Médias vitrine & fiche produit WHY (fichiers dans /public). */

export const WHY_HERO_VIDEO = '/videos/video-why.mp4';

export const WHY_IMAGE_HERO = '/images/why/why-image-une.png';

export const WHY_GALLERY: string[] = [
  WHY_IMAGE_HERO,
  '/images/why/why-hero-dark.png',
  '/images/why/why-split-light.png',
];

export function isWhySlug(slug: string): boolean {
  return slug.trim().toLowerCase() === 'why';
}

export function whyProductImageRows(): {
  url: string;
  is_primary: boolean;
  type: string;
  display_order: number;
}[] {
  return WHY_GALLERY.map((url, i) => ({
    url,
    is_primary: i === 0,
    type: i === 0 ? 'packshot' : 'editorial',
    display_order: i,
  }));
}
