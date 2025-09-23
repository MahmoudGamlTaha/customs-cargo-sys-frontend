// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./**/*.{html,js,jsx,ts,tsx}"], // adjust paths
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Roboto', 'sans-serif'],
      },
      colors: {
        'brand-primary': 'var(--brand-primary, #EA580C)',
        'brand-primary-hover': 'var(--brand-primary-hover, #C2410C)',
        'brand-primary-light': 'var(--brand-primary-light, #FB923C)',
        'brand-secondary': '#007A3D',
        'brand-accent': '#D4AF37',
      },
    },
  },
  plugins: [],
};