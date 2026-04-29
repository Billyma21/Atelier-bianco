'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  DEFAULT_HERO_BADGES,
  DEFAULT_HERO_PRODUCT_IMAGE,
  normalizeHeroBadges,
  type HeroBadge,
} from '@/lib/hero-content';

function badgeSlotClass(slot: HeroBadge['slot']) {
  return slot === 'top-right'
    ? 'absolute top-20 -right-8'
    : 'absolute bottom-32 -left-12 translate-y-12';
}

function BadgeCard({ badge }: { badge: HeroBadge }) {
  const isDark = badge.variant === 'dark';
  return (
    <div
      className={
        isDark
          ? 'block rounded-[2rem] border border-white/5 bg-brand-black/95 px-7 py-5 shadow-2xl backdrop-blur-xl'
          : 'block rounded-[2rem] border border-brand-gold/10 bg-white/90 px-7 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl'
      }
    >
      <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">{badge.label}</span>
      <span
        className={`text-sm font-serif italic ${isDark ? 'text-brand-cream' : 'text-brand-black'}`}
      >
        {badge.text}
      </span>
    </div>
  );
}

export default function Hero({ content }: { content?: any }) {
  const { t } = useLanguage();
  const heroBadges = normalizeHeroBadges(content?.hero_badges);
  const heroImageSrc =
    (typeof content?.hero_product_image === 'string' && content.hero_product_image.trim()) ||
    (typeof content?.hero_image === 'string' && content.hero_image.trim()) ||
    DEFAULT_HERO_PRODUCT_IMAGE;
  
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-brand-cream flex items-center pt-24 md:pt-0">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-black/5 -skew-x-12 translate-x-20 transition-transform hidden md:block" />
      
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-24 relative z-20">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-left py-16 md:py-0"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-[10px] uppercase text-brand-gold mb-12 block font-black"
          >
            {t('hero.label', 'Maison de Parfum de Niche')}
          </motion.span>
          
          <h1 className="text-5xl md:text-[8rem] lg:text-[10rem] font-serif text-brand-black mb-10 leading-[0.8] tracking-tighter">
            {content?.hero_title === 'WHY' ? (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-logo capitalize tracking-normal text-brand-gold block drop-shadow-sm mb-4"
              >
                Why
              </motion.span>
            ) : (
              <span className="block mb-4">{content?.hero_title || t('hero.title_1', "L'Éveil")}</span>
            )}
            <span className="text-xl md:text-5xl uppercase tracking-[0.2em] font-sans font-black block mt-6 opacity-20 leading-tight">
              {content?.hero_subtitle || t('hero.desc', 'Extrait de Parfum')}
            </span>
          </h1>
          
          <p className="text-brand-black/60 font-sans text-[11px] md:text-base max-w-sm mb-16 leading-relaxed tracking-wide italic border-l-2 border-brand-gold/20 pl-8">
            {content?.story_text || t('hero.story_text', "Une rencontre entre l'ombre et la lumière, capturer l'essence du subconscient dans un sillage inoubliable.")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-start md:items-center gap-10">
            <Link href="/parfums" className="luxury-button group px-12 py-5 flex items-center gap-4 hover:scale-105 transition-all text-[10px] font-black">
              {t('hero.cta_main', 'Découvrir WHY')}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight size={16} />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Right Content - Product Shot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative aspect-square md:aspect-auto md:h-[85vh] flex items-center justify-center pt-10"
        >
          {/* Main Glow Atmosphere */}
          <div className="absolute inset-0 bg-brand-gold/15 blur-[160px] rounded-full scale-110 animate-pulse-slow" />
          
          <div className="relative h-full w-full max-w-sm md:max-w-none flex items-center justify-center">
            {/* Floating Bokeh/Particles */}
            <motion.div 
              animate={{ 
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute top-1/4 -right-10 w-24 h-24 bg-brand-gold/20 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                y: [0, 50, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-1/4 -left-20 w-32 h-32 bg-brand-gold/30 rounded-full blur-3xl"
            />

            <Image
              src={heroImageSrc}
              alt={content?.hero_image_alt || 'WHY - Extrait de Parfum'}
              width={900}
              height={1200}
              priority
              className="object-contain drop-shadow-[0_50px_80px_-20px_rgba(0,0,0,0.4)] transition-transform duration-1000 ease-out hover:scale-[1.03]"
              referrerPolicy="no-referrer"
              unoptimized={heroImageSrc.startsWith('/')}
            />

            {heroBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                variants={{
                  initial: { opacity: 0, x: badge.slot === 'top-right' ? 20 : -20 },
                  animate: { opacity: 1, x: 0 },
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.9 + i * 0.15, duration: 0.85 }}
                className={badgeSlotClass(badge.slot)}
              >
                <BadgeCard badge={badge} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Bottom Navigation/Info */}
      <div className="absolute bottom-12 left-12 hidden md:flex items-center gap-20">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-widest text-brand-black/20 font-black">Collection</span>
          <span className="text-[10px] uppercase tracking-widest text-brand-black font-black">Les Incontournables</span>
        </div>
      </div>

      {/* Vertical Rail Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="writing-vertical-lr rotate-180 text-[8px] uppercase tracking-[0.8em] text-brand-black/20 font-black whitespace-nowrap">
          HAUTE PARFUMERIE • PARIS • GRASSE • ATELIER BIANCO
        </span>
      </div>
    </section>
  );
}
