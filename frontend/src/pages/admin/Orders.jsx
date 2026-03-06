// =============================================================================
// CALIPE DIGITAL — Admin: Gestão de Pedidos
// Arquivo: frontend/src/pages/admin/Orders.jsx
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ordersAPI } from '@/services/api';
import { LoadingSpinner, EmptyState, StatusBadge, Pagination } from '@/components/ui/index.jsx';

const STATUSES = ['pending','paid','processing','shipped','delivered','cancelled'];
const STATUS_LABELS = {
  pending: 'Pendente', paid: 'Pago', processing: 'Processando',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.list({ per_page: 15, page });
      setOrders(res.data?.items ?? []);
      setMeta(res.data?.meta ?? null);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      toast.success('Status actualizado!');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-bold text-silver-800">Pedidos</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eucalyptus-50 border-b border-eucalyptus-100">
              <tr>
                {['#', 'Cliente', 'Itens', 'Total', 'Status', 'Data'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eucalyptus-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16"><LoadingSpinner /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-16"><EmptyState icon={ShoppingBag} title="Sem pedidos" /></td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-eucalyptus-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-silver-600">#{o.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-silver-800">{o.customer_name}</p>
                    <p className="text-xs text-silver-400">{o.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 text-silver-600">{o.item_count}</td>
                  <td className="py-3 px-4 font-semibold text-eucalyptus-700">
                    {Number(o.total).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={e => handleStatus(o.id, e.target.value)}
                      className="text-xs border border-eucalyptus-200 rounded-lg px-2 py-1.5 bg-white
                                 focus:outline-none focus:ring-1 focus:ring-eucalyptus-400 cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-silver-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString('pt-AO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
