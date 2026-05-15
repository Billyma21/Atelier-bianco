'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'header' | 'drawer';

const LANG_ITEMS = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
];

export default function LanguageSwitcher({ variant = 'header' }: { variant?: Variant }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 160 });

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !mounted) return;

    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = variant === 'drawer' ? Math.max(200, r.width) : 160;
      let left = r.right - w;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      const pad = 8;
      let top = r.bottom + pad;
      const estH = LANG_ITEMS.length * 48 + 24;
      if (top + estH > window.innerHeight - 8) {
        top = Math.max(pad, r.top - estH - pad);
      }
      setCoords({ top, left, width: w });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, mounted, variant]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const dropdown =
    mounted &&
    isOpen &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[140]" aria-hidden onClick={close} />
        <div
          role="listbox"
          aria-label="Langue"
          className={cn(
            'fixed z-[150] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl outline-none',
            variant === 'drawer' && 'ring-1 ring-brand-black/5'
          )}
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
          }}
        >
          {LANG_ITEMS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code);
                close();
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-all',
                language === lang.code
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-base" aria-hidden>
                {lang.flag}
              </span>
              {lang.name}
            </button>
          ))}
        </div>
      </>,
      document.body
    );

  return (
    <div className={cn('relative', variant === 'drawer' && 'w-full')}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-brand-black/[0.06]',
          variant === 'drawer' && 'w-full justify-center py-3'
        )}
      >
        <Globe size={14} className="shrink-0 text-brand-gold" />
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">
          {language === 'fr' ? 'FR' : 'IT'}
        </span>
      </button>

      {dropdown}
    </div>
  );
}
