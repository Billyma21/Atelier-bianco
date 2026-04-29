import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Cormorant_Garamond, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import LuxuryLoader from '@/components/layout/LuxuryLoader';
import ToastHost from '@/components/layout/ToastHost';
import CookieConsent from '@/components/layout/CookieConsent';

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

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  process.env.APP_URL?.replace(/\/$/, '') ||
  'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Atelier Bianco | Haute Parfumerie & Parfums de Niche',
  description: 'Maison Atelier Bianco : créations olfactives d\'exception, extraits de parfum rares et savoir-faire artisanal français.',
  openGraph: {
    title: 'Atelier Bianco | Maison de Parfum',
    description: 'L\'élégance du parfum de niche. Découvrez nos collections exclusives.',
    siteName: 'Atelier Bianco',
  }
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable} ${pinyon.variable}`}>
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
