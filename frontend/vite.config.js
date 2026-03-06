import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// =============================================================================
// CALIPE DIGITAL — Configuração do Vite
// =============================================================================
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // import de @/components/...
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/calipe-digital/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
});
