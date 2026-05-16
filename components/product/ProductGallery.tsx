'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import {
  getSignatureMedia,
  sortSignatureGalleryUrls,
} from '@/lib/signature-product-media';
import { WHY_IMAGE_HERO } from '@/lib/why-media';

type GallerySlide =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string; poster: string };

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  productSlug?: string;
  heroVideo?: string;
  videoPoster?: string;
}

const MotionImage = motion(Image);

function normalizeGalleryUrl(url: string): string {
  return url.split('?')[0].trim().toLowerCase();
}

function dedupeGalleryUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    if (!url) return false;
    const key = normalizeGalleryUrl(url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function ProductGallery({
  images,
  productName,
  productSlug,
  heroVideo,
  videoPoster,
}: ProductGalleryProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo((): GallerySlide[] => {
    const signature = productSlug ? getSignatureMedia(productSlug) : null;

    let urls = images.length > 0 ? images : signature?.gallery ?? [];
    if (signature && images.length === 0) {
      urls = signature.gallery;
    }
    if (signature) {
      urls = sortSignatureGalleryUrls(urls, signature);
    } else {
      urls = dedupeGalleryUrls(urls);
    }

    const videoSrc = heroVideo ?? signature?.heroVideo;
    const poster = videoPoster ?? signature?.imageHero ?? WHY_IMAGE_HERO;

    if (videoSrc) {
      const posterKey = normalizeGalleryUrl(poster);
      urls = urls.filter((u) => normalizeGalleryUrl(u) !== posterKey);
    }

    const list: GallerySlide[] = [];
    if (videoSrc) {
      list.push({ kind: 'video', url: videoSrc, poster });
    }
    for (const url of urls) {
      if (url) list.push({ kind: 'image', url });
    }
    if (list.length === 0) {
      list.push({ kind: 'image', url: WHY_IMAGE_HERO });
    }
    return list;
  }, [images, heroVideo, videoPoster, productSlug]);

  const idx = Math.min(activeIndex, Math.max(0, slides.length - 1));
  const active = slides[idx];
  const baseAlt = productName?.trim() || t('product.gallery_main_alt');

  return (
    <div className="flex flex-col-reverse gap-4 sm:gap-6 md:flex-row">
      <div className="flex gap-4 overflow-x-auto no-scrollbar md:flex-col">
        {slides.map((slide, i) => (
          <button
            key={`${slide.kind}-${slide.url}-${i}`}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`relative h-24 w-20 flex-shrink-0 overflow-hidden border transition-all duration-300 ${
              idx === i ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            {slide.kind === 'video' ? (
              <>
                <Image
                  src={slide.poster}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute inset-0 flex items-center justify-center bg-brand-black/25 text-[8px] font-bold uppercase tracking-widest text-white">
                  Vid
                </span>
              </>
            ) : (
              <Image
                src={slide.url}
                alt={t('product.gallery_thumb_alt').replace('{n}', String(i + 1))}
                fill
                sizes="80px"
                className="object-cover"
                referrerPolicy={slide.url.startsWith('/') ? undefined : 'no-referrer'}
                unoptimized={slide.url.startsWith('/')}
              />
            )}
          </button>
        ))}
      </div>

      <div className="group relative aspect-[3/4] min-h-[280px] flex-1 overflow-hidden rounded-[1.5rem] bg-brand-black/5 sm:min-h-[360px] md:min-h-0">
        <AnimatePresence mode="wait">
          {active.kind === 'video' ? (
            <motion.video
              key={`video-${active.url}`}
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              controls
              poster={active.poster}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <source src={active.url} type="video/mp4" />
            </motion.video>
          ) : (
            <MotionImage
              key={active.url}
              src={active.url}
              alt={baseAlt}
              fill
              priority={idx === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.22 }}
              className="object-cover"
              referrerPolicy={active.url.startsWith('/') ? undefined : 'no-referrer'}
              unoptimized={active.url.startsWith('/')}
            />
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-6 right-6 bg-brand-cream/80 px-4 py-2 text-[8px] font-sans uppercase tracking-widest opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          {active.kind === 'video'
            ? t('product.gallery_video_hint', 'Lecture automatique')
            : t('product.gallery_zoom_hint')}
        </div>
      </div>
    </div>
  );
}
