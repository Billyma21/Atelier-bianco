'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Bell, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Loader2,
  Package,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table as TableIcon
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const supabase = useMemo(() => createClient(), []);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_notifications')
      .select(`
        *,
        products(name),
        product_variants(size_ml, price)
      `)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNotifications(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.products?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchQuery, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('stock_notifications')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, status: newStatus } : n));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette notification ?')) return;
    const { error } = await supabase.from('stock_notifications').delete().eq('id', id);
    if (!error) setNotifications(notifications.filter(n => n.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Produit', 'Format', 'Statut', 'Date'];
    const rows = filteredNotifications.map(n => [
      n.email,
      n.products?.name,
      `${n.product_variants?.size_ml}ml`,
      n.status,
      new Date(n.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Alertes de Stock</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gestion des demandes de réapprovisionnement</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <TableIcon size={16} className="text-emerald-500" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Demandes', value: notifications.length, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En Attente', value: notifications.filter(n => n.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Traitées', value: notifications.filter(n => n.status === 'notified').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">{stat.label}</p>
              <p className="text-3xl font-serif">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="RECHERCHER UN EMAIL OU UN PRODUIT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-16 pr-6 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border-none rounded-2xl py-4 px-8 text-[10px] uppercase tracking-widest font-bold focus:ring-1 focus:ring-brand-gold/30 appearance-none cursor-pointer"
          >
            <option value="all">TOUS LES STATUTS</option>
            <option value="pending">EN ATTENTE</option>
            <option value="notified">NOTIFIÉ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Client</th>
                <th className="px-10 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Produit Concerné</th>
                <th className="px-10 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Date de Demande</th>
                <th className="px-10 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Statut</th>
                <th className="px-10 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-gold mb-4" size={32} />
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chargement des alertes...</p>
                  </td>
                </tr>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{notif.email}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Client Potentiel</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-brand-gold">
                          <Package size={18} strokeWidth={1} />
                        </div>
                        <div>
                          <p className="text-sm font-serif">{notif.products?.name}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Format: {notif.product_variants?.size_ml}ml</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span className="text-xs">{new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                        notif.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", notif.status === 'pending' ? "bg-amber-600" : "bg-emerald-600")} />
                        {notif.status === 'pending' ? 'En Attente' : 'Notifié'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {notif.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(notif.id, 'notified')}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Marquer comme notifié"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(notif.id)}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bell size={32} className="text-gray-200" strokeWidth={1} />
                    </div>
                    <p className="text-sm font-serif italic text-gray-400">Aucune alerte de stock en attente</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
