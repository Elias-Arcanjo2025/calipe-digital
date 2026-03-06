// =============================================================================
// CALIPE DIGITAL — App Principal com Roteamento
// Arquivo: frontend/src/App.jsx
// Descrição: Define todas as rotas públicas e protegidas da aplicação.
//            Usa React Router v6 com lazy loading para performance.
// =============================================================================

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

// ── Layout Wrappers ───────────────────────────────────────────────────────────
import PublicLayout  from '@/components/layouts/PublicLayout';
import AdminLayout   from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ── Páginas Públicas (lazy loaded) ────────────────────────────────────────────
const HomePage        = lazy(() => import('@/pages/public/HomePage'));
const ProductsPage    = lazy(() => import('@/pages/public/ProductsPage'));
const ProductPage     = lazy(() => import('@/pages/public/ProductPage'));
const CartPage        = lazy(() => import('@/pages/public/CartPage'));
const CheckoutPage    = lazy(() => import('@/pages/public/CheckoutPage'));
const LoginPage       = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage    = lazy(() => import('@/pages/public/RegisterPage'));
const AccountPage     = lazy(() => import('@/pages/public/AccountPage'));
const OrdersPage      = lazy(() => import('@/pages/public/OrdersPage'));

// ── Páginas Admin (lazy loaded) ───────────────────────────────────────────────
const AdminDashboard  = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts   = lazy(() => import('@/pages/admin/Products'));
const AdminOrders     = lazy(() => import('@/pages/admin/Orders'));
const AdminCustomers  = lazy(() => import('@/pages/admin/Customers'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));

// ── Fallback de carregamento ──────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-eucalyptus-50">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  const { refreshUser, token } = useAuthStore();

  // Revalida o token ao carregar a aplicação
  useEffect(() => {
    if (token) refreshUser();
  }, []); // eslint-disable-line

  return (
    <BrowserRouter>
      {/* Toast notifications com tema eucalipto */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: { background: '#f2f7f4', color: '#315a40', border: '1px solid #c3dccb' },
            iconTheme: { primary: '#4f8c61', secondary: '#fff' },
          },
          error: {
            style: { background: '#fff5f5', color: '#9b1c1c', border: '1px solid #fecaca' },
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Rotas Públicas ──────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/products"  element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/cart"      element={<CartPage />} />
            <Route path="/checkout"  element={
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/account"   element={
              <ProtectedRoute><AccountPage /></ProtectedRoute>
            } />
            <Route path="/orders"    element={
              <ProtectedRoute><OrdersPage /></ProtectedRoute>
            } />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
          </Route>

          {/* ── Rotas Admin ─────────────────────────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index                element={<AdminDashboard />} />
            <Route path="products"      element={<AdminProducts />} />
            <Route path="orders"        element={<AdminOrders />} />
            <Route path="customers"     element={<AdminCustomers />} />
            <Route path="categories"    element={<AdminCategories />} />
          </Route>

          {/* ── 404 ─────────────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
