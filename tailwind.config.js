/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#52c41a',
        secondary: '#722ed1',
        dark: '#0f0f10',
        card: '#18181b',
      },
      fontFamily: {
        main: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

