'use client';

import React from 'react';
import { useCart } from '@/store/useCart';
import { formatPrice } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-xl">
        <h1 className="heading-page mb-8 sm:mb-12">{t('cart.title', 'Votre panier')}</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-8 sm:space-y-8">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex flex-col gap-4 border border-brand-black/5 bg-white p-4 shadow-sm sm:flex-row sm:gap-6 sm:p-6 lg:gap-8 lg:p-8"
                >
                  <div className="relative mx-auto h-36 w-28 flex-shrink-0 bg-brand-black/5 sm:mx-0 sm:h-32 sm:w-24">
                    <Image
                      src={item.image || 'https://picsum.photos/seed/perfume/200/300'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-xl uppercase tracking-widest">{item.name}</h3>
                        <p className="mt-2 text-xs uppercase text-brand-black/40">{item.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-brand-black/20 transition-colors hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center border border-brand-black/10">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-3 transition-colors hover:bg-brand-black/5"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-6 font-sans text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-3 transition-colors hover:bg-brand-black/5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-sans text-lg font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 border border-brand-black/5 bg-white p-8 shadow-sm">
                <h2 className="mb-8 font-serif text-xl">{t('cart.summary', 'Résumé')}</h2>
                <div className="mb-8 space-y-4">
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-brand-black/40">{t('cart.subtotal', 'Sous-total')}</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-brand-black/40">{t('cart.shipping', 'Livraison')}</span>
                    <span className="text-[10px] uppercase tracking-widest text-green-600">
                      {t('cart.shipping_free_label', 'Offerte')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-brand-black/5 pt-4 font-serif text-xl">
                    <span>{t('common.total', 'Total')}</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                </div>

                <Link href="/checkout" className="luxury-button flex w-full items-center justify-center gap-3 py-5">
                  {t('cart.checkout', 'Passer la commande')}
                  <ArrowRight size={16} />
                </Link>

                <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-brand-black/40">
                  {t('cart.secure_payment_hint', 'Paiement 100 % sécurisé')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-brand-black/5 bg-white py-32 text-center">
            <ShoppingBag size={64} className="mx-auto mb-8 text-brand-black/10" strokeWidth={1} />
            <p className="mb-12 font-serif text-xl italic text-brand-black/40">{t('cart.empty_line', '')}</p>
            <Link href="/parfums" className="luxury-button inline-block px-12 py-4">
              {t('cart.discover_cta', 'Découvrir nos créations')}
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
