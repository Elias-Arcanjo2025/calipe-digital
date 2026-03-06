// =============================================================================
// CALIPE DIGITAL — Página Minha Conta
// Arquivo: frontend/src/pages/public/AccountPage.jsx
// =============================================================================

import React, { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersAPI } from '@/services/api';
import useAuthStore from '@/store/authStore';

export default function AccountPage() {
  const { user, refreshUser } = useAuthStore();
  const [form,    setForm]    = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.update(user.id, form);
      await refreshUser();
      toast.success('Perfil actualizado! 🌿');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-10 max-w-2xl animate-fade-in">
      <div className="section-header mb-6">
        <h1 className="text-2xl font-bold text-silver-800">Minha Conta</h1>
      </div>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-eucalyptus-100 rounded-2xl flex items-center justify-center">
            <span className="text-eucalyptus-700 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-silver-800">{user?.name}</p>
            <p className="text-sm text-silver-500">{user?.email}</p>
            <span className="badge badge-delivered mt-1">
              {user?.role === 'admin' ? '⚙️ Administrador' : '👤 Cliente'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+244 9XX XXX XXX" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Guardar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
