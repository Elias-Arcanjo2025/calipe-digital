// =============================================================================
// CALIPE DIGITAL — Página do Carrinho
// Arquivo: frontend/src/pages/public/CartPage.jsx
// =============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '@/store/cartStore';
import { EmptyState } from '@/components/ui/index.jsx';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const SHIPPING = 1500;
  const sub      = subtotal();
  const total    = sub + SHIPPING;

  return (
    <div className="page-container py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-silver-800 mb-6">
        Carrinho ({items.reduce((s, i) => s + i.quantity, 0)} itens)
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Carrinho vazio"
          description="Adicione produtos para continuar."
          action={<Link to="/products" className="btn-primary">Ver Produtos</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map(item => {
                const price = (item.sale_price ?? item.price);
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    className="card p-4 flex gap-4"
                  >
                    {/* Imagem */}
                    <div className="w-20 h-20 rounded-xl bg-eucalyptus-50 overflow-hidden shrink-0">
                      {item.image
                        ? <img src={`/backend/uploads/${item.image}`} alt={item.name}
                               className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-eucalyptus-200">
                            <ShoppingBag size={24} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug}`}
                        className="font-semibold text-silver-800 hover:text-eucalyptus-700 text-sm line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-eucalyptus-600 font-bold mt-1">
                        {price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                    </div>

                    {/* Quantidade + Remover */}
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => removeItem(item.id)}
                        className="text-silver-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-1 border border-eucalyptus-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-eucalyptus-50 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-eucalyptus-50 transition-colors"
                          disabled={item.quantity >= item.stock}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-silver-700">
                        {(price * item.quantity).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5 mt-2">
              <Trash2 size={14} /> Limpar carrinho
            </button>
          </div>

          {/* Resumo */}
          <div className="card p-5 h-fit sticky top-20">
            <h2 className="font-bold text-silver-800 mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-silver-600">
                <span>Subtotal</span>
                <span>{sub.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
              </div>
              <div className="flex justify-between text-silver-600">
                <span>Frete estimado</span>
                <span>{SHIPPING.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
              </div>
              <div className="border-t border-eucalyptus-100 pt-3 flex justify-between font-bold text-silver-800">
                <span>Total</span>
                <span className="text-eucalyptus-700">
                  {total.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full justify-center py-3">
              Finalizar Compra <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn-ghost w-full justify-center mt-2 text-sm">
              Continuar Comprando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
