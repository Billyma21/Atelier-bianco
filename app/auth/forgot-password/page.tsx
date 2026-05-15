'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';
import { getSiteUrl } from '@/lib/site-url';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = `${getSiteUrl()}/auth/callback?next=/mon-compte`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="page-content flex min-h-[60dvh] items-center justify-center">
        <div className="w-full max-w-md border border-brand-black/5 bg-white p-10 shadow-sm">
          <h1 className="mb-4 text-center font-serif text-3xl">{t('auth.forgot_title', '')}</h1>
          <p className="mb-8 text-center font-sans text-xs leading-relaxed text-brand-black/55">{t('auth.forgot_intro', '')}</p>

          {error && (
            <div className="mb-6 border border-red-100 bg-red-50 p-4 text-xs text-red-600" role="alert">
              {error}
            </div>
          )}

          {sent ? (
            <div className="rounded-2xl border border-green-100 bg-green-50/80 p-6 text-center text-sm text-green-900">
              <p className="font-medium">{t('auth.forgot_sent_title', '')}</p>
              <p className="mt-2 text-xs opacity-90">{t('auth.forgot_sent_body', '')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block font-sans text-[10px] uppercase tracking-widest">{t('auth.email', 'E-mail')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input"
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading} className="luxury-button w-full py-4 disabled:opacity-50">
                {loading ? t('auth.forgot_loading', '') : t('auth.forgot_submit', '')}
              </button>
            </form>
          )}

          <p className="mt-8 text-center font-sans text-xs text-brand-black/40">
            <Link href="/auth/login" className="text-brand-gold hover:underline">
              {t('auth.back_login', '')}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
