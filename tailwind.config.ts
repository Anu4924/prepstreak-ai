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
        forest: {
          50: "#F2F7F4",
          100: "#E2ECE5",
          200: "#C5D9CC",
          300: "#9FBEAA",
          400: "#6B9A7C",
          500: "#3F7754",
          600: "#245C3B",
          700: "#1A492E",
          800: "#133824",
          900: "#0D2B1B",
          950: "#07180F",
          DEFAULT: "#0D2B1B",
        },
        almond: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#EAE0D1",
          300: "#DBCDB9",
          400: "#C7B49A",
          500: "#B49C7D",
          DEFAULT: "#F5EFE6",
        },
        charcoal: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
          DEFAULT: "#0F172A",
        },
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(13, 43, 27, 0.05), 0 2px 4px -2px rgba(13, 43, 27, 0.05)",
        hover: "0 10px 15px -3px rgba(13, 43, 27, 0.08), 0 4px 6px -4px rgba(13, 43, 27, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
