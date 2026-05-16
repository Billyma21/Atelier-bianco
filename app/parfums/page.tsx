'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { normalizeProductSlug } from '@/lib/product-slug';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  MASAMVNE_DESCRIPTION_FR,
  MASAMVNE_DESCRIPTION_IT,
  MASAMVNE_SHORT_DESC_FR,
  MASAMVNE_SHORT_DESC_IT,
  WHY_DESCRIPTION_FR,
  WHY_DESCRIPTION_IT,
  WHY_SHORT_DESC_FR,
  WHY_SHORT_DESC_IT,
} from '@/lib/brand-copy';
import { productDisplayName } from '@/lib/i18n/db-locale';

export type CatalogCollection = {
  id: string;
  name: string;
  name_it?: string | null;
  slug: string;
  sort_order?: number | null;
};

const MOCK_COLLECTION_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function productBelongsToCollection(
  product: any,
  collectionId: string | 'all',
  collectionSlug: string | null
) {
  if (collectionId === 'all') return true;
  const links = product.product_collections as
    | { collection_id?: string; collections?: { id?: string; slug?: string } }[]
    | undefined;
  if (links?.length) {
    return links.some(
      (pc) =>
        pc.collection_id === collectionId ||
        pc.collections?.id === collectionId ||
        (!!collectionSlug && pc.collections?.slug === collectionSlug)
    );
  }
  // Liaisons absentes (repli vitrine, anciennes données) : WHY / MASAMVNE pour Alter Egos
  if (collectionSlug === 'alter-egos') {
    const s = normalizeProductSlug(String(product.slug ?? ''));
    return s === 'why' || s === 'masamvne' || s === 'masamune';
  }
  return false;
}

const SHOW_CATALOG_MOCK =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_CATALOG_MOCK === 'true';

/**
 * Données fictives du catalogue : uniquement si NEXT_PUBLIC_CATALOG_DEV_FALLBACK=true.
 * Sans cette variable, le catalogue lit toujours Supabase (comme en prod) — configurez .env.local.
 */
const CATALOG_DEV_DEMO =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CATALOG_DEV_FALLBACK === 'true';

function mockPc(collectionId: string) {
  return [
    {
      collection_id: collectionId,
      collections: {
        id: collectionId,
        name: 'Alter Egos',
        name_it: 'Alter Egos',
        slug: 'alter-egos',
        sort_order: 0,
      },
    },
  ];
}

function getMockCatalogProducts(collectionId: string = MOCK_COLLECTION_ID) {
  return [
    {
      id: 'mock-why',
      name: 'WHY',
      name_it: 'WHY',
      slug: 'why',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      price: 219,
      image: '/images/why/why-image-une.png',
      status: 'active',
      short_desc: WHY_SHORT_DESC_FR,
      short_desc_it: WHY_SHORT_DESC_IT,
      description: WHY_DESCRIPTION_FR,
      description_it: WHY_DESCRIPTION_IT,
      product_images: [
        { url: '/images/why/why-image-une.png', is_primary: true, type: 'packshot' },
        { url: '/images/why/why-hero-dark.png', is_primary: false, type: 'editorial' },
      ],
      product_variants: [
        { price: 219, size_ml: 50 },
        { price: 319, size_ml: 100 },
      ],
      product_collections: mockPc(collectionId),
    },
    {
      id: 'mock-masamvne',
      name: 'MASAMVNE',
      name_it: 'MASAMVNE',
      slug: 'masamvne',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      price: 209,
      image: '/images/masamvne/masamvne-image-une.png',
      status: 'active',
      short_desc: MASAMVNE_SHORT_DESC_FR,
      short_desc_it: MASAMVNE_SHORT_DESC_IT,
      description: MASAMVNE_DESCRIPTION_FR,
      description_it: MASAMVNE_DESCRIPTION_IT,
      product_images: [
        { url: '/images/masamvne/masamvne-image-une.png', is_primary: true, type: 'packshot' },
        { url: '/images/masamvne/masamvne-hero-dark.png', is_primary: false, type: 'editorial' },
      ],
      product_variants: [
        { price: 209, size_ml: 50 },
        { price: 299, size_ml: 100 },
      ],
      product_collections: mockPc(collectionId),
    },
  ];
}

const MOCK_COLLECTION_ROW: CatalogCollection = {
  id: MOCK_COLLECTION_ID,
  name: 'Alter Egos',
  name_it: 'Alter Egos',
  slug: 'alter-egos',
  sort_order: 0,
};

