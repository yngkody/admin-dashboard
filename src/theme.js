export const tokensLight = {
  primary: {
    0:  "#000000",
    10: "#080808",
    50: "#141414",
    100:"#212121",
    200:"#303030",
    300:"#424242",
    400:"#616161",
    500:"#757575",  // main neutral text
    600:"#9e9e9e",
    700:"#bdbdbd",
    800:"#e0e0e0",
    900:"#f5f5f5",
    1000:"#ffffff",
  },

  grey: {
    100:"#faf5ff",
    200:"#f3e8ff",
    300:"#e0c4ff",
    400:"#c39dff",
    500:"#a855f7",
    600:"#9333ea",
    700:"#7e22ce",
    800:"#6b21a8",
    900:"#581c87",
  },

  secondary: {
    50: "#faf7ff",
    100:"#f0ecff",
    200:"#e0daf8",
    300:"#cdc6ea",
    400:"#b6afda",
    500:"#9d96c3",
    600:"#8079a3",
    700:"#645e80",
    800:"#47435a",
    900:"#2d2a38",
  },
};

export const tokensDark = {
  primary: {
    0:  "#ffffff",
    10: "#f5f5f5",
    50: "#e0e0e0",
    100:"#bdbdbd",
    200:"#9e9e9e",
    300:"#757575",
    400:"#616161",
    500:"#424242",   // main
    600:"#303030",
    700:"#212121",
    800:"#141414",
    900:"#080808",
    1000:"#000000",
  },

  grey: {
    100:"#faf5ff",
    200:"#f3e8ff",
    300:"#e0c4ff",
    400:"#c39dff",
    500:"#a855f7", // mid purple
    600:"#9333ea",
    700:"#7e22ce",
    800:"#6b21a8",
    900:"#581c87",
  },

  secondary: {
    50: "#faf7ff",
    100:"#f0ecff",
    200:"#e0daf8",
    300:"#cdc6ea",
    400:"#b6afda",
    500:"#9d96c3",
    600:"#8079a3",
    700:"#645e80",
    800:"#47435a",
    900:"#2d2a38",
  },
};



export const themeSettings = (mode) => {
  const tokens = mode === "dark" ? tokensDark : tokensLight;
  const isDark = mode === "dark";

  // Stronger purple in light mode, slightly softer in dark
  const primaryMain  = isDark ? tokens.grey[400] : tokens.grey[700];
  const primaryLight = isDark ? tokens.grey[200] : tokens.grey[500];
  const primaryDark  = isDark ? tokens.grey[600] : tokens.grey[800];

  return {
    palette: {
      mode,

      // Purple accent
      primary: {
        ...tokens.grey,
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
      },

      // Support color
      secondary: {
        ...tokens.secondary,
        main: tokens.secondary[500],
        light: tokens.secondary[300],
        dark: tokens.secondary[700],
      },

      // Neutral greys (black/white scale)
      neutral: {
        ...tokens.primary,
        main: tokens.primary[500],
      },

      // Page backgrounds
      background: {
        default: isDark ? tokens.primary[900] : tokens.primary[1000], // black vs white
        alt:      isDark ? tokens.primary[800] : tokens.primary[900],  // panel bg
      },

      // Make sure text is legible
      text: {
        primary: isDark ? tokens.primary[10]  : tokens.primary[100],
        secondary: isDark ? tokens.primary[200] : tokens.primary[300],
      },
    },

    typography: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 12,
      h1: { fontFamily: "Inter, sans-serif", fontSize: 40 },
      h2: { fontFamily: "Inter, sans-serif", fontSize: 32 },
      h3: { fontFamily: "Inter, sans-serif", fontSize: 24 },
      h4: { fontFamily: "Inter, sans-serif", fontSize: 20 },
      h5: { fontFamily: "Inter, sans-serif", fontSize: 16 },
      h6: { fontFamily: "Inter, sans-serif", fontSize: 14 },
    },
  };
};
