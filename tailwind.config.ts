import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0d14',
          900: '#0d1017',
          800: '#12151d',
          700: '#1a1e29',
          600: '#252a38',
        },
        accent: {
          400: '#7c9cff',
          500: '#5b7fff',
          600: '#4361ee',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
