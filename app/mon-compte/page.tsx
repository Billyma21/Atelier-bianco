'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  LogOut, 
  ChevronRight,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen bg-brand-cream flex items-center justify-center font-serif italic">Chargement...</div>;

  const menuItems = [
    { name: 'Mes Commandes', icon: ShoppingBag, href: '/mon-compte/commandes', desc: 'Suivez vos achats et factures' },
    { name: 'Mes Adresses', icon: MapPin, href: '#', desc: 'Gérez vos lieux de livraison' },
    { name: 'Ma Liste d\'Envies', icon: Heart, href: '#', desc: 'Vos parfums favoris' },
    { name: 'Paramètres', icon: Settings, href: '#', desc: 'Informations personnelles' },
  ];

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="flex items-center gap-4 p-6 bg-white border border-brand-black/5">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold font-serif text-xl">
                {profile?.full_name?.[0] || profile?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{profile?.full_name || 'Client Atelier Bianco'}</p>
                <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between p-4 bg-white border border-brand-black/5 hover:border-brand-gold transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} strokeWidth={1.5} className="text-brand-black/40 group-hover:text-brand-gold transition-colors" />
                    <span className="text-xs uppercase tracking-widest">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="text-brand-black/20" />
                </Link>
              ))}
              <button 
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                className="w-full flex items-center gap-3 p-4 text-red-600/60 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest">Déconnexion</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-12">
            <div>
              <h1 className="text-4xl font-serif mb-4">Bonjour, {profile?.full_name?.split(' ')[0] || 'Cher Client'}</h1>
              <p className="text-sm text-brand-black/40 uppercase tracking-widest">Bienvenue dans votre espace personnel Atelier Bianco</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="p-8 bg-white border border-brand-black/5 hover:shadow-xl transition-all group"
                >
                  <item.icon size={32} strokeWidth={1} className="text-brand-gold mb-6" />
                  <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                  <p className="text-xs text-brand-black/40 font-sans">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
