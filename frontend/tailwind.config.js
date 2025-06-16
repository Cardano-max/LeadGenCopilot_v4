/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          border: '#e5e7eb',
          background: '#ffffff',
          foreground: '#111827',
          primary: {
            DEFAULT: '#667eea',
            50: '#f0f2ff',
            100: '#e4e8ff',
            200: '#ced4ff',
            300: '#a9b6ff',
            400: '#8593ff',
            500: '#667eea',
            600: '#5a6fd8',
            700: '#4c5bc4',
            800: '#3e4aa0',
            900: '#364380',
          },
          secondary: {
            DEFAULT: '#764ba2',
            50: '#f7f3ff',
            100: '#f0e9ff',
            200: '#e3d6ff',
            300: '#cfb8ff',
            400: '#b692ff',
            500: '#9b6aff',
            600: '#8b4dff',
            700: '#764ba2',
            800: '#633d85',
            900: '#52326b',
          },
          accent: {
            pink: '#f093fb',
            coral: '#f5576c',
            blue: '#4facfe',
            cyan: '#00f2fe',
            green: '#43e97b',
            mint: '#38f9d7',
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
          'gradient': 'gradient 3s ease infinite',
          'slide-up': 'slide-up 0.6s ease-out',
          'scale-in': 'scale-in 0.3s ease-out',
          'fade-in': 'fade-in 0.5s ease-out',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          'pulse-glow': {
            '0%, 100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)' },
            '50%': { boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)' },
          },
          gradient: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          'slide-up': {
            from: { opacity: '0', transform: 'translateY(30px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
          },
          'scale-in': {
            from: { opacity: '0', transform: 'scale(0.9)' },
            to: { opacity: '1', transform: 'scale(1)' },
          },
          'fade-in': {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        backdropBlur: {
          xs: '2px',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
        },
        maxWidth: {
          '8xl': '88rem',
          '9xl': '96rem',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
        }
      },
    },
    plugins: [],
  }