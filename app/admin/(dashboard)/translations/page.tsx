'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { 
  Languages, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  Search as SearchIcon, 
  Globe, 
  History,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', fr: '', it: '', category: 'general' });
  const [filterCategory, setFilterCategory] = useState('all');

  const supabase = useMemo(() => createClient(), []);

  const categories = [
    { id: 'all', name: 'Toutes' },
    { id: 'common', name: 'Commun' },
    { id: 'home', name: 'Accueil' },
    { id: 'product', name: 'Produits' },
    { id: 'cart', name: 'Panier' },
    { id: 'auth', name: 'Compte' },
    { id: 'admin', name: 'Administration' },
  ];

  const fetchTranslations = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('key', { ascending: true });
    
    if (data) {
      setTranslations(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await fetchTranslations();
    };
    load();
  }, [fetchTranslations]);

  const handleUpdate = async (key: string, fr: string, it: string) => {
    setSaving(key);
    const { error } = await supabase
      .from('translations')
      .update({ fr, it })
      .eq('key', key);
    
    if (error) {
      useToast.getState().show(`Erreur: ${error.message}`, 'error');
    }
    setSaving(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('new');
    const { error } = await supabase
      .from('translations')
      .insert([newKey]);
    
    if (!error) {
      setShowAddModal(false);
      setNewKey({ key: '', fr: '', it: '', category: 'general' });
      fetchTranslations();
    } else {
      useToast.getState().show(`Erreur: ${error.message}`, 'error');
    }
    setSaving(null);
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Supprimer la traduction pour "${key}" ?`)) return;
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('key', key);
    
    if (!error) {
      setTranslations(translations.filter(t => t.key !== key));
    }
  };

  const filteredTranslations = translations.filter(t => {
    const matchesSearch = t.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.it.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium text-gray-900">Gestion des Traductions</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Personnalisez chaque texte de l&apos;interface</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          <Plus size={16} />
          Nouvelle Traduction
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="RECHERCHER UNE CLÉ OU UN TEXTE..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "px-5 py-3 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all whitespace-nowrap",
                filterCategory === cat.id 
                  ? "bg-brand-gold text-white shadow-md shadow-brand-gold/20" 
                  : "bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Translations List */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Clé Système (Unique)</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">FR</span>
                    Français
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-black text-green-600">IT</span>
                    Italien
                  </div>
                </th>
                <th className="px-8 py-6 text-right text-[10px] uppercase tracking-widest text-gray-400 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 uppercase tracking-widest">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-4"><div className="h-10 bg-gray-50 rounded-xl" /></td>
                  </tr>
                ))
              ) : filteredTranslations.length > 0 ? (
                filteredTranslations.map((t) => (
                  <TranslationRow 
                    key={t.key} 
                    item={t} 
                    onSave={handleUpdate} 
                    onDelete={handleDelete}
                    saving={saving === t.key}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Globe size={48} className="mx-auto mb-4 text-gray-100" />
                    <p className="text-xs font-serif italic text-gray-400">Aucune traduction trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  <h2 className="text-3xl font-serif font-medium">Nouvelle Traduction</h2>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-2">Enregistrez une nouvelle clé de texte</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-10 space-y-8 uppercase tracking-widest">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400">Clé (ex: common.home)</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      value={newKey.key}
                      onChange={(e) => setNewKey({ ...newKey, key: e.target.value.toLowerCase() })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400">Français</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        value={newKey.fr}
                        onChange={(e) => setNewKey({ ...newKey, fr: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400">Italien</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        value={newKey.it}
                        onChange={(e) => setNewKey({ ...newKey, it: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400">Catégorie</label>
                    <select 
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all outline-none appearance-none"
                      value={newKey.category}
                      onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
                    >
                      {categories.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={saving === 'new'}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {saving === 'new' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving === 'new' ? 'Enregistrement...' : 'Ajouter la Traduction'}
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

function TranslationRow({ item, onSave, onDelete, saving }: { item: any; onSave: any; onDelete: any; saving: boolean }) {
  const [fr, setFr] = useState(item.fr);
  const [it, setIt] = useState(item.it);
  const hasChanged = fr !== item.fr || it !== item.it;

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-8 py-6">
        <code className="text-[9px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-1 rounded-md font-bold">
          {item.key}
        </code>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[7px] text-gray-400 uppercase tracking-widest font-black">Catégorie: {item.category || 'Général'}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <textarea 
          className="w-full bg-transparent border-none p-0 text-[10px] font-bold focus:ring-0 text-gray-600 resize-none min-h-[40px]"
          value={fr}
          onChange={(e) => setFr(e.target.value)}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </td>
      <td className="px-8 py-6">
        <textarea 
          className="w-full bg-transparent border-none p-0 text-[10px] font-bold focus:ring-0 text-gray-600 resize-none min-h-[40px]"
          value={it}
          onChange={(e) => setIt(e.target.value)}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => onSave(item.key, fr, it)}
            disabled={!hasChanged || saving}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center justify-center",
              hasChanged 
                ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/20" 
                : "bg-gray-100 text-gray-300 pointer-events-none"
            )}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          </button>
          <button 
            onClick={() => onDelete(item.key)}
            className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {saving && (
          <div className="flex items-center justify-end mt-2 gap-2 text-[8px] text-brand-gold font-black animate-pulse">
            <Loader2 size={10} className="animate-spin" />
            Synchronisation...
          </div>
        )}
      </td>
    </tr>
  );
}
