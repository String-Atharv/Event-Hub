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
      // Responsive container padding
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
      },
      // Custom spacing for consistent responsive design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
    // Explicit screen breakpoints
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}
