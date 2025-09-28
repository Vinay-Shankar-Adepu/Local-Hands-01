/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2C98F0",
          accent: "#FF6F61",
          dark: "#111827",
          light: "#F9FAFB",
        },
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.06)",
        cardHover: "0 14px 30px rgba(0,0,0,0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
