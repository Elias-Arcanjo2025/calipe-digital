// =============================================================================
// CALIPE DIGITAL — Página Inicial (Home)
// Arquivo: frontend/src/pages/public/HomePage.jsx
// Descrição: Vitrine principal com hero, categorias e produtos em destaque.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Shield, Truck, RefreshCw } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/services/api';
import { ProductCard, LoadingSpinner } from '@/components/ui/index.jsx';

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-leaf-gradient py-20 md:py-28">
      {/* Padrão decorativo de folhas */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <Leaf key={i} size={80 + i * 20}
            className="absolute text-white animate-leaf-sway"
            style={{ top: `${10 + i * 15}%`, left: `${i % 2 === 0 ? -2 : 85}%`,
                     animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      <div className="page-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm
                           font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Leaf size={14} /> Bem-vindo ao Calipe Digital
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            O melhor do comércio<br />
            <span className="text-eucalyptus-200">digital em Angola</span>
          </h1>

          <p className="text-eucalyptus-100 text-lg mb-8 max-w-xl mx-auto">
            Produtos de qualidade, entregas rápidas e uma experiência de compra
            inspirada na pureza do eucalipto.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary bg-white text-eucalyptus-700
                                            hover:bg-eucalyptus-50 shadow-bark px-8 py-3 text-base">
              Ver Produtos <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-secondary bg-transparent border-white/40
                                            text-white hover:bg-white/10 px-8 py-3 text-base">
              Criar Conta
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Features Strip ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Truck,     label: 'Entrega Rápida',     desc: 'Para todo Angola' },
  { icon: Shield,    label: 'Compra Segura',       desc: 'Pagamentos protegidos' },
  { icon: RefreshCw, label: 'Devoluções Fáceis',   desc: 'Até 30 dias' },
  { icon: Leaf,      label: 'Produtos Naturais',   desc: 'Selecionados com cuidado' },
];

function FeaturesStrip() {
  return (
    <div className="bg-white border-b border-eucalyptus-100">
      <div className="page-container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-eucalyptus-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-eucalyptus-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-silver-800">{label}</p>
                <p className="text-xs text-silver-500">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Categories Grid ───────────────────────────────────────────────────────────
function CategoriesSection({ categories }) {
  if (!categories?.length) return null;
  return (
    <section className="page-container py-12">
      <div className="section-header">
        <h2 className="text-2xl font-bold text-silver-800">Categorias</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((cat, i) => (
          <motion.div key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link to={`/products?category=${cat.slug}`}
              className="card-hover flex flex-col items-center p-4 text-center gap-2">
              <div className="w-12 h-12 bg-eucalyptus-100 rounded-2xl flex items-center justify-center">
                <Leaf size={22} className="text-eucalyptus-500" />
              </div>
              <p className="text-sm font-semibold text-silver-700">{cat.name}</p>
              <p className="text-xs text-silver-400">{cat.product_count} produtos</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [loading,          setLoading]           = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsAPI.list({ featured: 1, per_page: 8 }),
          categoriesAPI.list(),
        ]);
        setFeaturedProducts(prodRes.data?.items ?? []);
        setCategories(catRes.data ?? []);
      } catch (err) {
        console.error('Erro ao carregar dados da home:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      <HeroSection />
      <FeaturesStrip />
      <CategoriesSection categories={categories} />

      {/* Produtos em Destaque */}
      <section className="page-container pb-16">
        <div className="section-header">
          <h2 className="text-2xl font-bold text-silver-800">Produtos em Destaque</h2>
          <Link to="/products" className="ml-auto text-sm text-eucalyptus-600
                                          hover:text-eucalyptus-700 font-medium flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
