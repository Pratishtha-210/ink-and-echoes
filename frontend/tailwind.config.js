/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#050505",
          card: "#0F0F0F",
          gold: "#D4AF37",
          goldMuted: "#AA8417",
          goldDark: "#7C5D06",
          text: "#FFFFFF",
          muted: "#B3B3B3",
          border: "#1F1F1F"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        poetry: ["Cormorant Garamond", "serif"]
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-glow-hover': '0 0 25px rgba(212, 175, 55, 0.35)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
      }
    },
  },
  plugins: [],
}
