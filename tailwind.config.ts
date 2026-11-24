import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-deep": "#181816",
        "bg-side": "#202020",
        "bg-card": "#272725",
        "bg-input": "#313130",
        border: "#383836",
        ink: "#ede9e0",
        "ink-soft": "#9a9080",
        "ink-dim": "#5e5a52",
        green: "#3a5a3a",
        "green-light": "#5a8a5a",
        gold: "#8a7a4a",
        "gold-light": "#c4ae72",
        danger: "#8a3030",
      },
    },
  },
  plugins: [],
};

export default config;
