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
          50: '#F0F7F4',
          100: '#DCEFE6',
          200: '#B8DFCE',
          600: '#236551',
          700: '#1B4D3E', // Primary Forest Green
          800: '#143C30',
          900: '#0D2720',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FAF9F6', // Warm Ivory background
          200: '#F4F2EB',
          300: '#EAE6DC',
        },
        charcoal: {
          800: '#2B2D2F',
          900: '#1F2421', // Primary text
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
