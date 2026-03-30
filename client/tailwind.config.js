/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E2E2E",
        topbar: "#456E91",
        sidebar: "#264E70",
        accent: "#BBD4CE",
        surface: "#F2EFE9",
        card: "#FFFCF7",
        danger: "#E08478",
        muted: "#4A4A4A",
        nudge: "#FAD7D3",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["B612 Mono", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
      }
    },
  },
  plugins: [],
}