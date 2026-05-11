'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type FeaturedCollectionData = {
  name: string;
  name_it?: string | null;
  slug: string;
  description?: string | null;
  image_url: string;
};

type Props = {
  collection: FeaturedCollectionData;
};

export default function FeaturedCollection({ collection }: Props) {
  const { t, language } = useLanguage();
  const title =
    language === 'it' && collection.name_it?.trim()
      ? collection.name_it
      : collection.name;
  const href = `/parfums?collection=${encodeURIComponent(collection.slug)}`;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-brand-cream">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block">
            {t('home.featured_collection_label', 'Collection')}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-black">
            {t('home.featured_collection_title', 'Notre univers olfactif')}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] border border-brand-black/10 bg-brand-black shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] min-h-[420px] lg:min-h-[520px]">
            <Link
              href={href}
              className="relative block min-h-[320px] lg:min-h-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
            >
              <Image
                src={collection.image_url}
                alt={title}
                fill
                className="object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                unoptimized={collection.image_url.startsWith('/')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-brand-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-brand-black/15 lg:to-brand-black/45 pointer-events-none" />
            </Link>

            <div className="flex flex-col justify-center px-8 py-12 md:px-14 md:py-16 text-brand-cream">
              <p className="text-[10px] uppercase tracking-[0.35em] text-brand-gold/90 mb-4">
                Atelier Bianco — Extrait de Parfum
              </p>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] leading-tight mb-6 tracking-wide">
                {title}
              </h3>
              <p className="font-sans text-sm md:text-base leading-relaxed text-brand-cream/80 max-w-md mb-10">
                {collection.description?.trim() ||
                  t(
                    'home.featured_collection_fallback_desc',
                    'Alter Egos réunit deux extraits — WHY et MASAMVNE — concentration maximale, fabrication italienne, esthétique minimaliste.'
                  )}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={href}
                  className="inline-flex items-center gap-3 rounded-full border border-brand-cream/25 bg-brand-cream/10 px-8 py-4 text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-brand-cream transition-colors hover:bg-brand-gold hover:border-brand-gold hover:text-brand-black"
                >
                  {t('home.featured_collection_cta', 'Découvrir la collection')}
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Link
                    href="/produits/why"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-brand-cream/70 border-b border-brand-cream/25 pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors"
                  >
                    WHY — fiche produit
                  </Link>
                  <Link
                    href="/produits/masamvne"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-brand-cream/70 border-b border-brand-cream/25 pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors"
                  >
                    MASAMVNE — fiche produit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
