/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#1B2A4A",
        amber: "#E8913A",
        sage: "#4A9E7D",
        coral: "#E07A6B",
        cream: "#F8F7F4",
      },
      fontFamily: {
        inter: ["Inter"],
        "inter-bold": ["Inter-Bold"],
        mono: ["JetBrainsMono"],
      },
    },
  },
  plugins: [],
};
