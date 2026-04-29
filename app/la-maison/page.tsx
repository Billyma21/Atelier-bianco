'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function LaMaisonPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src="https://picsum.photos/seed/atelier/1920/1080?blur=2" 
            alt="Atelier Bianco"
            fill
            priority
            className="object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block"
          >
            Héritage & Vision
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif italic"
          >
            La Maison Bianco
          </motion.h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 leading-relaxed">
            Née au cœur de la Belgique, Atelier Bianco est le fruit d&apos;une quête obsessionnelle pour la pureté olfactive.
          </h2>
          <div className="space-y-8 text-brand-black/70 font-sans leading-loose text-lg">
            <p>
              Fondée par Kenzy Bianco, notre maison s&apos;attache à redéfinir les codes de la parfumerie de niche en privilégiant l&apos;émotion brute et la qualité sans compromis des matières premières.
            </p>
            <p>
              Chaque fragrance est une architecture invisible, un sillage qui raconte une histoire unique, capturant des instants d&apos;éternité dans des flacons au design minimaliste.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 bg-brand-black text-brand-cream px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
          {[
            { title: 'Artisanat Belge', desc: 'Chaque flacon est assemblé et scellé à la main dans notre atelier de Bruxelles.' },
            { title: 'Essences Rares', desc: 'Nous sourçons nos matières premières auprès des meilleurs producteurs mondiaux, de Grasse à Java.' },
            { title: 'Éco-Conception', desc: 'Nos packagings sont 100% recyclables et nos formules sont respectueuses de l\'environnement.' }
          ].map((value, idx) => (
            <motion.div 
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-xl font-serif italic mb-6 text-brand-gold">{value.title}</h3>
              <p className="text-sm font-sans opacity-60 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
