'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '@/store/useCart';
import { formatPrice, cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Truck, CreditCard, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseBrowserConfigured } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Paiement Stripe
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Belgique',
  });

  const total = subtotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    if (step === 2 && !acceptCGV) {
      useToast.getState().show(
        'Veuillez accepter les conditions générales de vente pour finaliser votre commande.',
        'error'
      );
      return;
    }

    if (step === 2 && total <= 0) {
      useToast.getState().show('Le montant de la commande est invalide.', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const createRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          shipping: formData,
          userId: user?.id ?? null,
        }),
      });
      const createPayload = await createRes.json().catch(() => ({}));

      if (!createRes.ok || !createPayload?.orderId) {
        const hint =
          createPayload?.error === 'server_misconfigured'
            ? createPayload.message ||
              'Côté serveur : ajoutez NEXT_PUBLIC_SUPABASE_URL (URL du projet) et SUPABASE_SERVICE_ROLE_KEY.'
            : createPayload?.message ||
              (createRes.status >= 500
                ? 'Le serveur ne peut pas enregistrer la commande. Vérifiez les variables d’environnement sur l’hébergement.'
                : 'Impossible d’enregistrer la commande.');
        if (!isSupabaseBrowserConfigured()) {
          useToast.getState().show(
            `${hint} (côté navigateur : URL Supabase + clé anon ou publishable semblent absents ou invalides.)`,
            'error'
          );
        } else {
          useToast.getState().show(hint, 'error');
        }
        setLoading(false);
        return;
      }

      const orderId = createPayload.orderId as string;

      const skipStripe = process.env.NEXT_PUBLIC_DEV_SKIP_STRIPE === 'true';
      if (skipStripe) {
        useToast.getState().show(
          'Mode développement : redirection sans Stripe (NEXT_PUBLIC_DEV_SKIP_STRIPE).',
          'success'
        );
        clearCart();
        router.push(`/confirmation/${orderId}`);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/checkout/stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok || !payload?.url) {
        const hint =
          payload?.error === 'stripe_not_configured'
            ? 'Ajoutez STRIPE_SECRET_KEY dans .env.local.'
            : payload?.error === 'server_misconfigured'
              ? 'Ajoutez SUPABASE_SERVICE_ROLE_KEY (serveur) pour finaliser le paiement.'
              : payload?.message ||
                'Impossible d\'ouvrir la page de paiement. Vérifiez Stripe et les clés serveur.';
        useToast.getState().show(hint, 'error');
        setLoading(false);
        return;
      }

      window.location.href = payload.url as string;
    } catch (err: any) {
      console.error('Order creation error:', err);
      useToast.getState().show(
        err.message || 'Une erreur est survenue lors de la commande. Veuillez réessayer.',
        'error'
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-brand-cream">
        <Header />
        <div className="pt-40 pb-20 px-6 text-center">
          <h1 className="text-3xl font-serif mb-6">Votre panier est vide</h1>
          <Link href="/parfums" className="luxury-button inline-block px-12 py-4">Découvrir nos créations</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <div className="pt-32 pb-20 px-6 md:px-12 max-w-screen-xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500",
              step >= 1 ? "bg-brand-black text-white" : "bg-gray-100 text-gray-400"
            )}>
              <span className="text-[10px] font-bold">01</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{t('checkout.step_info', 'Informations')}</span>
            </div>
            <div className="w-12 h-[1px] bg-gray-200" />
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500",
              step >= 2 ? "bg-brand-black text-white" : "bg-gray-100 text-gray-400"
            )}>
              <span className="text-[10px] font-bold">02</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{t('checkout.step_payment', 'Paiement')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-12">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-12"
                  >
                    <section>
                      <div className="flex items-baseline justify-between mb-8 border-b border-gray-100 pb-4">
                        <h2 className="text-2xl font-serif">{t('checkout.contact', 'Contact')}</h2>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400">{t('checkout.step_1', 'Étape 1 sur 2')}</span>
                      </div>
                      <div className="space-y-4">
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Adresse Email</span>
                          <input 
                            type="email" 
                            placeholder="votre@email.com" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Numéro de téléphone</span>
                          <input 
                            type="tel" 
                            placeholder="+32 000 00 00 00" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </label>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-serif mb-8 border-b border-gray-100 pb-4">Adresse de livraison</h2>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Prénom</span>
                          <input 
                            type="text" 
                            placeholder="Jean" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Nom</span>
                          <input 
                            type="text" 
                            placeholder="Dupont" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          />
                        </label>
                      </div>
                      <label className="block mb-6">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Adresse</span>
                        <input 
                          type="text" 
                          placeholder="123 Rue de la Paix" 
                          required
                          className="luxury-input w-full bg-white"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Code postal</span>
                          <input 
                            type="text" 
                            placeholder="1000" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Ville</span>
                          <input 
                            type="text" 
                            placeholder="Bruxelles" 
                            required
                            className="luxury-input w-full bg-white"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 block ml-1">Pays</span>
                        <select 
                          className="luxury-input w-full bg-white appearance-none"
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                        >
                          <option>Belgique</option>
                          <option>France</option>
                          <option>Luxembourg</option>
                          <option>Pays-Bas</option>
                        </select>
                      </label>
                    </section>

                    <button 
                      type="submit" 
                      className="luxury-button w-full py-6 flex items-center justify-center gap-4 group"
                    >
                      <span className="text-[11px] uppercase tracking-[0.3em]">Continuer vers le paiement</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center justify-center gap-8 pt-8 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-gray-400">
                        <ShieldCheck size={12} />
                        <span>Paiement Sécurisé</span>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-gray-400">
                        <Truck size={12} />
                        <span>Livraison Offerte</span>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-gray-400">
                        <Lock size={12} />
                        <span>Données Cryptées</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400 hover:text-brand-black transition-colors mb-8"
                    >
                      <ArrowLeft size={12} />
                      Retour aux informations
                    </button>

                    <section>
                      <h2 className="text-2xl font-serif mb-8 border-b border-gray-100 pb-4">Paiement</h2>
                      <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-2xl border border-brand-black/10 bg-white p-8 shadow-sm">
                          <div className="absolute right-0 top-0 p-4">
                            <Lock size={16} className="text-brand-gold" />
                          </div>
                          <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-12 items-center justify-center rounded bg-brand-cream">
                                <CreditCard size={20} strokeWidth={1.5} className="text-brand-gold" />
                              </div>
                              <span className="text-xs font-medium uppercase tracking-widest">
                                Carte bancaire (Stripe Checkout)
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] leading-relaxed text-brand-black/60">
                            Vous serez redirigé vers une page de paiement sécurisée Stripe pour régler{' '}
                            <span className="font-medium text-brand-black">{formatPrice(total)}</span>. Aucun paiement
                            n&apos;est encaissé sur ce site.
                          </p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                          <ShieldCheck size={20} className="text-emerald-600" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                              Paiement 100 % sécurisé
                            </p>
                            <p className="text-[9px] uppercase tracking-widest text-emerald-700/70">
                              Cryptage SSL — conformité PCI via Stripe
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-brand-black"
                        checked={acceptCGV}
                        onChange={(e) => setAcceptCGV(e.target.checked)}
                      />
                      <span className="text-left text-[11px] leading-relaxed text-brand-black/70">
                        Je confirme avoir pris connaissance des{' '}
                        <Link href="/cgv" className="border-b border-brand-gold/40 text-brand-black hover:text-brand-gold">
                          conditions générales de vente
                        </Link>
                        , de la{' '}
                        <Link href="/confidentialite" className="border-b border-brand-gold/40 text-brand-black hover:text-brand-gold">
                          politique de confidentialité
                        </Link>{' '}
                        et j&apos;accepte le traitement de mes données aux fins de la commande.
                      </span>
                    </label>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="luxury-button w-full py-6 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-[11px] uppercase tracking-[0.3em]">Validation...</span>
                        </div>
                      ) : (
                        <span className="text-[11px] uppercase tracking-[0.3em]">{t('checkout.confirm_pay', 'Confirmer et Payer')} {formatPrice(total)}</span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
              <h2 className="text-xl font-serif mb-10 border-b border-gray-50 pb-6">{t('checkout.selection', 'Votre Sélection')}</h2>
              <div className="space-y-8 mb-10 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-6 group">
                    <div className="relative w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image 
                        src={item.image || 'https://picsum.photos/seed/perfume/150/200'} 
                        alt={item.name} 
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 right-2 bg-brand-black text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center z-10 font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-[10px] font-serif uppercase tracking-[0.2em] mb-1">{item.name}</h3>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">{item.size}</p>
                      <span className="text-xs font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-100">
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-400">{t('checkout.subtotal', 'Sous-total')}</span>
                  <span className="font-medium">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-gray-400">{t('checkout.shipping', 'Livraison Standard')}</span>
                  <span className="text-emerald-600 font-bold">{t('checkout.free', 'Offerte')}</span>
                </div>
                <div className="flex justify-between items-baseline pt-6 mt-4 border-t border-gray-100">
                  <span className="text-sm font-serif uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-serif">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <Truck size={14} strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest">Livraison en 2-4 jours ouvrés</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    <ShieldCheck size={14} strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest">Garantie satisfaction 30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
