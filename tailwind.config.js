/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        accent: 'var(--accent-color)',
        bg: 'var(--bg-color)',
      },
      zIndex: {
        '1000': '1000',
        '9999': '9999',
      }
    },
  },
  plugins: [],
}
