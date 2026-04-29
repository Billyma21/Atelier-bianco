'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

export type CatalogCollection = {
  id: string;
  name: string;
  name_it?: string | null;
  slug: string;
  sort_order?: number | null;
};

const MOCK_COLLECTION_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function productBelongsToCollection(product: any, collectionId: string | 'all') {
  if (collectionId === 'all') return true;
  const links = product.product_collections as
    | { collection_id?: string; collections?: { id?: string } }[]
    | undefined;
  if (!links?.length) return false;
  return links.some(
    (pc) => pc.collection_id === collectionId || pc.collections?.id === collectionId
  );
}

const SHOW_CATALOG_MOCK =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_CATALOG_MOCK === 'true';

/** En local, si Supabase n’est pas configuré, afficher des exemples pour travailler sur l’UI (désactivé en build production). */
const CATALOG_DEV_DEMO =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_CATALOG_DEV_FALLBACK === 'true');

function mockPc(collectionId: string) {
  return [
    {
      collection_id: collectionId,
      collections: {
        id: collectionId,
        name: 'SIGNATURE',
        name_it: 'SIGNATURE',
        slug: 'signature',
        sort_order: 0,
      },
    },
  ];
}

function getMockCatalogProducts(collectionId: string = MOCK_COLLECTION_ID) {
  return [
    {
      id: 'mock-p1',
      name: 'Mûre Iris',
      slug: 'mure-iris',
      family: 'Floral',
      price: 185,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
      status: 'active',
      product_images: [],
      product_variants: [{ price: 185 }],
      product_collections: mockPc(collectionId),
    },
    {
      id: 'mock-p2',
      name: 'Ambre Nuit',
      slug: 'ambre-nuit',
      family: 'Oriental',
      price: 195,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
      status: 'active',
      product_images: [],
      product_variants: [{ price: 195 }],
      product_collections: mockPc(collectionId),
    },
    {
      id: 'mock-p3',
      name: "Bois d'Ébène",
      slug: 'bois-ebene',
      family: 'Boisé',
      price: 210,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
      status: 'active',
      product_images: [],
      product_variants: [{ price: 210 }],
      product_collections: mockPc(collectionId),
    },
    {
      id: 'mock-p4',
      name: 'Cuir Sacré',
      slug: 'cuir-sacre',
      family: 'Cuiré',
      price: 225,
      image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop',
      status: 'active',
      product_images: [],
      product_variants: [{ price: 225 }],
      product_collections: mockPc(collectionId),
    },
  ];
}

const MOCK_COLLECTION_ROW: CatalogCollection = {
  id: MOCK_COLLECTION_ID,
  name: 'SIGNATURE',
  name_it: 'SIGNATURE',
  slug: 'signature',
  sort_order: 0,
};

export default function CataloguePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [collectionsList, setCollectionsList] = useState<CatalogCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [catalogDevDemo, setCatalogDevDemo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | 'all'>('all');
  const { t, language } = useLanguage();

  const collectionLabel = (c: CatalogCollection) =>
    language === 'it' && c.name_it?.trim() ? c.name_it : c.name;

  const products = useMemo(() => {
    return allProducts.filter((p) => productBelongsToCollection(p, activeCollectionId));
  }, [allProducts, activeCollectionId]);

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
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const slug = params.get('collection');
    if (!slug) return;
    const found = collectionsList.find((c) => c.slug === slug);
    if (found) setActiveCollectionId(found.id);
  }, [collectionsList]);

  /** Une seule requête au chargement : le serveur parle à Supabase (même origine), changement de famille = instantané. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      setCatalogDevDemo(false);
      try {
        const res = await fetch('/api/catalog');
        const payload = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          if (
            CATALOG_DEV_DEMO &&
            res.status === 503 &&
            payload?.error === 'not_configured'
          ) {
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

        if (list.length === 0 && SHOW_CATALOG_MOCK) {
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
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-brand-black/5">
        <div className="max-w-screen-2xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-4 block"
          >
            {t('catalog.label', 'La Collection Complète')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic mb-8"
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
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          {fetchError && (
            <div className="mb-10 rounded-2xl border border-red-100 bg-red-50/80 px-6 py-5 text-sm text-red-900">
              <p className="font-serif font-medium">Impossible de charger le catalogue</p>
              <p className="mt-2 text-xs leading-relaxed">{fetchError}</p>
              <p className="mt-4 text-xs text-red-900/85">
                Dupliquez le fichier <code className="rounded bg-red-100/80 px-1.5 py-0.5 font-mono text-[11px]">env</code> en{' '}
                <code className="rounded bg-red-100/80 px-1.5 py-0.5 font-mono text-[11px]">.env.local</code>, renseignez
                l’URL et les clés (Supabase → Settings → API), puis redémarrez le serveur. Sur Vercel : Project → Settings →
                Environment Variables.
              </p>
            </div>
          )}

          {catalogDevDemo && !fetchError && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-xs text-amber-950">
              <p className="font-medium">Catalogue de démonstration (sans base Supabase)</p>
              <p className="mt-1 opacity-90">
                Les fiches liées resteront en secours mock tant que la base n’est pas branchée. Partez du fichier{' '}
                <code className="rounded bg-white/80 px-1 font-mono">env</code> pour créer{' '}
                <code className="rounded bg-white/80 px-1 font-mono">.env.local</code> avec vos vrais produits.
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
                  'Aucun parfum n’est associé à cette collection pour le moment.'
                )}
              </p>
              <p className="mx-auto mb-8 max-w-md text-sm text-brand-black/55">
                Admin → Produits : cochez la collection (ex. SIGNATURE) sur chaque fragrance, ou créez une nouvelle
                collection dans Admin → Collections.
              </p>
              <button type="button" onClick={() => selectCollection('all')} className="luxury-button">
                {t('catalog.show_all_collections', 'Afficher toutes les créations')}
              </button>
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="mb-4 font-serif text-2xl italic text-brand-black/80">
                {t('catalog.empty', 'Aucun parfum actif pour le moment.')}
              </p>
              <p className="mx-auto mb-8 max-w-md text-sm text-brand-black/55">
                Dans l’admin, activez des produits et rattachez-les à la collection <strong>SIGNATURE</strong> (ou
                toute autre collection publiée).
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
                <h2 className="text-2xl font-serif">Filtres</h2>
                <button onClick={() => setShowFilters(false)} className="hover:rotate-90 transition-transform duration-500">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-12">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest mb-6 text-brand-gold">Prix</h3>
                  <input type="range" className="w-full accent-brand-gold" />
                  <div className="flex justify-between mt-2 text-[10px] uppercase font-sans opacity-40">
                    <span>0€</span>
                    <span>500€</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest mb-6 text-brand-gold">Intensité</h3>
                  <div className="space-y-4">
                    {['Léger', 'Modéré', 'Intense', 'Extrait'].map((level) => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 border border-brand-black/20 group-hover:border-brand-gold transition-colors" />
                        <span className="text-xs uppercase tracking-widest">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <button className="luxury-button w-full py-5 absolute bottom-12 left-0 px-12">
                Appliquer les filtres
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
