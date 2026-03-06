// =============================================================================
// CALIPE DIGITAL — Página Meus Pedidos (Cliente)
// Arquivo: frontend/src/pages/public/OrdersPage.jsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { ordersAPI } from '@/services/api';
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui/index.jsx';

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.list().then(res => {
      setOrders(res.data?.items ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-10 animate-fade-in">
      <div className="section-header mb-6">
        <h1 className="text-2xl font-bold text-silver-800">Meus Pedidos</h1>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum pedido ainda"
          description="Faça o seu primeiro pedido."
          action={<Link to="/products" className="btn-primary">Comprar Agora</Link>} />
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="card p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-silver-800">Pedido #{order.id}</p>
                <p className="text-xs text-silver-500 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('pt-AO')}
                  {' · '}{order.item_count} item{order.item_count !== 1 ? 's' : ''}
                </p>
              </div>
              <StatusBadge status={order.status} />
              <p className="font-bold text-eucalyptus-700">
                {Number(order.total).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
