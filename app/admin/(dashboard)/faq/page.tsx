'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { Plus, Trash2, Edit, Save, Loader2, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setFaqs(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
      question_fr: formData.get('question_fr') as string,
      answer_fr: formData.get('answer_fr') as string,
      question_it: formData.get('question_it') as string,
      answer_it: formData.get('answer_it') as string,
      category: formData.get('category') as string,
      display_order: parseInt(formData.get('display_order') as string) || 0,
    };

    try {
      if (isEditing) {
        await supabase.from('faqs').update(payload).eq('id', selectedFaq.id);
      } else {
        await supabase.from('faqs').insert([payload]);
      }
      fetchFaqs();
      setShowModal(false);
    } catch (err: any) {
      useToast.getState().show(err?.message || 'Une erreur est survenue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq: any) => {
    setSelectedFaq(faq);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (!error) fetchFaqs();
  };

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif mb-3">Questions Fréquentes (FAQ)</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gérer le contenu d&apos;assistance</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setSelectedFaq(null);
            setShowModal(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-black transition-all"
        >
          <Plus size={16} />
          Nouvelle Question
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-3xl border border-gray-100" />)
        ) : faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-8 rounded-[32px] border border-gray-100 group">
             <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[8px] uppercase tracking-widest font-black rounded-full">
                        {faq.category}
                      </span>
                      <span className="text-[9px] text-gray-300 font-mono italic">Ordre: {faq.display_order}</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Français</p>
                        <h4 className="text-lg font-serif mb-2">{faq.question_fr}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{faq.answer_fr}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Italien</p>
                        <h4 className="text-lg font-serif mb-2">{faq.question_it}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{faq.answer_it}</p>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                   <button onClick={() => handleEdit(faq)} className="p-3 bg-gray-50 text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"><Edit size={16} /></button>
                   <button onClick={() => handleDelete(faq.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-2xl font-serif">{isEditing ? 'Modifier la Question' : 'Nouvelle Question FAQ'}</h2>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Catégorie</label>
                        <input name="category" type="text" defaultValue={selectedFaq?.category || 'General'} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Ordre d&apos;affichage</label>
                        <input name="display_order" type="number" defaultValue={selectedFaq?.display_order || 0} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black border-b border-brand-gold/10 pb-4">Version Française</h3>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Question (FR)</label>
                              <input name="question_fr" type="text" required defaultValue={selectedFaq?.question_fr} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Réponse (FR)</label>
                              <textarea name="answer_fr" rows={5} required defaultValue={selectedFaq?.answer_fr} className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-sm"></textarea>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-8">
                        <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black border-b border-brand-gold/10 pb-4">Versione Italiana</h3>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Domanda (IT)</label>
                              <input name="question_it" type="text" required defaultValue={selectedFaq?.question_it} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Risposta (IT)</label>
                              <textarea name="answer_it" rows={5} required defaultValue={selectedFaq?.answer_it} className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-sm"></textarea>
                           </div>
                        </div>
                     </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full py-5 bg-gray-900 text-white rounded-[24px] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all flex items-center justify-center gap-4">
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                     {isEditing ? 'Sauvegarder les modifications' : 'Enregistrer la Question'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
