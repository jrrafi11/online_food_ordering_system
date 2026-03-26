/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ffe6f2',
          100: '#ffcce5',
          200: '#ff99cc',
          300: '#ff66b2',
          400: '#ff3399',
          500: '#f61a77',
          600: '#e31166',
          700: '#bf0f55',
          800: '#990d45',
          900: '#730a34',
        },
        ink: {
          900: '#1d1d27',
          700: '#454557',
          500: '#6f6f81',
          300: '#b9b9c8',
        },
      },
      boxShadow: {
        card: '0 12px 40px rgba(211, 16, 96, 0.08)',
        elevated: '0 18px 40px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Nunito Sans', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        riseIn: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        riseIn: 'riseIn 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};
