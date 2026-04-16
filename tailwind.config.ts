import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(2, 16, 24, 0.12)",
      },
      borderRadius: {
        panel: "1.5rem",
      },
      maxWidth: {
        content: "78rem",
      },
    },
  },
  plugins: [],
};

export default config;
