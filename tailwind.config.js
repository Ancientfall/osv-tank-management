/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          navy: '#003366',     // Deep Navy Blue
          orange: '#FF6600',   // Bright Orange
          white: '#FFFFFF',   // Clean White for backgrounds or text
        },
      },
    },
  },
  plugins: [],
};