'use client';

import Link from 'next/link';
import type { SignatureMediaConfig } from '@/lib/signature-product-media';
import {
  showcaseMediaAspectClass,
  showcaseMediaFrameClass,
  showcaseMediaWidthClass,
} from '@/lib/showcase-media-styles';

type Props = {
  href: string;
  displayName: string;
  media: SignatureMediaConfig;
};

/** Bloc média accueil : vidéo hero avec poster image. */
export default function SignatureShowcaseMedia({ href, displayName, media }: Props) {
  return (
    <Link
      href={href}
      className={`group mb-8 block shrink-0 bg-brand-black ${showcaseMediaFrameClass} ${showcaseMediaAspectClass} ${showcaseMediaWidthClass}`}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1.1s] ease-out group-hover:scale-[1.02]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={media.imageHero}
        aria-label={displayName}
      >
        <source src={media.heroVideo} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/45 via-brand-black/5 to-transparent"
        aria-hidden
      />
    </Link>
  );
}
