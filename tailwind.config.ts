import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#98af41",
          brown: "#746761",
          yellow: "#febe10",
          blue: "#78b4d8",
          orange: "#c35131",
          paper: "#ffffff",
          paper2: "#f7f5f0",
        },
      },
      fontFamily: {
        sans: ['"Jost"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Jost"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
