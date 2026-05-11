'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { 
  Tag, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit,
  Save,
  Percent,
  Euro,
  Loader2,
  X,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Gift,
  Image as ImageIcon
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  DEFAULT_HERO_BADGES,
  DEFAULT_HERO_PRODUCT_IMAGE,
  DEFAULT_HERO_SECONDARY_IMAGE,
  type HeroBadge,
} from '@/lib/hero-content';

export default function AdminMarketingPage() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'promos' | 'site_content'>('promos');
  const [homeContent, setHomeContent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    min_order: 0,
    max_uses: null as number | null,
    is_active: true,
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: ''
  });

  const supabase = useMemo(() => createClient(), []);

  const fetchData = React.useCallback(async () => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setLoading(true), 0);
    
    // Promo Codes
    const { data: promoData } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (promoData) setPromoCodes(promoData);

    // Home Content
    const { data: homeData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'home_content')
      .single();
    if (homeData?.value) {
      const v = { ...homeData.value };
      if (!Array.isArray(v.hero_badges) || v.hero_badges.length === 0) {
        v.hero_badges = DEFAULT_HERO_BADGES.map((b) => ({ ...b }));
      }
      setHomeContent(v);
    } else {
      setHomeContent({
        hero_badges: DEFAULT_HERO_BADGES.map((b) => ({ ...b })),
        hero_product_image: DEFAULT_HERO_PRODUCT_IMAGE,
        hero_image: DEFAULT_HERO_SECONDARY_IMAGE,
      });
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveHomeContent = async () => {
    if (!homeContent) {
      useToast.getState().show('Aucun contenu à enregistrer.', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'home_content', value: homeContent, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (!error) useToast.getState().show('Contenu mis à jour', 'success');
    else useToast.getState().show(`Erreur: ${error.message}`, 'error');
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) setPromoCodes(promoCodes.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('promo_codes')
      .insert([formData]);

    if (!error) {
      setShowAddModal(false);
      fetchData();
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        min_order: 0,
        max_uses: null,
        is_active: true,
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: ''
      });
    } else {
      useToast.getState().show(`Erreur: ${error.message}`, 'error');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Marketing & Offres</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gérez vos campagnes et programmes de fidélité</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          <Plus size={16} />
          Nouveau Code Promo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('promos')}
          className={cn(
            "pb-4 px-2 text-[10px] uppercase tracking-widest font-black transition-all",
            activeTab === 'promos' ? "text-brand-gold border-b-2 border-brand-gold" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Codes Promotions
        </button>
        <button 
          onClick={() => setActiveTab('site_content')}
          className={cn(
            "pb-4 px-2 text-[10px] uppercase tracking-widest font-black transition-all",
            activeTab === 'site_content' ? "text-brand-gold border-b-2 border-brand-gold" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Contenu du Site (Home)
        </button>
      </div>

      {activeTab === 'promos' ? (
        <React.Fragment>
          {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Codes Actifs', value: promoCodes.filter(p => p.is_active).length, icon: Tag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Utilisations Totales', value: promoCodes.reduce((acc, p) => acc + (p.used_count || 0), 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Économies Clients', value: formatPrice(1240), icon: Gift, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
          { label: 'Taux de Conversion', value: '4.2%', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
              <p className="text-xl font-serif font-medium">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))
        ) : promoCodes.length > 0 ? (
          promoCodes.map((code) => (
            <div key={code.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-gray-50 hover:bg-brand-gold/10 text-gray-400 hover:text-brand-gold rounded-xl transition-all">
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(code.id)}
                  className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
                  <Tag size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-medium tracking-tight">{code.code}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border",
                      code.is_active ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {code.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Réduction</span>
                  <span className="text-xs font-black text-gray-900">
                    {code.type === 'percentage' ? `${code.value}%` : formatPrice(code.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Utilisations</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-gold" 
                        style={{ width: code.max_uses ? `${(code.used_count / code.max_uses) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-900">{code.used_count} / {code.max_uses || '∞'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Panier Min.</span>
                  <span className="text-xs font-black text-gray-900">{formatPrice(code.min_order)}</span>
                </div>
              </div>

              {code.ends_at && (
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                    <Clock size={12} />
                    Expire le {new Date(code.ends_at).toLocaleDateString('fr-FR')}
                  </div>
                  <ArrowRight size={14} className="text-gray-200" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-gray-100">
            <Tag size={48} className="mx-auto mb-6 text-gray-200" strokeWidth={1} />
            <p className="text-sm font-serif italic text-gray-400">Aucun code promotionnel actif</p>
          </div>
        )}
      </div>
      </React.Fragment>
    ) : !homeContent ? (
      <div className="flex items-center justify-center rounded-[40px] border border-gray-100 bg-white py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    ) : (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-12">
             <section className="space-y-8">
                <div className="flex items-center gap-4 border-b border-brand-gold/10 pb-4">
                   <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <ImageIcon size={16} />
                   </div>
                   <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black">Cinematic Hero (Entête)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Titre Hero</label>
                      <input 
                        type="text" 
                        value={homeContent?.hero_title || ''} 
                        onChange={(e) => setHomeContent({ ...homeContent, hero_title: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30 transition-all font-serif" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Sous-titre Hero</label>
                      <input 
                        type="text" 
                        value={homeContent?.hero_subtitle || ''} 
                        onChange={(e) => setHomeContent({ ...homeContent, hero_subtitle: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30 transition-all" 
                      />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                        Accroche sous le titre (colonne gauche, italique)
                      </label>
                      <textarea
                        rows={3}
                        value={homeContent?.hero_lead ?? ''}
                        onChange={(e) => setHomeContent({ ...homeContent, hero_lead: e.target.value })}
                        className="w-full rounded-2xl border-none bg-gray-50 p-6 text-sm leading-relaxed focus:ring-1 focus:ring-brand-gold/30"
                        placeholder="Texte court sous « Extrait de Parfum »…"
                      />
                      <p className="text-[10px] text-gray-400">
                        Si vide, le texte « Histoire » plus bas peut servir de repli (ancien comportement).
                      </p>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                        Image storytelling « Maison » (bloc texte + photo)
                      </label>
                      <div className="relative group">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          value={homeContent?.hero_image || ''} 
                          onChange={(e) => setHomeContent({ ...homeContent, hero_image: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all" 
                          placeholder={DEFAULT_HERO_SECONDARY_IMAGE}
                        />
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-400">
                        Visuel ambiance / lifestyle sous « Une Maison de Haute Parfumerie ». Défaut :{' '}
                        <code className="rounded bg-gray-100 px-1">{DEFAULT_HERO_SECONDARY_IMAGE}</code>
                      </p>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                        Packshot Hero (grande image à droite, au-dessus de la ligne de flottaison)
                      </label>
                      <div className="relative group">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          value={homeContent?.hero_product_image ?? ''} 
                          onChange={(e) => setHomeContent({ ...homeContent, hero_product_image: e.target.value })}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30 transition-all" 
                          placeholder={DEFAULT_HERO_PRODUCT_IMAGE}
                        />
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-400">
                        Vide = packshot studio par défaut (<code className="rounded bg-gray-100 px-1">{DEFAULT_HERO_PRODUCT_IMAGE}</code>). URL Supabase Storage ou{' '}
                        <code className="rounded bg-gray-100 px-1">/images/…</code>
                      </p>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Texte alt (accessibilité)</label>
                      <input 
                        type="text" 
                        value={homeContent?.hero_image_alt || ''} 
                        onChange={(e) => setHomeContent({ ...homeContent, hero_image_alt: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30 transition-all" 
                        placeholder="WHY - Extrait de Parfum"
                      />
                   </div>
                </div>
             </section>

             <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/10 pb-4">
                   <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                         <Tag size={16} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-gold">Pastilles flottantes</h3>
                        <p className="mt-1 max-w-xl text-[10px] text-gray-500">
                          Jusqu’à 6 pastilles. Style <strong>clair</strong> (fond blanc) ou <strong>sombre</strong> (fond noir). Position haut-droite ou bas-gauche.
                        </p>
                      </div>
                   </div>
                   <button
                     type="button"
                     onClick={() => {
                       const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])];
                       if (list.length >= 6) return;
                       list.push({
                         id: `badge-${Date.now()}`,
                         variant: 'light',
                         label: 'Nouveau',
                         text: 'Texte',
                         slot: 'top-right',
                       });
                       setHomeContent({ ...homeContent, hero_badges: list });
                     }}
                     className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:border-brand-gold"
                   >
                     + Pastille
                   </button>
                </div>
                <div className="space-y-4">
                  {((homeContent?.hero_badges as HeroBadge[]) || []).map((badge, idx) => (
                    <div
                      key={badge.id}
                      className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 md:grid-cols-12 md:items-end"
                    >
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Titre (petit)</label>
                        <input
                          className="w-full rounded-xl border-none bg-white px-3 py-2 text-sm"
                          value={badge.label}
                          onChange={(e) => {
                            const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setHomeContent({ ...homeContent, hero_badges: list });
                          }}
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Texte principal</label>
                        <input
                          className="w-full rounded-xl border-none bg-white px-3 py-2 text-sm"
                          value={badge.text}
                          onChange={(e) => {
                            const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])];
                            list[idx] = { ...list[idx], text: e.target.value };
                            setHomeContent({ ...homeContent, hero_badges: list });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Style</label>
                        <select
                          className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-bold uppercase"
                          value={badge.variant}
                          onChange={(e) => {
                            const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])];
                            list[idx] = { ...list[idx], variant: e.target.value as HeroBadge['variant'] };
                            setHomeContent({ ...homeContent, hero_badges: list });
                          }}
                        >
                          <option value="light">Clair</option>
                          <option value="dark">Sombre</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Position</label>
                        <select
                          className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-bold uppercase"
                          value={badge.slot}
                          onChange={(e) => {
                            const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])];
                            list[idx] = { ...list[idx], slot: e.target.value as HeroBadge['slot'] };
                            setHomeContent({ ...homeContent, hero_badges: list });
                          }}
                        >
                          <option value="top-right">Haut droite</option>
                          <option value="bottom-left">Bas gauche</option>
                        </select>
                      </div>
                      <div className="flex md:col-span-1 md:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...((homeContent?.hero_badges as HeroBadge[]) || [])].filter((_, i) => i !== idx);
                            setHomeContent({ ...homeContent, hero_badges: list.length ? list : DEFAULT_HERO_BADGES.map((b) => ({ ...b })) });
                          }}
                          className="rounded-xl p-2 text-red-400 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setHomeContent({
                      ...homeContent,
                      hero_badges: DEFAULT_HERO_BADGES.map((b) => ({ ...b })),
                    })
                  }
                  className="text-[9px] font-bold uppercase tracking-widest text-gray-400 underline underline-offset-4 hover:text-brand-gold"
                >
                  Réinitialiser les pastilles (défaut WHY)
                </button>
             </section>

             <section className="space-y-8">
                <div className="flex items-center gap-4 border-b border-brand-gold/10 pb-4">
                   <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <Edit size={16} />
                   </div>
                   <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black">Histoire de la Maison</h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Titre Storytelling</label>
                      <input 
                        type="text" 
                        value={homeContent?.story_title || ''} 
                        onChange={(e) => setHomeContent({ ...homeContent, story_title: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-serif" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Texte Storytelling</label>
                      <textarea 
                        rows={5}
                        value={homeContent?.story_text || ''} 
                        onChange={(e) => setHomeContent({ ...homeContent, story_text: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-sm leading-relaxed" 
                      />
                   </div>
                </div>
             </section>

             <button 
                onClick={handleSaveHomeContent}
                disabled={saving}
                className="w-full py-5 bg-gray-900 text-white rounded-[24px] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-200"
             >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Sauvegarde...' : 'Mettre à jour le contenu du site'}
             </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white z-[110] rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif font-medium">Nouveau Code Promo</h2>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-2">Configurez votre offre spéciale</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Code Promo</label>
                      <input 
                        required
                        type="text" 
                        placeholder="EX: ETE2024"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Type</label>
                      <select 
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all outline-none appearance-none"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant Fixe (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Valeur</label>
                      <div className="relative">
                        <input 
                          required
                          type="number" 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                          {formData.type === 'percentage' ? '%' : '€'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Panier Minimum</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                          value={formData.min_order}
                          onChange={(e) => setFormData({ ...formData, min_order: Number(e.target.value) })}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Date de Début</label>
                      <input 
                        type="date" 
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        value={formData.starts_at}
                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Date de Fin</label>
                      <input 
                        type="date" 
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        value={formData.ends_at}
                        onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    {saving ? 'Création en cours...' : 'Créer le Code Promo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
