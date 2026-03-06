// =============================================================================
// CALIPE DIGITAL — Configuração do Tailwind CSS
// Arquivo: frontend/tailwind.config.js
// Paleta: Folhas de Eucalipto 🌿
//   Verdes acinzentados, prateados e terrosos que surgem das folhas
// =============================================================================

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Paleta Eucalipto ─────────────────────────────────────────────────
        // Inspirada na cor das folhas e caule do eucalipto
        eucalyptus: {
          50:  '#f2f7f4',   // névoa de eucalipto — fundos ultra-suaves
          100: '#e0ede6',   // folha jovem pálida
          200: '#c3dccb',   // verde prateado claro
          300: '#9dc4a9',   // folha madura clara
          400: '#74a882',   // verde folha médio
          500: '#4f8c61',   // folha de eucalipto — cor principal
          600: '#3d7050',   // verde profundo
          700: '#315a40',   // sombra da folha
          800: '#284834',   // tronco verde-escuro
          900: '#1f3828',   // eucalipto noturno
          950: '#0f1f15',   // copa na noite
        },
        // Cinzas prateados (como a casca e o verso da folha)
        silver: {
          50:  '#f8f9f8',
          100: '#eef0ee',
          200: '#dde1dd',
          300: '#bfc6bf',   // verso prateado da folha
          400: '#9da89d',
          500: '#7d8c7d',   // cinza eucalipto
          600: '#637063',
          700: '#4f594f',
          800: '#414941',
          900: '#363d36',
          950: '#1c201c',
        },
        // Terroso quente (terra sob os eucaliptos)
        bark: {
          50:  '#faf7f2',
          100: '#f2ece0',
          200: '#e5d8c2',
          300: '#d4be9a',   // casca clara
          400: '#c09f74',
          500: '#a8844f',   // casca do eucalipto
          600: '#8a6a3e',
          700: '#6f5232',
          800: '#5b432b',
          900: '#4b3826',
          950: '#281d12',
        },
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
      },

      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.875rem',
      },

      boxShadow: {
        'leaf':   '0 4px 24px -4px rgba(79, 140, 97, 0.25)',
        'bark':   '0 4px 24px -4px rgba(168, 132, 79, 0.20)',
        'glass':  '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glow':   '0 0 24px rgba(79, 140, 97, 0.35)',
      },

      backgroundImage: {
        'leaf-gradient':    'linear-gradient(135deg, #4f8c61 0%, #315a40 100%)',
        'bark-gradient':    'linear-gradient(135deg, #a8844f 0%, #6f5232 100%)',
        'forest-gradient':  'linear-gradient(180deg, #f2f7f4 0%, #e0ede6 100%)',
        'night-gradient':   'linear-gradient(135deg, #1f3828 0%, #0f1f15 100%)',
      },

      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'leaf-sway': 'leafSway 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:   { from: { opacity: 0 },                   to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        leafSway: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
      },
    },
  },
  plugins: [],
};
