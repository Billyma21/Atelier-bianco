'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, ChevronRight, Clock, Truck, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [supabase]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'shipped': return <Truck size={16} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Package size={16} className="text-brand-black/40" />;
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-40 pb-20 px-6 md:px-12 max-w-screen-lg mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-serif mb-4">Mes Commandes</h1>
          <p className="text-sm text-brand-black/40 uppercase tracking-widest">Suivez vos achats Atelier Bianco</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white animate-pulse rounded-sm" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 md:p-8 border border-brand-black/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div className="flex gap-8">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-black/40 block mb-1">Commande</span>
                      <span className="text-xs font-mono font-medium">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-black/40 block mb-1">Date</span>
                      <span className="text-xs font-sans">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-black/40 block mb-1">Total</span>
                      <span className="text-xs font-sans font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-brand-black/[0.02] rounded-full">
                    {getStatusIcon(order.status)}
                    <span className="text-[10px] uppercase tracking-widest font-medium">{order.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="relative w-12 h-16 bg-brand-black/5 flex-shrink-0">
                      <Image 
                        src={item.product_snapshot?.image || 'https://picsum.photos/seed/perfume/100/150'} 
                        alt={item.product_snapshot?.name} 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Link 
                    href={`/confirmation/${order.id}`}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest hover:text-brand-gold transition-colors"
                  >
                    Voir les détails
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-brand-black/5">
            <Package size={48} className="mx-auto mb-6 text-brand-black/10" strokeWidth={1} />
            <p className="text-sm font-serif italic text-brand-black/40 mb-8">Vous n&apos;avez pas encore passé de commande.</p>
            <Link href="/parfums" className="luxury-button inline-block px-12 py-4">Découvrir la collection</Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
