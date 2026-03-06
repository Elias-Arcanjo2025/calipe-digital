// =============================================================================
// CALIPE DIGITAL — Store de Autenticação (Zustand)
// Arquivo: frontend/src/store/authStore.js
// Descrição: Gerencia o estado global do utilizador autenticado.
//            Persiste token e dados do utilizador no localStorage.
// =============================================================================

import { create } from 'zustand';
import { authAPI } from '@/services/api';

const TOKEN_KEY = 'calipe_token';
const USER_KEY  = 'calipe_user';

const useAuthStore = create((set, get) => ({
  // ── Estado ─────────────────────────────────────────────────────────────────
  /** Dados do utilizador logado (ou null) */
  user:          JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  /** Token JWT (ou null) */
  token:         localStorage.getItem(TOKEN_KEY) || null,
  /** Se está a carregar dados de autenticação */
  loading:       false,
  /** Mensagem de erro de auth */
  error:         null,

  // ── Getters derivados ──────────────────────────────────────────────────────
  isAuthenticated: () => !!get().token,
  isAdmin:         () => get().user?.role === 'admin',

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Login — armazena token e dados do utilizador */
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, loading: false });

      return { success: true, user };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /** Registro — cria conta e faz login automático */
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.register({ name, email, password });
      const { token, user } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, loading: false });

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  /** Logout — limpa estado e localStorage */
  logout: async () => {
    try { await authAPI.logout(); } catch (_) { /* JWT stateless — ignora erro */ }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, error: null });
  },

  /** Revalida token e atualiza dados do utilizador */
  refreshUser: async () => {
    if (!get().token) return;
    try {
      const res = await authAPI.me();
      const user = res.data;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch (_) {
      get().logout(); // token inválido → força logout
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
