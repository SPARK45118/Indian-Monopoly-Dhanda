/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Red & Black Theme Tokens
        app: {
          bg: '#09090b',
          card: '#18181b',
          surface: '#18181b',
          panel: '#18181b',
          border: '#27272a',
        },
        board: {
          bg: '#09090b',
          surface: '#18181b',
          border: '#27272a',
          center: '#09090b',
        },
        primary: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
        },
        accent: {
          DEFAULT: '#e11d48',
          hover: '#be185d',
        },
        slateText: {
          main: '#fafafa',
          secondary: '#a1a1aa',
        },
        status: {
          success: '#22c55e',
          error: '#ef4444',
        },
        // City property colors
        delhi: { DEFAULT: '#dc2626', light: '#fca5a5', dark: '#991b1b' },
        mumbai: { DEFAULT: '#ea580c', light: '#fdba74', dark: '#9a3412' },
        bengaluru: { DEFAULT: '#2563eb', light: '#93c5fd', dark: '#1e3a8a' },
        hyderabad: { DEFAULT: '#16a34a', light: '#86efac', dark: '#14532d' },
        jaipur: { DEFAULT: '#e11d48', light: '#fda4af', dark: '#be185d' },
        kolkata: { DEFAULT: '#9333ea', light: '#d8b4fe', dark: '#6b21a8' },
        ahmedabad: { DEFAULT: '#d97706', light: '#fde68a', dark: '#92400e' },
        goa: { DEFAULT: '#0891b2', light: '#67e8f9', dark: '#164e63' },
        railway: { DEFAULT: '#52525b', light: '#a1a1aa', dark: '#27272a' },
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.6s ease-in-out',
        'token-move': 'tokenMove 0.5s ease-in-out',
        'money-gain': 'moneyGain 0.4s ease-out',
        'money-lose': 'moneyLose 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(180deg) scale(1.2)' },
          '50%': { transform: 'rotate(360deg) scale(0.9)' },
          '75%': { transform: 'rotate(540deg) scale(1.1)' },
          '100%': { transform: 'rotate(720deg) scale(1)' },
        },
        tokenMove: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.2)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        moneyGain: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-30px)', opacity: '0' },
        },
        moneyLose: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(30px)', opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.8)',
        'board': 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
        'primary': '0 4px 14px rgba(220, 38, 38, 0.35)',
      },
    },
  },
  plugins: [],
};
