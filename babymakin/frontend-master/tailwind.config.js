/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        logoGreen: "#43A980",
        cardGray: "#F5F5F5",
        textGreen: "#386553",
        textGray: "#3A3A3A",
        borderGray: "#DEDEDE",
        defaultText: "#34383D",
      },
      fontFamily: {
        inter: ["inter"],
        interBold: ["interBold"],
        interLite: ["interLite"],
        interDeep: ["interDeep"],
        interMedium: ["interMedium"],
        interMidBold: ["interMidBold"],
        interThin: ["interThin"],
        interBlack: ["interBlack"],
        interFaint: ["interFaint"],
        quicksandLight: ["Quicksand"],
      },
      screens: {
        "lg-graph": "1260px",
      },
    },
  },
};
