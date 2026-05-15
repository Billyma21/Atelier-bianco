import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Inter, Cormorant_Garamond, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import LuxuryLoader from '@/components/layout/LuxuryLoader';
import ToastHost from '@/components/layout/ToastHost';
import CookieConsent from '@/components/layout/CookieConsent';
import { getSiteUrl } from '@/lib/site-url';
import { APP_LANGUAGE_COOKIE, parseLangCookie } from '@/lib/i18n/constants';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const pinyon = Pinyon_Script({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-logo',
  weight: '400',
  display: 'swap',
});

const siteUrl = getSiteUrl();

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const lang = parseLangCookie(jar.get(APP_LANGUAGE_COOKIE)?.value);
  const copy = lang === 'it' ? it : fr;

  return {
    metadataBase: new URL(siteUrl),
    title: copy['meta.title'],
    description: copy['meta.description'],
    openGraph: {
      title: copy['meta.og_title'],
      description: copy['meta.og_description'],
      siteName: 'Atelier Bianco',
      locale: lang === 'it' ? 'it_IT' : 'fr_BE',
      alternateLocale: lang === 'it' ? ['fr_BE'] : ['it_IT'],
    },
    alternates: {
      canonical: '/',
      languages: {
        fr: '/',
        it: '/',
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jar = await cookies();
  const htmlLang = parseLangCookie(jar.get(APP_LANGUAGE_COOKIE)?.value);

  return (
    <html lang={htmlLang} className={`${inter.variable} ${cormorant.variable} ${pinyon.variable}`}>
      <body suppressHydrationWarning className="bg-[#F8F5F0] text-[#0A0A0A] font-sans antialiased selection:bg-[#C9A96E] selection:text-white">
        <LanguageProvider>
          <ThemeProvider>
            <LuxuryLoader>{children}</LuxuryLoader>
            <ToastHost />
            <CookieConsent />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
