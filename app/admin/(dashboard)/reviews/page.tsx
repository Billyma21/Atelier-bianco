'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { CheckCircle2, Trash2, Star, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
// import Image from 'next/image'; // Remove if unused

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const supabase = useMemo(() => createClient(), []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('product_reviews')
      .select('*, products(name, slug)');
    
    if (filter === 'pending') query = query.eq('is_approved', false);
    else if (filter === 'approved') query = query.eq('is_approved', true);

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('product_reviews').update({ is_approved: true }).eq('id', id);
    if (!error) fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    const { error } = await supabase.from('product_reviews').delete().eq('id', id);
    if (!error) fetchReviews();
  };

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3">Modération des Avis</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Valider ou supprimer les témoignages clients</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100">
           {(['pending', 'approved', 'all'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-6 py-3 text-[9px] uppercase tracking-widest font-black rounded-xl transition-all",
                 filter === f ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900"
               )}
             >
               {f === 'pending' ? 'En attente' : f === 'approved' ? 'Publiés' : 'Tous'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-3xl border border-gray-100" />)
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
             <MessageSquare size={48} className="text-gray-100 mx-auto mb-6" />
             <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Aucun avis trouvé</p>
          </div>
        ) : reviews.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
             <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-lg">
                        {review.user_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider">{review.user_name}</h4>
                        <p className="text-[9px] text-gray-400 font-bold">{new Date(review.created_at).toLocaleString()}</p>
                      </div>
                      <div className="ml-auto md:ml-4 flex text-brand-gold">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />)}
                      </div>
                   </div>
                   
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1 font-bold">Produit concerné</p>
                      <p className="text-sm font-serif font-medium">{review.products?.name}</p>
                   </div>

                   <p className="text-sm text-gray-600 leading-relaxed italic font-serif bg-brand-cream/5 p-6 rounded-2xl border border-brand-black/5">
                      &quot;{review.comment}&quot;
                   </p>
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto">
                   {!review.is_approved && (
                     <button 
                       onClick={() => handleApprove(review.id)}
                       className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] uppercase tracking-widest font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                     >
                        <CheckCircle2 size={16} />
                        Approuver
                     </button>
                   )}
                   <button 
                     onClick={() => handleDelete(review.id)}
                     className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border border-red-100 text-red-500 rounded-2xl text-[10px] uppercase tracking-widest font-black hover:bg-red-50 transition-all"
                   >
                      <Trash2 size={16} />
                      {review.is_approved ? 'Supprimer' : 'Rejeter'}
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
