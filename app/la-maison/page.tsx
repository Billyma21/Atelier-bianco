'use client';

import React, { useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  MAISON_BRIEF_FR,
  MAISON_BRIEF_IT,
  MAISON_LONG_FR,
  MAISON_LONG_IT,
} from '@/lib/brand-copy';
import { DEFAULT_HERO_SECONDARY_IMAGE } from '@/lib/hero-content';

function splitParagraphs(text: string): string[] {
  return text
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const VALUES_FR = [
  {
    title: 'Sicile & Méditerranée',
    desc: 'Lumière des pierres blanches, agrumes et silence des villas : une esthétique née de la côte et du calme siciliens.',
  },
  {
    title: 'Extraits & signatures',
    desc: 'Chaque création est pensée comme une présence olfactive forte — précise, émotionnelle, sans excès tapageur.',
  },
  {
    title: 'Made in Italy',
    desc: 'Des formules et flacons exigeants, fabriqués en Italie, au service d’un luxe discret et durable.',
  },
];

const VALUES_IT = [
  {
    title: 'Sicilia & Mediterraneo',
    desc: 'Luce delle pietre bianche, agrumi e silenzio delle ville: un’estetica nata dalla costa e dalla calma siciliana.',
  },
  {
    title: 'Estratti & firme',
    desc: 'Ogni creazione è una presenza olfattiva forte — precisa, emotiva, senza eccessi rumorosi.',
  },
  {
    title: 'Made in Italy',
    desc: 'Formule e flaconi esigenti, prodotti in Italia, al servizio di un lusso discreto e duraturo.',
  },
];

export default function LaMaisonPage() {
  const { t, language } = useLanguage();

  const brief = language === 'it' ? MAISON_BRIEF_IT : MAISON_BRIEF_FR;
  const longBody = language === 'it' ? MAISON_LONG_IT : MAISON_LONG_FR;
  const paragraphs = useMemo(() => splitParagraphs(longBody), [longBody]);
  const values = language === 'it' ? VALUES_IT : VALUES_FR;

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <section className="relative flex min-h-[60dvh] items-center justify-center overflow-hidden pt-24 sm:min-h-[72vh] sm:pt-28">
        <div className="absolute inset-0 z-0">
          <Image
            src={DEFAULT_HERO_SECONDARY_IMAGE}
            alt="Atelier Bianco"
            fill
            priority
            className="object-cover object-center opacity-35"
            sizes="100vw"
            unoptimized={DEFAULT_HERO_SECONDARY_IMAGE.startsWith('/')}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-cream/80 via-brand-cream/40 to-brand-cream" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 block text-[10px] uppercase tracking-[0.4em] text-brand-gold"
          >
            {t('maison.hero_kicker', 'Sicile · Italie')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-display italic text-brand-black"
          >
            {t('maison.hero_title', 'Atelier Bianco')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl font-sans text-sm leading-relaxed text-brand-black/70 md:text-base"
          >
            {brief.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </React.Fragment>
            ))}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-10"
          >
            <Link
              href="/parfums"
              className="text-[10px] uppercase tracking-[0.3em] text-brand-black/50 underline-offset-4 transition-colors hover:text-brand-gold"
            >
              {t('maison.cta_catalog', 'Découvrir les créations')}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-brand-black/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-14 text-center font-serif text-3xl italic text-brand-black md:text-4xl">
            {t('maison.story_title', 'Une maison, une intention')}
          </h2>
          <div className="space-y-10 text-left font-sans text-base leading-[1.85] text-brand-black/75 md:text-lg">
            {paragraphs.map((p, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: Math.min(idx * 0.06, 0.24), duration: 0.55 }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-brand-black/5 bg-brand-black px-4 py-20 text-brand-cream sm:px-6 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="mb-16 text-center font-serif text-2xl italic text-brand-gold md:text-3xl">
            {t('maison.values_title', 'Ce qui nous guide')}
          </h2>
          <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-12">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="text-center md:text-left"
              >
                <h3 className="mb-5 font-serif text-xl italic text-brand-cream">{value.title}</h3>
                <p className="text-sm font-sans leading-relaxed text-brand-cream/65">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
