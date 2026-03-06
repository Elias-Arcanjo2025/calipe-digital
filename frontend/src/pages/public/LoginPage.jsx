// =============================================================================
// CALIPE DIGITAL — Página de Login
// Arquivo: frontend/src/pages/public/LoginPage.jsx
// =============================================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success(`Bem-vindo de volta, ${res.user.name}! 🌿`);
      navigate(res.user.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-leaf-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-leaf">
              <Leaf size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-silver-800">Bem-vindo de volta</h1>
            <p className="text-silver-500 text-sm mt-1">Entre na sua conta Calipe Digital</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="input" />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-400 hover:text-silver-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-silver-500 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-eucalyptus-600 hover:text-eucalyptus-700 font-semibold">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
