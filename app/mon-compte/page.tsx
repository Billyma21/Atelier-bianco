'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShoppingBag, MapPin, Heart, LogOut, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AccountDashboard() {
  const [profile, setProfile] = useState<{ full_name?: string | null; email?: string | null; role?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLanguage();

  const menuItems = [
    { nameKey: 'account.menu_orders', nameFb: 'Mes commandes', icon: ShoppingBag, href: '/mon-compte/commandes', descKey: 'account.menu_orders_desc', descFb: 'Suivez vos achats et factures' },
    { nameKey: 'account.menu_addresses', nameFb: 'Mes adresses', icon: MapPin, href: '/mon-compte/adresses', descKey: 'account.menu_addresses_desc', descFb: 'Gérez vos lieux de livraison' },
    { nameKey: 'account.menu_wishlist', nameFb: 'Ma liste d’envies', icon: Heart, href: '/mon-compte/favoris', descKey: 'account.menu_wishlist_desc', descFb: 'Vos parfums favoris' },
    { nameKey: 'account.menu_settings', nameFb: 'Paramètres', icon: Settings, href: '/mon-compte/parametres', descKey: 'account.menu_settings_desc', descFb: 'Informations personnelles' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream font-serif italic">
        {t('common.loading', 'Chargement…')}
      </div>
    );
  }

  const first = profile?.full_name?.split(' ')[0];
  const guest = t('account.guest_name', 'cher client');
  const titleName = first || guest;
  const titleNameCap = titleName.charAt(0).toUpperCase() + titleName.slice(1);

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-xl">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row">
          <aside className="w-full space-y-8 md:w-64">
            <div className="flex items-center gap-4 border border-brand-black/5 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 font-serif text-xl text-brand-gold">
                {profile?.full_name?.[0] || profile?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{profile?.full_name || t('account.client_default', 'Client Atelier Bianco')}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand-black/40">{profile?.role}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between border border-brand-black/5 bg-white p-4 transition-all hover:border-brand-gold"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} strokeWidth={1.5} className="text-brand-black/40 transition-colors group-hover:text-brand-gold" />
                    <span className="text-xs uppercase tracking-widest">{t(item.nameKey, item.nameFb)}</span>
                  </div>
                  <ChevronRight size={14} className="text-brand-black/20" />
                </Link>
              ))}
              <button
                type="button"
                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                className="flex w-full items-center gap-3 p-4 text-red-600/60 transition-colors hover:text-red-600"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest">{t('account.logout', 'Déconnexion')}</span>
              </button>
            </nav>
          </aside>

          <div className="flex-1 space-y-12">
            <div>
              <h1 className="mb-4 font-serif text-4xl">{t('account.greeting', 'Bonjour, {name}').replace('{name}', titleNameCap)}</h1>
              <p className="text-sm uppercase tracking-widest text-brand-black/40">{t('account.welcome_line', '')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="group border border-brand-black/5 bg-white p-8 transition-all hover:shadow-xl">
                  <item.icon size={32} strokeWidth={1} className="mb-6 text-brand-gold" />
                  <h3 className="mb-2 font-serif text-xl">{t(item.nameKey, item.nameFb)}</h3>
                  <p className="font-sans text-xs text-brand-black/40">{t(item.descKey, item.descFb)}</p>
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
