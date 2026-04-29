'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <h1 className="text-5xl font-serif mb-12">Conditions Générales de Vente</h1>
          
          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">1. Objet</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Atelier Bianco et toute personne effectuant un achat sur le site.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">2. Produits</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Les produits proposés à la vente sont ceux décrits sur le site au jour de la consultation du site par le client, dans la limite des stocks disponibles.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">3. Prix</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Les prix sont indiqués en Euros TTC. Atelier Bianco se réserve le droit de modifier ses prix à tout moment.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif uppercase tracking-widest text-brand-gold">4. Livraison</h2>
            <div className="text-sm font-sans text-brand-black/70 leading-relaxed">
              <p>Les produits sont livrés à l&apos;adresse de livraison indiquée lors de la commande. Les délais de livraison sont donnés à titre indicatif.</p>
            </div>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
