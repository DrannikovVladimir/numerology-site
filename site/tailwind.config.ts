import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        parchment: "#F2E4C9",
        cream: "#FBF3E3",
        sand: "#E0C9A0",
        terracotta: {
          DEFAULT: "#7A3418",
          light: "#F0D5C4",
        },
        teal: {
          DEFAULT: "#1B4D4A",
          light: "#CDE8E4",
        },
        ink: "#3D2B1F",
        inkMuted: "#6B5A47",
      },
    },
  },
  plugins: [],
};
export default config;
