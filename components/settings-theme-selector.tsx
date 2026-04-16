"use client";

import { bindTheme } from "ssr-themes/react";
import { Monitor, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTheme } from "@/app/actions";
import { theme } from "@/app/theme";

const { useTheme } = bindTheme(theme);

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor, db: "SYSTEM" },
  { value: "light", label: "Light", icon: Sun, db: "LIGHT" },
  { value: "dark", label: "Dark", icon: Moon, db: "DARK" },
] as const;

export function SettingsThemeSelector() {
  const { selected, setSelected } = useTheme();

  function handleChange(value: string, db: "SYSTEM" | "LIGHT" | "DARK") {
    setSelected(value as "system" | "light" | "dark");
    updateTheme(db);
  }

  return (
    <div className="flex gap-3">
      {OPTIONS.map(({ value, label, icon: Icon, db }) => (
        <button
          key={value}
          onClick={() => handleChange(value, db)}
          className={cn(
            "flex flex-col items-center gap-2 flex-1 rounded-xl border p-4 text-sm transition-colors",
            selected === value
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
          )}
        >
          <Icon className="w-5 h-5" />
          {label}
        </button>
      ))}
    </div>
  );
}
