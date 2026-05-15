'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const HOME_FAQ_FALLBACK = [
  {
    id: 'fb-shipping',
    question_fr: 'Quels sont les délais et frais de livraison ?',
    answer_fr:
      'Les commandes sont préparées sous 48 h (jours ouvrés), puis expédiées avec suivi. La livraison est offerte en France métropolitaine à partir de 150 €. Pour les autres destinations, les frais s’affichent avant paiement.',
    question_it: 'Quali sono i tempi e costi di spedizione?',
    answer_it:
      'Gli ordini vengono preparati entro 48 ore (giorni lavorativi), poi spediti con tracciamento. Spedizione gratuita in Francia metropolitana da 150 €.',
  },
  {
    id: 'fb-samples',
    question_fr: 'Puis-je recevoir des échantillons ?',
    answer_fr:
      'Deux échantillons sont offerts pour toute commande sur le site, selon disponibilité. Ils vous permettent de découvrir la Maison avant d’investir dans un flacon.',
    question_it: 'Posso ricevere campioni?',
    answer_it:
      'Due campioni in omaggio con ogni ordine sul sito, in base alla disponibilità.',
  },
  {
    id: 'fb-return',
    question_fr: 'Quelle est votre politique de retour ?',
    answer_fr:
      'Les produits scellés et non ouverts peuvent être retournés sous 14 jours (voir nos CGV). Les extraits de parfum ouverts ne sont pas repris pour des raisons d’hygiène.',
    question_it: 'Qual è la politica di reso?',
    answer_it:
      'Prodotti sigillati restituibili entro 14 giorni (CGV). Profumi aperti non sono idonei al reso per motivi igienici.',
  },
  {
    id: 'fb-authentic',
    question_fr: 'Les créations WHY et MASAMVNE sont-elles authentiques ?',
    answer_fr:
      'Oui : tous nos extraits sont formulés et conditionnés dans le cadre de la Maison, avec traçabilité et fabrication italienne pour la ligne présentée sur le site.',
    question_it: 'WHY e MASAMVNE sono autentici?',
    answer_it:
      'Sì: sono formulazioni della Maison, con tracciabilità e produzione italiana per la linea presentata sul sito.',
  },
  {
    id: 'fb-contact',
    question_fr: 'Comment contacter le service client ?',
    answer_fr:
      'Écrivez-nous depuis la page Contact ou répondez à votre e-mail de confirmation de commande. Nous répondons en général sous 24 à 48 h ouvrées.',
    question_it: 'Come contattare il servizio clienti?',
    answer_it:
      'Scrivici dalla pagina Contatto o rispondendo alla mail di conferma ordine. Risposta di solito entro 24–48 ore lavorative.',
  },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState<any[]>(HOME_FAQ_FALLBACK);
  const [openId, setOpenId] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(12);
      if (data?.length) setFaqs(data);
    };
    fetchFaqs();
  }, [supabase]);

  return (
    <section
      id="faq-accueil"
      className="scroll-mt-28 border-t border-brand-black/5 bg-white/50 px-4 py-16 sm:px-6 sm:py-20 md:py-32 lg:px-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-6 block font-bold">
            {t('faq.label', 'Assistance')}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6">{t('faq.title', 'Questions Fréquentes')}</h2>
          <p className="text-brand-black/40 text-[10px] uppercase tracking-widest font-sans font-bold">
            {t('faq.subtitle', "Tout savoir sur l'univers Atelier Bianco")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                'group bg-white rounded-[32px] border border-brand-black/5 overflow-hidden transition-all duration-500',
                openId === faq.id
                  ? 'shadow-2xl shadow-brand-black/5 ring-1 ring-brand-gold/20'
                  : 'hover:shadow-lg'
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full text-left p-8 flex items-center justify-between transition-colors"
              >
                <span className="text-lg font-serif group-hover:text-brand-gold transition-colors pr-4">
                  {(language === 'it' ? faq.question_it : faq.question_fr)?.trim() || t('faq.locale_content_pending')}
                </span>
                <div
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500',
                    openId === faq.id
                      ? 'bg-brand-gold text-white rotate-180'
                      : 'bg-brand-black/5 text-brand-black/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold'
                  )}
                >
                  {openId === faq.id ? <Minus size={18} /> : <Plus size={18} />}
                </div>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <div className="px-8 pb-8 text-brand-black/60 font-sans leading-relaxed text-base border-t border-brand-black/5 pt-6 mx-8 mt-2">
                      {(language === 'it' ? faq.answer_it : faq.answer_fr)?.trim() || t('faq.locale_content_pending')}
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
