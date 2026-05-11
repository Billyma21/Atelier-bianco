'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical, 
  Shield, 
  Ban, 
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  UserPlus,
  TrendingUp,
  Star
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const supabase = useMemo(() => createClient(), []);
  const [now] = useState(() => Date.now());

  const fetchClients = React.useCallback(async () => {
    setTimeout(() => setLoading(true), 0);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        orders(total)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      // Process stats for each client
      const clientsWithStats = data.map((client: any) => ({
        ...client,
        orderCount: client.orders?.length || 0,
        totalSpent: client.orders?.reduce((acc: number, o: any) => acc + Number(o.total), 0) || 0
      }));
      setClients(clientsWithStats);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || c.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Répertoire Clients</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Gérez votre base de données et fidélisation</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
          <UserPlus size={16} />
          Ajouter un Client
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Nouveaux (30j)', value: clients.filter(c => new Date(c.created_at).getTime() > (now - 30 * 24 * 60 * 60 * 1000)).length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Clients VIP', value: clients.filter(c => c.totalSpent > 500).length, icon: Star, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
          { label: 'Panier Moyen', value: formatPrice(clients.reduce((acc, c) => acc + c.totalSpent, 0) / (clients.reduce((acc, c) => acc + c.orderCount, 0) || 1)), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
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
            placeholder="RECHERCHER PAR NOM, EMAIL, VILLE..." 
            className="w-full bg-gray-50 border-none rounded-xl py-3.5 pl-12 pr-6 text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-brand-gold/30 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-gray-100 rounded-xl px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 focus:ring-1 focus:ring-brand-gold/30 outline-none appearance-none"
          >
            <option value="all">Tous les Rôles</option>
            <option value="user">Utilisateurs</option>
            <option value="admin">Administrateurs</option>
          </select>
          <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:bg-gray-50 transition-all">
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Client</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Rôle</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Activité</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Total Dépensé</th>
                <th className="p-6 text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Inscription</th>
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
              ) : filteredClients.length > 0 ? (filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-cream border border-brand-gold/20 flex items-center justify-center text-brand-gold font-serif text-lg font-medium shadow-sm">
                        {client.full_name?.[0] || client.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{client.full_name || 'Sans nom'}</p>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {client.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 text-brand-gold text-[8px] uppercase tracking-widest font-black rounded-full border border-brand-gold/20">
                          <Shield size={10} />
                          Administrateur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 text-[8px] uppercase tracking-widest font-black rounded-full border border-gray-200">
                          <Users size={10} />
                          Client
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(client.orderCount, 3))].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <ShoppingBag size={10} className="text-gray-400" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-900">{client.orderCount} Commandes</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-gray-900">{formatPrice(client.totalSpent)}</span>
                      {client.totalSpent > 500 && (
                        <span className="text-[7px] uppercase tracking-widest text-brand-gold font-black mt-1">Client Privilégié</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-900">
                        {new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">Membre depuis {Math.floor((now - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 hover:bg-gray-900 hover:text-white text-gray-400 rounded-xl transition-all" title="Voir Profil">
                        <Eye size={16} />
                      </button>
                      <button className="p-2.5 hover:bg-brand-gold hover:text-white text-gray-400 rounded-xl transition-all" title="Envoyer Email">
                        <Mail size={16} />
                      </button>
                      <button className="p-2.5 hover:bg-red-500 hover:text-white text-gray-400 rounded-xl transition-all" title="Bannir">
                        <Ban size={16} />
                      </button>
                    </div>
                    <button className="p-2.5 text-gray-300 group-hover:hidden">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users size={32} className="text-gray-200" strokeWidth={1} />
                    </div>
                    <p className="text-sm font-serif italic text-gray-400">Aucun client ne correspond à votre recherche</p>
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
