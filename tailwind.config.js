/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9ec',
          300: '#95bede',
          400: '#5f9dcd',
          500: '#387ebc',
          600: '#27649f',
          700: '#215081',
          800: '#1e446c',
          900: '#0f2b52',
          950: '#0a1c36',
        },
        prohealth: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f8',
          500: '#0e8ce9',
          600: '#0270c7',
          700: '#0358a1',
          800: '#074c84',
          900: '#0c3f6e',
          950: '#082849',
        },
        navycontrast: {
          DEFAULT: '#0c1b33',
          50: '#f1f5fa',
          100: '#e2ebf4',
          800: '#102240',
          900: '#0c1b33',
          950: '#071020',
        },
        warmaccent: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          hover: '#d97706',
        },
        tealbrand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        risk: {
          low: '#16a34a',
          'low-bg': '#f0fdf4',
          'low-border': '#bbf7d0',
          medium: '#d97706',
          'medium-bg': '#fffbeb',
          'medium-border': '#fde68a',
          high: '#dc2626',
          'high-bg': '#fef2f2',
          'high-border': '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        glass: '0 8px 30px rgba(14, 140, 233, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        float: '0 20px 40px -15px rgba(2, 112, 199, 0.15)',
        glow: '0 0 25px rgba(56, 168, 248, 0.25)',
      }
    },
  },
  plugins: [],
}
