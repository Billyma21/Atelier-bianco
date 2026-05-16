'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/product/ProductGallery';
import { motion, AnimatePresence } from 'motion/react';

const OlfactoryProfile = dynamic(() => import('@/components/product/OlfactoryProfile'), {
  ssr: false,
  loading: () => (
    <div className="space-y-8 py-16">
      <div className="mx-auto h-40 max-w-2xl animate-pulse rounded-3xl bg-brand-black/5" />
      <div className="mx-auto h-32 max-w-xl animate-pulse rounded-2xl bg-brand-black/5" />
    </div>
  ),
});
import Image from 'next/image';
import { 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight,
  Plus,
  Minus,
  Star,
  Share2,
  CheckCircle2,
  Send,
  Loader2,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice, cn } from '@/lib/utils';
import { mapVisualsByKind } from '@/lib/olfactory-visuals';
import { useCart } from '@/store/useCart';
import { useLanguage } from '@/context/LanguageContext';
import { localizedText } from '@/lib/i18n/localized-text';
import {
  dbVisualAlt,
  dbVisualCaption,
  productDisplayFamily,
  productDisplayName,
  productPrimaryBody,
} from '@/lib/i18n/db-locale';
import { normalizeProductSlug } from '@/lib/product-slug';
import { getSignatureMedia } from '@/lib/signature-product-media';
import { getDemoProduct } from '@/lib/product-demo-mocks';
import { ReportProductMissing } from '@/components/product/ReportProductMissing';
import WishlistButton from '@/components/product/WishlistButton';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { language, t } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addItem } = useCart();
  const supabase = createClient();

  const fetchReviews = React.useCallback(async (productId: string) => {
    setLoadingReviews(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoadingReviews(false);
  }, [supabase]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const rawSlug = resolvedParams?.slug ?? '';
      const slug = normalizeProductSlug(decodeURIComponent(rawSlug));

      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `
            *,
            product_images(*),
            product_variants(*),
            olfactory_notes(*),
            product_olfactory_visuals(*)
          `
          )
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.warn('Product fetch:', error.message);
        }

        let productRow = data;
        if (!productRow && slug === 'masamune') {
          const { data: alt } = await supabase
            .from('products')
            .select(
              `
            *,
            product_images(*),
            product_variants(*),
            olfactory_notes(*),
            product_olfactory_visuals(*)
          `
            )
            .eq('slug', 'masamvne')
            .maybeSingle();
          productRow = alt ?? null;
        }

        if (productRow) {
          setProduct(productRow);
          if (productRow.product_variants && productRow.product_variants.length > 0) {
            const sortedVariants = [...productRow.product_variants].sort((a, b) => a.size_ml - b.size_ml);
            setSelectedVariant(sortedVariants[0]);
          } else {
            setSelectedVariant(null);
          }
          fetchReviews(productRow.id);
        } else {
          console.warn('Product not found for slug:', slug);
          const demo = getDemoProduct(slug);
          if (demo) {
            setProduct(demo);
            const vars = (demo as { product_variants?: { size_ml: number }[] }).product_variants;
            if (Array.isArray(vars) && vars.length > 0) {
              const sorted = [...vars].sort((a, b) => a.size_ml - b.size_ml);
              setSelectedVariant(sorted[0]);
            } else {
              setSelectedVariant(null);
            }
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams?.slug, supabase, fetchReviews]);

  useEffect(() => {
    supabase.auth.getUser().then((result: { data: { user: any } }) => {
      const u = result.data.user;
      if (u) {
        setUser(u);
        setReviewForm((prev) => ({
          ...prev,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || '',
        }));
      }
    });
  }, [supabase]);

  const olfactoryVisualsByKind = useMemo(
    () => mapVisualsByKind(product?.product_olfactory_visuals),
    [product?.product_olfactory_visuals]
  );
  const storyVisual = olfactoryVisualsByKind.story_panel;
  const pyramidVisual = olfactoryVisualsByKind.pyramid_diagram;
  const pyramidImageUrl =
    pyramidVisual?.image_url?.trim() || product?.olfactory_diagram_url?.trim() || '';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    setSubmittingReview(true);
    
    const { error } = await supabase
      .from('product_reviews')
      .insert([{
        product_id: product.id,
        user_id: user.id,
        user_name: reviewForm.name || user.email?.split('@')[0] || 'Client',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        is_approved: false // Always needs moderation
      }]);

    if (!error) {
      setReviewSuccess(true);
      setReviewForm({ rating: 5, comment: '', name: user.user_metadata?.full_name || user.email?.split('@')[0] || '' });
    } else {
      useToast.getState().show(t('product.toast_review_error', '') + error.message, 'error');
    }
    setSubmittingReview(false);
  };

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedVariant) return;
    setSubmitting(true);
    
    const { error } = await supabase
      .from('stock_notifications')
      .insert([{
        product_id: product.id,
        variant_id: selectedVariant.id,
        email: email,
        status: 'pending'
      }]);

    if (!error) {
      setNotified(true);
      setEmail('');
    }
    setSubmitting(false);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;

    addItem({
      id: product.id,
      name: language === 'it' && product.name_it ? product.name_it : product.name,
      size: `${selectedVariant.size_ml}ml`,
      price: selectedVariant.price,
      quantity: quantity,
      image: product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || '',
      variantId: selectedVariant.id
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream">
        <Header />
        <div className="mx-auto max-w-screen-2xl px-6 pb-24 pt-32 md:px-12">
          <div className="grid animate-pulse grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="aspect-[3/4] rounded-sm bg-gradient-to-br from-brand-black/[0.07] to-brand-black/[0.02]" />
            </div>
            <div className="lg:col-span-5 space-y-8 pt-2">
              <div className="h-3 w-24 rounded-full bg-brand-gold/30" />
              <div className="h-12 max-w-md rounded bg-brand-black/10" />
              <div className="h-20 max-w-lg rounded bg-brand-black/5" />
              <div className="h-14 w-full max-w-sm rounded bg-brand-black/80" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  if (!product) {
    const missingSlug = normalizeProductSlug(decodeURIComponent(resolvedParams?.slug ?? ''));
    return (
      <main className="min-h-screen bg-brand-cream">
        <ReportProductMissing slug={missingSlug} />
        <Header />
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
          <h1 className="mb-4 max-w-lg font-serif text-3xl font-normal text-brand-black/90">
            {t('product.not_found_title', 'Cette création n’est pas disponible')}
          </h1>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-brand-black/55">
            {t(
              'product.not_found_desc',
              'Ce lien est peut-être incomplet ou la fragrance n’est plus au catalogue.'
            )}
          </p>
          <Link href="/parfums" className="luxury-button inline-block">
            {t('catalog.view_all', 'Voir tout le catalogue')}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const variants = product.product_variants || [];
  const isOutOfStock = selectedVariant && selectedVariant.stock <= 0;

  // I18n Product Data (jamais de repli français lorsque langue = italien)
  const displayName = productDisplayName(language, product);
  const displayFamilyRaw = productDisplayFamily(language, product);
  const displayFamily = displayFamilyRaw.trim() ? displayFamilyRaw : t('product.family_default');
  const displayDescription = productPrimaryBody(language, product);
  const displayProfileTitle = localizedText(
    language,
    product.olfactory_profile_title_fr,
    product.olfactory_profile_title_it
  );
  const displayProfileDesc = localizedText(
    language,
    product.olfactory_profile_description_fr,
    product.olfactory_profile_description_it
  );

  const mapOlfactoryNotes = (rows: { name: string; name_it?: string | null; image_url?: string }[]) =>
    rows
      .map((n) => ({
        name: localizedText(language, n.name, n.name_it).trim(),
        image_url: n.image_url,
      }))
      .filter((n) => n.name.length > 0);

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5;

  const productSlug = normalizeProductSlug(product.slug || '');
  const galleryImages = (() => {
    const rows = (product.product_images || []) as {
      url: string;
      display_order?: number | null;
      position?: number | null;
      is_primary?: boolean;
    }[];
    const sorted = [...rows].sort((a, b) => {
      const ao = a.display_order ?? a.position ?? 99;
      const bo = b.display_order ?? b.position ?? 99;
      if (ao !== bo) return ao - bo;
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });
    const urls = sorted.map((r) => r.url).filter((u): u is string => Boolean(u));
    const signature = getSignatureMedia(productSlug);
    if (signature && urls.length === 0) return signature.gallery;
    return urls;
  })();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />

      <div className="page-content mx-auto max-w-screen-2xl pb-24 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery
              images={galleryImages}
              productName={displayName}
              productSlug={productSlug}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-sans font-bold">
                  {displayFamily}
                </span>
                <div className="flex items-center gap-4">
                  <button className="text-brand-black/40 hover:text-brand-gold transition-colors"><Share2 size={18} strokeWidth={1.5} /></button>
                  {product?.id ? <WishlistButton productId={product.id} /> : null}
                </div>
              </div>
              
              <h1 className="heading-page mb-4 sm:mb-6">{displayName}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(averageRating) ? "currentColor" : "none"} />)}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-black/40 font-sans font-bold">
                  {reviews.length} {t('product.reviews', 'Avis Clients')}
                </span>
              </div>

              {displayDescription.trim() ? (
                <p className="text-brand-black/70 font-sans text-base leading-relaxed mb-10">{displayDescription}</p>
              ) : null}

              {/* Size Selector */}
              <div className="mb-10">
                <span className="text-[10px] uppercase tracking-widest font-sans mb-4 block font-bold">{t('product.format', 'Format')}</span>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setNotified(false); }}
                      className={cn(
                        "px-6 py-3 border text-xs font-sans tracking-widest transition-all duration-300",
                        selectedVariant?.id === v.id ? 'border-brand-black bg-brand-black text-brand-cream' : 'border-brand-black/10 hover:border-brand-gold'
                      )}
                    >
                      {v.size_ml}ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-black/40 block mb-1 font-bold">{t('product.price_label')}</span>
                  <span className="text-3xl font-serif">{selectedVariant ? formatPrice(selectedVariant.price) : '—'}</span>
                </div>
                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="text-[10px] uppercase tracking-widest font-sans text-red-500 font-bold">{t('product.out_of_stock', 'Rupture de Stock')}</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest font-sans text-green-600 font-bold">{t('product.in_stock', 'En Stock')}</span>
                  )}
                </div>
              </div>

              {isOutOfStock ? (
                <div className="mb-10 p-8 bg-brand-black/5 rounded-2xl border border-brand-black/5">
                  <h4 className="text-sm font-serif mb-4">{t('product.out_of_stock_title', 'Ce format est actuellement indisponible')}</h4>
                  <p className="text-[11px] text-brand-black/60 mb-6 leading-relaxed">
                    {t('product.out_of_stock_desc', 'Inscrivez-vous pour être prévenu(e) dès son retour en stock.')}
                  </p>
                  
                  {notified ? (
                    <div className="flex items-center gap-3 text-green-600 text-[10px] uppercase tracking-widest font-bold animate-in fade-in slide-in-from-bottom-2">
                      <CheckCircle2 size={16} />
                      {t('product.notify_success', 'Merci ! Nous vous préviendrons par email.')}
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="flex gap-2">
                      <input type="email" required placeholder={t('form.email', 'VOTRE EMAIL')} value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-white border border-brand-black/10 px-4 py-3 text-[10px] uppercase tracking-widest focus:outline-none focus:border-brand-gold transition-all" />
                      <button type="submit" disabled={submitting} className="bg-brand-black text-brand-cream px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold transition-all disabled:opacity-50">
                        {submitting ? '...' : t('product.notify_me', 'Prévenez-moi')}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={handleAddToCart} className="luxury-button mb-10 hidden w-full py-5 text-sm lg:block">
                    {t('product.add_to_cart', 'Ajouter au Panier')}
                  </button>
                  <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-black/10 bg-brand-cream/95 p-4 backdrop-blur-md lg:hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <button onClick={handleAddToCart} className="luxury-button w-full py-4 text-sm">
                      {t('product.add_to_cart', 'Ajouter au Panier')}
                    </button>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-4 border-y border-brand-black/5 py-8 sm:grid-cols-3">
                {[
                  { icon: Truck, text: t('product.free_delivery', 'Livraison offerte') },
                  { icon: RefreshCw, text: t('product.returns', 'Retours 30 jours') },
                  { icon: ShieldCheck, text: t('product.secure_payment', 'Paiement sécurisé') },
                ].map((b, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <b.icon size={20} strokeWidth={1} className="text-brand-gold" />
                    <span className="text-[8px] uppercase tracking-widest font-sans font-bold">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <div className="flex border-b border-brand-black/5 mb-16 overflow-x-auto no-scrollbar justify-center">
            {(
              [
                { id: 'profile' as const, labelKey: 'product.tab.profile_olfactif' },
                { id: 'reviews' as const, labelKey: 'product.tab.avis_clients' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-sans transition-all whitespace-nowrap font-bold',
                  activeTab === tab.id ? 'text-brand-gold border-b border-brand-gold' : 'text-brand-black/40 hover:text-brand-black'
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            {activeTab === 'profile' && (
              <OlfactoryProfile
                diagramUrl={product.olfactory_diagram_url}
                title={displayProfileTitle}
                description={displayProfileDesc}
                storyPanel={
                  storyVisual?.image_url
                    ? {
                        url: storyVisual.image_url,
                        caption: dbVisualCaption(language, storyVisual),
                        alt: dbVisualAlt(language, storyVisual),
                      }
                    : undefined
                }
                pyramidImage={
                  pyramidImageUrl
                    ? {
                        url: pyramidImageUrl,
                        caption: dbVisualCaption(language, pyramidVisual ?? {}),
                        alt: dbVisualAlt(language, pyramidVisual ?? {}),
                      }
                    : undefined
                }
                notes={{
                  head: mapOlfactoryNotes(product.olfactory_notes?.filter((n: any) => n.type === 'head') || []),
                  heart: mapOlfactoryNotes(product.olfactory_notes?.filter((n: any) => n.type === 'heart') || []),
                  base: mapOlfactoryNotes(product.olfactory_notes?.filter((n: any) => n.type === 'base') || []),
                }}
              />
            )}

            {activeTab === 'reviews' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Review Form */}
                    <div className="lg:col-span-5 bg-white p-10 rounded-[40px] border border-brand-black/5 shadow-xl shadow-brand-black/5 h-fit">
                      <h3 className="text-2xl font-serif mb-6">{t('review.write', 'Partagez votre expérience')}</h3>
                      {!user ? (
                        <div className="text-center py-8 space-y-6">
                           <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                              <ShieldCheck size={32} />
                           </div>
                           <p className="text-sm text-brand-black/60 font-medium">
                              {t('review.login_required', 'Vous devez être connecté pour déposer un avis.')}
                           </p>
                           <button 
                             type="button"
                             onClick={() => { window.location.href = '/auth/login'; }}
                             className="luxury-button w-full py-4 text-[10px]"
                           >
                              {t('auth.login', 'Se Connecter')}
                           </button>
                        </div>
                      ) : reviewSuccess ? (
                        <div className="bg-green-50 text-green-600 p-8 rounded-3xl text-sm font-medium border border-green-100 flex flex-col items-center text-center gap-4">
                           <CheckCircle2 size={32} />
                           <p>{t('review.success_detail', 'Merci ! Votre avis a été envoyé pour modération et sera publié très prochainement.')}</p>
                           <button type="button" onClick={() => setReviewSuccess(false)} className="text-[10px] uppercase tracking-widest font-black underline underline-offset-4">{t('review.write_another')}</button>
                        </div>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">{t('review.name', 'Votre Nom')}</label>
                            <input type="text" required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">{t('review.rating', 'Note')}</label>
                            <div className="flex gap-2">
                              {[1,2,3,4,5].map(star => (
                                <button key={star} type="button" onClick={() => setReviewForm({...reviewForm, rating: star})} className={cn("transition-all", reviewForm.rating >= star ? "text-brand-gold" : "text-gray-200")}>
                                  <Star size={24} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">{t('review.comment', 'Votre avis')}</label>
                            <textarea required rows={4} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" placeholder={t('review.placeholder', 'Quelle émotion ce parfum vous procure-t-il ?')} />
                          </div>
                          <button type="submit" disabled={submittingReview} className="luxury-button w-full py-5 flex items-center justify-center gap-3">
                            {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {t('review.submit', 'Publier mon avis')}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Review List */}
                    <div className="lg:col-span-7 space-y-8">
                       <h3 className="text-2xl font-serif">{`${reviews.length}`} {t('review.count_suffix')}</h3>
                       {loadingReviews ? (
                         <div className="text-center py-20 italic text-gray-400">{t('review.loading', '')}</div>
                       ) : reviews.length === 0 ? (
                         <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                           <MessageSquare size={32} className="text-gray-100 mx-auto mb-4" />
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-bold font-sans">{t('review.empty', 'Soyez le premier à donner votre avis')}</p>
                         </div>
                       ) : (
                         reviews.map((r) => (
                           <div key={r.id} className="bg-white p-8 rounded-[32px] border border-brand-black/5 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold">
                                    {r.user_name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider">{r.user_name}</h4>
                                    <p className="text-[9px] text-gray-400 font-bold">{new Date(r.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex text-brand-gold">
                                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? "currentColor" : "none"} />)}
                                </div>
                              </div>
                              <p className="text-sm text-brand-black/70 italic font-serif leading-relaxed">
                                &quot;{r.comment}&quot;
                              </p>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
               </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-brand-cream border-t border-brand-black/5 p-4 md:hidden z-40 flex items-center justify-between gap-4">
        <div>
          <span className="text-lg font-serif">{selectedVariant ? formatPrice(selectedVariant.price) : '—'}</span>
        </div>
        <button onClick={handleAddToCart} className="luxury-button flex-1 py-3 text-[10px]">
          {t('product.add_to_cart', 'Ajouter au Panier')}
        </button>
      </div>

      <Footer />
    </main>
  );
}
