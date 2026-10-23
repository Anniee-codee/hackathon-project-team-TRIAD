/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5dfd0',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#081c15',
        },
        ivory: '#faf9f6',
        charcoal: '#212529',
      }
    },
  },
  plugins: [],
}
