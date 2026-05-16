'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FAQSection from '@/components/home/FAQSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import HomeSelection from '@/components/home/HomeSelection';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_HERO_SECONDARY_IMAGE } from '@/lib/hero-content';
import {
  ALTER_EGOS_COLLECTION_IMAGE,
  resolveAlterEgosCollectionImage,
  resolveStoryImage,
} from '@/lib/home-marketing-images';
import {
  showcaseMediaAspectClass,
  showcaseMediaFrameClass,
} from '@/lib/showcase-media-styles';
import {
  filterRetailProducts,
  isRetailReadyProduct,
  pickStorefrontCollections,
  sortSignatureShowcaseProducts,
} from '@/lib/catalog-quality';
import { getHomeShowcaseFallbackProducts } from '@/lib/home-showcase-fallback';

const FALLBACK_FEATURED_COLLECTION = {
  name: 'Alter Egos',
  name_it: 'Alter Egos',
  slug: 'alter-egos',
  image_url: ALTER_EGOS_COLLECTION_IMAGE,
};

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [homeContent, setHomeContent] = useState<any>(null);
  const [activeCollections, setActiveCollections] = useState<any[]>([]);
  const { t, language } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      let bestList: any[] = [];
      try {
        const { data: featuredRows } = await supabase
          .from('products')
          .select('*, product_images(*), product_variants(*)')
          .eq('status', 'active')
          .eq('is_featured', true)
          .limit(24);
        bestList = sortSignatureShowcaseProducts(
          filterRetailProducts((featuredRows ?? []) as Record<string, unknown>[])
        );

        if (bestList.length === 0) {
          const { data: duo } = await supabase
            .from('products')
            .select('*, product_images(*), product_variants(*)')
            .eq('status', 'active')
            .in('slug', ['why', 'masamvne', 'masamune']);
          bestList = sortSignatureShowcaseProducts(
            filterRetailProducts((duo ?? []) as Record<string, unknown>[])
          );
        }
        if (bestList.length === 0) {
          const { data: whyOnly } = await supabase
            .from('products')
            .select('*, product_images(*), product_variants(*)')
            .eq('status', 'active')
            .eq('slug', 'why')
            .maybeSingle();
          if (whyOnly && isRetailReadyProduct(whyOnly as Record<string, unknown>)) {
            bestList = [whyOnly];
          }
        }
        if (bestList.length === 0) {
          const { data: pool } = await supabase
            .from('products')
            .select('*, product_images(*), product_variants(*)')
            .eq('status', 'active')
            .limit(40);
          bestList = sortSignatureShowcaseProducts(
            filterRetailProducts((pool ?? []) as Record<string, unknown>[])
          ).slice(0, 6);
        }
      } catch (e) {
        console.error('Home showcase fetch:', e);
      }

      if (bestList.length === 0) {
        bestList = getHomeShowcaseFallbackProducts() as any[];
      }

      setBestSellers(bestList.slice(0, 6));

      try {
        const { data: hData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'home_content')
          .single();
        if (hData) setHomeContent(hData.value);

        const cRes = await supabase
          .from('collections')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true })
          .limit(12);
        if (cRes.data) setActiveCollections(pickStorefrontCollections(cRes.data));
        else if (!cRes.error) setActiveCollections([]);
        else {
          const c2 = await supabase.from('collections').select('*').order('name', { ascending: true }).limit(12);
          if (c2.data) setActiveCollections(pickStorefrontCollections(c2.data));
        }
      } catch (e) {
        console.error('Home settings/collections:', e);
      }
    };
    fetchData();
  }, [supabase]);

  const featuredCollection = useMemo(() => {
    const row = activeCollections[0];
    if (!row) return FALLBACK_FEATURED_COLLECTION;
    return {
      ...FALLBACK_FEATURED_COLLECTION,
      ...row,
      image_url: resolveAlterEgosCollectionImage(row.image_url || FALLBACK_FEATURED_COLLECTION.image_url),
    };
  }, [activeCollections]);

  const storyImageSrc = resolveStoryImage(
    (typeof homeContent?.hero_image === 'string' && homeContent.hero_image.trim()) ||
      DEFAULT_HERO_SECONDARY_IMAGE
  );

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Cinematic Hero */}
      <Hero content={homeContent} />

      {/* Promo Banner */}
      <div className="bg-brand-black text-brand-cream py-3 overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee space-x-12">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[10px] uppercase tracking-[0.3em] font-sans">
              {language === 'it'
                ? homeContent?.promo_banner_it?.trim() || t('home.promo_banner')
                : homeContent?.promo_banner?.trim() || t('home.promo_banner')}
            </span>
          ))}
        </div>
      </div>

      {/* Storytelling Section */}
      <section className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 sm:py-28 lg:px-12 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-8 block">{t('home.story_label', "L'Art de l'Olfaction")}</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-tight">
              {(language === 'it' ? homeContent?.story_title_it : homeContent?.story_title)?.trim() ? (
                <>{(language === 'it' ? homeContent?.story_title_it : homeContent?.story_title) as string}</>
              ) : (
                <>
                  {t('home.story_title_1', 'Une Maison de')} <br />{' '}
                  <span className="italic">{t('home.story_title_2', 'Haute Parfumerie')}</span>
                </>
              )}
            </h2>
            <p className="text-brand-black/70 font-sans text-base leading-relaxed mb-10 max-w-lg">
              {language === 'it'
                ? homeContent?.story_text_it?.trim() || t('home.story_desc')
                : homeContent?.story_text?.trim() || t('home.story_desc')}
            </p>
            <Link
              href="/la-maison"
              className="luxury-button inline-flex items-center justify-center px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
            >
              {t('home.story_cta', 'Découvrir notre univers')}
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className={`group ${showcaseMediaFrameClass} ${showcaseMediaAspectClass} mx-auto max-w-[22rem] sm:max-w-md md:mx-0 md:max-w-none`}
          >
            <Image
              src={storyImageSrc}
              alt={
                language === 'it'
                  ? homeContent?.hero_image_alt_it?.trim() || t('home.hero_image_alt')
                  : homeContent?.hero_image_alt?.trim() || t('home.hero_image_alt')
              }
              fill
              className="object-cover object-center transition-transform duration-[1.1s] ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
              unoptimized={storyImageSrc.startsWith('/')}
            />
          </motion.div>
        </div>
      </section>

      <HomeSelection products={bestSellers} collectionSlug={featuredCollection.slug} />

      <FeaturedCollection collection={featuredCollection} />

      {/* Press Section */}
      <section className="py-32 border-t border-brand-black/5">
        <div className="max-w-screen-xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-30 grayscale">
            <span className="text-2xl font-serif italic">Vogue</span>
            <span className="text-2xl font-serif italic">Harper&apos;s Bazaar</span>
            <span className="text-2xl font-serif italic">Elle</span>
            <span className="text-2xl font-serif italic">Numéro</span>
          </div>
        </div>
      </section>

      <FAQSection />

      <Footer />

      {/* Marquee Animation Styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1.05); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
