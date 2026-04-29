'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SPLASH_KEY = 'atelier-bianco-splash-done';
const SPLASH_MS = 480;

export default function LuxuryLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(SPLASH_KEY)) {
        setIsLoading(false);
        return;
      }
    } catch {
      /* ignore private mode */
    }
    const timer = window.setTimeout(() => {
      setIsLoading(false);
      try {
        sessionStorage.setItem(SPLASH_KEY, '1');
      } catch {
        /* ignore */
      }
    }, SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[1000] bg-brand-cream flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-serif tracking-[0.3em] uppercase mb-12">Atelier Bianco</h1>
              <div className="w-48 h-[1px] bg-brand-gold/20 mx-auto relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-brand-gold shadow-[0_0_15px_rgba(201,169,110,0.6)]"
                />
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mt-12 text-[10px] uppercase tracking-[0.5em] text-brand-gold/60 font-medium font-sans"
              >
                Maison de Haute Parfumerie
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={isLoading ? "h-screen overflow-hidden" : ""}>
        {children}
      </div>
    </>
  );
}
