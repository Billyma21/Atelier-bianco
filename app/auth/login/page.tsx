'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  isOauthProviderDisabledError,
  OAUTH_GOOGLE_DISABLED_MESSAGE,
} from '@/lib/auth-oauth';
import GoogleOAuthSetupLinks from '@/components/auth/GoogleOAuthSetupLinks';

const SHOW_GOOGLE =
  typeof process.env.NEXT_PUBLIC_HIDE_GOOGLE_OAUTH === 'undefined' ||
  process.env.NEXT_PUBLIC_HIDE_GOOGLE_OAUTH !== 'true';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [oauthSetupHelp, setOauthSetupHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const oauth = searchParams.get('oauth_error');
    const reason = searchParams.get('reason');
    if (oauth && reason) {
      try {
        const decoded = decodeURIComponent(reason.replace(/\+/g, ' '));
        const disabled = isOauthProviderDisabledError(decoded);
        setOauthSetupHelp(disabled || searchParams.get('hint') === 'google_disabled');
        setError(
          disabled ? t('auth.oauth_disabled_long', OAUTH_GOOGLE_DISABLED_MESSAGE) : decoded
        );
      } catch {
        setError(reason);
        setOauthSetupHelp(false);
      }
    }
  }, [searchParams, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOauthSetupHelp(false);

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signError) {
      setError(signError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/mon-compte');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="page-content flex min-h-[60dvh] items-center justify-center">
        <div className="w-full max-w-md border border-brand-black/5 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="mb-8 text-center font-serif text-2xl sm:text-3xl">{t('auth.login_title', '')}</h1>

          {error && (
            <div className="mb-6 border border-red-100 bg-red-50 p-4 text-xs leading-relaxed text-red-600">
              {error}
              {oauthSetupHelp ? <GoogleOAuthSetupLinks /> : null}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block font-sans text-[10px] uppercase tracking-widest">{t('auth.email', 'E-mail')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[10px] uppercase tracking-widest">{t('auth.password', '')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input"
                required
              />
              <p className="mt-3 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="font-sans text-[10px] uppercase tracking-widest text-brand-black/45 hover:text-brand-gold"
                >
                  {t('auth.forgot_password', '')}
                </Link>
              </p>
            </div>
            <button type="submit" disabled={loading} className="luxury-button mt-4 w-full py-4 disabled:opacity-50">
              {loading ? t('auth.logging_in', '') : t('auth.sign_in_cta', '')}
            </button>
          </form>

          {SHOW_GOOGLE && (
            <>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-brand-black/10" />
                <span className="text-[10px] uppercase tracking-widest text-brand-black/40">{t('auth.or', '')}</span>
                <div className="h-px flex-1 bg-brand-black/10" />
              </div>

              <Link
                href="/api/auth/google"
                prefetch={false}
                className="mt-6 flex w-full items-center justify-center gap-3 border border-brand-black/10 py-4 text-xs uppercase tracking-widest transition-all hover:bg-brand-black/5"
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
                {t('auth.signin_google', '')}
              </Link>
            </>
          )}
          {!SHOW_GOOGLE && (
            <p className="mt-6 text-center text-[10px] text-brand-black/40">{t('auth.google_disabled_env', '')}</p>
          )}

          <div className="mt-8 text-center">
            <p className="font-sans text-xs text-brand-black/40">
              {t('auth.no_account', '')}{' '}
              <Link href="/auth/register" className="text-brand-gold hover:underline">
                {t('auth.create_account', '')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function LoginPageInner() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-cream pt-40 text-center font-serif text-brand-black/50">
          {t('common.loading_short', '')}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginPageInner />;
}
