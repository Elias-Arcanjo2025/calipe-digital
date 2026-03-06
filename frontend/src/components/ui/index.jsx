// =============================================================================
// CALIPE DIGITAL — Componentes UI Reutilizáveis
// Arquivo: frontend/src/components/ui/index.jsx
// =============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Star, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

// =============================================================================
// ProtectedRoute — Protege rotas que exigem autenticação (e opcionalmente admin)
// =============================================================================
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;

// =============================================================================
// LoadingSpinner — Indicador de carregamento com tema eucalipto
// =============================================================================
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40, xl: 56 };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2
        size={sizes[size]}
        className="animate-spin text-eucalyptus-500"
      />
    </div>
  );
}

// =============================================================================
// ProductCard — Card de produto para vitrine
// =============================================================================
export function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const price        = product.sale_price ?? product.price;
  const hasDiscount  = !!product.sale_price;
  const discount     = hasDiscount
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0;

  const handleAddCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`"${product.name}" adicionado ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card-hover group overflow-hidden"
    >
      <Link to={`/products/${product.slug}`}>
        {/* Imagem */}
        <div className="relative overflow-hidden bg-eucalyptus-50 aspect-square">
          {product.image ? (
            <img
              src={`/backend/uploads/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-eucalyptus-200">
              <Eye size={48} />
            </div>
          )}

          {/* Badge desconto */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-eucalyptus-500 text-white
                             text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}

          {/* Badge esgotado */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-silver-700 font-semibold text-sm px-3 py-1 rounded-full">
                Esgotado
              </span>
            </div>
          )}

          {/* Botão rápido de carrinho (hover) */}
          {product.stock > 0 && (
            <button
              onClick={handleAddCart}
              className="absolute bottom-2 right-2 w-9 h-9 bg-white rounded-full shadow-leaf
                         flex items-center justify-center text-eucalyptus-600 hover:bg-eucalyptus-500
                         hover:text-white transition-all duration-200
                         opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-eucalyptus-500 font-medium mb-1">
            {product.category_name}
          </p>
          <h3 className="font-semibold text-silver-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-eucalyptus-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="fill-bark-400 text-bark-400" />
              <span className="text-xs text-silver-500">
                {Number(product.avg_rating).toFixed(1)} ({product.review_count})
              </span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-eucalyptus-700">
              {price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </span>
            {hasDiscount && (
              <span className="text-xs text-silver-400 line-through">
                {product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// =============================================================================
// StatusBadge — Badge de status de pedido
// =============================================================================
const STATUS_CONFIG = {
  pending:    { label: 'Pendente',     cls: 'badge-pending' },
  paid:       { label: 'Pago',         cls: 'badge-paid' },
  processing: { label: 'Processando',  cls: 'badge-processing' },
  shipped:    { label: 'Enviado',      cls: 'badge-shipped' },
  delivered:  { label: 'Entregue',     cls: 'badge-delivered' },
  cancelled:  { label: 'Cancelado',    cls: 'badge-cancelled' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

// =============================================================================
// EmptyState — Tela vazia com mensagem amigável
// =============================================================================
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-eucalyptus-50 rounded-2xl flex items-center justify-center mb-4">
        {Icon && <Icon size={32} className="text-eucalyptus-400" />}
      </div>
      <h3 className="font-semibold text-silver-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-silver-500 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// =============================================================================
// StatCard — Card de métrica para o dashboard admin
// =============================================================================
export function StatCard({ icon: Icon, label, value, change, color = 'eucalyptus' }) {
  const colors = {
    eucalyptus: 'bg-eucalyptus-50 text-eucalyptus-600',
    bark:       'bg-bark-50 text-bark-600',
    blue:       'bg-blue-50 text-blue-600',
    purple:     'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change >= 0
              ? 'bg-eucalyptus-50 text-eucalyptus-600'
              : 'bg-red-50 text-red-600'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-silver-800 mb-0.5">{value}</p>
      <p className="text-sm text-silver-500">{label}</p>
    </div>
  );
}

// =============================================================================
// Pagination — Controles de paginação
// =============================================================================
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(meta.current_page - 1)}
        disabled={meta.current_page === 1}
        className="btn-secondary px-3 py-2 disabled:opacity-40"
      >← Anterior</button>

      <span className="text-sm text-silver-500">
        Página {meta.current_page} de {meta.last_page}
      </span>

      <button
        onClick={() => onPageChange(meta.current_page + 1)}
        disabled={meta.current_page === meta.last_page}
        className="btn-secondary px-3 py-2 disabled:opacity-40"
      >Próxima →</button>
    </div>
  );
}
