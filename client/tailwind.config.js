/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: ['var(--text-xs)', { lineHeight: 'var(--line-height-ui)' }],
      sm: ['var(--text-sm)', { lineHeight: '1.45' }],
      base: ['var(--text-base)', { lineHeight: 'var(--line-height-body)' }],
      lg: ['var(--text-lg)', { lineHeight: '1.4' }],
      xl: ['var(--text-xl)', { lineHeight: 'var(--line-height-heading)' }],
      '2xl': ['var(--text-2xl)', { lineHeight: 'var(--line-height-heading)' }],
      '3xl': ['var(--text-3xl)', { lineHeight: 'var(--line-height-tight)' }],
      '4xl': ['clamp(2.5rem, 2rem + 2vw, 4rem)', { lineHeight: 'var(--line-height-tight)' }],
      '5xl': ['clamp(3rem, 2.2rem + 3vw, 5rem)', { lineHeight: 'var(--line-height-tight)' }],
    },
    fontWeight: {
      normal: 'var(--font-weight-regular)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
      black: 'var(--font-weight-bold)',
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-interface)'],
        interface: ['var(--font-interface)'],
      },
      letterSpacing: {
        tight: 'var(--tracking-tight)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
      },
      colors: {
        brand: {
          50: '#eef8fa',
          100: '#d6eef2',
          200: '#b2dfe6',
          300: '#7fc8d4',
          400: '#47a8b9',
          500: '#278b9e',
          600: '#1c6f81',
          700: '#185968',
          800: '#174957',
          900: '#173e49',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
