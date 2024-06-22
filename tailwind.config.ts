import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['"Ubuntu"', '"Noto Sans JP"', "sans-serif"],
      mono: ['"Ubuntu Mono"', '"Noto Sans JP"', "sans-serif"],
    },
  },
  plugins: [],
} satisfies Config;
