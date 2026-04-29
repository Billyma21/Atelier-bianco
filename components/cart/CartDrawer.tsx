'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/useCart';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-cream z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-brand-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-xl font-serif">Votre Panier</h2>
                <span className="text-[10px] bg-brand-black text-white w-5 h-5 rounded-full flex items-center justify-center font-sans">
                  {items.length}
                </span>
              </div>
              <button onClick={onClose} className="hover:rotate-90 transition-transform duration-500">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-6">
                    <div className="relative w-24 h-32 bg-brand-black/5 flex-shrink-0 overflow-hidden">
                      <Image 
                        src={item.image || 'https://picsum.photos/seed/perfume/200/300'} 
                        alt={item.name} 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-serif uppercase tracking-widest">{item.name}</h3>
                          <p className="text-[10px] text-brand-black/40 uppercase mt-1">{item.size}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-brand-black/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-brand-black/10">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-2 hover:bg-brand-black/5"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-4 text-xs font-sans">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-2 hover:bg-brand-black/5"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-sans">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-sm font-serif italic text-brand-black/40">Votre panier est vide.</p>
                  <button onClick={onClose} className="text-[10px] uppercase tracking-widest underline">Continuer vos achats</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 bg-white border-t border-brand-black/5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-brand-black/40">Sous-total</span>
                  <span className="text-xl font-serif">{formatPrice(subtotal())}</span>
                </div>
                <p className="text-[10px] text-brand-black/40 text-center italic">
                  Livraison offerte en Belgique & Benelux.
                </p>
                <div className="space-y-4">
                  <Link 
                    href="/panier" 
                    onClick={onClose}
                    className="w-full py-4 border border-brand-black text-[10px] uppercase tracking-widest hover:bg-brand-black hover:text-brand-cream transition-all text-center block"
                  >
                    Voir le panier complet
                  </Link>
                  <Link 
                    href="/checkout" 
                    onClick={onClose}
                    className="luxury-button w-full py-5 text-center block"
                  >
                    Procéder au paiement
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
