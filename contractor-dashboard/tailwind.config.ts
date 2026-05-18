const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f1f3f6",
        surface: "#ffffff",
        foreground: "#111827",
        muted: "#6b7280",
        accentBlue: "#475569",
        accentAmber: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
