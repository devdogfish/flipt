import { createTheme } from "ssr-themes";

export const theme = createTheme({
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
});

export const { themeScript } = theme;
