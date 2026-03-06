// =============================================================================
// CALIPE DIGITAL — Página de Registo
// Arquivo: frontend/src/pages/public/RegisterPage.jsx
// =============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function RegisterPage() {
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim())              errs.name     = 'Nome obrigatório.';
    if (!form.email.includes('@'))      errs.email    = 'E-mail inválido.';
    if (form.password.length < 8)       errs.password = 'Mínimo 8 caracteres.';
    if (form.password !== form.confirm) errs.confirm  = 'As senhas não coincidem.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const res = await register(form.name, form.email, form.password);
    if (res.success) {
      toast.success('Conta criada com sucesso! 🌿');
      navigate('/');
    } else {
      toast.error(res.error);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, extra }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input type={name === 'password' || name === 'confirm' ? (showPass ? 'text' : 'password') : type}
          required
          value={form[name]}
          onChange={e => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
          placeholder={placeholder}
          className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''} ${extra || ''}`}
        />
        {(name === 'password' || name === 'confirm') && name === 'password' && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-400 hover:text-silver-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-leaf-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-leaf">
              <Leaf size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-silver-800">Criar Conta</h1>
            <p className="text-silver-500 text-sm mt-1">Junte-se ao Calipe Digital</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="name"     label="Nome completo"  placeholder="Seu nome" />
            <Field name="email"    label="E-mail"          placeholder="seu@email.com" type="email" />
            <Field name="password" label="Senha"           placeholder="Mín. 8 caracteres" />
            <Field name="confirm"  label="Confirmar senha" placeholder="Repita a senha" />

            {/* Indicador de força da senha */}
            {form.password && (
              <div className="space-y-1.5">
                {[
                  [form.password.length >= 8,        'Mínimo 8 caracteres'],
                  [/[A-Z]/.test(form.password),      'Letra maiúscula'],
                  [/[0-9]/.test(form.password),      'Número'],
                  [/[^A-Za-z0-9]/.test(form.password), 'Caractere especial'],
                ].map(([ok, label], i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Check size={12} className={ok ? 'text-eucalyptus-500' : 'text-silver-300'} />
                    <span className={ok ? 'text-eucalyptus-600' : 'text-silver-400'}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Criar Conta Gratuita'}
            </button>
          </form>

          <p className="text-center text-sm text-silver-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-eucalyptus-600 hover:text-eucalyptus-700 font-semibold">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
