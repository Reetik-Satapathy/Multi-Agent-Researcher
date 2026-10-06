/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#070807',
        'surface-secondary': '#0C100E',
        surface: '#101512',
        elevated: '#141B17',
        'deep-green': '#16231D',
        emerald: {
          DEFAULT: '#315C4B',
          hover: '#3D705C',
          muted: '#6F9B83',
          dark: '#16231D',
          light: '#6F9B83',
        },
        champagne: '#B89B62',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(111, 155, 131, 0.30)',
        ink: '#F5F7F3',
        'secondary-text': '#A5ADA7',
        muted: '#737B76',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'emerald-soft': '0 4px 20px -2px rgba(49, 92, 75, 0.25)',
        'glow-subtle': '0 0 30px -10px rgba(49, 92, 75, 0.20)',
        'card': '0 8px 24px -10px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'dropdown': 'dropdown 180ms ease-out',
        'spin-slow': 'spin 90s linear infinite',
        'spin-reverse-slow': 'reverse 120s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-3px)' },
          '50%': { transform: 'translateY(3px)' },
        },
        dropdown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      }
    },
  },
  plugins: [],
}

