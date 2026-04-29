'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';

type Language = 'fr' | 'it';

interface TranslationData {
  [key: string]: {
    fr: string;
    it: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const FALLBACK_TRANSLATIONS: TranslationData = {
  'nav.home': { fr: 'Accueil', it: 'Home' },
  'nav.catalog': { fr: 'Catalogue', it: 'Catalogo' },
  'nav.maison': { fr: 'La Maison', it: 'La Maison' },
  'nav.perfumes': { fr: 'Parfums', it: 'Profumi' },
  'nav.faq': { fr: 'FAQ', it: 'FAQ' },
  'nav.account': { fr: 'Mon Compte', it: 'Il Mio Account' },
  'nav.cart': { fr: 'Panier', it: 'Carrello' },
  'common.loading': { fr: 'Chargement...', it: 'Caricamento...' },
  'home.hero_cta': { fr: 'Découvrir la Collection', it: 'Scopri la Collezione' },
  'product.add_to_cart': { fr: 'Ajouter au Panier', it: 'Aggiungi al carrello' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [translations, setTranslations] = useState<TranslationData>(FALLBACK_TRANSLATIONS);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Load preferred language from localStorage
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
      document.documentElement.lang = savedLang;
    }

    const fetchTranslations = async () => {
      try {
        const { data, error } = await supabase
          .from('translations')
          .select('*');

        if (error) {
          // Check for missing table error specific code/message
          if (error.code === 'PGRST116' || error.message.includes('public.translations')) {
            console.warn('translations table missing or inaccessible. Using local fallback.', error.message);
          } else {
            console.error('Supabase translation error:', error.message);
          }
          throw error;
        }

        if (data && data.length > 0) {
          const transMap: TranslationData = { ...FALLBACK_TRANSLATIONS };
          data.forEach((item: any) => {
            transMap[item.key] = {
              fr: item.fr,
              it: item.it
            };
          });
          setTranslations(transMap);
        }
      } catch (err: any) {
        console.warn('Initial fetch failed, fallback translations are active.', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [supabase]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string, fallback?: string) => {
    const translation = translations[key];
    if (translation) {
      return translation[language] || fallback || key;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
