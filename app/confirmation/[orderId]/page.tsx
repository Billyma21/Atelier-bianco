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
import { useLanguage } from '@/context/LanguageContext';

export default function ConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const clearCart = useCart((s) => s.clearCart);
  const { t } = useLanguage();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .eq('id', resolvedParams.orderId)
        .single();

      if (data) setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [resolvedParams.orderId, supabase]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream font-serif italic">
        {t('common.loading', 'Chargement…')}
      </div>
    );

  const email = order?.shipping_address?.email;

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-md text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-12">
          <CheckCircle2 size={64} className="mx-auto mb-6 text-green-600" strokeWidth={1} />
          <h1 className="mb-4 font-serif text-4xl md:text-5xl">{t('confirm.thanks', 'Merci pour votre commande')}</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-black/60">
            {t('confirm.order_no', 'Numéro de commande :')}{' '}
            <span className="text-brand-black">{resolvedParams.orderId}</span>
          </p>
        </motion.div>

        <div className="space-y-12 bg-white p-8 text-left shadow-sm md:p-12">
          <section>
            <h2 className="mb-6 flex items-center gap-3 font-serif text-xl">
              <Package size={20} strokeWidth={1.5} />
              {t('confirm.details', 'Détails de la commande')}
            </h2>
            <div className="space-y-4">
              {order?.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between font-sans text-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-12 flex-shrink-0 bg-brand-black/5">
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
                      <p className="text-[10px] uppercase text-brand-black/40">
                        {item.product_snapshot?.size} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-brand-black/5 pt-4 font-serif text-lg">
                <span>{t('common.total', 'Total')}</span>
                <span>{formatPrice(order?.total)}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-gold">
                <MapPin size={12} />
                {t('confirm.ship_addr', 'Adresse de livraison')}
              </h3>
              <div className="space-y-1 font-sans text-sm text-brand-black/70">
                <p>
                  {order?.shipping_address?.firstName} {order?.shipping_address?.lastName}
                </p>
                <p>{order?.shipping_address?.address}</p>
                <p>
                  {order?.shipping_address?.postalCode} {order?.shipping_address?.city}
                </p>
                <p>{order?.shipping_address?.country}</p>
              </div>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-gold">
                <Truck size={12} />
                {t('confirm.pay_method', 'Méthode de paiement')}
              </h3>
              <div className="font-sans text-sm text-brand-black/70">
                <p>
                  {order?.shipping_address?.payment_method === 'cash'
                    ? t('confirm.pay_cash', '')
                    : t('confirm.pay_stripe', '')}
                </p>
              </div>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-gold">
                <Calendar size={12} />
                {t('confirm.tracking_title', 'Suivi de livraison')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span className="font-sans text-xs">{t('confirm.step_confirmed', 'Commande confirmée')}</span>
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="h-2 w-2 rounded-full bg-brand-black" />
                  <span className="font-sans text-xs">{t('confirm.step_prep', 'En cours de préparation')}</span>
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="h-2 w-2 rounded-full bg-brand-black" />
                  <span className="font-sans text-xs">{t('confirm.step_shipped', 'Expédiée')}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <p className="font-sans text-sm italic text-brand-black/60">
            {t('confirm.email_sent', 'Un e-mail de confirmation a été envoyé à {email}.').replace('{email}', email || '—')}
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <Link href="/parfums" className="luxury-button px-12 py-4 text-xs">
              {t('confirm.cta_shop', 'Continuer mes achats')}
            </Link>
            <Link
              href={`/suivi?order=${resolvedParams.orderId}`}
              className="border border-brand-black/10 px-12 py-4 text-xs uppercase tracking-widest transition-all hover:bg-brand-black hover:text-white"
            >
              {t('confirm.cta_track', 'Suivi public')}
            </Link>
            <Link
              href="/mon-compte/commandes"
              className="border border-brand-black/10 px-12 py-4 text-xs uppercase tracking-widest transition-colors hover:bg-brand-black hover:text-white"
            >
              {t('confirm.cta_account', 'Mon compte')}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
