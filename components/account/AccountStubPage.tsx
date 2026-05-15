'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type Props = {
  titleKey: string;
  descriptionKey: string;
  titleFallback: string;
  descriptionFallback: string;
};

export default function AccountStubPage({ titleKey, descriptionKey, titleFallback, descriptionFallback }: Props) {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="page-content mx-auto max-w-lg">
        <h1 className="heading-page mb-4">{t(titleKey, titleFallback)}</h1>
        <p className="mb-8 text-sm leading-relaxed text-brand-black/60">{t(descriptionKey, descriptionFallback)}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/mon-compte" className="luxury-button justify-center text-center">
            {t('account.stub.back', 'Retour au compte')}
          </Link>
          <Link
            href="/faq"
            className="inline-flex min-h-12 items-center justify-center border border-brand-black/20 px-6 py-3 text-center text-xs uppercase tracking-widest transition-colors hover:border-brand-gold"
          >
            {t('nav.faq', 'FAQ')}
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
