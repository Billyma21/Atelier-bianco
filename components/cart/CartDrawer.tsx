'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/store/useCart';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Rendu via portail sur document.body : le <header> utilise backdrop-blur,
 * ce qui confine les descendants `position:fixed` à la hauteur du header.
 */
export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const count = totalItems();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const titleId = 'cart-drawer-title';

  const node = (
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              key="cart-backdrop"
              type="button"
              aria-label={t('cart.drawer.close_aria', 'Fermer le panier')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[200] bg-brand-black/60"
              onClick={onClose}
            />

            <motion.aside
              key="cart-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={cn(
                'fixed inset-y-0 right-0 z-[210] flex max-h-[100dvh] w-full max-w-[min(100vw-0.5rem,26.5rem)] flex-col bg-brand-cream',
                'shadow-[-28px_0_72px_-20px_rgba(10,10,10,0.28)] ring-1 ring-brand-black/[0.07]',
                'pt-[env(safe-area-inset-top,0px)] sm:max-w-md'
              )}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* En-tête — fond opaque, même teinte que le panneau */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-black/10 bg-brand-cream px-5 py-4 sm:px-8 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-black/[0.05]">
                    <ShoppingBag size={20} strokeWidth={1.25} className="text-brand-black/80" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 id={titleId} className="font-serif text-lg text-brand-black sm:text-xl">
                      {t('cart.title', 'Votre panier')}
                    </h2>
                    {count > 0 ? (
                      <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.2em] text-brand-black/45">
                        {count > 1
                          ? t('cart.drawer.items_count_plural', '{count} articles').replace('{count}', String(count))
                          : t('cart.drawer.items_count', '{count} article').replace('{count}', String(count))}
                      </p>
                    ) : (
                      <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.2em] text-brand-black/45">
                        {t('cart.drawer.empty_hint', 'Prêt quand vous l’êtes')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-black/50 transition-colors hover:bg-brand-black/[0.06] hover:text-brand-black"
                  aria-label={t('cart.drawer.close_aria', 'Fermer le panier')}
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Contenu scrollable — fond opaque */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-brand-cream px-5 py-6 sm:px-8 sm:py-8">
                {items.length > 0 ? (
                  <ul className="flex list-none flex-col gap-5">
                    {items.map((item) => (
                      <li
                        key={item.variantId}
                        className="flex gap-4 rounded-2xl border border-brand-black/[0.08] bg-white p-3.5 shadow-[0_1px_0_rgba(10,10,10,0.04)] sm:gap-5 sm:p-4"
                      >
                        <div className="relative h-[7.25rem] w-20 shrink-0 overflow-hidden rounded-xl bg-brand-black/[0.06] sm:h-32 sm:w-24">
                          <Image
                            src={item.image || 'https://picsum.photos/seed/perfume/200/300'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-[11px] font-medium uppercase leading-snug tracking-[0.14em] text-brand-black sm:text-xs">
                                {item.name}
                              </h3>
                              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-brand-black/40">{item.size}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              className="shrink-0 rounded-full p-1.5 text-brand-black/25 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label={t('cart.drawer.remove_aria', 'Retirer du panier')}
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                          <div className="flex flex-wrap items-end justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-brand-black/12 bg-brand-cream/80 p-0.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black/70 transition-colors hover:bg-brand-black/[0.07]"
                                aria-label={t('cart.drawer.decrease', 'Diminuer la quantité')}
                              >
                                <Minus size={14} strokeWidth={2} />
                              </button>
                              <span className="min-w-[2rem] px-1 text-center font-sans text-xs tabular-nums text-brand-black">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black/70 transition-colors hover:bg-brand-black/[0.07]"
                                aria-label={t('cart.drawer.increase', 'Augmenter la quantité')}
                              >
                                <Plus size={14} strokeWidth={2} />
                              </button>
                            </div>
                            <p className="font-serif text-base text-brand-black sm:text-lg">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex min-h-[min(70vh,32rem)] flex-col items-center justify-center px-2 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-black/[0.04] ring-1 ring-brand-black/[0.06]">
                      <ShoppingBag size={36} strokeWidth={1} className="text-brand-black/25" aria-hidden />
                    </div>
                    <p className="font-serif text-xl text-brand-black sm:text-2xl">{t('cart.empty', 'Votre panier est vide')}</p>
                    <p className="mt-3 max-w-[22rem] font-sans text-sm leading-relaxed text-brand-black/50">
                      {t('cart.empty_line', 'Votre panier est actuellement vide.')}
                    </p>
                    <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                      <Link
                        href="/parfums"
                        onClick={onClose}
                        className="luxury-button flex w-full justify-center py-4 text-center text-[10px] uppercase tracking-[0.22em]"
                      >
                        {t('cart.discover_cta', 'Découvrir nos créations')}
                      </Link>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full border border-brand-black/15 bg-brand-cream py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-brand-black/70 transition-colors hover:border-brand-black/25 hover:bg-brand-black/[0.03]"
                      >
                        {t('cart.drawer.continue', 'Continuer vos achats')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pied — toujours opaque ; seulement si articles */}
              {items.length > 0 ? (
                <div className="shrink-0 border-t border-brand-black/10 bg-brand-cream px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-6">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-brand-black/45">{t('cart.subtotal', 'Sous-total')}</span>
                    <span className="font-serif text-2xl text-brand-black">{formatPrice(subtotal())}</span>
                  </div>
                  {Boolean(t('cart.drawer.shipping_hint', '')) && (
                    <p className="mb-5 text-center text-[10px] leading-relaxed italic text-brand-black/40">{t('cart.drawer.shipping_hint', '')}</p>
                  )}
                  <p className="mb-4 text-center text-[9px] uppercase tracking-[0.18em] text-brand-black/35">{t('cart.secure_payment_hint', '')}</p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/panier"
                      onClick={onClose}
                      className="flex w-full items-center justify-center border border-brand-black py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-cream"
                    >
                      {t('cart.drawer.view_full', 'Voir le panier complet')}
                    </Link>
                    <Link href="/checkout" onClick={onClose} className="luxury-button flex w-full justify-center py-4 text-center">
                      {t('cart.drawer.pay', 'Procéder au paiement')}
                    </Link>
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(node, document.body);
}
