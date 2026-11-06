/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#142B3A',
          'navy-hover': '#0F212D',
          teal: '#13A89E',
          'teal-hover': '#0E8B83',
          bg: '#F7F9FB',
          surface: '#FFFFFF',
          text: '#172B3A',
          muted: '#718096',
          border: '#E2E8F0',
          success: '#16865A',
          warning: '#D69E2E',
          error: '#DC5151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

