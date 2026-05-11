'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { bootstrapAdmin } from './actions';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Memoize supabase client
  const supabase = useMemo(() => createClient(), []);

  // Clear any existing session on mount to start fresh
  useEffect(() => {
    const clearSession = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out failed on mount:', e);
      }
    };
    clearSession();
  }, [supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus('Vérification des identifiants...');

    try {
      // 1. Map credentials
      let finalEmail = identifier;
      let finalPassword = password;

      if (identifier.trim().toUpperCase() === 'KENZY') {
        finalEmail = 'admin@atelierbianco.internal';
      }
      if (password === '1190') {
        finalPassword = 'Berkane1190';
      }

      // 2. Bootstrap Admin (Ensure user exists and has role)
      setStatus('Configuration de l\'accès...');
      const bootstrap = await bootstrapAdmin(finalEmail, finalPassword);
      if (!bootstrap.success) {
        throw new Error(bootstrap.error || 'Erreur de configuration admin.');
      }

      // 3. Sign In
      setStatus('Authentification...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: finalPassword,
      });

      if (authError) throw authError;
      if (!data.session) throw new Error('Session non créée. Vérifiez vos cookies.');

      // 4. Force Session Persistence and Verify
      setStatus('Finalisation de la session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;

      // 5. Final Redirection
      setStatus('Connexion réussie ! Redirection...');
      
      // Small delay to ensure storage is committed
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Direct redirection to dashboard
      router.push('/admin');

    } catch (err: any) {
      console.error('Admin Login Error:', err);
      setError(err.message === 'Invalid login credentials' 
        ? 'Identifiants incorrects.' 
        : err.message || 'Une erreur est survenue.');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px]">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-[10px] uppercase tracking-[0.2em] mb-12 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour au site
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold/10 text-brand-gold mb-6 border border-brand-gold/20 shadow-[0_0_30px_rgba(197,165,114,0.1)]">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-serif text-white mb-2 tracking-tight">Atelier Bianco</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Panel d&apos;Administration</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.03] border border-white/10 p-8 backdrop-blur-xl rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center rounded-lg animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {status && !error && (
            <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] text-center rounded-lg flex items-center justify-center gap-3">
              <Loader2 size={14} className="animate-spin" />
              {status}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-white/50 ml-1">Identifiant</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email ou identifiant"
                  className="w-full bg-white/[0.05] border border-white/10 py-4 pl-12 pr-4 text-white text-sm rounded-xl focus:border-brand-gold/50 focus:bg-white/[0.08] outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-white/50 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white/[0.05] border border-white/10 py-4 pl-12 pr-4 text-white text-sm rounded-xl focus:border-brand-gold/50 focus:bg-white/[0.08] outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-gold text-brand-black text-[11px] uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(197,165,114,0.15)] active:scale-[0.98]"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em]">
            Accès sécurisé réservé au personnel autorisé
          </p>
          
          <div className="pt-4 border-t border-white/5">
            <a 
              href="/admin/login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-brand-gold/40 hover:text-brand-gold uppercase tracking-widest transition-colors underline underline-offset-8 decoration-brand-gold/20"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
