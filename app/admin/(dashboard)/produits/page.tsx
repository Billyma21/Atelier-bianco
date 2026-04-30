'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  X,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Globe,
  Dna
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import Image from 'next/image';
import { mapVisualsByKind, type OlfactoryVisualKind } from '@/lib/olfactory-visuals';

type OlfactoryVisualForm = {
  image_url: string;
  caption_fr: string;
  caption_it: string;
  alt_fr: string;
  alt_it: string;
};

const emptyOlfactoryVisual = (): OlfactoryVisualForm => ({
  image_url: '',
  caption_fr: '',
  caption_it: '',
  alt_fr: '',
  alt_it: '',
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newNotes, setNewNotes] = useState<{ type: string; name: string; image_url: string }[]>([]);
  const [variants, setVariants] = useState<{ size_ml: number; price: number; stock: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [perfumers, setPerfumers] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [olfactoryVisualInputs, setOlfactoryVisualInputs] = useState<
    Record<OlfactoryVisualKind, OlfactoryVisualForm>
  >({
    story_panel: emptyOlfactoryVisual(),
    pyramid_diagram: emptyOlfactoryVisual(),
  });

  const supabase = useMemo(() => createClient(), []);

  const uploadOlfactoryFile = async (kind: OlfactoryVisualKind, file: File | null) => {
    if (!file) return;
    if (!selectedProduct?.id) {
      useToast.getState().show('Enregistrez le produit une première fois pour importer une image.', 'error');
      return;
    }
    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
    const path = `${selectedProduct.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-olfactory').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) {
      useToast.getState().show(error.message, 'error');
      return;
    }
    const { data } = supabase.storage.from('product-olfactory').getPublicUrl(path);
    setOlfactoryVisualInputs((prev) => ({
      ...prev,
      [kind]: { ...prev[kind], image_url: data.publicUrl },
    }));
    useToast.getState().show('Image importée', 'success');
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    
    // Fetch Products
    const { data: pData } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(*),
        olfactory_notes(*),
        product_collections(*),
        product_olfactory_visuals(*)
      `)
      .order('created_at', { ascending: false });

    if (pData) setProducts(pData);

    // Fetch Perfumers
    const { data: perfData } = await supabase.from('perfumers').select('id, name');
    if (perfData) setPerfumers(perfData);

    // Fetch Collections
    const { data: colData } = await supabase.from('collections').select('id, name');
    if (colData) setCollections(colData);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setNewNotes(product.olfactory_notes || []);
    setVariants(product.product_variants || []);
    setSelectedCollections((product.product_collections || []).map((pc: any) => pc.collection_id));
    const byKind = mapVisualsByKind(product.product_olfactory_visuals);
    setOlfactoryVisualInputs({
      story_panel: {
        image_url: byKind.story_panel?.image_url || '',
        caption_fr: byKind.story_panel?.caption_fr || '',
        caption_it: byKind.story_panel?.caption_it || '',
        alt_fr: byKind.story_panel?.alt_fr || '',
        alt_it: byKind.story_panel?.alt_it || '',
      },
      pyramid_diagram: {
        image_url: byKind.pyramid_diagram?.image_url || product.olfactory_diagram_url || '',
        caption_fr: byKind.pyramid_diagram?.caption_fr || '',
        caption_it: byKind.pyramid_diagram?.caption_it || '',
        alt_fr: byKind.pyramid_diagram?.alt_fr || '',
        alt_it: byKind.pyramid_diagram?.alt_it || '',
      },
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setSelectedProduct(null);
    setNewNotes([]);
    setVariants([]);
    setOlfactoryVisualInputs({
      story_panel: emptyOlfactoryVisual(),
      pyramid_diagram: emptyOlfactoryVisual(),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      useToast.getState().show('Erreur lors de la suppression', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
      name: formData.get('name') as string,
      name_it: formData.get('name_it') as string,
      slug: formData.get('slug') as string,
      family: formData.get('family') as string,
      family_it: formData.get('family_it') as string,
      description: formData.get('description') as string,
      long_desc: formData.get('description') as string,
      description_it: formData.get('description_it') as string,
      status: formData.get('status') as string,
      intensity: parseInt(formData.get('intensity') as string) || 3,
      is_featured: (document.getElementById('featured') as HTMLInputElement).checked,
      olfactory_diagram_url: olfactoryVisualInputs.pyramid_diagram.image_url?.trim() || '',
      olfactory_profile_title_fr: formData.get('olfactory_profile_title_fr') as string,
      olfactory_profile_title_it: formData.get('olfactory_profile_title_it') as string,
      olfactory_profile_description_fr: formData.get('olfactory_profile_description_fr') as string,
      olfactory_profile_description_it: formData.get('olfactory_profile_description_it') as string,
    };

    let productId = selectedProduct?.id;

    try {
      const persistProduct = async (mode: 'insert' | 'update') => {
        let candidatePayload: Record<string, any> = { ...payload };

        while (true) {
          const query =
            mode === 'update'
              ? supabase
                  .from('products')
                  .update({ ...candidatePayload, updated_at: new Date().toISOString() })
                  .eq('id', productId)
                  .select()
                  .single()
              : supabase.from('products').insert(candidatePayload).select().single();

          const { data, error } = await query;
          if (!error) return { data };

          const msg = error.message || '';
          const match = msg.match(/Could not find the '([^']+)' column/);
          if (!match) throw error;

          const missingColumn = match[1];
          if (!(missingColumn in candidatePayload)) throw error;
          delete candidatePayload[missingColumn];
        }
      };

      if (isEditing) {
        await persistProduct('update');
      } else {
        const { data } = await persistProduct('insert');
        productId = data.id;
      }

      // Sync Variants
      await supabase.from('product_variants').delete().eq('product_id', productId);
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(
          variants.map(v => ({ ...v, product_id: productId }))
        );
      }

      // Sync Notes
      await supabase.from('olfactory_notes').delete().eq('product_id', productId);
      if (newNotes.length > 0) {
        await supabase.from('olfactory_notes').insert(
          newNotes.map(n => ({ ...n, product_id: productId }))
        );
      }

      await supabase.from('product_olfactory_visuals').delete().eq('product_id', productId);
      const visualRows: {
        product_id: string;
        kind: OlfactoryVisualKind;
        image_url: string;
        caption_fr: string | null;
        caption_it: string | null;
        alt_fr: string | null;
        alt_it: string | null;
        sort_order: number;
      }[] = [];
      (['story_panel', 'pyramid_diagram'] as const).forEach((kind, i) => {
        const v = olfactoryVisualInputs[kind];
        const url = v.image_url?.trim();
        if (!url) return;
        visualRows.push({
          product_id: productId,
          kind,
          image_url: url,
          caption_fr: v.caption_fr?.trim() || null,
          caption_it: v.caption_it?.trim() || null,
          alt_fr: v.alt_fr?.trim() || null,
          alt_it: v.alt_it?.trim() || null,
          sort_order: i,
        });
      });
      if (visualRows.length > 0) {
        const { error: ovError } = await supabase.from('product_olfactory_visuals').insert(visualRows);
        if (ovError) throw ovError;
      }

      // Sync Collections
      await supabase.from('product_collections').delete().eq('product_id', productId);
      if (selectedCollections.length > 0) {
        await supabase.from('product_collections').insert(
          selectedCollections.map(cid => ({ product_id: productId, collection_id: cid }))
        );
      }

      await fetchData();
      closeModal();
    } catch (error: any) {
      useToast.getState().show('Erreur: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.family?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Catalogue de Produits</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gestion des fragrances et des formats</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setSelectedProduct(null);
            setOlfactoryVisualInputs({
              story_panel: emptyOlfactoryVisual(),
              pyramid_diagram: emptyOlfactoryVisual(),
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          Nouveau Produit
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="RECHERCHER UNE FRAGRANCE..." 
            className="w-full bg-gray-50 border-none rounded-xl py-3.5 pl-12 pr-6 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-all">
            <Filter size={14} />
            Filtres
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-all">
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white aspect-[4/5] rounded-[32px] animate-pulse border border-gray-100" />
          ))
        ) : filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col">
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
              <Image 
                src={product.product_images?.find((i: any) => i.type === 'packshot')?.url || 'https://picsum.photos/seed/perfume/400/500'} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2 shadow-2xl">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black border",
                  product.status === 'active' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {product.status === 'active' ? 'En ligne' : 'Brouillon'}
                </span>
                {product.is_featured && (
                  <span className="bg-brand-gold text-white px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-black flex items-center gap-1">
                    Favori
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => handleEdit(product)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-brand-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">{product.family}</span>
                <span className="text-[10px] text-gray-400 font-mono">#{product.slug}</span>
              </div>
              <h3 className="text-xl font-serif font-medium mb-4">{product.name}</h3>
              <div className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  {product.product_variants?.map((v: any) => (
                    <span key={v.id} className={cn(
                      "text-[9px] px-2 py-1 rounded-lg border font-bold uppercase tracking-widest",
                      v.stock > 0 ? "border-gray-100 text-gray-400" : "border-red-100 text-red-400"
                    )}>
                      {v.size_ml}ml
                    </span>
                  ))}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black">{product.product_variants?.[0] ? formatPrice(product.product_variants[0].price) : 'N/A'}</span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest">Prix de base</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex justify-end">
          <div className="w-full max-w-6xl bg-white h-full shadow-2xl flex flex-col">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-serif font-medium">{isEditing ? 'Modifier la Fragrance' : 'Parfum d&apos;Exception'}</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mt-2">Configuration Multilingue & Profil Olfactif</p>
              </div>
              <button 
                onClick={closeModal}
                className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all font-black text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                
                {/* BLOC LANGUES */}
                <div className="space-y-12">
                   {/* FRANCAIS */}
                  <section className="space-y-8 bg-gray-50/50 p-8 rounded-[40px] border border-gray-100">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                      <Globe size={14} />
                      Contenu Français
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nom (FR)</label>
                        <input name="name" type="text" defaultValue={selectedProduct?.name} required className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30" placeholder="ex: Lavande Royale" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Famille Olfactive (FR)</label>
                        <input name="family" type="text" defaultValue={selectedProduct?.family} className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" placeholder="Boisé Floral" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Description (FR)</label>
                        <textarea name="description" rows={4} defaultValue={selectedProduct?.description || selectedProduct?.long_desc} className="w-full bg-white border-none rounded-[24px] p-6 text-sm leading-relaxed focus:ring-1 focus:ring-brand-gold/30" placeholder="Histoire du parfum..."></textarea>
                      </div>
                    </div>
                  </section>

                   {/* ITALIEN */}
                  <section className="space-y-8 bg-gray-50/50 p-8 rounded-[40px] border border-gray-100">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                      <Globe size={14} />
                      Contenuto Italiano
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nome (IT)</label>
                        <input name="name_it" type="text" defaultValue={selectedProduct?.name_it} className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-1 focus:ring-brand-gold/30" placeholder="ex: Lavanda Reale" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Famiglia Olfattiva (IT)</label>
                        <input name="family_it" type="text" defaultValue={selectedProduct?.family_it} className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" placeholder="Legnoso Floreale" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Descrizione (IT)</label>
                        <textarea name="description_it" rows={4} defaultValue={selectedProduct?.description_it} className="w-full bg-white border-none rounded-[24px] p-6 text-sm leading-relaxed focus:ring-1 focus:ring-brand-gold/30" placeholder="Storia del profumo..."></textarea>
                      </div>
                    </div>
                  </section>
                </div>

                {/* BLOC TECHNIQUE & PROFIL */}
                <div className="space-y-12">
                   {/* PARAMETRES FIXES */}
                   <section className="space-y-8">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                       <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                       Paramètres Système
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Slug (URL)</label>
                        <input name="slug" type="text" defaultValue={selectedProduct?.slug} required className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30" placeholder="lavande-royale" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Intensité</label>
                        <select name="intensity" defaultValue={selectedProduct?.intensity || 3} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[11px] uppercase font-black focus:ring-1 focus:ring-brand-gold/30">
                          <option value="1">1 - Très Léger</option>
                          <option value="2">2 - Délicat</option>
                          <option value="3">3 - Équilibré</option>
                          <option value="4">4 - Intense</option>
                          <option value="5">5 - Puissant</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Status</label>
                        <select name="status" defaultValue={selectedProduct?.status || 'draft'} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[11px] uppercase font-black focus:ring-1 focus:ring-brand-gold/30">
                          <option value="draft">Brouillon</option>
                          <option value="active">Actif</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl h-[56px] mt-6">
                        <input type="checkbox" id="featured" defaultChecked={selectedProduct?.is_featured} className="w-5 h-5 accent-brand-gold border-none rounded-lg" />
                        <label htmlFor="featured" className="text-[10px] uppercase tracking-widest font-black text-gray-700">Mettre en avant</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                          Collections boutique
                        </label>
                        <p className="text-[10px] leading-relaxed text-gray-400">
                          Cochez au moins une collection (ex. <strong>SIGNATURE</strong>) pour que le parfum apparaisse
                          sous l’onglet correspondant sur <strong>Nos Créations</strong>. Gérez les collections dans
                          Admin → Collections.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {collections.map(col => (
                             <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                   if (selectedCollections.includes(col.id)) {
                                      setSelectedCollections(selectedCollections.filter(id => id !== col.id));
                                   } else {
                                      setSelectedCollections([...selectedCollections, col.id]);
                                   }
                                }}
                                className={cn(
                                   "px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black border transition-all text-left",
                                   selectedCollections.includes(col.id) 
                                      ? "bg-brand-gold text-white border-brand-gold" 
                                      : "bg-gray-50 border-gray-100 text-gray-400 hover:border-brand-gold/50"
                                )}
                             >
                                {col.name}
                             </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PROFIL OLFACTIF — visuels + textes (table product_olfactory_visuals + products) */}
                  <section className="space-y-10 bg-brand-gold/5 p-8 rounded-[40px] border border-brand-gold/10">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                      <Dna size={14} />
                      Profil olfactif & visuels
                    </h3>
                    <p className="text-[10px] leading-relaxed text-gray-500 font-medium">
                      Deux visuels par produit : un panneau narration (pleine largeur sur la fiche) et le schéma pyramide.
                      Les légendes FR/IT s’affichent selon la langue du site. Importez dans le bucket{' '}
                      <span className="font-mono text-gray-700">product-olfactory</span> (produit déjà enregistré requis).
                    </p>

                    {(['story_panel', 'pyramid_diagram'] as const).map((kind) => {
                      const label =
                        kind === 'story_panel'
                          ? 'Panneau narration & plan séquence'
                          : 'Schéma pyramide / architecture olfactive';
                      const v = olfactoryVisualInputs[kind];
                      return (
                        <div
                          key={kind}
                          className="space-y-4 rounded-[28px] border border-brand-gold/15 bg-white/80 p-6 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold">
                              {label}
                            </span>
                            <label className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-600 transition hover:border-brand-gold/40 hover:text-gray-900">
                              Importer
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                disabled={!selectedProduct?.id}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) void uploadOlfactoryFile(kind, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          {!selectedProduct?.id && (
                            <p className="text-[9px] uppercase tracking-widest text-amber-700/90">
                              Créez le produit, puis rouvrez l’édition pour téléverser une image.
                            </p>
                          )}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                              URL image (ou coller après upload)
                            </label>
                            <input
                              type="text"
                              value={v.image_url}
                              onChange={(e) =>
                                setOlfactoryVisualInputs((prev) => ({
                                  ...prev,
                                  [kind]: { ...prev[kind], image_url: e.target.value },
                                }))
                              }
                              className="w-full bg-white border-none rounded-2xl py-4 px-6 text-xs font-mono focus:ring-1 focus:ring-brand-gold/30"
                              placeholder="https://..."
                            />
                          </div>
                          {v.image_url ? (
                            <div className="flex max-h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2">
                              {/* eslint-disable-next-line @next/next/no-img-element -- prévisualisation URL arbitraire admin */}
                              <img
                                src={v.image_url}
                                alt=""
                                className="max-h-44 w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : null}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input
                              type="text"
                              value={v.caption_fr}
                              onChange={(e) =>
                                setOlfactoryVisualInputs((prev) => ({
                                  ...prev,
                                  [kind]: { ...prev[kind], caption_fr: e.target.value },
                                }))
                              }
                              className="w-full rounded-2xl border-none bg-gray-50 py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30"
                              placeholder="Légende FR (sous l’image)"
                            />
                            <input
                              type="text"
                              value={v.caption_it}
                              onChange={(e) =>
                                setOlfactoryVisualInputs((prev) => ({
                                  ...prev,
                                  [kind]: { ...prev[kind], caption_it: e.target.value },
                                }))
                              }
                              className="w-full rounded-2xl border-none bg-gray-50 py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30"
                              placeholder="Didascalia IT"
                            />
                            <input
                              type="text"
                              value={v.alt_fr}
                              onChange={(e) =>
                                setOlfactoryVisualInputs((prev) => ({
                                  ...prev,
                                  [kind]: { ...prev[kind], alt_fr: e.target.value },
                                }))
                              }
                              className="w-full rounded-2xl border-none bg-gray-50 py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30"
                              placeholder="Texte alternatif FR (accessibilité)"
                            />
                            <input
                              type="text"
                              value={v.alt_it}
                              onChange={(e) =>
                                setOlfactoryVisualInputs((prev) => ({
                                  ...prev,
                                  [kind]: { ...prev[kind], alt_it: e.target.value },
                                }))
                              }
                              className="w-full rounded-2xl border-none bg-gray-50 py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30"
                              placeholder="Testo alternativo IT"
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="space-y-6 border-t border-brand-gold/10 pt-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                        Titres & accroches (table products)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Titre Profil (FR)</label>
                          <input name="olfactory_profile_title_fr" type="text" defaultValue={selectedProduct?.olfactory_profile_title_fr} className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" placeholder="Caractère Silvestre" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Titre Profil (IT)</label>
                          <input name="olfactory_profile_title_it" type="text" defaultValue={selectedProduct?.olfactory_profile_title_it} className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-brand-gold/30" placeholder="Carattere Silvestre" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <textarea name="olfactory_profile_description_fr" rows={2} defaultValue={selectedProduct?.olfactory_profile_description_fr} className="w-full bg-white border-none rounded-2xl p-4 text-xs italic focus:ring-1 focus:ring-brand-gold/30" placeholder="Description courte (FR)..."></textarea>
                        <textarea name="olfactory_profile_description_it" rows={2} defaultValue={selectedProduct?.olfactory_profile_description_it} className="w-full bg-white border-none rounded-2xl p-4 text-xs italic focus:ring-1 focus:ring-brand-gold/30" placeholder="Description courte (IT)..."></textarea>
                      </div>
                    </div>
                  </section>

                  {/* VARIANTES */}
                  <section className="space-y-6">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black">Formats & Prix</h3>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <span className="text-[10px] font-black">{v.size_ml}ml</span>
                          <span className="text-[10px] font-bold text-gray-400">{v.price}€</span>
                          <span className="text-[9px] font-mono text-gray-500">stock {v.stock}</span>
                          <div className="flex flex-wrap gap-1 border-l border-gray-200 pl-2">
                            <button
                              type="button"
                              title="Rupture (0)"
                              onClick={() =>
                                setVariants(variants.map((row, i) => (i === idx ? { ...row, stock: 0 } : row)))
                              }
                              className="rounded-lg bg-white px-2 py-1 text-[8px] font-black uppercase tracking-wider text-red-600 shadow-sm hover:bg-red-50"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              title="-10"
                              onClick={() =>
                                setVariants(
                                  variants.map((row, i) =>
                                    i === idx ? { ...row, stock: Math.max(0, row.stock - 10) } : row
                                  )
                                )
                              }
                              className="rounded-lg bg-white px-2 py-1 text-[8px] font-black text-gray-600 shadow-sm hover:bg-gray-100"
                            >
                              −10
                            </button>
                            <button
                              type="button"
                              title="+10"
                              onClick={() =>
                                setVariants(
                                  variants.map((row, i) =>
                                    i === idx ? { ...row, stock: row.stock + 10 } : row
                                  )
                                )
                              }
                              className="rounded-lg bg-white px-2 py-1 text-[8px] font-black text-emerald-700 shadow-sm hover:bg-emerald-50"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              title="Réapprovisionnement (+50)"
                              onClick={() =>
                                setVariants(
                                  variants.map((row, i) =>
                                    i === idx ? { ...row, stock: row.stock + 50 } : row
                                  )
                                )
                              }
                              className="rounded-lg bg-brand-gold/20 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-gray-900 hover:bg-brand-gold/40"
                            >
                              +50
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                            className="text-gray-300 transition-colors hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input id="v-size" type="number" placeholder="ML" className="bg-gray-50 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30" />
                      <input id="v-price" type="number" placeholder="€" className="bg-gray-50 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30" />
                      <input id="v-stock" type="number" placeholder="Stock" className="bg-gray-50 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30" />
                      <button 
                         type="button" 
                         onClick={() => {
                           const size_ml = parseInt((document.getElementById('v-size') as HTMLInputElement).value);
                           const price = parseFloat((document.getElementById('v-price') as HTMLInputElement).value);
                           const stock = parseInt((document.getElementById('v-stock') as HTMLInputElement).value) || 0;
                           if (size_ml && price) {
                             setVariants([...variants, { size_ml, price, stock }]);
                             (document.getElementById('v-size') as HTMLInputElement).value = '';
                             (document.getElementById('v-price') as HTMLInputElement).value = '';
                             (document.getElementById('v-stock') as HTMLInputElement).value = '';
                           }
                         }}
                         className="bg-gray-900 text-white rounded-xl flex items-center justify-center font-black"
                      >
                         <Plus size={16} />
                      </button>
                    </div>
                  </section>

                  {/* NOTES OLFACTIVES */}
                  <section className="space-y-6">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black">Notes Olfactives (Tête, Cœur, Fond)</h3>
                    <div className="flex flex-wrap gap-3">
                      {newNotes.map((note, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                          <span className={cn(
                            "text-[8px] uppercase font-black px-2 py-0.5 rounded-full",
                            note.type === 'head' ? 'bg-blue-50 text-blue-500' :
                            note.type === 'heart' ? 'bg-pink-50 text-pink-500' : 'bg-orange-50 text-orange-500'
                          )}>
                            {note.type === 'head' ? 'Tête' : note.type === 'heart' ? 'Cœur' : 'Fond'}
                          </span>
                          <span className="text-[10px] font-bold">{note.name}</span>
                          <button type="button" onClick={() => setNewNotes(newNotes.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <select id="n-type" className="bg-gray-50 border-none rounded-xl py-3 px-4 text-[10px] uppercase font-bold focus:ring-1 focus:ring-brand-gold/30">
                        <option value="head">Tête</option>
                        <option value="heart">Cœur</option>
                        <option value="base">Fond</option>
                      </select>
                      <input id="n-name" type="text" placeholder="Nom de la note" className="col-span-2 bg-gray-50 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-brand-gold/30" />
                      <button 
                         type="button" 
                         onClick={() => {
                           const type = (document.getElementById('n-type') as HTMLSelectElement).value;
                           const name = (document.getElementById('n-name') as HTMLInputElement).value;
                           if (name) {
                             setNewNotes([...newNotes, { type, name, image_url: '' }]);
                             (document.getElementById('n-name') as HTMLInputElement).value = '';
                           }
                         }}
                         className="bg-brand-gold text-white rounded-xl flex items-center justify-center font-black"
                      >
                         <Plus size={16} />
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 pt-16 mt-16 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-gray-900 transition-all underline underline-offset-8"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-24 py-5 bg-gray-900 text-white rounded-[32px] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all shadow-2xl shadow-gray-200 disabled:opacity-50 flex items-center gap-4"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? 'Enregistrer les modifications' : 'Lancer la Production'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
