// =============================================================================
// CALIPE DIGITAL — Admin: Categorias
// Arquivo: frontend/src/pages/admin/Categories.jsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categoriesAPI } from '@/services/api';
import { LoadingSpinner, EmptyState } from '@/components/ui/index.jsx';

function CategoryModal({ cat, onClose, onSaved }) {
  const isEdit = !!cat?.id;
  const [form, setForm]     = useState({ name: cat?.name || '', description: cat?.description || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) await categoriesAPI.update(cat.id, form);
      else await categoriesAPI.create(form);
      toast.success(isEdit ? 'Categoria actualizada!' : 'Categoria criada!');
      onSaved(); onClose();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-silver-800">{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? 'Guardar' : 'Criar')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const load = () => {
    setLoading(true);
    categoriesAPI.list().then(r => setCats(r.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Remover "${name}"?`)) return;
    await categoriesAPI.delete(id);
    toast.success('Categoria removida.');
    load();
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-silver-800">Categorias</h1>
        <button onClick={() => setModal('new')} className="btn-primary"><Plus size={16} /> Nova</button>
      </div>

      {loading ? <LoadingSpinner className="py-20" /> : cats.length === 0 ? (
        <EmptyState icon={Tag} title="Sem categorias" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 bg-eucalyptus-100 rounded-xl flex items-center justify-center">
                  <Tag size={18} className="text-eucalyptus-500" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(cat)} className="btn-ghost p-1.5 text-eucalyptus-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="btn-ghost p-1.5 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-silver-800 mt-2">{cat.name}</h3>
              {cat.description && <p className="text-xs text-silver-500 mt-1 line-clamp-2">{cat.description}</p>}
              <p className="text-xs text-eucalyptus-600 font-medium mt-2">{cat.product_count} produtos</p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CategoryModal
          cat={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
