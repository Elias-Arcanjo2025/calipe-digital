// =============================================================================
// CALIPE DIGITAL — Layout Público (Navbar + Outlet + Footer)
// Arquivo: frontend/src/components/layouts/PublicLayout.jsx
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, User, Menu, X, Leaf,
  LogOut, LayoutDashboard, Package, Heart,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu,   setUserMenu]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [search,     setSearch]     = useState('');

  // Sombra na navbar ao rolar
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const navLinks = [
    { to: '/',         label: 'Início' },
    { to: '/products', label: 'Produtos' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-glass' : 'bg-white'
    } border-b border-eucalyptus-100`}>
      <nav className="page-container h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6 shrink-0">
          <div className="w-8 h-8 bg-leaf-gradient rounded-xl flex items-center justify-center shadow-leaf">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-eucalyptus-800 hidden sm:block">
            Calipe <span className="text-gradient">Digital</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1 mr-auto">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === to
                ? 'bg-eucalyptus-50 text-eucalyptus-700'
                : 'text-silver-600 hover:text-eucalyptus-700 hover:bg-eucalyptus-50'
            }`}>{label}</Link>
          ))}
        </div>

        {/* Busca desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar produtos..."
            className="input pl-9 py-2 text-sm h-9"
          />
        </form>

        {/* Ações direita */}
        <div className="flex items-center gap-1 ml-auto md:ml-3">
          {/* Carrinho */}
          <Link to="/cart" className="btn-ghost relative p-2">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-eucalyptus-500 text-white
                               text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {isAuthenticated() ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-eucalyptus-50 transition-colors"
              >
                <div className="w-7 h-7 bg-eucalyptus-100 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus-700 text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-silver-700 hidden sm:block max-w-[100px] truncate">
                  {user?.name}
                </span>
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 card shadow-glass py-1 z-50"
                  >
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-silver-700
                                   hover:bg-eucalyptus-50 hover:text-eucalyptus-700 transition-colors">
                        <LayoutDashboard size={16} /> Painel Admin
                      </Link>
                    )}
                    <Link to="/orders" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-silver-700
                                 hover:bg-eucalyptus-50 hover:text-eucalyptus-700 transition-colors">
                      <Package size={16} /> Meus Pedidos
                    </Link>
                    <Link to="/account" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-silver-700
                                 hover:bg-eucalyptus-50 hover:text-eucalyptus-700 transition-colors">
                      <User size={16} /> Minha Conta
                    </Link>
                    <div className="border-t border-eucalyptus-100 my-1" />
                    <button
                      onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600
                                 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-4 text-sm">
              <User size={15} /> Entrar
            </Link>
          )}

          {/* Hamburger mobile */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-ghost p-2 md:hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden md:hidden border-t border-eucalyptus-100 bg-white"
          >
            <div className="page-container py-4 flex flex-col gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar..." className="input flex-1 h-9 text-sm" />
                <button type="submit" className="btn-primary px-3 py-2 h-9">
                  <Search size={14} />
                </button>
              </form>
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-silver-700
                             hover:bg-eucalyptus-50 hover:text-eucalyptus-700 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-eucalyptus-900 text-eucalyptus-200 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-eucalyptus-500 rounded-xl flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">Calipe Digital</span>
            </div>
            <p className="text-sm text-eucalyptus-400 leading-relaxed">
              Transformando o comércio digital com excelência, inspirado na
              pureza e resistência do eucalipto.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Navegação</h4>
            <ul className="space-y-2 text-sm text-eucalyptus-400">
              {[['/', 'Início'], ['/products', 'Produtos'], ['/cart', 'Carrinho'],
                ['/account', 'Minha Conta'], ['/orders', 'Pedidos']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-eucalyptus-200 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Info */}
          <div>
            <h4 className="font-semibold text-white mb-3">Informações</h4>
            <ul className="space-y-2 text-sm text-eucalyptus-400">
              <li>📍 Luanda, Angola</li>
              <li>✉️ suporte@calipedigital.ao</li>
              <li>📞 +244 900 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-eucalyptus-800 pt-6 text-center text-sm text-eucalyptus-500">
          © {new Date().getFullYear()} Calipe Digital. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

// ── Layout Wrapper ────────────────────────────────────────────────────────────
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
