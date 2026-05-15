'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { normalizeProductSlug } from '@/lib/product-slug';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { language, t } = useLanguage();

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);

      const safe = query.replace(/[%_,]/g, ' ').trim();
      if (safe.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('status', 'active')
        .or(`name.ilike.%${safe}%,name_it.ilike.%${safe}%,family.ilike.%${safe}%`)
        .limit(8);

      if (data) setResults(data);
      setLoading(false);
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [query, supabase]);

  const handleSelect = (slug: string) => {
    router.push(`/produits/${normalizeProductSlug(slug)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center px-4 pt-[max(5rem,10vh)] sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-black/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-2xl relative z-[210]"
          >
            <div className="relative group mb-8 sm:mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40 transition-colors group-focus-within:text-brand-gold sm:left-6" size={22} />
              <input 
                autoFocus
                type="text"
                placeholder={t('search.placeholder', 'Chercher une fragrance, une note...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-none bg-brand-cream/5 py-5 pl-14 pr-12 font-serif text-xl italic text-brand-cream placeholder:text-brand-cream/10 focus:ring-0 sm:py-8 sm:pl-20 sm:pr-8 sm:text-3xl"
              />
              <button 
                type="button"
                onClick={onClose}
                className="touch-target absolute right-2 top-1/2 -translate-y-1/2 text-brand-cream/20 transition-colors hover:text-brand-cream sm:right-6"
                aria-label={t('search.close_aria', 'Fermer la recherche')}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {loading && (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.slug)}
                    className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group text-left"
                  >
                    <div className="relative w-16 h-20 overflow-hidden rounded-lg bg-brand-black/20 flex-shrink-0">
                      <Image 
                        src={product.product_images?.[0]?.url || 'https://picsum.photos/seed/perfume/100/120'} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1">
                        {language === 'it' && product.family_it ? product.family_it : product.family}
                      </p>
                      <h4 className="text-xl font-serif text-brand-cream group-hover:text-brand-gold transition-colors">
                        {language === 'it' && product.name_it ? product.name_it : product.name}
                      </h4>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-brand-cream/40 font-sans text-sm">
                        {formatPrice(product.product_variants?.[0]?.price || 0)}
                      </p>
                      <ArrowRight size={16} className="text-brand-gold opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              {query.length >= 2 && results.length === 0 && !loading && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                  <Package className="mx-auto text-brand-cream/10 mb-4" size={48} />
                  <p className="text-brand-cream/40 font-serif italic text-xl">
                    {t('search.no_results', 'Aucun résultat trouvé pour « {q} »').replace('{q}', query)}
                  </p>
                </div>
              )}

              {query.length < 2 && (
                <div className="py-20 text-center">
                  <p className="text-[11px] uppercase tracking-[0.5em] text-brand-cream/20">
                    {t('search.min_chars', 'Entrez au moins 2 caractères')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
