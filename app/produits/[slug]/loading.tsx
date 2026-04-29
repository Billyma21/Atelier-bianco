'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/** Affiché immédiatement pendant le chargement du module / données — améliore la perception de vitesse. */
export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="mx-auto max-w-screen-2xl px-6 pb-24 pt-32 md:px-12">
        <div className="grid animate-pulse grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="aspect-[3/4] rounded-sm bg-gradient-to-br from-brand-black/[0.07] to-brand-black/[0.02]" />
          </div>
          <div className="lg:col-span-5 space-y-8 pt-2">
            <div className="h-3 w-24 rounded-full bg-brand-gold/30" />
            <div className="h-12 max-w-md rounded bg-brand-black/10" />
            <div className="h-20 max-w-lg rounded bg-brand-black/5" />
            <div className="flex gap-3">
              <div className="h-11 w-20 rounded border border-brand-black/10 bg-white" />
              <div className="h-11 w-20 rounded border border-brand-black/10 bg-white" />
            </div>
            <div className="h-14 w-full max-w-sm rounded bg-brand-black" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
