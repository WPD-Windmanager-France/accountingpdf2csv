import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff4b4b", // Taipy default red-ish
      },
    },
  },
  plugins: [],
};
export default config;
