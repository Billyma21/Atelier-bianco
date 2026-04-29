'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          setError('La connexion Google n&apos;est pas encore activée dans la configuration Supabase. Veuillez utiliser l&apos;email et le mot de passe.');
        } else {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError('Erreur lors de la connexion Google. Veuillez réessayer.');
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
      if (email === 'Kenzy@ab.be') {
        useToast.getState().show(
          'Inscription réussie ! Un email de confirmation a été envoyé. Veuillez le confirmer pour activer votre accès administrateur. (Vérifiez aussi vos spams)',
          'success'
        );
        router.push('/admin/login');
      } else {
        useToast.getState().show(
          'Inscription réussie ! Veuillez vérifier votre boîte de réception pour confirmer votre email avant de vous connecter.',
          'success'
        );
        router.push('/auth/login');
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <div className="pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 shadow-sm border border-brand-black/5">
          <h1 className="text-3xl font-serif text-center mb-8">Créer un compte</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-4 mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Nom Complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-sans mb-2 block">Mot de passe</label>
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
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-brand-black/10" />
            <span className="text-[10px] uppercase tracking-widest text-brand-black/40">Ou</span>
            <div className="flex-1 h-px bg-brand-black/10" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 mt-6 border border-brand-black/10 flex items-center justify-center gap-3 hover:bg-brand-black/5 transition-all text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continuer avec Google
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-brand-black/40 font-sans">
              Déjà un compte ? <Link href="/auth/login" className="text-brand-gold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
