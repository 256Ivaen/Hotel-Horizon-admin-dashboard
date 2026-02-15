/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary: '#bd8c57',
        primary: '#5b3b18',
        secondary: '#fbbf24',
      },
      animation: {
        rise: 'rise 1s ease-out',
      },
      keyframes: {
        rise: {
          '0%': {
            transform: 'translateY(30px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}