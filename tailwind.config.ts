import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        shift: "shift 4s ease-in-out infinite",
        scalePulse: "scalePulse 10s ease-in-out infinite",
      },
      keyframes: {
        scalePulse: {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.3)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        shift: {
          "0%": {
            transform: "rotate(0deg)",
            borderRadius: "0%",
          },
          "50%": {
            borderRadius: "50%",
          },
          "100%": {
            transform: "rotate(360deg)",
            borderRadius: "0%",
          },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
