import { ThemeProvider as MUIThemeProvider } from "@mui/material";
import React from "react";
import { Theme } from "./theme";

export const ThemeProvider: React.FC<any> = (props) => {
  return <MUIThemeProvider theme={Theme}>{props.children}</MUIThemeProvider>;
};
