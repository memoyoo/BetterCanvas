/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090d",
        card: "#12131a",
        muted: "#8f94ac",
        primary: "#8b7cff",
        secondary: "#59d0ff",
      },
    },
  },
  presets: [require("nativewind/preset")],
};
