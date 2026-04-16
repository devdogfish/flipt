"use client";

import type { ReactNode } from "react";
import { bindTheme } from "ssr-themes/react";
import { theme } from "@/app/theme";

const { ThemeProvider: SsrThemeProvider } = bindTheme(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <SsrThemeProvider>{children}</SsrThemeProvider>;
}
