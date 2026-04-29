'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type FooterCollection = { id: string; name: string; name_it?: string | null; slug: string };

export default function Footer() {
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<FooterCollection[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/collections')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.collections)) setCollections(d.collections);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-brand-black text-brand-cream pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        {/* Brand Story */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-logo tracking-widest capitalize mb-6 text-brand-cream">Atelier Bianco</h2>
          <p className="text-sm font-sans text-brand-cream/60 leading-relaxed max-w-xs">
            {t('footer.story', 'Maison de parfum de niche dédiée à l\'art de l\'olfaction. Des créations intemporelles, façonnées avec passion.')}
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-sans mb-6 text-brand-gold">{t('footer.shop', 'Boutique')}</h3>
          <ul className="space-y-4 text-sm font-sans text-brand-cream/80">
            <li>
              <Link href="/parfums" className="hover:text-brand-gold transition-colors">
                {t('footer.all_perfumes', 'Tous les Parfums')}
              </Link>
            </li>
            {collections.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/parfums?collection=${encodeURIComponent(c.slug)}`}
                  className="hover:text-brand-gold transition-colors"
                >
                  {language === 'it' && c.name_it?.trim() ? c.name_it : c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/suivi" className="hover:text-brand-gold transition-colors">
                {t('footer.orders', 'Suivi de Commande')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-sans mb-6 text-brand-gold">{t('footer.house', 'Maison')}</h3>
          <ul className="space-y-4 text-sm font-sans text-brand-cream/80">
            <li><Link href="/la-maison" className="hover:text-brand-gold transition-colors">{t('footer.our_story', 'Notre Histoire')}</Link></li>
            <li><Link href="/faq" className="hover:text-brand-gold transition-colors">{t('footer.faq', 'Questions Fréquentes')}</Link></li>
            <li><Link href="/auth/login" className="hover:text-brand-gold transition-colors">{t('footer.my_account', 'Mon Compte')}</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-sans mb-6 text-brand-gold">{t('footer.newsletter', 'Newsletter')}</h3>
          <p className="text-sm font-sans text-brand-cream/60 mb-6">
            {t('footer.newsletter_desc', 'Inscrivez-vous pour recevoir nos actualités et invitations exclusives.')}
          </p>
          <form className="flex border-b border-brand-cream/20 pb-2">
            <input
              type="email"
              placeholder={t('footer.email_placeholder', 'Votre email')}
              className="bg-transparent border-none outline-none text-sm w-full font-sans"
            />
            <button type="submit" className="text-[10px] uppercase tracking-widest font-sans hover:text-brand-gold transition-colors">
              {t('footer.subscribe', 'S\'inscrire')}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto pt-10 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex space-x-6">
          <a href="#" className="text-brand-cream/40 hover:text-brand-gold transition-colors"><Instagram size={18} /></a>
          <a href="#" className="text-brand-cream/40 hover:text-brand-gold transition-colors"><Facebook size={18} /></a>
          <a href="#" className="text-brand-cream/40 hover:text-brand-gold transition-colors"><Twitter size={18} /></a>
        </div>
        
        <div className="text-[10px] uppercase tracking-widest font-sans text-brand-cream/40 flex space-x-8">
          <Link href="/mentions-legales" className="hover:text-brand-gold transition-colors">{t('footer.legal', 'Mentions Légales')}</Link>
          <Link href="/cgv" className="hover:text-brand-gold transition-colors">{t('footer.terms', 'CGV')}</Link>
          <Link href="/confidentialite" className="hover:text-brand-gold transition-colors">{t('footer.privacy', 'Confidentialité')}</Link>
        </div>

        <p className="text-[10px] uppercase tracking-widest font-sans text-brand-cream/20">
          © {new Date().getFullYear()} Atelier Bianco. Tous droits réservés.
        </p>
        
        <Link href="/admin/login" className="text-[8px] uppercase tracking-[0.4em] text-brand-cream/5 hover:text-brand-gold transition-colors">
          Admin
        </Link>
      </div>
    </footer>
  );
}
