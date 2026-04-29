'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    name_it?: string;
    slug: string;
    family: string;
    family_it?: string;
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

  const displayName = language === 'it' && product.name_it ? product.name_it : product.name;
  const displayFamily = language === 'it' && product.family_it ? product.family_it : product.family;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <Link href={`/produits/${product.slug}`} prefetch>
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-black/5 mb-6">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-brand-gold text-white text-[8px] uppercase tracking-widest px-3 py-1 z-10">
              {t('product.new', 'Nouveauté')}
            </span>
          )}

          <button className="absolute top-4 right-4 text-brand-black/40 hover:text-brand-gold transition-colors">
            <Heart size={18} strokeWidth={1.5} />
          </button>

          <div className="absolute inset-0 bg-brand-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <span className="luxury-button scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
              {t('product.discover', 'Découvrir')}
            </span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[9px] uppercase tracking-widest text-brand-gold mb-2 block font-sans">
            {displayFamily}
          </span>
          <h3 className="text-lg font-serif mb-2 group-hover:text-brand-gold transition-colors">
            {displayName}
          </h3>
          <p className="text-sm font-sans text-brand-black/60">
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
