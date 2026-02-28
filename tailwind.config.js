/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#E53935",
        sunset: "#FF6F00",
        darkbg: "#0B1220",
        card: "#111827",
        textlight: "#E5E7EB",
        muted: "#9CA3AF",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};