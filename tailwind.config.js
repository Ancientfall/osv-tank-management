/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                // Your main HTML file in the project root
    "./src/**/*.{js,ts,jsx,tsx}",  // All JS, TS, JSX, TSX files in the src folder and its subfolders
  ],
  theme: {
    extend: {}, // You can customize your theme here later
  },
  plugins: [], // You can add Tailwind plugins here later
}