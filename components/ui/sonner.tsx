"use client";

import { bindTheme } from "ssr-themes/react";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { theme } from "@/app/theme";

const { useTheme } = bindTheme(theme);

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolved } = useTheme();

  return (
    <Sonner
      theme={(resolved ?? "system") as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
