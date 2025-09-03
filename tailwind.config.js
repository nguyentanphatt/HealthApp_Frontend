/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "lato-regular": ["Lato-Regular"],
        "lato-bold": ["Lato-Bold"],
      },
      colors: {
        "cyan-blue": "#19B1FF",
      },
    },
  },
  plugins: [],
};
