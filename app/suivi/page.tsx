'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Package, Search } from 'lucide-react';
import { useToast } from '@/store/useToast';
import { useLanguage } from '@/context/LanguageContext';

function SuiviForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    id?: string;
    status: string;
    tracking_number: string | null;
    tracking_carrier: string | null;
    created_at: string;
  } | null>(null);
  const { t } = useLanguage();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        useToast.getState().show(t('track.toast_nomatch', ''), 'error');
        return;
      }
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: t('track.status.pending', ''),
    processing: t('track.status.processing', ''),
    shipped: t('track.status.shipped', ''),
    delivered: t('track.status.delivered', ''),
    cancelled: t('track.status.cancelled', ''),
    refunded: t('track.status.refunded', ''),
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="page-content mx-auto max-w-lg">
        <div className="mb-10 text-center sm:mb-12">
          <Package className="mx-auto mb-6 text-brand-gold" size={36} strokeWidth={1} />
          <h1 className="heading-page">{t('track.title', 'Suivi de commande')}</h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-black/60">{t('track.intro', '')}</p>
        </div>

        <form onSubmit={submit} className="space-y-6 rounded-3xl border border-brand-black/10 bg-white p-5 shadow-sm sm:p-8">
          <label className="block">
            <span className="mb-2 block text-[9px] uppercase tracking-widest text-brand-black/40">{t('track.ref_label', '')}</span>
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="luxury-input w-full bg-[#FDFCFB] font-mono text-xs"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[9px] uppercase tracking-widest text-brand-black/40">{t('track.email', 'E-mail')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="luxury-input w-full bg-[#FDFCFB]"
              placeholder={t('track.email_ph', 'vous@exemple.com')}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="luxury-button flex w-full items-center justify-center gap-2 py-4 text-[10px] uppercase tracking-[0.25em] disabled:opacity-50"
          >
            <Search size={14} />
            {loading ? t('track.searching', 'Recherche…') : t('track.submit', 'Afficher le statut')}
          </button>
        </form>

        {result && (
          <div className="mt-10 space-y-6 rounded-3xl border border-brand-black/10 bg-white p-8 text-sm shadow-sm">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-brand-gold">{t('track.status', 'Statut')}</p>
              <p className="mt-1 font-serif text-xl">{statusLabel[result.status] || result.status}</p>
            </div>
            {(result.tracking_number || result.tracking_carrier) && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-gold">{t('track.shipping', 'Expédition')}</p>
                <p className="mt-1 text-brand-black/80">
                  {result.tracking_carrier && <span className="mr-2 font-medium">{result.tracking_carrier}</span>}
                  {result.tracking_number && (
                    <span className="font-mono text-xs tracking-wide">{result.tracking_number}</span>
                  )}
                </p>
              </div>
            )}
            <Link
              href={`/api/invoices/${result.id || orderId.trim()}?email=${encodeURIComponent(email.trim())}`}
              className="inline-block border-b border-brand-black/20 pb-1 text-[10px] uppercase tracking-widest text-brand-black/70 hover:border-brand-gold hover:text-brand-gold"
            >
              {t('track.invoice_pdf', '')}
            </Link>
          </div>
        )}

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-brand-black/35">
          <Link href="/" className="hover:text-brand-gold">
            {t('track.home', 'Retour à l’accueil')}
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}

export default function SuiviPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream pt-40 text-center font-serif">{t('common.loading_short', 'Chargement…')}</div>}>
      <SuiviForm />
    </Suspense>
  );
}
