// =============================================================================
// CALIPE DIGITAL — Serviço de API (Axios)
// Arquivo: frontend/src/services/api.js
// Descrição: Instância centralizada do Axios com interceptores para:
//   - Injeção automática do token JWT em todas as requisições
//   - Tratamento global de erros 401 (redireciona para login)
//   - Logout automático se token expirar
// =============================================================================

import axios from 'axios';

// URL base da API — em produção, substitua pelo domínio real
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** Instância Axios configurada para o Calipe Digital */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000, // 15 segundos
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de Requisição: injeta o JWT ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('calipe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de Resposta: trata erros globais ───────────────────────────
api.interceptors.response.use(
  (response) => response.data, // retorna apenas `data` da resposta
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Erro de comunicação com o servidor.';

    // Token expirado ou inválido → limpa sessão e redireciona
    if (status === 401) {
      localStorage.removeItem('calipe_token');
      localStorage.removeItem('calipe_user');
      window.location.href = '/login';
    }

    return Promise.reject({ message, status });
  }
);

// =============================================================================
// Endpoints organizados por recurso
// =============================================================================

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
};

// ── Produtos ──────────────────────────────────────────────────────────────────
export const productsAPI = {
  /** Lista produtos com filtros e paginação */
  list:    (params = {}) => api.get('/products', { params }),
  /** Produto individual por ID */
  show:    (id)          => api.get(`/products/${id}`),
  /** Cria produto (admin) — aceita FormData para upload de imagem */
  create:  (formData)    => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  /** Atualiza produto (admin) */
  update:  (id, data)    => api.put(`/products/${id}`, data),
  /** Remove produto (soft delete, admin) */
  delete:  (id)          => api.delete(`/products/${id}`),
  /** Reviews do produto */
  reviews: (id)          => api.get(`/products/${id}/reviews`),
};

// ── Categorias ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list:   ()          => api.get('/categories'),
  show:   (id)        => api.get(`/categories/${id}`),
  create: (data)      => api.post('/categories', data),
  update: (id, data)  => api.put(`/categories/${id}`, data),
  delete: (id)        => api.delete(`/categories/${id}`),
};

// ── Pedidos ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list:         (params = {}) => api.get('/orders', { params }),
  show:         (id)          => api.get(`/orders/${id}`),
  /** Cria pedido (checkout) */
  create:       (data)        => api.post('/orders', data),
  /** Atualiza status do pedido (admin) */
  updateStatus: (id, status)  => api.put(`/orders/${id}/status`, { status }),
};

// ── Utilizadores ──────────────────────────────────────────────────────────────
export const usersAPI = {
  list:   (params = {}) => api.get('/users', { params }),
  show:   (id)          => api.get(`/users/${id}`),
  update: (id, data)    => api.put(`/users/${id}`, data),
};

export default api;
