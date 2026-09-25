"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-10 place-items-center rounded-full border border-foreground/15 bg-background/45 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Moon aria-hidden="true" className="block dark:hidden" size={16} />
      <Sun aria-hidden="true" className="hidden dark:block" size={16} />
    </button>
  );
}
