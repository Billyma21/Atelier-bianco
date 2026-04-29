'use client';

import React from 'react';
import { useCart } from '@/store/useCart';
import { formatPrice } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-xl mx-auto">
        <h1 className="text-5xl font-serif mb-12">Votre Panier</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-8">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-8 bg-white p-8 border border-brand-black/5 shadow-sm">
                  <div className="relative w-24 h-32 bg-brand-black/5 flex-shrink-0">
                    <Image 
                      src={item.image || 'https://picsum.photos/seed/perfume/200/300'} 
                      alt={item.name} 
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif uppercase tracking-widest">{item.name}</h3>
                        <p className="text-xs text-brand-black/40 uppercase mt-2">{item.size}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.variantId)}
                        className="text-brand-black/20 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-8">
                      <div className="flex items-center border border-brand-black/10">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-3 hover:bg-brand-black/5 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-6 text-sm font-sans">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-3 hover:bg-brand-black/5 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-sans font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white p-8 border border-brand-black/5 shadow-sm sticky top-32">
                <h2 className="text-xl font-serif mb-8">Résumé</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-brand-black/40">Sous-total</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-brand-black/40">Livraison</span>
                    <span className="text-green-600 uppercase tracking-widest text-[10px]">Offerte</span>
                  </div>
                  <div className="pt-4 border-t border-brand-black/5 flex justify-between text-xl font-serif">
                    <span>Total</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                </div>
                
                <Link href="/checkout" className="luxury-button w-full py-5 flex items-center justify-center gap-3">
                  Passer la commande
                  <ArrowRight size={16} />
                </Link>
                
                <p className="text-[10px] text-brand-black/40 text-center mt-6 uppercase tracking-widest">
                  Paiement 100% sécurisé
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-white border border-brand-black/5">
            <ShoppingBag size={64} className="mx-auto mb-8 text-brand-black/10" strokeWidth={1} />
            <p className="text-xl font-serif italic text-brand-black/40 mb-12">Votre panier est actuellement vide.</p>
            <Link href="/parfums" className="luxury-button inline-block px-12 py-4">Découvrir nos créations</Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
