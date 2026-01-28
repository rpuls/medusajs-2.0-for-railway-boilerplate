/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // ← Tailwind v4 syntax
    autoprefixer: {},
  },
};

export default config;