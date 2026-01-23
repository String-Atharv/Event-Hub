/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Netflix-inspired dark theme colors
        'netflix-black': '#141414',
        'netflix-dark': '#1f1f1f',
        'netflix-gray': '#2a2a2a',
        'netflix-light': '#e5e5e5',
      },
    },
  },
  plugins: [],
}
