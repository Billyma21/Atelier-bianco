'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <h1 className="text-5xl font-serif mb-12">Politique de Confidentialité</h1>
          
          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">1. Collecte des données</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Nous collectons les informations que vous nous fournissez lors de la création de votre compte, de vos commandes et de vos échanges avec notre service client.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">2. Utilisation des données</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Vos données sont utilisées pour la gestion de vos commandes, l&apos;amélioration de nos services et, si vous y avez consenti, l&apos;envoi d&apos;informations commerciales.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">3. Vos droits</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition au traitement de vos données personnelles.</p>
            </div>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
