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
import { useLanguage } from '@/context/LanguageContext';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [supabase]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-amber-500" />;
      case 'shipped':
        return <Truck size={16} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Package size={16} className="text-brand-black/40" />;
    }
  };

  const dateLoc = language === 'it' ? 'it-IT' : 'fr-FR';

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('track.status.pending', ''),
      processing: t('track.status.processing', ''),
      shipped: t('track.status.shipped', ''),
      delivered: t('track.status.delivered', ''),
      cancelled: t('track.status.cancelled', ''),
      refunded: t('track.status.refunded', ''),
    };
    return map[status] || status;
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-lg">
        <div className="mb-12">
          <h1 className="mb-4 font-serif text-4xl">{t('orders.page_h1', 'Mes commandes')}</h1>
          <p className="text-sm uppercase tracking-widest text-brand-black/40">{t('orders.subtitle', '')}</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-sm bg-white" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-brand-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
              >
                <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-brand-black/40">
                        {t('orders.label', 'Commande')}
                      </span>
                      <span className="font-mono text-xs font-medium">{order.id}</span>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-brand-black/40">
                        {t('orders.date_label', 'Date')}
                      </span>
                      <span className="font-sans text-xs">{new Date(order.created_at).toLocaleDateString(dateLoc)}</span>
                    </div>
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-brand-black/40">
                        {t('common.total', 'Total')}
                      </span>
                      <span className="font-sans text-xs font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-full bg-brand-black/[0.02] px-4 py-2">
                    {getStatusIcon(order.status)}
                    <span className="text-[10px] font-medium uppercase tracking-widest">{statusLabel(order.status)}</span>
                  </div>
                </div>

                <div className="mb-8 flex flex-wrap gap-4">
                  {order.order_items?.map((item: { id: string; product_snapshot?: { image?: string; name?: string } }) => (
                    <div key={item.id} className="relative h-16 w-12 flex-shrink-0 bg-brand-black/5">
                      <Image
                        src={item.product_snapshot?.image || 'https://picsum.photos/seed/perfume/100/150'}
                        alt={item.product_snapshot?.name || ''}
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
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors hover:text-brand-gold"
                  >
                    {t('orders.details_link', 'Voir les détails')}
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border border-brand-black/5 bg-white py-20 text-center">
            <Package size={48} className="mx-auto mb-6 text-brand-black/10" strokeWidth={1} />
            <p className="mb-8 font-serif text-sm italic text-brand-black/40">{t('orders.empty_line', '')}</p>
            <Link href="/parfums" className="luxury-button inline-block px-12 py-4">
              {t('orders.discover', 'Découvrir la collection')}
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
