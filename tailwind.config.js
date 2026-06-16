export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#8B5CF6',
        canvas: '#F8FAFC',
        ink: '#0F172A',
      },
      boxShadow: {
        soft: '0 22px 70px rgba(15, 23, 42, 0.12)',
        glow: '0 20px 60px rgba(37, 99, 235, 0.26)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
