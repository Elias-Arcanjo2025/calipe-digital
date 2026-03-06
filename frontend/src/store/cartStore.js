// =============================================================================
// CALIPE DIGITAL — Store do Carrinho (Zustand)
// Arquivo: frontend/src/store/cartStore.js
// Descrição: Gerencia o estado do carrinho de compras.
//            Persiste no localStorage para manter o carrinho entre sessões.
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── Estado ───────────────────────────────────────────────────────────────
      /** Array de itens: { id, name, price, sale_price, image, quantity, slug } */
      items: [],

      // ── Getters ──────────────────────────────────────────────────────────────

      /** Número total de itens (soma das quantidades) */
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      /** Subtotal do carrinho */
      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.sale_price ?? i.price) * i.quantity,
          0
        ),

      /** Verifica se um produto está no carrinho */
      isInCart: (id) => get().items.some((i) => i.id === id),

      /** Retorna a quantidade de um produto no carrinho */
      getQuantity: (id) => get().items.find((i) => i.id === id)?.quantity ?? 0,

      // ── Actions ──────────────────────────────────────────────────────────────

      /** Adiciona produto ao carrinho (ou incrementa quantidade) */
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing  = items.find((i) => i.id === product.id);

        if (existing) {
          // Incrementa quantidade respeitando o estoque
          const newQty = Math.min(existing.quantity + quantity, product.stock ?? 99);
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({
            items: [...items, {
              id:         product.id,
              name:       product.name,
              slug:       product.slug,
              price:      product.price,
              sale_price: product.sale_price,
              image:      product.image,
              stock:      product.stock,
              quantity,
            }],
          });
        }
      },

      /** Remove um produto do carrinho */
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      /** Altera a quantidade de um item (0 = remove) */
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.stock ?? 99) }
              : i
          ),
        });
      },

      /** Limpa o carrinho completamente */
      clearCart: () => set({ items: [] }),
    }),

    {
      name:    'calipe-cart', // chave no localStorage
      version: 1,
    }
  )
);

export default useCartStore;
