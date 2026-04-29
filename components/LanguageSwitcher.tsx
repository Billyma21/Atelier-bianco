'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <Globe size={14} className="text-brand-gold" />
        <span className="text-[10px] uppercase tracking-widest font-black text-brand-black/60">
          {language === 'fr' ? 'FR' : 'IT'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full mt-2 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 p-2 min-w-[140px]"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as 'fr' | 'it');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                    language === lang.code 
                      ? "bg-brand-gold/10 text-brand-gold" 
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
