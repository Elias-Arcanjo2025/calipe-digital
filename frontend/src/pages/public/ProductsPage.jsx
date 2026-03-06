// =============================================================================
// CALIPE DIGITAL — Página de Listagem de Produtos
// Arquivo: frontend/src/pages/public/ProductsPage.jsx
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/services/api';
import { ProductCard, LoadingSpinner, EmptyState, Pagination } from '@/components/ui/index.jsx';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta,       setMeta]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // Lê filtros actuais da URL
  const currentFilters = {
    category:  searchParams.get('category')  || '',
    search:    searchParams.get('search')    || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort:      searchParams.get('sort')      || 'created_at',
    dir:       searchParams.get('dir')       || 'DESC',
    page:      parseInt(searchParams.get('page') || '1'),
  };

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    if (key !== 'page') delete params.page; // reset page on filter change
    setSearchParams(params);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({
        ...currentFilters,
        per_page: 12,
      });
      setProducts(res.data?.items ?? []);
      setMeta(res.data?.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoriesAPI.list().then(res => setCategories(res.data ?? []));
  }, []);

  // ── Painel de Filtros ──────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="card p-5 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-silver-800 flex items-center gap-2">
          <Filter size={16} className="text-eucalyptus-500" /> Filtros
        </h3>
        {Object.values(currentFilters).some(v => v && v !== 'created_at' && v !== 'DESC' && v !== 1) && (
          <button onClick={() => setSearchParams({})}
            className="text-xs text-eucalyptus-600 hover:text-eucalyptus-700 flex items-center gap-1">
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Categorias */}
      <div>
        <p className="text-xs font-semibold text-silver-500 uppercase tracking-wide mb-2">Categoria</p>
        <div className="space-y-1">
          <button onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentFilters.category
                ? 'bg-eucalyptus-50 text-eucalyptus-700 font-medium'
                : 'text-silver-600 hover:bg-eucalyptus-50'
            }`}>
            Todas as categorias
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => updateFilter('category', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentFilters.category === cat.slug
                  ? 'bg-eucalyptus-50 text-eucalyptus-700 font-medium'
                  : 'text-silver-600 hover:bg-eucalyptus-50'
              }`}>
              {cat.name} <span className="text-silver-400 text-xs">({cat.product_count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div>
        <p className="text-xs font-semibold text-silver-500 uppercase tracking-wide mb-2">Preço (AOA)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín"
            value={currentFilters.min_price}
            onChange={e => updateFilter('min_price', e.target.value)}
            className="input text-sm py-2" />
          <input type="number" placeholder="Máx"
            value={currentFilters.max_price}
            onChange={e => updateFilter('max_price', e.target.value)}
            className="input text-sm py-2" />
        </div>
      </div>

      {/* Ordenação */}
      <div>
        <p className="text-xs font-semibold text-silver-500 uppercase tracking-wide mb-2">Ordenar por</p>
        <select value={`${currentFilters.sort}_${currentFilters.dir}`}
          onChange={e => {
            const [sort, dir] = e.target.value.split('_');
            updateFilter('sort', sort);
            updateFilter('dir', dir);
          }}
          className="input text-sm py-2">
          <option value="created_at_DESC">Mais recentes</option>
          <option value="price_ASC">Menor preço</option>
          <option value="price_DESC">Maior preço</option>
          <option value="views_DESC">Mais vistos</option>
          <option value="name_ASC">Nome (A-Z)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-silver-800">
            {currentFilters.search ? `Resultados: "${currentFilters.search}"` : 'Todos os Produtos'}
          </h1>
          {meta && (
            <p className="text-sm text-silver-500 mt-0.5">
              {meta.total} produto{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {/* Toggle filtro mobile */}
        <button onClick={() => setShowFilter(!showFilter)}
          className="btn-secondary gap-2 md:hidden">
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filtros — desktop sempre visível, mobile toggle */}
        <aside className={`w-60 shrink-0 ${showFilter ? 'block' : 'hidden'} md:block`}>
          <FilterPanel />
        </aside>

        {/* Grid de produtos */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner className="py-20" />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto encontrado"
              description="Tente ajustar os filtros ou pesquisar por outro termo."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              <Pagination meta={meta} onPageChange={p => updateFilter('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
