import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NexusCRM design tokens
        bg: {
          base:    'var(--bg-base)',
          surface: 'var(--bg-surface)',
          raised:  'var(--bg-raised)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle:  'var(--border-subtle)',
          strong:  'var(--border-strong)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          disabled:  'var(--text-disabled)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          emerald: 'var(--accent-emerald)',
          amber:   'var(--accent-amber)',
          red:     'var(--accent-red)',
          violet:  'var(--accent-violet)',
          cyan:    'var(--accent-cyan)',
        },
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#4f7fff',
          600: '#3b6fef',
          700: '#2d5fdf',
          900: '#1a3a8f',
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        sm:  'var(--r-sm)',
        md:  'var(--r-md)',
        lg:  'var(--r-lg)',
        xl:  'var(--r-xl)',
        full: '999px',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease both',
        'slide-up':  'slideUp 0.22s cubic-bezier(.2,.8,.3,1) both',
        'slide-in':  'slideIn 0.2s ease both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                     to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
