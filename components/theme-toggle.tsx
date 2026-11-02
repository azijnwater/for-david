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
      className="grid size-11 place-items-center rounded-full text-foreground shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors hover:bg-foreground hover:text-background"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Moon aria-hidden="true" className="block dark:hidden" size={17} />
      <Sun aria-hidden="true" className="hidden dark:block" size={17} />
    </button>
  );
}
