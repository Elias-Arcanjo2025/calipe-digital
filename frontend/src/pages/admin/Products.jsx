// =============================================================================
// CALIPE DIGITAL — Admin: Gestão de Produtos
// Arquivo: frontend/src/pages/admin/Products.jsx
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Package, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsAPI, categoriesAPI } from '@/services/api';
import { LoadingSpinner, EmptyState, Pagination, StatusBadge } from '@/components/ui/index.jsx';

// ── Modal de Produto (Create/Edit) ────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm]     = useState({
    name:        product?.name        || '',
    category_id: product?.category_id || '',
    description: product?.description || '',
    price:       product?.price       || '',
    sale_price:  product?.sale_price  || '',
    stock:       product?.stock       || 0,
    sku:         product?.sku         || '',
    featured:    product?.featured    || 0,
    active:      product?.active      ?? 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await productsAPI.update(product.id, form);
        toast.success('Produto actualizado!');
      } else {
        await productsAPI.create(form);
        toast.success('Produto criado!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-silver-800 text-lg">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Nome *</label>
            <input className="input" required value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Categoria *</label>
            <select className="input" required value={form.category_id}
              onChange={e => setForm({...form, category_id: e.target.value})}>
              <option value="">Selecionar...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço (AOA) *</label>
              <input className="input" type="number" step="0.01" required value={form.price}
                onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            <div>
              <label className="label">Preço Promo (AOA)</label>
              <input className="input" type="number" step="0.01" value={form.sale_price}
                onChange={e => setForm({...form, sale_price: e.target.value})} />
            </div>
            <div>
              <label className="label">Estoque</label>
              <input className="input" type="number" value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})} />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku}
                onChange={e => setForm({...form, sku: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-eucalyptus-500"
                checked={!!form.featured}
                onChange={e => setForm({...form, featured: e.target.checked ? 1 : 0})} />
              <span className="text-sm text-silver-700">Produto em destaque</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-eucalyptus-500"
                checked={!!form.active}
                onChange={e => setForm({...form, active: e.target.checked ? 1 : 0})} />
              <span className="text-sm text-silver-700">Activo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? 'Guardar' : 'Criar Produto')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta,       setMeta]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState(null); // null | product object | 'new'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 15, page };
      if (search) params.search = search;
      const res = await productsAPI.list(params);
      setProducts(res.data?.items ?? []);
      setMeta(res.data?.meta ?? null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoriesAPI.list().then(r => setCategories(r.data ?? []));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Remover "${name}"?`)) return;
    await productsAPI.delete(id);
    toast.success('Produto removido.');
    load();
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-silver-800">Produtos</h1>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-400" />
          <input className="input pl-9 h-9 text-sm" placeholder="Pesquisar produtos..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eucalyptus-50 border-b border-eucalyptus-100">
              <tr>
                {['Produto', 'Categoria', 'Preço', 'Stock', 'Status', 'Acções'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eucalyptus-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16"><LoadingSpinner /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-16">
                  <EmptyState icon={Package} title="Nenhum produto" />
                </td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-eucalyptus-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-eucalyptus-50 overflow-hidden shrink-0">
                          {p.image
                            ? <img src={`/backend/uploads/${p.image}`} alt={p.name}
                                   className="w-full h-full object-cover" />
                            : <Package size={20} className="m-auto text-eucalyptus-300 mt-2.5" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-silver-800 line-clamp-1">{p.name}</p>
                          {p.featured ? <span className="text-xs text-eucalyptus-500">⭐ Destaque</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-silver-600">{p.category_name}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-eucalyptus-700">
                        {Number(p.sale_price ?? p.price).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                      {p.sale_price && (
                        <p className="text-xs text-silver-400 line-through">
                          {Number(p.price).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-600' : 'text-silver-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${p.active ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(p)} className="btn-ghost p-2 text-eucalyptus-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="btn-ghost p-2 text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
