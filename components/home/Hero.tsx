'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_HERO_PRODUCT_IMAGE } from '@/lib/hero-content';

export default function Hero({ content }: { content?: Record<string, unknown> | null }) {
  const { t, language } = useLanguage();
  const heroImageSrc =
    (typeof content?.hero_product_image === 'string' && content.hero_product_image.trim()) ||
    (typeof content?.hero_image === 'string' && content.hero_image.trim()) ||
    DEFAULT_HERO_PRODUCT_IMAGE;

  return (
    <section className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-brand-cream pt-20 sm:pt-24 md:min-h-screen md:pt-0">
      <div className="absolute top-0 right-0 hidden h-full w-1/2 -skew-x-12 translate-x-20 bg-brand-black/5 transition-transform md:block" />

      <div className="relative z-20 mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:gap-24 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="py-16 text-left md:py-0"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-12 block text-[10px] font-black uppercase text-brand-gold"
          >
            {t('hero.label', 'Maison de Parfum de Niche')}
          </motion.span>

          <h1 className="mb-8 font-serif text-4xl leading-[0.95] tracking-tighter text-brand-black sm:mb-10 sm:text-5xl md:text-7xl md:leading-[0.92] lg:text-8xl xl:text-[7.5rem] xl:leading-[0.9]">
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
            <span className="mt-3 block font-sans text-sm font-black uppercase leading-snug tracking-[0.15em] opacity-25 sm:mt-5 sm:text-lg md:text-2xl lg:text-3xl">
              {language === 'it'
                ? typeof content?.hero_subtitle_it === 'string' && content.hero_subtitle_it.trim()
                  ? content.hero_subtitle_it
                  : t('hero.copy_extrakt')
                : typeof content?.hero_subtitle === 'string' && content.hero_subtitle.trim()
                  ? content.hero_subtitle
                  : t('hero.desc')}
            </span>
          </h1>

          <p className="mb-10 max-w-md border-l-2 border-brand-gold/20 pl-4 font-sans text-sm leading-relaxed tracking-wide text-brand-black/60 italic sm:mb-16 sm:pl-8 md:text-base">
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
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative flex aspect-[4/5] max-h-[55vh] items-center justify-center overflow-hidden sm:aspect-square sm:max-h-none md:aspect-auto md:h-[85vh] md:max-h-none"
        >
          <div className="animate-pulse-slow absolute inset-0 scale-110 rounded-full bg-brand-gold/15 blur-[160px]" />

          <div className="relative flex h-full w-full max-w-sm items-center justify-center overflow-hidden md:max-w-none">
            <motion.div
              animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              className="absolute top-1/4 -right-10 h-24 w-24 rounded-full bg-brand-gold/20 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 50, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-brand-gold/30 blur-3xl"
            />

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
              width={900}
              height={1200}
              priority
              className="max-h-full w-auto object-contain drop-shadow-[0_50px_80px_-20px_rgba(0,0,0,0.4)] transition-transform duration-1000 ease-out hover:scale-[1.02]"
              referrerPolicy="no-referrer"
              unoptimized={heroImageSrc.startsWith('/')}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
