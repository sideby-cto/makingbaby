import { COLOR, COLORS } from "src/design-system";

const {
  navbar: { backgroundColor, activeTabColor: navActiveTabColor },
} = COLORS;

export const navBarStyle = { backgroundColor };
export const activeTabColor = navActiveTabColor;
export const inactiveTabColor = COLOR.slate;

export const defaultTabStyle = "flex space-x-6 items-center cursor-pointer";
export const activeTabTextStyle = `flex flex-row text-md text-[#2493A2] font-interMedium`;
export const inactiveTabTextStyle = "flex flex-row text-md text-defaultText font-inter";

export const ICON_SIZE = "1.3rem";
export const LOGOUT_ICON_SIZE = "1.4rem";
