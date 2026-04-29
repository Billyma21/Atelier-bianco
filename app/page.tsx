'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FAQSection from '@/components/home/FAQSection';
import ProductCard from '@/components/product/ProductCard';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [homeContent, setHomeContent] = useState<any>(null);
  const [activeCollections, setActiveCollections] = useState<any[]>([]);
  const { t, language } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Best Sellers
      const { data: bData } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(4);
      if (bData) setBestSellers(bData);

      // Fetch Home Content
      const { data: hData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'home_content')
        .single();
      if (hData) setHomeContent(hData.value);

      // Fetch Collections (schéma enrichi : sort_order, is_published ; repli si migration pas encore appliquée)
      const cRes = await supabase
        .from('collections')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .limit(12);
      if (cRes.data) setActiveCollections(cRes.data);
      else if (!cRes.error) setActiveCollections([]);
      else {
        const c2 = await supabase.from('collections').select('*').order('name', { ascending: true }).limit(12);
        if (c2.data) setActiveCollections(c2.data);
      }
    };
    fetchData();
  }, [supabase]);

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
              {homeContent?.promo_banner || "Livraison offerte dès 150€ d'achat • 2 échantillons offerts pour toute commande • Atelier Bianco"}
            </span>
          ))}
        </div>
      </div>

      {/* Storytelling Section */}
      <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-8 block">{t('home.story_label', "L'Art de l'Olfaction")}</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-tight">
              {homeContent?.story_title || (
                <>
                  {t('home.story_title_1', 'Une Maison de')} <br /> <span className="italic">{t('home.story_title_2', 'Haute Parfumerie')}</span>
                </>
              )}
            </h2>
            <p className="text-brand-black/70 font-sans text-base leading-relaxed mb-10 max-w-lg">
              {homeContent?.story_text || t('home.story_desc', "Atelier Bianco est né d'une volonté de revenir à l'essence même du parfum. Nos créations sont le fruit d'une quête incessante de pureté et d'émotion, où chaque note raconte une histoire, chaque sillage évoque un souvenir.")}
            </p>
            <Link href="/la-maison" className="text-[10px] uppercase tracking-widest font-sans border-b border-brand-black/20 pb-2 hover:border-brand-gold hover:text-brand-gold transition-all">
              {t('home.story_cta', 'Découvrir notre univers')}
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1000&auto=format&fit=crop"
              alt="Atelier Bianco Craftsmanship"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block">{t('home.bestsellers_label', 'Sélection')}</span>
              <h2 className="text-4xl md:text-5xl font-serif">{t('home.bestsellers_title', 'Les Incontournables')}</h2>
            </div>
            <Link href="/parfums" className="text-[10px] uppercase tracking-widest font-sans border-b border-brand-black/20 pb-2 hover:border-brand-gold hover:text-brand-gold transition-all">
              {t('home.bestsellers_cta', 'Voir tout le catalogue')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Collections Carousel Placeholder */}
      <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block">{t('home.collections_label', 'Univers')}</span>
          <h2 className="text-4xl md:text-5xl font-serif">{t('home.collections_title', 'Nos Collections')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(activeCollections.length > 0 ? activeCollections : [
            { name: 'SIGNATURE', name_it: 'SIGNATURE', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop', slug: 'signature' },
            { name: t('collection.oriental', 'Collection Orientale'), name_it: t('collection.oriental', 'Collezione Orientale'), image_url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop', slug: 'orientale' },
            { name: t('collection.floral', 'Collection Florale'), name_it: t('collection.floral', 'Collezione Fioreale'), image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop', slug: 'florale' },
            { name: t('collection.woody', 'Collection Boisée'), name_it: t('collection.woody', 'Collezione Legnosa'), image_url: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop', slug: 'boisee' },
          ]).map((col, i) => {
            const colAny = col as { name: string; name_it?: string | null; image_url: string; slug: string };
            const title = language === 'it' && colAny.name_it?.trim() ? colAny.name_it : colAny.name;
            return (
            <motion.div
              key={colAny.slug || i}
              whileHover={{ y: -10 }}
              className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
            >
              <Image
                src={colAny.image_url}
                alt={title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/30 flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-2xl text-brand-cream font-serif mb-4">{title}</h3>
                <Link href={`/parfums?collection=${colAny.slug}`} className="text-[10px] uppercase tracking-widest text-brand-cream border-b border-brand-cream/30 pb-1 group-hover:border-brand-gold group-hover:text-brand-gold transition-all">
                  {t('home.collections_cta', 'Découvrir')}
                </Link>
              </div>
            </motion.div>
            );
          })}
        </div>
      </section>

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
