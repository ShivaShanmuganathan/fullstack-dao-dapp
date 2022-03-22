const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: [],
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        "Josefin": ["Josefin Sans"],
        "Cinzel": ["Cinzel Decorative"],
        Rampart: ["Rampart One", "cursive"],
        Playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

// font-family: 'Cinzel Decorative', cursive;
// font-family: 'Major Mono Display', monospace;
// font-family: 'Playfair Display', serif;
// font-family: 'Viaoda Libre', cursive;