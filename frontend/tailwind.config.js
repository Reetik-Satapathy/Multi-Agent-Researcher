/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F3EE',
        surface: '#FFFFFF',
        'surface-secondary': '#ECEAE4',
        sidebar: '#111318',
        card: '#FFFFFF',
        'card-hover': '#ECEAE4',
        border: '#D9D7D0',
        'border-blue': 'rgba(29, 78, 216, 0.25)',
        'border-blue-strong': 'rgba(29, 78, 216, 0.45)',
        ink: '#171717',
        muted: '#6B6B67',
        accent: {
          DEFAULT: '#1D4ED8',
          dark: '#172554',
          soft: '#DBEAFE',
        },
        success: '#166534',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -6px rgba(29, 78, 216, 0.28)',
        'glow-blue-lg': '0 0 36px -8px rgba(29, 78, 216, 0.32)',
        'glow-purple': '0 0 20px -6px rgba(29, 78, 216, 0.28)',
        'glow-purple-lg': '0 0 36px -8px rgba(29, 78, 216, 0.32)',
        'glow-cyan': '0 0 20px -6px rgba(29, 78, 216, 0.28)',
        'card': '0 10px 30px -12px rgba(23, 37, 84, 0.14)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'dropdown': 'dropdown 180ms ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(5px)' },
        },
        dropdown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
