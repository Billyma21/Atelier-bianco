'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/store/useToast';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { name: 'Chiffre d\'Affaires', value: '0 €', change: '', icon: TrendingUp, positive: true },
    { name: 'Commandes', value: '0', change: '', icon: ShoppingCart, positive: true },
    { name: 'Clients', value: '0', change: '', icon: Users, positive: true },
    { name: 'Stock Critique', value: '0', change: 'Alertes', icon: Package, positive: false },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  const [seeding, setSeeding] = useState(false);

  const seedDatabase = async () => {
    if (!confirm('Voulez-vous peupler la base de données avec des produits de démonstration ? Cela n\'écrasera pas vos données existantes.')) return;
    setSeeding(true);
    try {
      // 1. Skip perfumers, directly draft products
      const demoProducts = [
        { name: 'Mûre Iris', slug: 'mure-iris', family: 'Floral Fruité', status: 'active', intensity: 3, is_featured: true, description: 'Une rencontre poétique entre la mûre et l\'iris.', story: 'Inspiré par les jardins de Toscane.' },
        { name: 'Ambre Nuit', slug: 'ambre-nuit', family: 'Oriental', status: 'active', intensity: 4, is_featured: true, description: 'Une fragrance mystérieuse et enveloppante.' },
        { name: 'Bois d\'Ébène', slug: 'bois-ebene', family: 'Boisé', status: 'active', intensity: 5, is_featured: true, description: 'La puissance brute d\'un bois précieux.' },
        { name: 'Cuir Sacré', slug: 'cuir-sacre', family: 'Cuiré', status: 'active', intensity: 4, is_featured: true, description: 'L\'élégance du cuir travaillée avec finesse.' }
      ];

      for (const p of demoProducts) {
        const { data: existing } = await supabase.from('products').select('id').eq('slug', p.slug).single();
        if (!existing) {
          const { data: newProd } = await supabase.from('products').insert({ ...p }).select().single();
          if (newProd) {
            // Add a variant
            await supabase.from('product_variants').insert({
              product_id: newProd.id,
              size_ml: 100,
              price: 185,
              stock: 0
            });
            // Add an image
            await supabase.from('product_images').insert({
              product_id: newProd.id,
              url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800',
              type: 'packshot'
            });
          }
        }
      }
      useToast.getState().show('Base de données peuplée avec succès !', 'success');
      window.location.reload();
    } catch (err) {
      console.error('Seed error:', err);
      useToast.getState().show('Erreur lors du seeding.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch sales and orders
        const { data: orders } = await supabase
          .from('orders')
          .select('total, created_at, status, profiles(full_name)')
          .order('created_at', { ascending: false });

        const totalSales = orders?.reduce((acc: number, o: any) => acc + Number(o.total), 0) || 0;
        const totalOrders = orders?.length || 0;
        setRecentOrders(orders?.slice(0, 5) || []);

        // 2. Fetch total clients
        const { count: clientCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch low stock items
        const { count: lowStockCount } = await supabase
          .from('product_variants')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 5);

        setStats([
          { name: 'Chiffre d\'Affaires', value: formatPrice(totalSales), change: '', icon: TrendingUp, positive: true },
          { name: 'Commandes', value: totalOrders.toString(), change: '', icon: ShoppingCart, positive: true },
          { name: 'Clients', value: (clientCount || 0).toString(), change: '', icon: Users, positive: true },
          { name: 'Stock Critique', value: (lowStockCount || 0).toString(), change: 'Alertes', icon: Package, positive: false },
        ]);

        // 4. Generate chart data (last 7 days)
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            date: d.toISOString().split('T')[0],
            sales: 0,
            orders: 0
          };
        });

        orders?.forEach((order: any) => {
          const orderDate = order.created_at.split('T')[0];
          const chartDay = last7Days.find((d: any) => d.date === orderDate);
          if (chartDay) {
            chartDay.sales += Number(order.total);
            chartDay.orders += 1;
          }
        });

        setChartData(last7Days);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-3 font-medium">Vue d&apos;ensemble</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Bienvenue dans votre espace de gestion</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={seedDatabase}
            disabled={seeding}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            {seeding ? 'Initialisation...' : 'Initialiser Produits'}
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Clock size={14} />
            7 Derniers Jours
          </button>
          <a 
            href="/admin/produits"
            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            <Plus size={14} />
            Nouveau Produit
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-brand-gold/10 transition-colors">
                <stat.icon size={20} className="text-gray-400 group-hover:text-brand-gold transition-colors" />
              </div>
              {stat.change ? (
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider',
                    stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  )}
                >
                  {stat.change}
                  {stat.name === 'Stock Critique' ? null : stat.positive ? (
                    <ArrowUpRight size={10} />
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                </div>
              ) : null}
            </div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">{stat.name}</h3>
            <p className="text-3xl font-serif font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-900">Performance des Ventes</h2>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Revenus quotidiens en Euros</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Ventes</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: '#F9FAFB',
                      padding: '12px 16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#C9A96E' }}
                    labelStyle={{ fontSize: '9px', marginBottom: '4px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(value: any) => [`${value} €`, 'Ventes']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#C9A96E" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Ajouter Produit', icon: Package, href: '/admin/produits', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Créer Promo', icon: Tag, href: '/admin/marketing', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Voir Clients', icon: Users, href: '/admin/clients', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((action, i) => (
              <a 
                key={i} 
                href={action.href}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", action.bg, action.color)}>
                  <action.icon size={18} />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-900">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-900">Dernières Commandes</h2>
            <a href="/admin/commandes" className="text-[9px] uppercase tracking-widest font-bold text-brand-gold hover:text-gray-900 transition-colors flex items-center gap-2">
              Voir tout <ArrowRight size={12} />
            </a>
          </div>
          
          <div className="space-y-6 flex-1">
            {recentOrders.length > 0 ? recentOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all">
                    <ShoppingCart size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">{order.profiles?.full_name || 'Client Anonyme'}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold">{formatPrice(order.total)}</p>
                  <div className={cn(
                    "text-[7px] uppercase tracking-widest font-black mt-1",
                    order.status === 'completed' ? "text-green-500" : "text-brand-gold"
                  )}>
                    {order.status === 'completed' ? 'Livré' : 'En cours'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="text-gray-300" size={20} />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Aucune commande récente</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50">
            <div className="bg-brand-gold/5 rounded-2xl p-6 border border-brand-gold/10">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={16} className="text-brand-gold" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Système à jour</p>
              </div>
              <p className="text-[8px] text-gray-400 leading-relaxed uppercase tracking-widest">Toutes les synchronisations avec Supabase sont actives et sécurisées.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
