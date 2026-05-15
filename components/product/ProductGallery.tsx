'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface ProductGalleryProps {
  images: string[];
  productName?: string;
}

const MotionImage = motion(Image);

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const safe = images.length > 0 ? images : ['/images/why-packshot-hero.png'];
  const idx = Math.min(activeIndex, Math.max(0, safe.length - 1));
  const baseAlt = productName?.trim() || t('product.gallery_main_alt');

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
        {safe.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`relative flex-shrink-0 w-20 h-24 overflow-hidden border transition-all duration-300 ${
              idx === i ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={img}
              alt={t('product.gallery_thumb_alt').replace('{n}', String(i + 1))}
              fill
              sizes="80px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-brand-black/5 group">
        <AnimatePresence mode="wait">
          <MotionImage
            key={idx}
            src={safe[idx]}
            alt={baseAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22 }}
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        <div className="absolute bottom-6 right-6 bg-brand-cream/80 backdrop-blur-sm px-4 py-2 text-[8px] uppercase tracking-widest font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('product.gallery_zoom_hint')}
        </div>
      </div>
    </div>
  );
}
