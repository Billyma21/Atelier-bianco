'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  isOauthProviderDisabledError,
  OAUTH_GOOGLE_DISABLED_MESSAGE,
} from '@/lib/auth-oauth';

const SHOW_GOOGLE =
  typeof process.env.NEXT_PUBLIC_HIDE_GOOGLE_OAUTH === 'undefined' ||
  process.env.NEXT_PUBLIC_HIDE_GOOGLE_OAUTH !== 'true';

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const oauth = searchParams.get('oauth_error');
    const reason = searchParams.get('reason');
    if (oauth && reason) {
      try {
        const decoded = decodeURIComponent(reason.replace(/\+/g, ' '));
        setError(isOauthProviderDisabledError(decoded) ? t('auth.oauth_disabled_long', OAUTH_GOOGLE_DISABLED_MESSAGE) : decoded);
      } catch {
        setError(reason);
      }
    }
  }, [searchParams, t]);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(
          isOauthProviderDisabledError(oauthError.message)
            ? t('auth.oauth_disabled_long', OAUTH_GOOGLE_DISABLED_MESSAGE)
            : oauthError.message
        );
        setGoogleLoading(false);
      }
    } catch {
      setError(t('auth.google_start_error', "Impossible de démarrer la connexion Google. Réessayez ou utilisez l'email."));
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const bootstrapAdmin = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
      if (bootstrapAdmin && email.trim().toLowerCase() === bootstrapAdmin) {
        useToast.getState().show(t('auth.register_success_admin', ''), 'success');
        router.push('/admin/login');
      } else {
        useToast.getState().show(t('auth.register_success', ''), 'success');
        router.push('/auth/login');
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="page-content flex min-h-[60dvh] items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 shadow-sm border border-brand-black/5">
          <h1 className="text-3xl font-serif text-center mb-8">{t('auth.register_title', '')}</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-4 mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">{t('auth.full_name_label', '')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">{t('auth.email', 'E-mail')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">{t('auth.password', '')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-4 mt-4 disabled:opacity-50"
            >
              {loading ? t('auth.register_loading', '') : t('auth.register_submit', '')}
            </button>
          </form>

          {SHOW_GOOGLE && (
            <>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-brand-black/10" />
                <span className="text-[10px] uppercase tracking-widest text-brand-black/40">{t('auth.or', '')}</span>
                <div className="h-px flex-1 bg-brand-black/10" />
              </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleLogin}
                className="mt-6 flex w-full items-center justify-center gap-3 border border-brand-black/10 py-4 text-xs uppercase tracking-widest transition-all hover:bg-brand-black/5 disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? t('auth.redirecting', '') : t('auth.signin_google', '')}
              </button>

              <p className="mt-4 text-center text-[10px] leading-relaxed text-brand-black/45">
                {t('auth.supabase_google_short', '')}
              </p>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-brand-black/40 font-sans">
              {t('auth.have_account', '')}{' '}
              <Link href="/auth/login" className="text-brand-gold hover:underline">
                {t('auth.login_link', '')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function RegisterPageInner() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream pt-40 text-center font-serif">{t('common.loading_short', '')}</div>}>
      <RegisterForm />
    </Suspense>
  );
}

export default function RegisterPage() {
  return <RegisterPageInner />;
}
