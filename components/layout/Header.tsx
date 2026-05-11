'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import CartDrawer from '@/components/cart/CartDrawer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchModal from '@/components/layout/SearchModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { settings } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.perfumes', 'Parfums'), href: '/parfums' },
    { name: t('nav.maison', 'La Maison'), href: '/la-maison' },
    { name: t('nav.account', 'Mon Compte'), href: '/mon-compte' },
  ];

  const header = settings?.header;
  const defaultLogo = '/images/logo-atelier-bianco-wordmark.png';
  const logoImageSrc = header?.logo_url?.trim() || defaultLogo;
  const logoLabel = (header?.logo_text?.trim() || 'Atelier Bianco').replace(/\s+/g, ' ');

  return (
    <>
      {settings?.header?.show_announcement && (
        <div className="bg-brand-black text-brand-cream text-[10px] uppercase tracking-widest py-2 text-center fixed top-0 w-full z-[60]">
          {settings.header?.announcement_text}
        </div>
      )}
      <header
        className={cn(
          'fixed left-0 w-full z-50 transition-all duration-500 px-6 py-4 md:px-12 md:py-6',
          settings?.header?.show_announcement ? 'top-8' : 'top-0',
          isScrolled ? 'bg-brand-cream/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-brand-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] uppercase tracking-[0.2em] font-sans hover:text-brand-gold transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Wordmark noir sur fond transparent — logo_url Supabase ou PNG local */}
          <Link
            href="/"
            aria-label={`${logoLabel} — accueil`}
            className="absolute left-1/2 -translate-x-1/2 flex max-w-[min(320px,82vw)] items-center justify-center"
          >
            <Image
              src={logoImageSrc}
              alt=""
              width={280}
              height={48}
              className="h-8 w-auto max-w-[min(260px,78vw)] object-contain object-center md:h-10"
              priority
              aria-hidden
              unoptimized={logoImageSrc.startsWith('/')}
              referrerPolicy={logoImageSrc.startsWith('/') ? undefined : 'no-referrer'}
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:block hover:text-brand-gold transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/auth/login" className="hover:text-brand-gold transition-colors">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-brand-gold transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-brand-cream border-t border-brand-black/5 p-8 md:hidden"
            >
              <nav className="flex flex-col space-y-6 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-xs uppercase tracking-widest font-sans"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
