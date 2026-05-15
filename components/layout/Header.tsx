'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import CartDrawer from '@/components/cart/CartDrawer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchModal from '@/components/layout/SearchModal';
import { useCart } from '@/store/useCart';

const SCROLL_THRESHOLD_PX = 8;
const DEFAULT_LOGO_PATH = '/images/logo-atelier-bianco-wordmark.png';
const LOGO_INTRINSIC = { w: 670, h: 75 } as const;

type NavItem = { name: string; href: string };

function IconAction({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'touch-target rounded-full text-brand-black transition-colors duration-300 hover:text-brand-gold active:scale-[0.96]',
        className
      )}
    >
      {children}
    </button>
  );
}

const navLinkClass =
  'group relative inline-flex py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-brand-black/75 transition-colors duration-300 hover:text-brand-black md:text-[9px] md:tracking-[0.22em] lg:text-[10px]';

const navUnderline =
  'absolute bottom-0 left-0 h-px w-0 bg-brand-gold transition-[width] duration-500 ease-out group-hover:w-full';

function NavLink({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} className={navLinkClass}>
      {item.name}
      <span className={navUnderline} aria-hidden />
    </Link>
  );
}

function HeaderLogo({
  label,
  src,
  scrolled,
  homeSuffix,
}: {
  label: string;
  src: string;
  scrolled: boolean;
  homeSuffix: string;
}) {
  const external = src.startsWith('http://') || src.startsWith('https://');
  const serveRaw = src.startsWith('/') || external;

  return (
    <Link
      href="/"
      aria-label={`${label} — ${homeSuffix}`}
      className={cn(
        'relative z-[2] flex max-w-[min(100%,18rem)] shrink-0 items-center outline-none',
        'ring-brand-gold/40 transition-opacity duration-300 hover:opacity-[0.92] focus-visible:ring-2',
        'sm:max-w-[min(100%,22rem)] md:max-w-[min(100%,26rem)]'
      )}
    >
      <Image
        src={src}
        alt=""
        width={LOGO_INTRINSIC.w}
        height={LOGO_INTRINSIC.h}
        priority
        quality={100}
        className={cn(
          'h-[1.5rem] w-auto object-contain object-left sm:h-[1.65rem]',
          scrolled ? 'md:h-8 lg:h-[2.1rem]' : 'md:h-[2.05rem] lg:h-9'
        )}
        sizes="(max-width: 768px) 240px, 320px"
        unoptimized={serveRaw}
        referrerPolicy={external ? 'no-referrer' : undefined}
        aria-hidden
      />
    </Link>
  );
}

function NavList({ links, navAria, className }: { links: NavItem[]; navAria: string; className?: string }) {
  return (
    <nav aria-label={navAria} className={className}>
      {links.map((link) => (
        <NavLink key={link.href} item={link} />
      ))}
    </nav>
  );
}

function ActionCluster({
  cartCount,
  onSearch,
  onCart,
  t,
}: {
  cartCount: number;
  onSearch: () => void;
  onCart: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  const cartAria =
    cartCount > 0
      ? cartCount > 1
        ? t('header.aria.cart_items_plural', 'Panier, {count} articles').replace('{count}', String(cartCount))
        : t('header.aria.cart_items', 'Panier, {count} article').replace('{count}', String(cartCount))
      : t('header.aria.cart_open', 'Ouvrir le panier');

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">
      <LanguageSwitcher />
      <IconAction label={t('header.aria.search', 'Rechercher')} onClick={onSearch}>
        <Search size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
      </IconAction>
      <Link
        href="/auth/login"
        aria-label={t('header.aria.account', 'Mon compte')}
        className="touch-target rounded-full text-brand-black transition-colors duration-300 hover:text-brand-gold active:scale-[0.96]"
      >
        <User size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
      </Link>
      <button
        type="button"
        onClick={onCart}
        aria-label={cartAria}
        className="touch-target relative rounded-full text-brand-black transition-colors duration-300 hover:text-brand-gold active:scale-[0.96]"
      >
        <ShoppingBag size={20} strokeWidth={1.5} className="sm:h-[22px] sm:w-[22px]" />
        {cartCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 font-sans text-[9px] font-bold leading-none text-white shadow-sm tabular-nums">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { settings } = useTheme();
  const { t, language } = useLanguage();
  const cartCount = useCart((s) => s.totalItems());

  const showAnnouncement = Boolean(settings?.header?.show_announcement);

  const navLinks = useMemo<NavItem[]>(
    () => [
      { name: t('nav.perfumes', 'Parfums'), href: '/parfums' },
      { name: t('nav.maison', 'La Maison'), href: '/la-maison' },
      { name: t('nav.account', 'Mon Compte'), href: '/mon-compte' },
    ],
    [t]
  );

  const header = settings?.header;
  const logoSrc = header?.logo_url?.trim() || DEFAULT_LOGO_PATH;
  const logoLabel = (header?.logo_text?.trim() || 'Atelier Bianco').replace(/\s+/g, ' ');

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <>
      {showAnnouncement ? (
        <div
          data-announcement="true"
          className="fixed left-0 top-0 z-[60] w-full max-w-[100vw] bg-brand-black py-2 text-center pt-[env(safe-area-inset-top,0px)]"
        >
          <p className="truncate px-4 text-[9px] uppercase tracking-[0.2em] text-brand-cream sm:text-[10px]">
            {language === 'it'
              ? settings?.header?.announcement_text_it?.trim() || t('home.promo_banner')
              : settings?.header?.announcement_text?.trim() || t('home.promo_banner')}
          </p>
        </div>
      ) : null}

      <header
        data-site-header
        className={cn(
          'fixed left-0 z-50 w-full max-w-[100vw] transition-[padding,background-color,box-shadow,backdrop-filter] duration-500 ease-out',
          showAnnouncement ? 'top-8' : 'top-0',
          'pt-[max(0.375rem,env(safe-area-inset-top,0px))]',
          scrolled
            ? 'bg-brand-cream/[0.98] shadow-[0_1px_0_rgba(10,10,10,0.05)] backdrop-blur-xl'
            : 'bg-brand-cream/[0.94] backdrop-blur-md md:bg-brand-cream/[0.88] md:backdrop-blur-lg',
        )}
      >
        <div className="relative mx-auto w-full max-w-screen-2xl px-4 sm:px-5 md:px-6 lg:px-12">
          {/* Ligne principale : logo (accueil) + actions — jamais pointer-events:none */}
          <div className="flex min-h-[2.75rem] items-center justify-between gap-3 py-2 md:min-h-[3.25rem] md:py-2.5 lg:min-h-[3.5rem]">
            <HeaderLogo
              label={logoLabel}
              src={logoSrc}
              scrolled={scrolled}
              homeSuffix={t('header.logo_suffix', 'accueil')}
            />

            {/* Navigation desktop : centrée entre deux blocs */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:flex md:justify-center">
              <div className="pointer-events-auto">
                <NavList
                  links={navLinks}
                  navAria={t('header.aria.nav_main', 'Navigation principale')}
                  className="flex items-center gap-6 lg:gap-10"
                />
              </div>
            </div>

            <ActionCluster
              cartCount={cartCount}
              onSearch={() => setSearchOpen(true)}
              onCart={() => setCartOpen(true)}
              t={t}
            />
          </div>

          {/* Mobile / tablette : liens visibles, sans hamburger */}
          <div className="border-t border-brand-black/[0.07] md:hidden">
            <NavList
              links={navLinks}
              navAria={t('header.aria.nav_main', 'Navigation principale')}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-2.5 sm:gap-x-8"
            />
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
