'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_HERO_PRODUCT_IMAGE, resolveHeroProductImage } from '@/lib/hero-content';
import {
  showcaseMediaAspectClass,
  showcaseMediaFrameClass,
  showcaseMediaWidthClass,
} from '@/lib/showcase-media-styles';

export default function Hero({ content }: { content?: Record<string, unknown> | null }) {
  const { t, language } = useLanguage();
  const heroImageSrc = resolveHeroProductImage(
    (typeof content?.hero_product_image === 'string' && content.hero_product_image.trim()) ||
      DEFAULT_HERO_PRODUCT_IMAGE
  );

  return (
    <section className="hero-viewport relative flex w-full items-center overflow-hidden bg-brand-cream">
      <div className="absolute top-0 right-0 hidden h-full w-1/2 -skew-x-12 translate-x-20 bg-brand-black/5 md:block" />

      <div className="relative z-20 mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-8 px-4 sm:gap-10 sm:px-6 md:grid-cols-2 md:items-center md:gap-x-14 md:gap-y-10 lg:gap-x-24 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="order-1 py-2 text-left sm:py-4 md:order-1 md:py-8 lg:py-10"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-8 block text-[10px] font-black uppercase text-brand-gold sm:mb-10 md:mb-12"
          >
            {t('hero.label', 'Maison de Parfum de Niche')}
          </motion.span>

          <h1 className="mb-6 font-serif text-[2.35rem] leading-[0.95] tracking-tighter text-brand-black sm:mb-8 sm:text-5xl md:mb-10 md:text-6xl md:leading-[0.92] lg:text-7xl xl:text-8xl">
            {content?.hero_title === 'WHY' ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="font-logo mb-4 block capitalize tracking-normal text-brand-gold drop-shadow-sm"
              >
                Why
              </motion.span>
            ) : (
              <span className="mb-2 block">
                {typeof content?.hero_title === 'string' && content.hero_title.trim() ? (
                  content.hero_title
                ) : (
                  <>
                    {t('hero.title_1', "L'éveil des")}
                    <br />
                    <span className="italic">{t('hero.title_2', 'Sens')}</span>
                  </>
                )}
              </span>
            )}
            <span className="mt-3 block font-sans text-xs font-black uppercase leading-snug tracking-[0.12em] opacity-25 sm:mt-4 sm:text-sm sm:tracking-[0.15em] md:text-lg lg:text-2xl">
              {language === 'it'
                ? typeof content?.hero_subtitle_it === 'string' && content.hero_subtitle_it.trim()
                  ? content.hero_subtitle_it
                  : t('hero.copy_extrakt')
                : typeof content?.hero_subtitle === 'string' && content.hero_subtitle.trim()
                  ? content.hero_subtitle
                  : t('hero.desc')}
            </span>
          </h1>

          <p className="mb-8 max-w-md border-l-2 border-brand-gold/20 pl-4 font-sans text-sm leading-relaxed tracking-wide text-brand-black/60 italic sm:mb-12 sm:pl-6 md:mb-14 md:text-base lg:mb-16 lg:pl-8">
            {language === 'it'
              ? typeof content?.hero_lead_it === 'string' && content.hero_lead_it.trim()
                ? content.hero_lead_it
                : typeof content?.story_text_it === 'string' && content.story_text_it.trim()
                  ? content.story_text_it
                  : t('hero.story_text')
              : typeof content?.hero_lead === 'string' && content.hero_lead.trim()
                ? content.hero_lead
                : typeof content?.story_text === 'string' && content.story_text.trim()
                  ? content.story_text
                  : t('hero.story_text')}
          </p>

          <Link
            href="/parfums"
            className="luxury-button group flex w-full max-w-xs items-center justify-center gap-4 px-8 text-[10px] font-black transition-all hover:scale-[1.02] sm:w-auto sm:max-w-none sm:px-12"
          >
            {t('hero.cta_main', 'Découvrir WHY')}
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronRight size={16} />
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="order-2 flex w-full justify-center px-1 pt-8 sm:px-2 sm:pt-10 md:order-2 md:px-0 md:pt-14 lg:pt-20"
        >
          <div className="animate-pulse-slow pointer-events-none absolute inset-0 scale-110 rounded-full bg-brand-gold/15 blur-[160px]" />

          <motion.div
            className={`group ${showcaseMediaFrameClass} ${showcaseMediaAspectClass} ${showcaseMediaWidthClass} bg-brand-cream transition-transform duration-[1.1s] ease-out hover:scale-[1.02] md:max-h-[min(70vh,780px)] lg:max-h-[min(75vh,820px)]`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Image
              src={heroImageSrc}
              alt={
                language === 'it'
                  ? typeof content?.hero_image_alt_it === 'string' && content.hero_image_alt_it.trim()
                    ? content.hero_image_alt_it
                    : t('hero.image_alt_default')
                  : typeof content?.hero_image_alt === 'string' && content.hero_image_alt.trim()
                    ? content.hero_image_alt
                    : t('hero.image_alt_default')
              }
              fill
              priority
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 38vw"
              className="object-contain object-center p-0.5 sm:p-1"
              referrerPolicy="no-referrer"
              unoptimized={heroImageSrc.startsWith('/')}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
