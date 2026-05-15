'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import ProductCard from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { HOME_DUAL_SUBTITLE_FR } from '@/lib/brand-copy';
import { normalizeProductSlug } from '@/lib/product-slug';
import { productCardBlurb, productDisplayFamily, productDisplayName } from '@/lib/i18n/db-locale';

type ProductShape = {
  id: string;
  name: string;
  name_it?: string;
  name_en?: string;
  slug?: string;
  family?: string;
  family_it?: string;
  family_en?: string;
  description?: string;
  description_it?: string;
  short_desc?: string;
  short_desc_it?: string;
  short_desc_en?: string;
  description_en?: string;
  isNew?: boolean;
  product_images?: { url: string; is_primary?: boolean; type?: string }[];
  product_variants?: { price: number; size_ml?: number; is_active?: boolean }[];
};

function primaryImage(p: ProductShape): string {
  const imgs = p.product_images;
  const row =
    imgs?.find((x) => x.is_primary) ||
    imgs?.find((x) => x.type === 'packshot') ||
    imgs?.[0];
  return row?.url || '/images/why-packshot-hero.png';
}

function priceRange(p: ProductShape): { min: number; max: number } {
  const v = (p.product_variants ?? []).filter((x) => x?.is_active !== false);
  const prices = v.map((x) => Number(x.price)).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

type Props = {
  products: ProductShape[];
  /** Slug URL de la collection mise en avant (ex. alter-egos) */
  collectionSlug?: string;
};

export default function HomeSelection({ products, collectionSlug = 'alter-egos' }: Props) {
  const { t, language } = useLanguage();

  if (!products.length) {
    return (
      <section className="py-32 bg-white">
        <div className="max-w-screen-lg mx-auto px-6 text-center font-serif text-brand-black/50">
          <p>{t('home.selection_empty', 'La sélection sera bientôt disponible.')}</p>
          <Link href="/parfums" className="mt-6 inline-block text-[10px] uppercase tracking-widest text-brand-gold">
            Parfums
          </Link>
        </div>
      </section>
    );
  }

  const flagship = products.length === 1 ? products[0] : null;

  /** Deux extraits : mise en page premium côte à côte */
  if (products.length === 2) {
    return (
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(201,169,110,0.06),_transparent_50%)]" />
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
          <div className="mb-14 text-center md:mb-16">
            <span className="mb-4 block text-[10px] uppercase tracking-[0.45em] text-brand-gold">
              {t('home.dual_eyebrow', 'Alter Egos')}
            </span>
            <span className="mb-3 block text-[10px] uppercase tracking-[0.35em] text-brand-black/40">
              {t('home.bestsellers_label', 'Sélection')}
            </span>
            <h2 className="font-serif text-3xl tracking-wide text-brand-black md:text-4xl lg:text-5xl">
              {t('home.dual_title', 'Les deux extraits de la collection')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-sans text-sm leading-relaxed text-brand-black/60">
              {t(
                'home.dual_subtitle',
                HOME_DUAL_SUBTITLE_FR
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {products.map((p, idx) => {
              const displayName = productDisplayName(language, p);
              const displayFamily =
                productDisplayFamily(language, p).trim() || t('product.family_default');
              const img = primaryImage(p);
              const { min, max } = priceRange(p);
              const slug = normalizeProductSlug(p.slug || '');
              const href = slug ? `/produits/${slug}` : '/parfums';
              const blurb = productCardBlurb(language, p, 300);

              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: idx * 0.08 }}
                  className="flex flex-col items-center text-center lg:items-stretch lg:text-left"
                >
                  <Link
                    href={href}
                    className="group relative mx-auto mb-8 aspect-[3/4] w-full max-w-md overflow-hidden rounded-[1.5rem] bg-brand-black/5 shadow-lg lg:mx-0 lg:max-w-none"
                  >
                    <Image
                      src={img}
                      alt={displayName}
                      fill
                      className="object-cover object-center transition-transform duration-[1.1s] ease-out group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 90vw, 42vw"
                      priority={idx === 0}
                      unoptimized={img.startsWith('/')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent opacity-90" />
                  </Link>
                  <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.35em] text-brand-gold">{displayFamily}</p>
                  <h3 className="mb-4 font-serif text-2xl text-brand-black md:text-3xl">{displayName}</h3>
                  {blurb ? (
                    <p className="mb-6 line-clamp-5 font-sans text-sm leading-relaxed text-brand-black/65">{blurb}</p>
                  ) : null}
                  <div className="mb-6 flex flex-col gap-1">
                    <span className="font-sans text-lg text-brand-black">
                      {min > 0 && max > 0
                        ? min === max
                          ? formatPrice(min)
                          : `${formatPrice(min)} — ${formatPrice(max)}`
                        : ''}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-brand-black/35">
                      {t('home.flagship_formats', '50 ml & 100 ml · Made in Italy')}
                    </span>
                  </div>
                  <Link href={href} className="luxury-button inline-flex justify-center px-8 py-3.5 text-center">
                    {t('product.discover', 'Découvrir')}
                  </Link>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <Link
              href={`/parfums?collection=${encodeURIComponent(collectionSlug)}`}
              className="text-[10px] uppercase tracking-[0.25em] text-brand-black/45 underline-offset-4 transition-colors hover:text-brand-gold"
            >
              {t('home.flagship_collection_link', 'Voir la collection')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (flagship) {
    const displayName = productDisplayName(language, flagship);
    const displayFamily =
      productDisplayFamily(language, flagship).trim() || t('product.family_default');
    const img = primaryImage(flagship);
    const { min, max } = priceRange(flagship);
    const slug = normalizeProductSlug(flagship.slug || '');
    const href = slug ? `/produits/${slug}` : '/parfums';
    const blurbDb = productCardBlurb(language, flagship, 900);
    const blurb =
      blurbDb.trim() ||
      t('home.flagship_why_blurb', 'La sélection phare sera bientôt détaillée ici.');

    return (
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,169,110,0.08),_transparent_55%)]" />
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
          <div className="mb-14 text-center md:mb-16">
            <span className="mb-4 block text-[10px] uppercase tracking-[0.45em] text-brand-gold">
              {t('home.flagship_eyebrow', "L'Élégance intemporelle")}
            </span>
            <span className="mb-3 block text-[10px] uppercase tracking-[0.35em] text-brand-black/40">
              {t('home.bestsellers_label', 'Sélection')}
            </span>
            <h2 className="font-serif text-4xl tracking-wide text-brand-black md:text-5xl">
              {t('home.flagship_title', 'WHY')}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85 }}
            className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20"
          >
            <Link
              href={href}
              className="group relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-brand-black/5 shadow-xl lg:mx-0 lg:max-w-none"
            >
              <Image
                src={img}
                alt={displayName}
                fill
                className="object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 90vw, 45vw"
                priority
                unoptimized={img.startsWith('/')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/35 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            </Link>

            <div className="text-center lg:text-left">
              <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.35em] text-brand-gold">{displayFamily}</p>
              <h3 className="mb-6 font-serif text-3xl text-brand-black md:text-4xl">{displayName}</h3>
              <p className="mx-auto mb-10 max-w-md font-sans text-base leading-relaxed text-brand-black/70 lg:mx-0">
                {blurb}
              </p>
              <div className="mb-10 flex flex-col items-center gap-2 lg:items-start">
                <span className="font-sans text-lg text-brand-black">
                  {min > 0 && max > 0
                    ? min === max
                      ? formatPrice(min)
                      : `${formatPrice(min)} — ${formatPrice(max)}`
                    : ''}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-black/35">
                  {t('home.flagship_formats', '50 ml & 100 ml · Made in Italy')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href={href} className="luxury-button inline-flex min-w-[200px] justify-center px-10 py-4 text-center">
                  {t('product.discover', 'Découvrir')}
                </Link>
                <Link
                  href={`/parfums?collection=${encodeURIComponent(collectionSlug)}`}
                  className="text-[10px] uppercase tracking-[0.25em] text-brand-black/50 underline-offset-4 transition-colors hover:text-brand-gold"
                >
                  {t('home.flagship_collection_link', 'Voir la collection')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12">
        <div className="mb-16 flex flex-col items-end gap-8 md:flex-row md:justify-between">
          <div>
            <span className="mb-6 block text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              {t('home.bestsellers_label', 'Sélection')}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl">{t('home.bestsellers_title', 'Les Incontournables')}</h2>
          </div>
          <Link
            href="/parfums"
            className="text-[10px] uppercase tracking-widest font-sans border-b border-brand-black/20 pb-2 hover:border-brand-gold hover:text-brand-gold transition-all"
          >
            {t('home.bestsellers_cta', 'Voir tout le catalogue')}
          </Link>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 sm:grid-cols-2">
          {products.map((product) => {
            const variants = product.product_variants ?? [];
            const v0 = variants.find((x) => x.is_active !== false) ?? variants[0];
            return (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  slug: product.slug ?? '',
                  family: product.family ?? '',
                  price: Number(v0?.price ?? 0),
                  image: primaryImage(product),
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
