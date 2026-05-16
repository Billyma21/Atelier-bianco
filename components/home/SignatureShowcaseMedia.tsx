'use client';

import Link from 'next/link';
import type { SignatureMediaConfig } from '@/lib/signature-product-media';

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
      className="group relative mb-8 block aspect-[3/4] w-full max-w-[22rem] shrink-0 overflow-hidden rounded-[1.5rem] bg-brand-black shadow-lg sm:max-w-md lg:max-w-none"
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
