'use client';

import React from 'react';
import { motion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import WishlistButton from '@/components/product/WishlistButton';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { normalizeProductSlug } from '@/lib/product-slug';
import { productDisplayFamily, productDisplayName } from '@/lib/i18n/db-locale';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    name_it?: string;
    name_en?: string;
    slug: string;
    family: string;
    family_it?: string;
    family_en?: string;
    price: number;
    image: string;
    isNew?: boolean;
    product_images?: { url: string }[];
    product_variants?: { price: number }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  
  const imgs = product.product_images as { url: string; is_primary?: boolean; type?: string }[] | undefined;
  const primaryImg =
    imgs?.find((x) => x.is_primary) ||
    imgs?.find((x) => x.type === 'packshot') ||
    imgs?.[0];
  const imageUrl =
    product.image || primaryImg?.url || 'https://picsum.photos/seed/perfume/800/1000';
  const price = product.price || product.product_variants?.[0]?.price || 0;

  const displayName = productDisplayName(language, product);
  const displayFamily =
    productDisplayFamily(language, product).trim() || product.family || t('product.family_default');

  const slugSafe = normalizeProductSlug(product.slug || '');
  const href = slugSafe ? `/produits/${slugSafe}` : '/parfums';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative mb-6 aspect-[3/4] overflow-hidden bg-brand-black/5">
        <Link
          href={href}
          prefetch
          className="absolute inset-0 z-[1] block overflow-hidden"
          aria-label={`${displayName} — ${t('product.discover', 'Découvrir')}`}
        >
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy={imageUrl.startsWith('/') ? undefined : 'no-referrer'}
            unoptimized={imageUrl.startsWith('/')}
          />

          {product.isNew && (
            <span className="absolute left-4 top-4 z-[2] bg-brand-gold px-3 py-1 text-[8px] font-sans uppercase tracking-widest text-white">
              {t('product.new', 'Nouveauté')}
            </span>
          )}

          <div className="absolute inset-0 z-[2] flex items-center justify-center bg-brand-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="luxury-button scale-90 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
              {t('product.discover', 'Découvrir')}
            </span>
          </div>
        </Link>

        <WishlistButton productId={product.id} className="absolute right-4 top-4 z-[3]" />
      </div>

      <Link href={href} prefetch className="block text-center">
        <span className="mb-2 block font-sans text-[9px] uppercase tracking-widest text-brand-gold">{displayFamily}</span>
        <h3 className="mb-2 font-serif text-lg transition-colors group-hover:text-brand-gold">{displayName}</h3>
        <p className="font-sans text-sm text-brand-black/60">{formatPrice(price)}</p>
      </Link>
    </motion.div>
  );
}
