'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setFaqs(data);
      setLoading(false);
    };
    fetchFaqs();
  }, [supabase]);

  const filteredFaqs = faqs.filter(faq => {
    const q = (language === 'it' ? faq.question_it : faq.question_fr).toLowerCase();
    const a = (language === 'it' ? faq.answer_it : faq.answer_fr).toLowerCase();
    return q.includes(searchQuery.toLowerCase()) || a.includes(searchQuery.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="page-content">
        <div className="max-w-4xl mx-auto text-center mb-24">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-6 py-2 bg-brand-gold/10 rounded-full text-brand-gold text-[10px] uppercase tracking-[0.4em] font-black mb-8"
           >
              <HelpCircle size={14} />
              Support & Assistance
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-5xl md:text-7xl font-serif mb-12"
           >
             {t('faq.title', 'Questions Fréquentes')}
           </motion.h1>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="relative max-w-2xl mx-auto"
           >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold/40" size={20} />
              <input 
                type="text" 
                placeholder={t('faq.search', 'CHERCHER UNE RÉPONSE...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-brand-black/5 rounded-[32px] py-6 pl-16 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all font-sans"
              />
           </motion.div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
           {loading ? (
             [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/50 animate-pulse rounded-3xl" />)
           ) : filteredFaqs.length === 0 ? (
             <div className="text-center py-20 italic text-brand-black/40">
                {t('faq.no_results', 'Aucun résultat trouvé pour votre recherche.')}
             </div>
           ) : (
             filteredFaqs.map((faq, index) => (
               <motion.div 
                 key={faq.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
                 className={cn(
                   "group bg-white rounded-[32px] border border-brand-black/5 overflow-hidden transition-all duration-500",
                   openId === faq.id ? "shadow-2xl shadow-brand-black/5 ring-1 ring-brand-gold/20" : "hover:shadow-lg"
                 )}
               >
                  <button 
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full text-left p-8 flex items-center justify-between transition-colors"
                  >
                     <span className="text-lg font-serif group-hover:text-brand-gold transition-colors">
                       {language === 'it' ? faq.question_it : faq.question_fr}
                     </span>
                     <div className={cn(
                       "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                       openId === faq.id ? "bg-brand-gold text-white rotate-180" : "bg-brand-black/5 text-brand-black/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                     )}>
                        {openId === faq.id ? <Minus size={18} /> : <Plus size={18} />}
                     </div>
                  </button>
                  <AnimatePresence>
                    {openId === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                         <div className="px-8 pb-8 text-brand-black/60 font-sans leading-relaxed text-base border-t border-brand-black/5 pt-6 mx-8 mt-2">
                           {language === 'it' ? faq.answer_it : faq.answer_fr}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
             ))
           )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
