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
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
