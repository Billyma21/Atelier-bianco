'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { Plus, Trash2, Edit, Save, Loader2, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPerfumersPage() {
  const [perfumers, setPerfumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPerfumer, setSelectedPerfumer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchPerfumers = async () => {
    setLoading(true);
    const { data } = await supabase.from('perfumers').select('*').order('name');
    if (data) setPerfumers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPerfumers();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
      photo_url: formData.get('photo_url') as string,
    };

    try {
      if (isEditing) {
        await supabase.from('perfumers').update(payload).eq('id', selectedPerfumer.id);
      } else {
        await supabase.from('perfumers').insert([payload]);
      }
      fetchPerfumers();
      setShowModal(false);
    } catch (err: any) {
      useToast.getState().show(err?.message || 'Une erreur est survenue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce parfumeur ?')) return;
    const { error } = await supabase.from('perfumers').delete().eq('id', id);
    if (!error) fetchPerfumers();
  };

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif mb-3">Parfumeurs</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gérer les créateurs de la maison</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setSelectedPerfumer(null);
            setShowModal(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-black transition-all"
        >
          <Plus size={16} />
          Nouveau Parfumeur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-gray-100" />)
        ) : perfumers.map((perfumer) => (
          <div key={perfumer.id} className="bg-white p-6 rounded-[32px] border border-gray-100 text-center group hover:shadow-xl transition-all">
             <div className="relative w-24 h-24 mx-auto mb-6">
                {perfumer.photo_url ? (
                  <img src={perfumer.photo_url} alt={perfumer.name} className="w-full h-full object-cover rounded-full border-2 border-brand-gold/20" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <User size={32} />
                  </div>
                )}
                <div className="absolute top-0 right-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setSelectedPerfumer(perfumer); setIsEditing(true); setShowModal(true); }} className="p-2 bg-white rounded-lg text-gray-600 hover:text-brand-gold transition-all shadow-md"><Edit size={12} /></button>
                   <button onClick={() => handleDelete(perfumer.id)} className="p-2 bg-white rounded-lg text-gray-600 hover:text-red-500 transition-all shadow-md"><Trash2 size={12} /></button>
                </div>
             </div>
             <h3 className="text-lg font-serif mb-2">{perfumer.name}</h3>
             <p className="text-xs text-gray-400 italic line-clamp-3 px-4">{perfumer.bio || 'Aucune biographie'}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-2xl font-serif">{isEditing ? 'Modifier Parfumeur' : 'Nouveau Parfumeur'}</h2>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Nom Complet</label>
                     <input name="name" type="text" required defaultValue={selectedPerfumer?.name} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Photo URL</label>
                     <input name="photo_url" type="text" defaultValue={selectedPerfumer?.photo_url} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Biographie</label>
                     <textarea name="bio" rows={6} defaultValue={selectedPerfumer?.bio} className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-sm"></textarea>
                  </div>

                  <button type="submit" disabled={saving} className="w-full py-5 bg-gray-900 text-white rounded-[24px] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all flex items-center justify-center gap-4">
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                     {isEditing ? 'Sauvegarder' : 'Créer le Parfumeur'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
