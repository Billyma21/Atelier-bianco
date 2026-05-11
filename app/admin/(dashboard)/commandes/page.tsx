'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { formatPrice, cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock,
  X,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  ChevronRight,
  Printer,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackForm, setTrackForm] = useState({ number: '', carrier: '' });
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (selectedOrder) {
      setTrackForm({
        number: selectedOrder.tracking_number || '',
        carrier: selectedOrder.tracking_carrier || '',
      });
    }
  }, [selectedOrder?.id]);

  const fetchOrders = React.useCallback(async () => {
    setTimeout(() => setLoading(true), 0);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin orders fetch:', error);
      useToast.getState().show(`Chargement commandes : ${error.message}`, 'error');
      setOrders([]);
    } else if (data) {
      setOrders(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev: any[]) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev: any[]) => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
          setSelectedOrder((prev: any) => (prev && prev.id === payload.new.id) ? { ...prev, ...payload.new } : prev);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      useToast.getState().show(`Erreur: ${error.message}`, 'error');
    }
    setUpdatingStatus(null);
  };

  const saveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    const { error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackForm.number.trim() || null,
        tracking_carrier: trackForm.carrier.trim() || null,
      })
      .eq('id', selectedOrder.id);

    if (error) {
      useToast.getState().show(`Erreur suivi : ${error.message}`, 'error');
    } else {
      useToast.getState().show('Informations de suivi enregistrées', 'success');
      setSelectedOrder({
        ...selectedOrder,
        tracking_number: trackForm.number.trim() || null,
        tracking_carrier: trackForm.carrier.trim() || null,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                tracking_number: trackForm.number.trim() || null,
                tracking_carrier: trackForm.carrier.trim() || null,
              }
            : o
        )
      );
    }
    setSavingTracking(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
      case 'awaiting_payment':
        return { label: 'Paiement en attente', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: CreditCard };
      case 'processing':
        return { label: 'Préparation', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Package };
      case 'on_hold':
        return { label: 'En pause / stock', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: AlertCircle };
      case 'shipped':
        return { label: 'Expédiée', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Truck };
      case 'delivered':
        return { label: 'Livrée', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Annulée', color: 'bg-red-50 text-red-600 border-red-100', icon: X };
      case 'refunded':
        return { label: 'Remboursée', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CreditCard };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100', icon: Package };
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Gestion des Commandes</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Suivi logistique et relation client</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:bg-gray-50 transition-all">
            <Download size={14} />
            Exporter CSV
          </button>
          <button className="flex items-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
            <Printer size={14} />
            Imprimer Bordereaux
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Commandes du jour', value: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'À préparer', value: orders.filter(o => ['pending', 'awaiting_payment', 'on_hold'].includes(o.status)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'En cours d\'envoi', value: orders.filter(o => o.status === 'processing').length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total CA', value: formatPrice(orders.reduce((acc, o) => acc + (o.total || 0), 0)), icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
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

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="RECHERCHER PAR ID, CLIENT, EMAIL..." 
            className="w-full bg-gray-50 border-none rounded-xl py-3.5 pl-12 pr-6 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-gray-100 rounded-xl px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 focus:ring-1 focus:ring-brand-gold/30 outline-none appearance-none"
          >
            <option value="all">Tous les Statuts</option>
            <option value="pending">En attente</option>
            <option value="awaiting_payment">Paiement en attente</option>
            <option value="processing">Préparation</option>
            <option value="on_hold">Pause / réappro</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursée</option>
          </select>
          <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:bg-gray-50 transition-all">
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">ID Commande</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Client</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Date & Heure</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Total</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 text-center">Statut</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-8 h-24" />
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (filteredOrders.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="p-6">
                      <span className="text-[10px] font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-cream border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-900">
                            {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">{order.shipping_address?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-[11px] font-black text-gray-900">{formatPrice(order.total)}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full font-black border",
                        status.color
                      )}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 hover:bg-gray-900 hover:text-white text-gray-400 rounded-xl transition-all"
                          title="Détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="p-2.5 hover:bg-brand-gold hover:text-white text-gray-400 rounded-xl transition-all"
                          title="Imprimer"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                      <button className="p-2.5 text-gray-300 group-hover:hidden">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })) : (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package size={32} className="text-gray-200" strokeWidth={1} />
                    </div>
                    <p className="text-sm font-serif italic text-gray-400">Aucune commande trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Side Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-3xl font-serif font-medium">Commande #{selectedOrder.id.slice(0, 8)}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={cn(
                      "text-[8px] uppercase tracking-[0.2em] px-3 py-1 rounded-full font-black border",
                      getStatusConfig(selectedOrder.status).color
                    )}>
                      {getStatusConfig(selectedOrder.status).label}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Passée le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Workflow Status */}
                <section className="space-y-6">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                    Progression Logistique
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'pending', label: 'Attente', icon: Clock },
                      { id: 'awaiting_payment', label: 'Paiement', icon: CreditCard },
                      { id: 'processing', label: 'Préparation', icon: Package },
                      { id: 'on_hold', label: 'Pause stock', icon: AlertCircle },
                      { id: 'shipped', label: 'Expédiée', icon: Truck },
                      { id: 'delivered', label: 'Livrée', icon: CheckCircle2 },
                      { id: 'cancelled', label: 'Annulée', icon: X },
                      { id: 'refunded', label: 'Remboursée', icon: CreditCard },
                    ].map((s) => (
                      <button
                        key={s.id}
                        disabled={updatingStatus === selectedOrder.id}
                        onClick={() => updateStatus(selectedOrder.id, s.id)}
                        className={cn(
                          "flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-[9px] uppercase tracking-widest font-black border transition-all",
                          selectedOrder.status === s.id 
                            ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200" 
                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                        )}
                      >
                        <s.icon size={14} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                    Transport & suivi
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-[9px] uppercase tracking-widest text-gray-400">Transporteur</span>
                      <input
                        value={trackForm.carrier}
                        onChange={(e) => setTrackForm((f) => ({ ...f, carrier: e.target.value }))}
                        placeholder="Colissimo, DHL, UPS…"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-xs outline-none focus:border-brand-gold"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-[9px] uppercase tracking-widest text-gray-400">Numéro de suivi</span>
                      <input
                        value={trackForm.number}
                        onChange={(e) => setTrackForm((f) => ({ ...f, number: e.target.value }))}
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 font-mono text-xs outline-none focus:border-brand-gold"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    disabled={savingTracking}
                    onClick={saveTracking}
                    className="rounded-2xl bg-gray-900 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-brand-gold disabled:opacity-50"
                  >
                    {savingTracking ? 'Enregistrement…' : 'Enregistrer le suivi'}
                  </button>
                  {selectedOrder.shipping_address?.email && (
                    <a
                      href={`/api/invoices/${selectedOrder.id}?email=${encodeURIComponent(selectedOrder.shipping_address.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400 hover:text-brand-gold"
                    >
                      <Download size={14} />
                      Facture PDF (client)
                    </a>
                  )}
                </section>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-6">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                      Client & Livraison
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-900">
                            {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-medium">
                            <Mail size={12} className="text-gray-300" />
                            {selectedOrder.shipping_address?.email}
                          </div>
                          {selectedOrder.shipping_address?.phone && (
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-medium font-mono">
                              <Phone size={12} className="text-gray-300" />
                              {selectedOrder.shipping_address.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-start gap-4">
                          <MapPin size={16} className="text-gray-300 mt-0.5" />
                          <div className="text-[10px] font-medium text-gray-600 leading-relaxed uppercase tracking-wider">
                            {selectedOrder.shipping_address?.address}<br/>
                            {selectedOrder.shipping_address?.postalCode} {selectedOrder.shipping_address?.city}<br/>
                            {selectedOrder.shipping_address?.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                      Paiement & Facturation
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center",
                          selectedOrder.shipping_address?.payment_method === 'cash' ? "text-amber-600" : "text-green-600"
                        )}>
                          {selectedOrder.shipping_address?.payment_method === 'cash' ? <Truck size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                            {selectedOrder.shipping_address?.payment_method === 'cash'
                            ? 'Paiement à la livraison (historique)'
                            : 'Carte — Stripe'}
                          </p>
                          <p className={cn(
                            "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                            selectedOrder.shipping_address?.payment_method === 'cash' ? "text-amber-600" : "text-green-600"
                          )}>
                            {selectedOrder.shipping_address?.payment_method === 'cash' ? 'HISTORIQUE' : 'STRIPE'}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <span>Sous-total</span>
                          <span className="text-gray-900">{formatPrice(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <span>Livraison</span>
                          <span className="text-green-600">OFFERTE</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Order Items */}
                <section className="space-y-6">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-black flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-brand-gold/30"></span>
                    Articles Commandés ({selectedOrder.order_items?.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex gap-6 items-center bg-white p-4 rounded-3xl border border-gray-100 hover:border-brand-gold/20 transition-all group">
                        <div className="relative w-16 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                          <Image 
                            src={item.product_snapshot?.image || 'https://picsum.photos/seed/perfume/100/150'} 
                            alt={item.product_snapshot?.name} 
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{item.product_snapshot?.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] font-black text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded-lg border border-brand-gold/10">
                              {item.product_snapshot?.size}ml
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                              Quantité: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-gray-900">{formatPrice(item.unit_price * item.quantity)}</p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">{formatPrice(item.unit_price)} / unité</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-10 bg-gray-900 text-white rounded-t-[40px] shadow-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black mb-2">Montant Total TTC</p>
                    <p className="text-4xl font-serif font-medium">{formatPrice(selectedOrder.total)}</p>
                  </div>
                  <button className="px-10 py-5 bg-brand-gold text-brand-black rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:bg-white transition-all shadow-xl shadow-black/20 flex items-center gap-4">
                    <Printer size={18} />
                    Générer Facture
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
