import type { Config } from "tailwindcss";

// Tailwind is used for layout utilities only. The cinematic Living Worlds
// visual identity (gradients, phone frame, glass, animations) lives in
// app/globals.css as scoped `.lw-*` classes ported from the prototype.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#5BE0E6",
        accent2: "#9B7BFF",
      },
    },
  },
  plugins: [],
};
export default config;
