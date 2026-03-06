// =============================================================================
// CALIPE DIGITAL — Dashboard Administrativo
// Arquivo: frontend/src/pages/admin/Dashboard.jsx
// Descrição: Métricas de negócio com gráficos de vendas, pedidos e receita.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ordersAPI, productsAPI, usersAPI } from '@/services/api';
import { StatCard, StatusBadge, LoadingSpinner } from '@/components/ui/index.jsx';

// Cores da paleta eucalipto para os gráficos
const CHART_COLORS = ['#4f8c61', '#74a882', '#9dc4a9', '#a8844f', '#315a40'];

// Dados de exemplo para gráficos (em produção, viriam da API de analytics)
const REVENUE_DATA = [
  { month: 'Set', receita: 450000, pedidos: 42 },
  { month: 'Out', receita: 620000, pedidos: 58 },
  { month: 'Nov', receita: 890000, pedidos: 83 },
  { month: 'Dez', receita: 1200000, pedidos: 112 },
  { month: 'Jan', receita: 780000, pedidos: 71 },
  { month: 'Fev', receita: 950000, pedidos: 89 },
  { month: 'Mar', receita: 1100000, pedidos: 98 },
];

const STATUS_DATA = [
  { name: 'Entregues',   value: 245, color: '#4f8c61' },
  { name: 'Enviados',    value: 87,  color: '#74a882' },
  { name: 'Pendentes',   value: 43,  color: '#f59e0b' },
  { name: 'Cancelados',  value: 18,  color: '#ef4444' },
];

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes] = await Promise.all([
          ordersAPI.list({ per_page: 5 }),
        ]);
        setRecentOrders(ordersRes.data?.items ?? []);
        // Estatísticas simuladas (em produção, use endpoint /api/admin/stats)
        setStats({
          revenue:    1100000,
          orders:     98,
          customers:  342,
          products:   127,
          revenueChange:  12,
          ordersChange:   9,
          customersChange: 18,
          productsChange:  3,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-silver-800">Dashboard</h1>
        <p className="text-silver-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('pt-AO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Receita (Mar)"
          value={`${(stats.revenue / 1000).toFixed(0)}K AOA`}
          change={stats.revenueChange} color="eucalyptus" />
        <StatCard icon={ShoppingBag} label="Pedidos (Mar)"
          value={stats.orders} change={stats.ordersChange} color="blue" />
        <StatCard icon={Users} label="Clientes"
          value={stats.customers} change={stats.customersChange} color="purple" />
        <StatCard icon={Package} label="Produtos ativos"
          value={stats.products} change={stats.productsChange} color="bark" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Receita + Pedidos (AreaChart) */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-silver-800 mb-4">Receita & Pedidos (Últimos 7 meses)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f8c61" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f8c61" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0ede6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7d8c7d' }} />
              <YAxis tick={{ fontSize: 12, fill: '#7d8c7d' }}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v, n) => [
                  n === 'receita'
                    ? v.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
                    : v,
                  n === 'receita' ? 'Receita' : 'Pedidos'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #c3dccb', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="receita" stroke="#4f8c61" strokeWidth={2}
                fill="url(#gradReceita)" />
              <Area type="monotone" dataKey="pedidos" stroke="#a8844f" strokeWidth={2}
                fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status dos Pedidos (PieChart) */}
        <div className="card p-5">
          <h3 className="font-semibold text-silver-800 mb-4">Status dos Pedidos</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STATUS_DATA} cx="50%" cy="45%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ fontSize: 12, color: '#4f594f' }}>{v}</span>} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="card p-5">
        <div className="section-header mb-4">
          <h3 className="font-semibold text-silver-800">Pedidos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eucalyptus-100">
                {['#', 'Cliente', 'Itens', 'Total', 'Status', 'Data'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-silver-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eucalyptus-50">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-eucalyptus-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-silver-600">#{order.id}</td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-silver-800">{order.customer_name}</p>
                    <p className="text-xs text-silver-400">{order.customer_email}</p>
                  </td>
                  <td className="py-3 px-3 text-silver-600">{order.item_count}</td>
                  <td className="py-3 px-3 font-semibold text-eucalyptus-700">
                    {Number(order.total).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-3 text-silver-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('pt-AO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
