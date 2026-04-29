'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Calendar, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useCart } from '@/store/useCart';

export default function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const clearCart = useCart((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', resolvedParams.orderId)
        .single();

      if (data) setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [resolvedParams.orderId, supabase]);

  if (loading) return <div className="min-h-screen bg-brand-cream flex items-center justify-center font-serif italic">Chargement...</div>;

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <CheckCircle2 size={64} className="text-green-600 mx-auto mb-6" strokeWidth={1} />
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Merci pour votre commande</h1>
          <p className="text-brand-black/60 font-sans uppercase tracking-widest text-xs">
            Numéro de commande : <span className="text-brand-black">{resolvedParams.orderId}</span>
          </p>
        </motion.div>

        <div className="bg-white p-8 md:p-12 text-left space-y-12 shadow-sm">
          <section>
            <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
              <Package size={20} strokeWidth={1.5} />
              Détails de la commande
            </h2>
            <div className="space-y-4">
              {order?.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-sans">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-12 h-16 bg-brand-black/5 flex-shrink-0">
                      <Image 
                        src={item.product_snapshot?.image || 'https://picsum.photos/seed/perfume/100/150'} 
                        alt={item.product_snapshot?.name} 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.product_snapshot?.name}</p>
                      <p className="text-[10px] text-brand-black/40 uppercase">{item.product_snapshot?.size} x {item.quantity}</p>
                    </div>
                  </div>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-brand-black/5 flex justify-between font-serif text-lg">
                <span>Total</span>
                <span>{formatPrice(order?.total)}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-brand-gold mb-4 flex items-center gap-2">
                <MapPin size={12} />
                Adresse de livraison
              </h3>
              <div className="text-sm font-sans text-brand-black/70 space-y-1">
                <p>{order?.shipping_address?.firstName} {order?.shipping_address?.lastName}</p>
                <p>{order?.shipping_address?.address}</p>
                <p>{order?.shipping_address?.postalCode} {order?.shipping_address?.city}</p>
                <p>{order?.shipping_address?.country}</p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-brand-gold mb-4 flex items-center gap-2">
                <Truck size={12} />
                Méthode de Paiement
              </h3>
              <div className="text-sm font-sans text-brand-black/70">
                <p>
                  {order?.shipping_address?.payment_method === 'cash'
                    ? 'Ancienne commande — paiement à la livraison'
                    : 'Paiement sécurisé par carte (Stripe)'}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-brand-gold mb-4 flex items-center gap-2">
                <Calendar size={12} />
                Suivi de livraison
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="text-xs font-sans">Commande confirmée</span>
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="w-2 h-2 rounded-full bg-brand-black" />
                  <span className="text-xs font-sans">En cours de préparation</span>
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="w-2 h-2 rounded-full bg-brand-black" />
                  <span className="text-xs font-sans">Expédiée</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <p className="text-sm font-sans text-brand-black/60 italic">
            Un email de confirmation a été envoyé à {order?.shipping_address?.email}.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/parfums" className="luxury-button px-12 py-4 text-xs">Continuer mes achats</Link>
            <Link
              href={`/suivi?order=${resolvedParams.orderId}`}
              className="border border-brand-black/10 px-12 py-4 text-xs uppercase tracking-widest transition-all hover:bg-brand-black hover:text-white"
            >
              Suivi public
            </Link>
            <Link href="/mon-compte/commandes" className="border border-brand-black/10 px-12 py-4 text-xs uppercase tracking-widest hover:bg-brand-black hover:text-white transition-all">Mon compte</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
