'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { User, Mail, Shield, Save, Loader2, Key, Camera, CheckCircle2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import Image from 'next/image';

export default function AdminAccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
      full_name: formData.get('full_name') as string,
      username: formData.get('username') as string,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...payload });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      useToast.getState().show('Erreur: ' + error.message, 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center italic text-gray-400">Chargement du profil...</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-serif mb-3">Mon Compte Administrateur</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold font-sans">Gestion des informations personnelles et sécurité</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Sidebar Identity */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 text-center shadow-xl shadow-gray-100/50">
               <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer">
                  <div className="w-full h-full rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold text-4xl font-serif">
                     {profile?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                     <Camera size={24} />
                  </div>
               </div>
               <h2 className="text-xl font-serif mb-1">{profile?.full_name}</h2>
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">@{profile?.username || 'admin'}</p>
               <div className="px-4 py-1.5 bg-brand-gold text-white text-[8px] uppercase tracking-widest font-black rounded-full inline-flex items-center gap-2">
                  <Shield size={10} />
                  Administrateur
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-4">
               <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Statistiques</h3>
               <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Dernière connexion</span>
                  <span className="text-xs font-medium">Aujourd&apos;hui</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Rôle système</span>
                  <span className="text-xs font-medium">Super Admin</span>
               </div>
            </div>
         </div>

         {/* Form Settings */}
         <div className="lg:col-span-8">
            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm">
               <form onSubmit={handleSubmit} className="space-y-10">
                  <section className="space-y-8">
                     <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black border-b border-brand-gold/10 pb-4">Informations Générales</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nom Complet</label>
                           <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-gold transition-colors" size={18} />
                              <input name="full_name" type="text" defaultValue={profile?.full_name} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nom d&apos;utilisateur</label>
                           <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-sm">@</span>
                              <input name="username" type="text" defaultValue={profile?.username} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30" />
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-8">
                     <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black border-b border-brand-gold/10 pb-4">Sécurité & Identifiants</h3>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Adresse Email</label>
                           <div className="relative opacity-60">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input type="email" value={profile?.id ? "admin@atelierbianco.com" : ""} readOnly className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-6 text-sm cursor-not-allowed" />
                           </div>
                           <p className="text-[9px] text-gray-400 italic">L&apos;adresse email ne peut être modifiée pour des raisons de sécurité.</p>
                        </div>
                        <button type="button" className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-gold hover:text-brand-black transition-colors py-2 group">
                           <Key size={14} className="group-hover:rotate-12 transition-transform" />
                           Réinitialiser le mot de passe
                        </button>
                     </div>
                  </section>

                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                     {success ? (
                        <div className="flex items-center gap-3 text-green-500 text-[10px] uppercase tracking-widest font-bold animate-in fade-in slide-in-from-left-2">
                           <CheckCircle2 size={16} />
                           Profil mis à jour
                        </div>
                     ) : (
                        <div />
                     )}
                     <button 
                        type="submit" 
                        disabled={saving}
                        className="px-12 py-5 bg-gray-900 text-white rounded-[24px] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all flex items-center gap-4 disabled:opacity-50"
                     >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Enregistrer
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
    </div>
  );
}
