/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.4s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0.4 },
          "100%": { opacity: 1 },
        },
      },
      colors: {
        primary: {
          DEFAULT: "#764BA2",
          dark: "#333333",
          hover: "#5A3783",
          heading: "#1f2937",
          subtitle: "#4b5563",
        },
        dark: {
          DEFAULT: "#040413",
          50: "#30345E",
          900: "#08081E",
        },
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
