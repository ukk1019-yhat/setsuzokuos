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
          bg: '#F8F9FA',            // warm off-white paper neutral
          surface: '#FFFFFF',       // crisp card surface
          border: '#E2E4E8',        // hairline neutral border
          'border-subtle': '#EEF0F2',
          text: '#11181C',          // deep warm charcoal
          muted: '#687076',         // secondary text
          accent: '#0969DA',        // ONE single accent: royal cobalt
          'accent-hover': '#0854B2',
          'accent-subtle': '#F0F6FF',
          sidebar: '#15181C',       // warm graphite sidebar
          'sidebar-border': '#24282D',
          'sidebar-hover': '#1F2328',
          'sidebar-text': '#8B949E',
          success: '#1A7F37',
          'success-bg': '#F0FDF4',
          'success-border': '#BBF7D0',
          warning: '#9A6700',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          error: '#CF222E',
          'error-bg': '#FEF2F2',
          'error-border': '#FECACA',
          // Backwards compatibility mappings for older classes
          navy: '#15181C',
          'navy-hover': '#1F2328',
          teal: '#0969DA',
          'teal-hover': '#0854B2',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
