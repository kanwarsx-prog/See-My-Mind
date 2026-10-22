/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#9ECFC4',
          light: '#C9E4DE',
          pale: '#E8F4F1',
        },
        teal: {
          DEFAULT: '#2A6B62',
          medium: '#3D8C82',
        },
        navy: {
          DEFAULT: '#1A3A4A',
          light: '#2D5A6E',
          lighter: '#3A6A80',
        },
        coral: {
          DEFAULT: '#F4A89A',
          dark: '#C5503E',
          light: '#FCDCD6',
        },
        amber: {
          DEFAULT: '#F5C77E',
          dark: '#B87A2A',
          light: '#FBE8C8',
        },
        purple: {
          DEFAULT: '#9B8DC2',
          dark: '#5E4D9A',
          light: '#DDD8F0',
        },
        green: {
          DEFAULT: '#4CAF82',
          light: '#D4EDE0',
        },
        gold: {
          DEFAULT: '#E8B84B',
          light: '#FDF3DC',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
}
