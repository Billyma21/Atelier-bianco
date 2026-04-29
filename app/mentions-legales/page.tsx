'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <h1 className="text-5xl font-serif mb-12">Mentions Légales</h1>
          
          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">1. Éditeur du site</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed space-y-2">
              <p>Le présent site est édité par la société Atelier Bianco.</p>
              <p>Siège social : Avenue des Parfums 123, 1000 Bruxelles, Belgique.</p>
              <p>Numéro d&apos;entreprise : BE 0123.456.789</p>
              <p>Email : contact@atelier-bianco.be</p>
              <p>Directeur de la publication : Kenzy Bianco</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">2. Hébergement</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Le site est hébergé par Google Cloud Platform.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">3. Propriété Intellectuelle</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>L&apos;ensemble de ce site relève de la législation internationale sur le droit d&apos;auteur, le droit des marques et, de façon générale, sur la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
            </div>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
