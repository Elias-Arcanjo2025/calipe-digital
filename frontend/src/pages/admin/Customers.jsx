// =============================================================================
// CALIPE DIGITAL — Admin: Clientes
// Arquivo: frontend/src/pages/admin/Customers.jsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { usersAPI } from '@/services/api';
import { LoadingSpinner, EmptyState, Pagination } from '@/components/ui/index.jsx';

export default function AdminCustomers() {
  const [users,   setUsers]   = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    setLoading(true);
    usersAPI.list({ per_page: 15, page })
      .then(r => { setUsers(r.data?.items ?? []); setMeta(r.data?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-bold text-silver-800">Clientes</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eucalyptus-50 border-b border-eucalyptus-100">
              <tr>
                {['Cliente', 'Telefone', 'Pedidos', 'Total Gasto', 'Desde'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eucalyptus-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-16"><EmptyState icon={Users} title="Sem clientes" /></td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-eucalyptus-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-eucalyptus-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-eucalyptus-700 text-sm font-bold">{u.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-silver-800">{u.name}</p>
                        <p className="text-xs text-silver-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-silver-600">{u.phone || '—'}</td>
                  <td className="py-3 px-4 text-silver-600">{u.order_count}</td>
                  <td className="py-3 px-4 font-semibold text-eucalyptus-700">
                    {Number(u.total_spent).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </td>
                  <td className="py-3 px-4 text-silver-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString('pt-AO')}
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
