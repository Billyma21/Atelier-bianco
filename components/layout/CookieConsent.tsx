'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'atelier-bianco-cookie-consent';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const persist = (value: 'essential' | 'all') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: value }));
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[10000] border-t border-brand-black/10 bg-[#FDFCFB]/95 px-6 py-8 shadow-[0_-12px_40px_rgba(10,10,10,0.08)] backdrop-blur-md md:px-12"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p id="cookie-consent-title" className="font-serif text-lg text-brand-black">
            Respect de votre vie privée
          </p>
          <p className="text-sm leading-relaxed text-brand-black/65">
            Nous utilisons des cookies strictement nécessaires au fonctionnement du site (panier, session) et,
            avec votre accord, des mesures d&apos;audience anonymisées pour perfectionner votre expérience.
            Consultez notre{' '}
            <Link href="/confidentialite" className="border-b border-brand-gold/40 text-brand-black hover:text-brand-gold">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => persist('essential')}
            className="border border-brand-black/15 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-brand-black/70 transition-colors hover:border-brand-gold hover:text-brand-black"
          >
            Essentiels uniquement
          </button>
          <button
            type="button"
            onClick={() => persist('all')}
            className="bg-brand-black px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-brand-cream transition-colors hover:bg-brand-gold hover:text-white"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
