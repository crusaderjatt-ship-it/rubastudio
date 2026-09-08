import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#fbf6ee",
        charcoal: "#2f2a28",
        gold: "#c69b52",
        blush: "#f6dfdc",
        maroon: "#6f2434"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(47, 42, 40, 0.12)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
