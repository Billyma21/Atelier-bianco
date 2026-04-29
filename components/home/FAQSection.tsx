'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function FAQSection() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(6);
      if (data) setFaqs(data);
    };
    fetchFaqs();
  }, [supabase]);

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-white/50 border-t border-brand-black/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block font-bold">
            {t('faq.label', 'Assistance')}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6">{t('faq.title', 'Questions Fréquentes')}</h2>
          <p className="text-brand-black/40 text-[10px] uppercase tracking-widest font-sans font-bold">
            {t('faq.subtitle', 'Tout savoir sur l\'univers Atelier Bianco')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
          ))}
        </div>
      </div>
    </section>
  );
}
