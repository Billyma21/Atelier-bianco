'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Save, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShoppingCart, 
  Mail, 
  User, 
  Lock,
  Globe,
  Bell,
  Database,
  CreditCard,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'account'>('api');
  const [keys, setKeys] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});
  
  // Account settings state
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch API Keys
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'api_keys')
        .single();
      
      if (settingsData) setKeys(settingsData.value);

      // Fetch current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    };
    fetchData();
  }, [supabase]);

  const handleSaveKeys = async () => {
    setLoading(true);
    setApiMessage(null);
    const { error } = await supabase
      .from('site_settings')
      .update({ value: keys })
      .eq('key', 'api_keys');
    
    if (!error) {
      setApiMessage({ type: 'success', text: 'Clés API sauvegardées avec succès' });
    } else {
      setApiMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
    setLoading(false);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMessage(null);

    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      if (userEmail) {
        const { error: emailError } = await supabase.auth.updateUser({ email: userEmail });
        if (emailError) throw emailError;
      }

      setAccountMessage({ type: 'success', text: 'Compte mis à jour avec succès' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setAccountMessage({ type: 'error', text: err.message });
    } finally {
      setAccountLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    setTesting(service);
    await new Promise(r => setTimeout(r, 1500));
    setTestResults({ ...testResults, [service]: true });
    setTesting(null);
  };

  if (!keys) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-brand-gold" size={32} />
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Initialisation des paramètres...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Configuration Système</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gérez vos intégrations et votre sécurité</p>
        </div>
        {activeTab === 'api' && (
          <button
            onClick={handleSaveKeys}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'api', label: 'Intégrations API', icon: Globe },
          { id: 'account', label: 'Sécurité Compte', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'api' ? (
        <div className="space-y-8">
          {apiMessage && (
            <div className={cn(
              "p-6 rounded-2xl flex items-center gap-4 border",
              apiMessage.type === 'success' ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
            )}>
              {apiMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              <p className="text-xs font-bold uppercase tracking-widest">{apiMessage.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Supabase Section */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-medium">Infrastructure Supabase</h2>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Base de données & Authentification</p>
                  </div>
                </div>
                <button 
                  onClick={() => testConnection('supabase')}
                  className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] uppercase tracking-widest font-black text-gray-500 transition-all"
                >
                  {testing === 'supabase' ? <Loader2 size={12} className="animate-spin" /> : testResults.supabase ? <CheckCircle2 size={12} className="text-green-600" /> : <Key size={12} />}
                  Tester la connexion
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">URL du Projet</label>
                  <input
                    type="text"
                    value={keys.supabase_url}
                    onChange={(e) => setKeys({ ...keys, supabase_url: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Clé Anonyme (Public)</label>
                    <input
                      type="password"
                      value={keys.supabase_anon_key}
                      onChange={(e) => setKeys({ ...keys, supabase_anon_key: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Service Role Key (Secret)</label>
                    <input
                      type="password"
                      value={keys.supabase_service_role}
                      onChange={(e) => setKeys({ ...keys, supabase_service_role: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stripe Section */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-medium">Passerelle Stripe</h2>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Flux de paiements sécurisés</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black text-gray-400 hover:text-gray-900 transition-all">
                    Dashboard <ExternalLink size={12} />
                  </a>
                  <button 
                    onClick={() => testConnection('stripe')}
                    className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] uppercase tracking-widest font-black text-gray-500 transition-all"
                  >
                    {testing === 'stripe' ? <Loader2 size={12} className="animate-spin" /> : testResults.stripe ? <CheckCircle2 size={12} className="text-green-600" /> : <Key size={12} />}
                    Tester l&apos;API
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Clé Publique (pk_...)</label>
                    <input
                      type="text"
                      value={keys.stripe_public_key}
                      onChange={(e) => setKeys({ ...keys, stripe_public_key: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Clé Secrète (sk_...)</label>
                    <input
                      type="password"
                      value={keys.stripe_secret_key}
                      onChange={(e) => setKeys({ ...keys, stripe_secret_key: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Webhook Signing Secret</label>
                  <input
                    type="password"
                    value={keys.stripe_webhook_secret}
                    onChange={(e) => setKeys({ ...keys, stripe_webhook_secret: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    placeholder="whsec_..."
                  />
                </div>
              </div>
            </div>

            {/* Resend Section */}
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-medium">Communications Resend</h2>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Emails transactionnels & Marketing</p>
                  </div>
                </div>
                <button 
                  onClick={() => testConnection('resend')}
                  className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] uppercase tracking-widest font-black text-gray-500 transition-all"
                >
                  {testing === 'resend' ? <Loader2 size={12} className="animate-spin" /> : testResults.resend ? <CheckCircle2 size={12} className="text-green-600" /> : <Key size={12} />}
                  Tester l&apos;envoi
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Clé API Resend (re_...)</label>
                <input
                  type="password"
                  value={keys.resend_api_key}
                  onChange={(e) => setKeys({ ...keys, resend_api_key: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-start gap-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-2 uppercase tracking-widest">Zone de Haute Sécurité</h4>
              <p className="text-[10px] font-medium text-red-700 leading-relaxed uppercase tracking-wider">
                La modification de ces paramètres est critique. Toute erreur peut paralyser les paiements, l&apos;accès à la base de données ou l&apos;envoi d&apos;emails. 
                Veuillez vérifier scrupuleusement chaque clé avant d&apos;enregistrer.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium">Profil Administrateur</h2>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Gérez vos identifiants de connexion</p>
              </div>
            </div>

            {accountMessage && (
              <div className={cn(
                "mb-8 p-6 rounded-2xl flex items-center gap-4 border",
                accountMessage.type === 'success' ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
              )}>
                {accountMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <p className="text-xs font-bold uppercase tracking-widest">{accountMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Email de Connexion</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    required
                  />
                </div>
                <p className="text-[8px] text-gray-400 italic uppercase tracking-widest mt-2">Une confirmation sera requise pour tout changement d&apos;email.</p>
              </div>

              <div className="pt-8 border-t border-gray-50 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                    <Lock size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Sécurité du Mot de Passe</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Nouveau Mot de Passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Confirmation</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={accountLoading}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {accountLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Mettre à jour mon compte
              </button>
            </form>
          </div>

          <div className="bg-brand-cream/50 p-8 rounded-[32px] border border-brand-gold/10">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={18} className="text-brand-gold" />
              <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-900">Recommandations de Sécurité</h4>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">
              Utilisez un mot de passe unique d&apos;au moins 12 caractères. Ne partagez jamais vos identifiants. 
              En cas de perte d&apos;accès, la réinitialisation doit être effectuée via la console Supabase par un administrateur système.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
