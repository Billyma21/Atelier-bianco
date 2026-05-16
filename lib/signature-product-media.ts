import {
  MASAMVNE_GALLERY,
  MASAMVNE_HERO_VIDEO,
  MASAMVNE_IMAGE_HERO,
  isMasamvneSlug,
} from '@/lib/masamvne-media';
import { WHY_GALLERY, WHY_HERO_VIDEO, WHY_IMAGE_HERO, isWhySlug } from '@/lib/why-media';

export type SignatureMediaConfig = {
  heroVideo: string;
  imageHero: string;
  gallery: string[];
  /** Fragments d’URL legacy à retirer de la galerie. */
  excludeFragments: string[];
};

const SIGNATURE_BY_KEY: Record<'why' | 'masamvne', SignatureMediaConfig> = {
  why: {
    heroVideo: WHY_HERO_VIDEO,
    imageHero: WHY_IMAGE_HERO,
    gallery: WHY_GALLERY,
    excludeFragments: [
      'why-lifestyle',
      'why-gallery-',
      'why-pyramid',
      'hero-why',
      'why-packshot-hero',
    ],
  },
  masamvne: {
    heroVideo: MASAMVNE_HERO_VIDEO,
    imageHero: MASAMVNE_IMAGE_HERO,
    gallery: MASAMVNE_GALLERY,
    excludeFragments: [
      'masamune-lifestyle',
      'masamvne-packshot',
      'masamvne-split-rose',
    ],
  },
};

export type SignatureProductKey = keyof typeof SIGNATURE_BY_KEY;

export function resolveSignatureProductKey(slug: string): SignatureProductKey | null {
  if (isWhySlug(slug)) return 'why';
  if (isMasamvneSlug(slug)) return 'masamvne';
  return null;
}

export function getSignatureMedia(slug: string): SignatureMediaConfig | null {
  const key = resolveSignatureProductKey(slug);
  return key ? SIGNATURE_BY_KEY[key] : null;
}

export function sortSignatureGalleryUrls(urls: string[], config: SignatureMediaConfig): string[] {
  const hero = config.imageHero;
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    if (!url) continue;
    const key = url.split('?')[0].trim().toLowerCase();
    if (seen.has(key)) continue;
    const legacy = config.excludeFragments.some((frag) => key.includes(frag.toLowerCase()));
    if (legacy) continue;
    seen.add(key);
    deduped.push(url);
  }

  const rest = deduped.filter(
    (u) => u !== hero && !u.toLowerCase().includes(hero.split('/').pop()!.toLowerCase())
  );
  const hasHero = deduped.some(
    (u) => u === hero || u.toLowerCase().includes(config.imageHero.split('/').pop()!.toLowerCase())
  );
  return hasHero ? [hero, ...rest] : deduped;
}
