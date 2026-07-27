import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#1e293b",
        background: "#000000",
        foreground: "#ffffff",
        muted: "#9ca3af",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      borderRadius: {
        lg: "12px",
        xl: "16px",
      },

      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.25)",
      },
    },
  },

  plugins: [],
};

export default config;