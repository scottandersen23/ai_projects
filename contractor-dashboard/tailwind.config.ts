const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070B",
        surface: "#101827",
        foreground: "#E5E7EB",
        muted: "#9CA3AF",
        neonTeal: "#00FFD1",
        accentOrange: "#FFBD17",
      },
    },
  },
  plugins: [],
};

export default config;
