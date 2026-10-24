/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mediteal: {
          DEFAULT: '#0B5D5E',
          hover: '#08494A',
          light: '#E6F2F2',
        },
        medicoral: {
          DEFAULT: '#F26B5B',
          hover: '#DE5646',
          light: '#FDF0EE',
        },
        medicard: '#F6F8F8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        content: '960px',
      },
    },
  },
  plugins: [],
}
