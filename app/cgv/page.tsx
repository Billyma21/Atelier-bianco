'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

export default function CGVPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <h1 className="mb-12 font-serif text-5xl">{t('legal.cgv_h1', '')}</h1>

          <section className="space-y-6">
            <h2 className="font-serif text-xl uppercase tracking-widest text-brand-gold">{t('legal.cgv_s1', '')}</h2>
            <div className="text-sm font-sans leading-relaxed text-brand-black/70">
              <p>{t('legal.cgv_p1', '')}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-xl uppercase tracking-widest text-brand-gold">{t('legal.cgv_s2', '')}</h2>
            <div className="text-sm font-sans leading-relaxed text-brand-black/70">
              <p>{t('legal.cgv_p2', '')}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-xl uppercase tracking-widest text-brand-gold">{t('legal.cgv_s3', '')}</h2>
            <div className="text-sm font-sans leading-relaxed text-brand-black/70">
              <p>{t('legal.cgv_p3', '')}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-serif text-xl uppercase tracking-widest text-brand-gold">{t('legal.cgv_s4', '')}</h2>
            <div className="text-sm font-sans leading-relaxed text-brand-black/70">
              <p>{t('legal.cgv_p4', '')}</p>
            </div>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
