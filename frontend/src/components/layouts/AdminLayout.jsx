// =============================================================================
// CALIPE DIGITAL — Layout do Painel Admin
// Arquivo: frontend/src/components/layouts/AdminLayout.jsx
// =============================================================================

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, Leaf, LogOut, Menu, X, ChevronRight, Bell,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const NAV_ITEMS = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/products',   icon: Package,         label: 'Produtos' },
  { to: '/admin/orders',     icon: ShoppingBag,     label: 'Pedidos' },
  { to: '/admin/customers',  icon: Users,           label: 'Clientes' },
  { to: '/admin/categories', icon: Tag,             label: 'Categorias' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile,    setMobile]    = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Sidebar content
  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-eucalyptus-800 ${
        collapsed && !onClose ? 'justify-center' : ''
      }`}>
        <div className="w-9 h-9 bg-eucalyptus-500 rounded-xl flex items-center justify-center shrink-0 shadow-leaf">
          <Leaf size={18} className="text-white" />
        </div>
        {(!collapsed || onClose) && (
          <div>
            <p className="font-bold text-white text-sm">Calipe Digital</p>
            <p className="text-eucalyptus-400 text-xs">Painel Admin</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-eucalyptus-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${isActive
                ? 'bg-eucalyptus-500 text-white shadow-leaf'
                : 'text-eucalyptus-300 hover:bg-eucalyptus-800 hover:text-white'
              }
              ${collapsed && !onClose ? 'justify-center' : ''}
            `}
          >
            <Icon size={18} className="shrink-0" />
            {(!collapsed || onClose) && <span>{label}</span>}
            {/* Tooltip no modo colapsado */}
            {collapsed && !onClose && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-eucalyptus-900 text-white
                              text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                              whitespace-nowrap z-50 pointer-events-none">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-eucalyptus-800">
        {(!collapsed || onClose) && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-eucalyptus-800/50">
            <div className="w-8 h-8 bg-eucalyptus-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-eucalyptus-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm
                      text-eucalyptus-400 hover:bg-red-900/30 hover:text-red-400 transition-all
                      ${collapsed && !onClose ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {(!collapsed || onClose) && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-eucalyptus-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-eucalyptus-900 shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-eucalyptus-900 z-50 md:hidden"
            >
              <SidebarContent onClose={() => setMobile(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-eucalyptus-100 flex items-center px-4 gap-3 shrink-0">
          {/* Toggle sidebar desktop */}
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex btn-ghost p-2 text-silver-500">
            {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>
          {/* Hamburger mobile */}
          <button onClick={() => setMobile(true)}
            className="md:hidden btn-ghost p-2 text-silver-500">
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          <button className="btn-ghost p-2 relative text-silver-500">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-eucalyptus-500 rounded-full" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
