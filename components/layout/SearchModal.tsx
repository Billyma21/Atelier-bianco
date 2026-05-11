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
  const { language } = useLanguage();

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .or(`name.ilike.%${query}%,name_it.ilike.%${query}%,family.ilike.%${query}%`)
        .limit(5);

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
        <div className="fixed inset-0 z-[200] flex flex-col items-center pt-[10vh] px-6">
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
            <div className="relative group mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold/40 group-focus-within:text-brand-gold transition-colors" size={24} />
              <input 
                autoFocus
                type="text"
                placeholder="Chercher une fragrance, une note..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-brand-cream/5 border-none text-brand-cream text-3xl font-serif italic py-8 pl-20 pr-8 focus:ring-0 placeholder:text-brand-cream/10"
              />
              <button 
                onClick={onClose}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-cream/20 hover:text-brand-cream transition-colors"
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
                  <p className="text-brand-cream/40 font-serif italic text-xl">Aucun résultat trouvé pour &quot;{query}&quot;</p>
                </div>
              )}

              {query.length < 2 && (
                <div className="py-20 text-center">
                  <p className="text-[11px] uppercase tracking-[0.5em] text-brand-cream/20">Entrez au moins 2 caractères</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
