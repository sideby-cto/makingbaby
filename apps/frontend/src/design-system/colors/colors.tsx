const GLAUCOUS = "#678293";
const GRAY_FEATHER = "#B9BDC8";
const SAND = "#DDCABB";
const YELLOW_GOLD = "#DCB13C";
const AQUA = "#57BDA2";
const TEAL = "#2493A2";
const MEDIUM_BLUE = "#304A78";
const NAVY_BLUE = "#2C3259";
const SLATE = "#34383D";
const SHALLOW = "#E7EDE6";

// Ideally this variable would be named something like
// COLORS, but to iteratively change the color pattern
// I'll name it COLOR for now.

export const COLOR = {
  glaucous: GLAUCOUS,
  grayFeather: GRAY_FEATHER,
  sand: SAND,
  yellowGold: YELLOW_GOLD,
  aqua: AQUA,
  teal: TEAL,
  mediumBlue: MEDIUM_BLUE,
  navyBlue: NAVY_BLUE,
  slate: SLATE,
  shallow: SHALLOW,
};

export const COLORS = {
  getStarted: {
    defaultText: SLATE,
    inactiveOvalBackgroundColor: GRAY_FEATHER,
    activeOvalBackgroundColor: TEAL,
    categoryBackgroundColor: GRAY_FEATHER,
    activeTextColor: TEAL,
    iconBackgroundColor: SHALLOW,
    iconColor: TEAL,
  },
  sharedGetStartedDashboardColorS: {},
  navbar: {
    backgroundColor: SHALLOW,
    defaultTextTagColor: SLATE,
    activeTabColor: TEAL,
    avatarTextColor: MEDIUM_BLUE,
  },
  story: {
    successSignTagBackgroundColor: AQUA,
    // successSignTagBackgroundColor: "#DDCABB",
    characteristicsTagBackgroundColor: YELLOW_GOLD,
    // characteristicsTagBackgroundColor: AQUA,
    promisingPracticeTagBackgroundColor: GRAY_FEATHER,
    avatarTextColor: MEDIUM_BLUE,
  },
  text: {
    default: SLATE,
  },
  scrollBarBackgroundColor: MEDIUM_BLUE,
};
