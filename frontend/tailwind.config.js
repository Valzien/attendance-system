/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#a7c7e7',
          pink: '#f1c0e8',
          green: '#b5ead7',
          yellow: '#ffdac1',
          purple: '#cbaacb',
        }
      }
    },
  },
  plugins: [],
}
