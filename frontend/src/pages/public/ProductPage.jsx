// =============================================================================
// CALIPE DIGITAL — Página de Produto Individual
// Arquivo: frontend/src/pages/public/ProductPage.jsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsAPI } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/index.jsx';
import useCartStore from '@/store/cartStore';

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem, getQuantity } = useCartStore();
  const [product,  setProduct]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [qty,      setQty]      = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [selImg,   setSelImg]   = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Busca por slug — usa listagem com filtro de nome aproximado
        // Em produção, adicione endpoint GET /api/products/slug/{slug}
        const res = await productsAPI.list({ search: slug, per_page: 1 });
        const prod = res.data?.items?.[0];
        if (!prod) { setProduct(null); setLoading(false); return; }

        const detail = await productsAPI.show(prod.id);
        setProduct(detail.data);

        const revRes = await productsAPI.reviews(prod.id);
        setReviews(revRes.data ?? []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <LoadingSpinner className="py-32" size="lg" />;
  if (!product) return (
    <div className="page-container py-20 text-center">
      <Package size={48} className="mx-auto text-eucalyptus-300 mb-4" />
      <h2 className="font-bold text-silver-700 text-xl mb-2">Produto não encontrado</h2>
      <Link to="/products" className="btn-primary mt-4">Ver todos os produtos</Link>
    </div>
  );

  const price       = product.sale_price ?? product.price;
  const hasDiscount = !!product.sale_price;
  const images      = product.images?.length ? product.images : [product.image].filter(Boolean);

  const handleAddCart = () => {
    addItem(product, qty);
    toast.success(`${qty}× "${product.name}" adicionado ao carrinho! 🌿`);
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <Link to="/products" className="flex items-center gap-1.5 text-sm text-silver-500
                                      hover:text-eucalyptus-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galeria */}
        <div>
          <div className="card overflow-hidden aspect-square mb-3">
            {images[selImg]
              ? <img src={`/backend/uploads/${images[selImg]}`} alt={product.name}
                     className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-eucalyptus-50 text-eucalyptus-200">
                  <Package size={64} />
                </div>
            }
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selImg === i ? 'border-eucalyptus-500' : 'border-transparent'
                  }`}>
                  <img src={`/backend/uploads/${img}`} alt={`thumb-${i}`}
                       className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div>
          <p className="text-xs text-eucalyptus-500 font-medium mb-2">{product.category_name}</p>
          <h1 className="text-2xl font-bold text-silver-800 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16}
                  className={s <= Math.round(product.avg_rating)
                    ? 'fill-bark-400 text-bark-400'
                    : 'fill-silver-200 text-silver-200'
                  } />
              ))}
              <span className="text-sm text-silver-500">
                {Number(product.avg_rating).toFixed(1)} ({product.review_count} avaliações)
              </span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-eucalyptus-700">
              {price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </span>
            {hasDiscount && (
              <span className="text-lg text-silver-400 line-through">
                {product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </span>
            )}
          </div>

          {/* Descrição */}
          {product.description && (
            <p className="text-silver-600 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Quantidade + Carrinho */}
          {product.stock > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-eucalyptus-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-eucalyptus-50">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-eucalyptus-50">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddCart} className="btn-primary flex-1 py-3">
                <ShoppingCart size={18} /> Adicionar ao Carrinho
              </button>
            </div>
          ) : (
            <div className="bg-silver-100 text-silver-500 text-center py-3 rounded-xl font-medium">
              Produto Esgotado
            </div>
          )}

          <p className="text-xs text-silver-400 mt-3">
            {product.stock > 0 && `${product.stock} unidades em estoque`}
          </p>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-12">
          <div className="section-header">
            <h2 className="text-xl font-bold text-silver-800">Avaliações ({reviews.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-eucalyptus-100 rounded-full flex items-center justify-center">
                    <span className="text-eucalyptus-700 text-xs font-bold">
                      {r.user_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-silver-700">{r.user_name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11}
                          className={s <= r.rating ? 'fill-bark-400 text-bark-400' : 'fill-silver-200 text-silver-200'} />
                      ))}
                    </div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-silver-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
