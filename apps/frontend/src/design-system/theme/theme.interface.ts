import "@mui/material";

type colors = "teal" | "slate" | "midBlue";
declare module "@mui/material" {
  interface ThemeOptions {
    colors?: {
      [key in colors]: string;
    };
  }
}
