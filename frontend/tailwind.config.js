/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefefe',
          100: '#fdfdfe',
          200: '#fafafd',
          300: '#f6f5f9',
          400: '#f0eef5',
          500: '#e6e4ee',
          600: '#b8b4c4',
          700: '#8a869a',
          800: '#5c5870',
          900: '#2e2a46',
        },
        accent: {
          50: '#fbf7ff',
          100: '#f6ecff',
          200: '#edd9ff',
          300: '#e0b8ff',
          400: '#cd8bff',
          500: '#ba5eff',
          600: '#a73eff',
          700: '#7e2fcf',
          800: '#5f2399',
          900: '#3f1863',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}