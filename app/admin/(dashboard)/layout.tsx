'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  LayoutDashboard, 
  Palette, 
  Package, 
  ShoppingCart, 
  Users, 
  Mail, 
  Settings, 
  LogOut,
  ChevronRight,
  Key,
  ShieldCheck,
  Bell,
  Search,
  Megaphone,
  User as UserIcon,
  ExternalLink,
  Globe,
  MessageSquare,
  HelpCircle,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Initialisation...');
  const [error, setError] = useState<string | null>(null);
  const isCheckingRef = React.useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const supabase = useMemo(() => createClient(), []);

  const menuItems = useMemo(() => [
    { name: t('admin.nav.dashboard', 'Dashboard'), icon: LayoutDashboard, href: '/admin' },
    { name: t('admin.nav.products', 'Produits'), icon: Package, href: '/admin/produits' },
    { name: t('admin.nav.collections', 'Collections'), icon: ShoppingCart, href: '/admin/collections' },
    { name: t('admin.nav.orders', 'Commandes'), icon: ShoppingCart, href: '/admin/commandes' },
    { name: t('admin.nav.reviews', 'Avis Clients'), icon: MessageSquare, href: '/admin/reviews' },
    { name: t('admin.nav.faq', 'FAQ & Support'), icon: HelpCircle, href: '/admin/faq' },
    { name: t('admin.nav.translations', 'Traductions'), icon: Languages, href: '/admin/translations' },
    { name: t('admin.nav.clients', 'Base Clients'), icon: Users, href: '/admin/clients' },
    { name: t('admin.nav.design', 'Design Studio'), icon: Palette, href: '/admin/design' },
    { name: t('admin.nav.marketing', 'Marketing'), icon: Megaphone, href: '/admin/marketing' },
    { name: t('admin.nav.notifications', 'Notifications'), icon: Bell, href: '/admin/notifications' },
    { name: t('admin.nav.account', 'Compte Admin'), icon: ShieldCheck, href: '/admin/compte' },
    { name: t('admin.nav.settings', 'Paramètres'), icon: Settings, href: '/admin/settings' },
  ], [t]);

  const bottomMenuItems = useMemo(() => [
    { name: t('admin.nav.view_site', 'Voir le Site'), icon: Globe, href: '/' },
  ], [t]);

  const currentMenuItem = menuItems.find(item => 
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );

  const checkAdmin = React.useCallback(async (force = false) => {
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    setError(null);
    
    try {
      setStatus('Vérification de la session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('Session introuvable. Veuillez vous reconnecter.');
        setIsAdmin(false);
        return;
      }

      // 1. Check hardcoded admin (User Email)
      if (session.user.email === 'bilyma21@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // 2. Check JWT metadata (Fastest)
      if (session.user.app_metadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // 3. Check database profile with retries
      let profile: { role?: string } | null = null;
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        const currentAttempt = i + 1;
        setStatus(`Vérification des droits (${currentAttempt}/${maxAttempts})...`);
        
        try {
          const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (data?.role === 'admin') {
            profile = data;
            break;
          }
          if (fetchError) console.warn(`Attempt ${currentAttempt} failed:`, fetchError.message);
        } catch (err) {}
        
        if (i < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 500 * (i + 1)));
        }
      }

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setError(`Accès refusé. Droits administrateur requis pour ${session.user.email}.`);
        setIsAdmin(false);
      }
    } catch (err: any) {
      setError(`Erreur système : ${err.message}`);
      setIsAdmin(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, [supabase]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-10 text-center font-sans">
        <div className="w-16 h-16 bg-red-50 flex items-center justify-center rounded-2xl mb-6 border border-red-100">
          <Key size={24} className="text-red-500" />
        </div>
        <h2 className="text-lg font-serif mb-2 text-gray-900 font-medium">Accès Restreint</h2>
        <p className="text-xs text-gray-500 mb-8 max-w-xs leading-relaxed uppercase tracking-wider">
          {error}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button 
            onClick={() => checkAdmin()}
            className="w-full py-3 bg-gray-900 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all rounded-lg font-bold"
          >
            Réessayer
          </button>
          <button 
            onClick={() => window.location.replace('/admin/login')}
            className="w-full py-3 border border-gray-200 text-gray-900 text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all rounded-lg font-bold"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={24} className="text-brand-gold animate-pulse" />
          </div>
        </div>
        <h1 className="font-serif text-xl mb-3 tracking-[0.2em] text-gray-900 uppercase">Atelier Bianco</h1>
        <div className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-medium animate-pulse">
          {status}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        <div className="p-10">
          <h1 className="text-2xl font-logo tracking-widest capitalize text-brand-black">Atelier Bianco</h1>
          <p className="text-[8px] uppercase tracking-[0.4em] text-brand-gold mt-2 font-bold">Administration</p>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between p-4 text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl transition-all group",
                  isActive 
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 1.5} className={cn(isActive ? "text-brand-gold" : "text-gray-400 group-hover:text-gray-900")} />
                  <span>{item.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 bg-brand-gold rounded-full shadow-[0_0_8px_#C9A96E]" />}
              </Link>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-gray-50">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 p-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all group"
              >
                <item.icon size={16} className="text-gray-400 group-hover:text-gray-900" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-8 mt-auto">
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/10">
                <UserIcon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">Kenzy Bianco</p>
                <p className="text-[8px] text-gray-400 uppercase tracking-widest">Propriétaire</p>
              </div>
            </div>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
            >
              <LogOut size={14} strokeWidth={2} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">
              <Link href="/admin" className="hover:text-gray-900 transition-colors">Admin</Link>
              <ChevronRight size={10} />
              <span className="text-gray-900">{currentMenuItem?.name || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="RECHERCHER..." 
                className="bg-gray-50 border-none rounded-full py-2.5 pl-12 pr-6 text-[9px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 w-64 transition-all"
              />
            </div>
            <button className="relative text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-bold">3</span>
            </button>
          </div>
        </header>

        <main className="p-12 flex-1">
          {children}
        </main>

        <footer className="px-12 py-8 border-t border-gray-100 text-center">
          <p className="text-[9px] text-gray-300 uppercase tracking-[0.4em]">
            &copy; 2024 Atelier Bianco &mdash; Système de Gestion de Luxe
          </p>
        </footer>
      </div>
    </div>
  );
}
