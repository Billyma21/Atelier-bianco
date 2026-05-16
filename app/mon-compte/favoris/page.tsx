'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { Heart, Loader2 } from 'lucide-react';
import { normalizeProductSlug } from '@/lib/product-slug';
import { productDisplayFamily, productDisplayName } from '@/lib/i18n/db-locale';
import WishlistButton from '@/components/product/WishlistButton';
import { useWishlist } from '@/store/useWishlist';

type WishlistRow = {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    name_it?: string | null;
    slug: string;
    family?: string | null;
    family_it?: string | null;
    product_images?: { url: string; is_primary?: boolean; type?: string }[];
    product_variants?: { price: number; is_active?: boolean }[];
  } | null;
};

export default function AccountFavoritesPage() {
  const { t, language } = useLanguage();
  const supabase = createClient();
  const refreshWishlist = useWishlist((s) => s.refresh);
  const [rows, setRows] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNeedsLogin(true);
      setRows([]);
      setLoading(false);
      return;
    }

    setNeedsLogin(false);

    const { data, error } = await supabase
      .from('wishlists')
      .select(
        `
        id,
        product_id,
        products (
          id,
          name,
          name_it,
          slug,
          family,
          family_it,
          product_images ( url, is_primary, type ),
          product_variants ( price, is_active )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('favorites fetch:', error.message);
      setRows([]);
    } else {
      setRows((data as WishlistRow[]) ?? []);
    }

    await refreshWishlist();
    setLoading(false);
  };

  useEffect(() => {
    void loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = rows.filter((r) => r.products?.id);

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-lg">
        <div className="mb-12">
          <h1 className="mb-4 font-serif text-4xl">{t('favorites.page_title', 'Ma liste d’envies')}</h1>
          <p className="text-sm uppercase tracking-widest text-brand-black/40">
            {t('favorites.subtitle', 'Vos créations préférées')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-brand-black/40">
            <Loader2 className="animate-spin" size={28} strokeWidth={1.5} />
          </div>
        ) : needsLogin ? (
          <div className="rounded-2xl border border-brand-black/10 bg-white p-10 text-center">
            <Heart className="mx-auto mb-6 text-brand-gold" size={32} strokeWidth={1} />
            <p className="mb-8 text-sm leading-relaxed text-brand-black/60">
              {t('favorites.login_prompt', 'Connectez-vous pour retrouver vos parfums favoris.')}
            </p>
            <Link href="/auth/login?next=%2Fmon-compte%2Ffavoris" className="luxury-button inline-flex justify-center px-10">
              {t('auth.sign_in_cta', 'Se connecter')}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-brand-black/10 bg-white p-10 text-center">
            <Heart className="mx-auto mb-6 text-brand-black/20" size={36} strokeWidth={1} />
            <p className="mb-8 text-sm leading-relaxed text-brand-black/60">
              {t(
                'favorites.empty',
                'Votre liste est vide. Explorez le catalogue et touchez le cœur sur vos créations préférées.'
              )}
            </p>
            <Link href="/parfums" className="luxury-button inline-flex justify-center px-10">
              {t('catalog.view_all', 'Voir le catalogue')}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {items.map((row) => {
              const p = row.products!;
              const slug = normalizeProductSlug(p.slug);
              const href = slug ? `/produits/${slug}` : '/parfums';
              const imgs = p.product_images ?? [];
              const img =
                imgs.find((x) => x.is_primary)?.url ||
                imgs.find((x) => x.type === 'packshot')?.url ||
                imgs[0]?.url ||
                '/images/why-packshot-hero.png';
              const variants = (p.product_variants ?? []).filter((v) => v.is_active !== false);
              const prices = variants.map((v) => Number(v.price)).filter((n) => n > 0);
              const min = prices.length ? Math.min(...prices) : 0;
              const max = prices.length ? Math.max(...prices) : 0;
              const displayName = productDisplayName(language, p);
              const displayFamily =
                productDisplayFamily(language, p).trim() || t('product.family_default');

              return (
                <li
                  key={row.id}
                  className="group overflow-hidden rounded-2xl border border-brand-black/8 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] bg-brand-black/5">
                    <Link href={href} className="absolute inset-0 block">
                      <Image
                        src={img}
                        alt={displayName}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized={img.startsWith('/')}
                      />
                    </Link>
                    <WishlistButton productId={p.id} className="absolute right-4 top-4 z-[2] bg-white/80 backdrop-blur-sm" />
                  </div>
                  <div className="p-6 text-center sm:text-left">
                    <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.35em] text-brand-gold">{displayFamily}</p>
                    <h2 className="mb-2 font-serif text-xl text-brand-black">{displayName}</h2>
                    <p className="mb-5 font-sans text-sm text-brand-black/60">
                      {min > 0
                        ? min === max
                          ? formatPrice(min)
                          : `${formatPrice(min)} — ${formatPrice(max)}`
                        : ''}
                    </p>
                    <Link href={href} className="luxury-button inline-flex w-full justify-center sm:w-auto sm:px-8">
                      {t('product.discover', 'Découvrir')}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-12">
          <Link
            href="/mon-compte"
            className="text-[10px] uppercase tracking-widest text-brand-black/45 underline-offset-4 hover:text-brand-gold"
          >
            ← {t('account.stub.back', 'Retour au compte')}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
