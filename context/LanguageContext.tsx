'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CLIENT_LOCALE_MERGED, type TranslationData } from '@/lib/i18n/merge-locales';
import { APP_LANGUAGE_COOKIE } from '@/lib/i18n/constants';
import type { AppLanguage } from '@/lib/i18n/constants';

import {
  FEATURED_COLLECTION_DESC_FR,
  FEATURED_COLLECTION_DESC_IT,
  FOOTER_STORY_FR,
  FOOTER_STORY_IT,
  HOME_DUAL_SUBTITLE_FR,
  HOME_DUAL_SUBTITLE_IT,
  MAISON_BRIEF_FR,
  MAISON_BRIEF_IT,
  MAISON_HERO_LEAD_FR,
  MAISON_HERO_LEAD_IT,
  WHY_SHORT_DESC_FR,
  WHY_SHORT_DESC_IT,
} from '@/lib/brand-copy';

export type { TranslationData };

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, fallback?: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** Textes longs / imports brand : surchargent les entrées JSON si présentes. */
const BRAND_TRANSLATION_OVERRIDES: TranslationData = {
  'home.story_desc': { fr: MAISON_BRIEF_FR, it: MAISON_BRIEF_IT },
  'home.dual_subtitle': { fr: HOME_DUAL_SUBTITLE_FR, it: HOME_DUAL_SUBTITLE_IT },
  'home.featured_collection_fallback_desc': {
    fr: FEATURED_COLLECTION_DESC_FR,
    it: FEATURED_COLLECTION_DESC_IT,
  },
  'hero.story_text': { fr: MAISON_HERO_LEAD_FR, it: MAISON_HERO_LEAD_IT },
  'footer.story': { fr: FOOTER_STORY_FR, it: FOOTER_STORY_IT },
  'home.flagship_why_blurb': { fr: WHY_SHORT_DESC_FR, it: WHY_SHORT_DESC_IT },
};

const FALLBACK_TRANSLATIONS: TranslationData = {
  ...CLIENT_LOCALE_MERGED,
  ...BRAND_TRANSLATION_OVERRIDES,
};

function persistLocaleCookie(lang: AppLanguage) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${APP_LANGUAGE_COOKIE}=${lang};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [language, setLanguageState] = useState<AppLanguage>('fr');
  const [translations, setTranslations] = useState<TranslationData>(FALLBACK_TRANSLATIONS);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('app-language') as AppLanguage | null;
      if (savedLang === 'fr' || savedLang === 'it') {
        setLanguageState(savedLang);
        persistLocaleCookie(savedLang);
      } else {
        persistLocaleCookie('fr');
      }
    } catch {
      persistLocaleCookie('fr');
    }

    const fetchTranslations = async () => {
      try {
        const { data, error } = await supabase.from('translations').select('*');

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('public.translations')) {
            console.warn('translations table missing or inaccessible. Using local fallback.', error.message);
          } else {
            console.error('Supabase translation error:', error.message);
          }
          throw error;
        }

        if (data && data.length > 0) {
          const transMap: TranslationData = { ...FALLBACK_TRANSLATIONS };
          data.forEach((item: { key: string; fr: string; it: string }) => {
            const prev = transMap[item.key];
            const fr = (item.fr?.trim() || prev?.fr || '') as string;
            const itRaw = item.it?.trim();
            /** Jamais recopier le FR dans IT : évite les fuites côté italien. */
            const it = (itRaw || prev?.it || '') as string;
            transMap[item.key] = { fr, it };
          });
          Object.assign(transMap, BRAND_TRANSLATION_OVERRIDES);
          setTranslations(transMap);
        }
      } catch (err: unknown) {
        console.warn('Initial fetch failed, fallback translations are active.', err instanceof Error ? err.message : err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [supabase]);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app-language', lang);
    } catch {
      /* ignore */
    }
    persistLocaleCookie(lang);
    router.refresh();
  }, [router]);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const tr = translations[key];
      if (tr) {
        const primary = (tr[language] ?? '').trim();
        if (primary) return primary;
        if (language === 'fr') {
          const it = (tr.it ?? '').trim();
          if (it) return it;
        }
        /** IT : pas de repli vers le français. */
      }
      return (fallback ?? '').trim() || key;
    },
    [language, translations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
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
