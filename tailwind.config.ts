import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#B8F500',
          soft: 'rgba(184, 245, 0, 0.12)',
          hover: '#A6DE00',
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#B8EE32',
          600: '#84CC16',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#1A2E05',
        },
        slate: {
          app: 'var(--nexora-background)',
          surface: 'var(--nexora-surface)',
          border: 'var(--nexora-border)',
          subtle: 'var(--nexora-border-subtle)',
          muted: 'var(--nexora-muted)',
          dark: 'var(--nexora-text)',
        },
        // Exact Nexra Dark Mode Design Tokens
        nexra: {
          bg: '#0F0B0A',
          card: '#28282B',
          surface: '#28282B',
          hover: '#323236',
          border: '#3A3A3D',
          text: '#F5F5F5',
          secondary: '#A1A1AA',
          muted: '#71717A',
          lime: '#B8F500',
        },
        up: {
          DEFAULT: 'var(--nexora-success)',
          bg: '#ECFDF5',
          border: '#A7F3D0',
        },
        down: {
          DEFAULT: 'var(--nexora-danger)',
          bg: '#FEF2F2',
          border: '#FECACA',
        },
      },
      borderRadius: {
        card: '18px',
        'card-lg': '24px',
        'card-xl': '28px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        lime: '0 4px 14px 0 rgba(184, 245, 0, 0.35)',
        'lime-subtle': '0 2px 8px 0 rgba(184, 245, 0, 0.20)',
        'dark-card': '0 4px 20px 0 rgba(0, 0, 0, 0.35)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
