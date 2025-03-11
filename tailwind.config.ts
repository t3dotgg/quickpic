import type { Config } from "tailwindcss";

const widths = {
  "2xs": "20rem",
  xs: "29rem",
  sm: "40rem",
  container: "25rem",
} as const;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      width: {
        ...widths,
      },
      maxWidth: {
        ...widths,
      },
      screens: {
        ...widths,
      },
    },
  },
  plugins: [],
};

export default config;
