'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { Plus, Trash2, Edit, Save, Loader2, X, Image as ImageIcon, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCol, setSelectedCol] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      const { data: d2 } = await supabase.from('collections').select('*').order('name', { ascending: true });
      if (d2) setCollections(d2);
      else setCollections([]);
    } else if (data) {
      setCollections(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const moveCollection = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= collections.length) return;
    const a = collections[index];
    const b = collections[next];
    const na = Number(a.sort_order) || 0;
    const nb = Number(b.sort_order) || 0;
    const { error: e1 } = await supabase.from('collections').update({ sort_order: nb }).eq('id', a.id);
    const { error: e2 } = await supabase.from('collections').update({ sort_order: na }).eq('id', b.id);
    if (e1 || e2) {
      useToast.getState().show((e1 || e2)?.message || 'Erreur réordonnancement', 'error');
      return;
    }
    fetchCollections();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const name = (formData.get('name') as string)?.trim();
    const slugRaw = (formData.get('slug') as string)?.trim();
    const slug = slugRaw || name?.toLowerCase().replace(/\s+/g, '-') || 'collection';
    const sortOrder = parseInt(String(formData.get('sort_order')), 10);
    const maxSort = collections.length
      ? Math.max(0, ...collections.map((c) => Number(c.sort_order) || 0))
      : -1;

    const payload: Record<string, unknown> = {
      name,
      slug,
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      name_it: (formData.get('name_it') as string)?.trim() || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : maxSort + 1,
      is_published: formData.get('is_published') === 'on',
    };

    try {
      if (isEditing && selectedCol?.id) {
        const { error } = await supabase.from('collections').update(payload).eq('id', selectedCol.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('collections').insert([payload]);
        if (error) throw error;
      }
      useToast.getState().show(isEditing ? 'Collection mise à jour' : 'Collection créée', 'success');
      fetchCollections();
      setShowModal(false);
    } catch (err: any) {
      useToast.getState().show(err?.message || 'Une erreur est survenue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette collection ? Les liens produits seront retirés (contrainte base).')) return;
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) useToast.getState().show(error.message, 'error');
    else fetchCollections();
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-10">
      <div className="flex flex-col gap-6 border-b border-gray-100 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-3 font-serif text-4xl">Collections boutique</h1>
          <p className="max-w-xl text-sm leading-relaxed text-gray-500">
            Chaque onglet du catalogue <strong>Nos Créations</strong> correspond à une collection. Par défaut la
            maison utilise <strong>SIGNATURE</strong> ; vous pouvez en ajouter d’autres (éditions limitées, capsules,
            etc.). Rattachez les parfums depuis{' '}
            <span className="font-semibold text-gray-800">Admin → Produits</span> en cochant les collections sur la
            fiche.
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            Ordre des onglets = champ « ordre » (plus petit à gauche)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setSelectedCol(null);
            setShowModal(true);
          }}
          className="flex items-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-gray-200 transition-all hover:bg-black"
        >
          <Plus size={16} />
          Nouvelle collection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-gray-100 bg-white" />
          ))
        ) : (
          collections.map((col, index) => (
            <div
              key={col.id}
              className="group overflow-hidden rounded-[32px] border border-gray-100 bg-white transition-all hover:shadow-xl"
            >
              <div className="relative h-48 bg-gray-100">
                {col.image_url ? (
                  <img
                    src={col.image_url}
                    alt={col.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex flex-col gap-1">
                  <button
                    type="button"
                    title="Monter"
                    onClick={() => moveCollection(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    title="Descendre"
                    onClick={() => moveCollection(index, 1)}
                    disabled={index === collections.length - 1}
                    className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCol(col);
                      setIsEditing(true);
                      setShowModal(true);
                    }}
                    className="rounded-xl bg-white/90 p-2 text-gray-600 shadow-lg backdrop-blur-md transition-all hover:text-brand-gold"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col.id)}
                    className="rounded-xl bg-white/90 p-2 text-gray-600 shadow-lg backdrop-blur-md transition-all hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-widest',
                      col.is_published === false
                        ? 'border-gray-200 bg-black/50 text-white'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    )}
                  >
                    {col.is_published === false ? <EyeOff size={10} /> : <Eye size={10} />}
                    {col.is_published === false ? 'Masquée' : 'En ligne'}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="mb-2 font-serif text-xl">{col.name}</h3>
                {col.name_it && <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-400">IT : {col.name_it}</p>}
                <p className="line-clamp-2 text-xs italic text-gray-500">{col.description || 'Aucune description'}</p>
                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span>Slug : {col.slug}</span>
                  <span>Ordre : {col.sort_order ?? 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-6 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[40px] bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-50 bg-white p-8">
                <h2 className="font-serif text-2xl">{isEditing ? 'Modifier la collection' : 'Nouvelle collection'}</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-10">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Nom (FR / défaut boutique)
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={selectedCol?.name}
                    className="w-full rounded-2xl border-none bg-gray-50 py-4 px-6 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Nom italien (optionnel)
                  </label>
                  <input
                    name="name_it"
                    type="text"
                    defaultValue={selectedCol?.name_it}
                    className="w-full rounded-2xl border-none bg-gray-50 py-4 px-6 text-sm"
                    placeholder="SIGNATURE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Slug URL (ex. signature)
                  </label>
                  <input
                    name="slug"
                    type="text"
                    placeholder="signature"
                    defaultValue={selectedCol?.slug}
                    className="w-full rounded-2xl border-none bg-gray-50 py-4 px-6 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Ordre d’affichage (0 = premier onglet après « Toutes »)
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={selectedCol?.sort_order ?? collections.length}
                    className="w-full rounded-2xl border-none bg-gray-50 py-4 px-6 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <input
                    type="checkbox"
                    name="is_published"
                    id="is_published"
                    defaultChecked={selectedCol?.is_published !== false}
                    className="h-5 w-5 accent-brand-gold"
                  />
                  <label htmlFor="is_published" className="text-[11px] font-medium leading-snug text-gray-700">
                    Visible sur le site (catalogue, footer, accueil). Décochez pour préparer une collection sans la
                    publier.
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    URL image (optionnel)
                  </label>
                  <input
                    name="image_url"
                    type="text"
                    defaultValue={selectedCol?.image_url}
                    className="w-full rounded-2xl border-none bg-gray-50 py-4 px-6 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={selectedCol?.description}
                    className="w-full rounded-[24px] border-none bg-gray-50 p-6 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-4 rounded-[24px] bg-gray-900 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-black disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