export default function CataloguePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [collectionsList, setCollectionsList] = useState<CatalogCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [catalogDevDemo, setCatalogDevDemo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | 'all'>('all');
  const { t, language } = useLanguage();

  const collectionLabel = (c: CatalogCollection) =>
    productDisplayName(language, { name: c.name, name_it: c.name_it ?? undefined });

  const activeCollectionSlug = useMemo(() => {
    if (activeCollectionId === 'all') return null;
    return collectionsList.find((c) => c.id === activeCollectionId)?.slug ?? null;
  }, [activeCollectionId, collectionsList]);

  const products = useMemo(() => {
    return allProducts.filter((p) =>
      productBelongsToCollection(p, activeCollectionId, activeCollectionSlug)
    );
  }, [allProducts, activeCollectionId, activeCollectionSlug]);

  const selectCollection = (id: string | 'all', slug?: string) => {
    setActiveCollectionId(id);
    if (typeof window === 'undefined') return;
    if (id === 'all' || !slug) {
      router.replace(pathname, { scroll: false });
    } else {
      router.replace(`${pathname}?collection=${encodeURIComponent(slug)}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (collectionsList.length === 0) return;
    const slug = searchParams.get('collection');
    if (!slug) {
      setActiveCollectionId('all');
      return;
    }
    const found = collectionsList.find((c) => c.slug === slug);
    if (found) setActiveCollectionId(found.id);
    else if (slug) setActiveCollectionId('all');
  }, [collectionsList, searchParams]);

  /** Une seule requête au chargement : le serveur parle à Supabase (même origine), changement de famille = instantané. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      setCatalogDevDemo(false);
      try {
        const res = await fetch('/api/catalog', { cache: 'no-store' });
        const payload = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          const isSupabaseError =
            payload?.error === 'not_configured' || payload?.error === 'fetch_failed';
          if (CATALOG_DEV_DEMO && (res.status === 503 || res.status === 502) && isSupabaseError) {
            setCollectionsList([MOCK_COLLECTION_ROW]);
            setAllProducts(getMockCatalogProducts(MOCK_COLLECTION_ID));
            setActiveCollectionId('all');
            setFetchError(null);
            setCatalogDevDemo(true);
            setLoading(false);
            return;
          }
          const msg =
            payload?.message ||
            (payload?.error === 'not_configured'
              ? 'Variables Supabase manquantes sur le serveur (URL + clé anon ou publishable, ou SUPABASE_SERVICE_ROLE_KEY).'
              : payload?.error || `Erreur ${res.status}`);
          setFetchError(msg);
          setAllProducts([]);
          setCollectionsList([]);
          setLoading(false);
          return;
        }

        const list = Array.isArray(payload.products) ? payload.products : [];
        const cols = Array.isArray(payload.collections) ? payload.collections : [];
        setCollectionsList(cols);

        if (list.length === 0 && CATALOG_DEV_DEMO) {
          const colsEff = cols.length > 0 ? cols : [MOCK_COLLECTION_ROW];
          const colId = colsEff[0]?.id ?? MOCK_COLLECTION_ID;
          setCollectionsList(colsEff);
          setAllProducts(getMockCatalogProducts(colId));
          setFetchError(null);
          setCatalogDevDemo(true);
        } else if (list.length === 0 && SHOW_CATALOG_MOCK) {
          setCollectionsList(cols.length > 0 ? cols : [MOCK_COLLECTION_ROW]);
          setAllProducts(getMockCatalogProducts(MOCK_COLLECTION_ID));
          setFetchError(null);
          setCatalogDevDemo(false);
        } else {
          setAllProducts(list);
          setFetchError(null);
          setCatalogDevDemo(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          if (CATALOG_DEV_DEMO) {
            setCollectionsList([MOCK_COLLECTION_ROW]);
            setAllProducts(getMockCatalogProducts(MOCK_COLLECTION_ID));
            setActiveCollectionId('all');
            setFetchError(null);
            setCatalogDevDemo(true);
          } else {
            setFetchError(
              'Impossible de joindre ce site (réseau). Vérifiez que le serveur Next.js tourne et que /api/catalog répond.'
            );
            setAllProducts([]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      {/* Hero Catalogue */}
      <section className="page-content border-b border-brand-black/5 pb-12 sm:pb-16 lg:pb-20">
        <div className="mx-auto max-w-screen-2xl">
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mb-4 block text-[10px] uppercase tracking-[0.3em] text-brand-gold"
          >
            {t('catalog.label', 'La Collection Complète')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="heading-page mb-6 italic sm:mb-8"
          >
            {t('catalog.title', 'Nos Créations')}
          </motion.h1>
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
              <button
                type="button"
                onClick={() => selectCollection('all')}
                className={`text-[10px] uppercase tracking-widest px-6 py-2 border transition-all duration-500 whitespace-nowrap ${
                  activeCollectionId === 'all'
                    ? 'bg-brand-black text-brand-cream border-brand-black'
                    : 'border-brand-black/10 hover:border-brand-black'
                }`}
              >
                {t('catalog.collection_all', 'Toutes les créations')}
              </button>
              {collectionsList.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => selectCollection(col.id, col.slug)}
                  className={`text-[10px] uppercase tracking-widest px-6 py-2 border transition-all duration-500 whitespace-nowrap ${
                    activeCollectionId === col.id
                      ? 'bg-brand-black text-brand-cream border-brand-black'
                      : 'border-brand-black/10 hover:border-brand-black'
                  }`}
                >
                  {collectionLabel(col)}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-3 text-[10px] uppercase tracking-widest hover:text-brand-gold transition-colors"
            >
              <SlidersHorizontal size={14} />
              {t('catalog.filters', 'Filtres Avancés')}
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-screen-2xl">
          {fetchError && (
            <div className="mb-10 rounded-2xl border border-red-100 bg-red-50/80 px-6 py-5 text-sm text-red-900">
              <p className="font-serif font-medium">
                {t('catalog.load_error_title', 'Impossible de charger le catalogue pour le moment.')}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-3 text-left text-xs">
                  <summary className="cursor-pointer text-red-800/90">Détails techniques (dev)</summary>
                  <p className="mt-2 leading-relaxed">{fetchError}</p>
                </details>
              )}
            </div>
          )}

          {catalogDevDemo && !fetchError && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-xs text-amber-950">
              <p className="font-medium">Catalogue de démonstration (repli UI)</p>
              <p className="mt-1 opacity-90">
                Variable active :{' '}
                <code className="rounded bg-white/80 px-1 font-mono">NEXT_PUBLIC_CATALOG_DEV_FALLBACK=true</code> — retirez-la
                pour utiliser uniquement Supabase.
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-6">
                  <div className="aspect-[3/4] bg-brand-black/5 animate-pulse rounded-sm" />
                  <div className="space-y-3">
                    <div className="h-2 w-1/4 bg-brand-black/5 animate-pulse mx-auto" />
                    <div className="h-4 w-2/3 bg-brand-black/5 animate-pulse mx-auto" />
                    <div className="h-3 w-1/3 bg-brand-black/5 animate-pulse mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? null : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.025, 0.2), duration: 0.45 }}
                  viewport={{ once: true, margin: '40px' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="py-24 text-center">
              <p className="mb-6 font-serif text-2xl italic text-brand-black/80">
                {t(
                  'catalog.empty_collection',
                  'Aucun parfum dans cette sélection pour le moment.'
                )}
              </p>
              <p className="mx-auto mb-8 max-w-md text-sm text-brand-black/55">
                {t(
                  'catalog.empty_collection_hint',
                  'Découvrez l’ensemble des créations ou changez de univers.'
                )}
              </p>
              <button type="button" onClick={() => selectCollection('all')} className="luxury-button">
                {t('catalog.show_all_collections', 'Afficher toutes les créations')}
              </button>
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="mb-4 font-serif text-2xl italic text-brand-black/80">
                {t('catalog.empty', 'Notre catalogue sera bientôt enrichi.')}
              </p>
              <p className="mx-auto mb-8 max-w-md text-sm text-brand-black/55">
                {t('catalog.empty_hint', 'Revenez très prochainement ou contactez-nous pour toute demande.')}
              </p>
              <Link href="/" className="luxury-button inline-block">
                {t('catalog.back_home', "Retour à l'accueil")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-brand-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-cream z-[80] p-12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-serif">{t('catalog.filter_drawer_title')}</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="hover:rotate-90 transition-transform duration-500"
                  aria-label={t('catalog.filters_close_aria')}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-12">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest mb-6 text-brand-gold">{t('catalog.filter_price')}</h3>
                  <input type="range" className="w-full accent-brand-gold" />
                  <div className="flex justify-between mt-2 text-[10px] uppercase font-sans opacity-40">
                    <span>0 €</span>
                    <span>500 €</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest mb-6 text-brand-gold">{t('catalog.filter_intensity')}</h3>
                  <div className="space-y-4">
                    {(
                      [
                        'catalog.intensity_light',
                        'catalog.intensity_moderate',
                        'catalog.intensity_strong',
                        'catalog.intensity_extrakt',
                      ] as const
                    ).map((levelKey) => (
                      <label key={levelKey} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 border border-brand-black/20 group-hover:border-brand-gold transition-colors" />
                        <span className="text-xs uppercase tracking-widest">{t(levelKey)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <button type="button" className="luxury-button w-full py-5 absolute bottom-12 left-0 px-12">
                {t('catalog.apply_filters')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
