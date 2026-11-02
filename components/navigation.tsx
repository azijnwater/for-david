"use client";

import { ArrowUpRight } from "lucide-react";
import { useBirthday } from "@/components/birthday-provider";
import { SucukMark } from "@/components/sucuk-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const birthday = useBirthday();
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3">
        <a href="#top" className="brand rounded-full pr-2" aria-label="Sucuk, back to top">
          <SucukMark />
          <span aria-hidden="true" className="hidden min-[400px]:inline">Sucuk</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Primary navigation" className="flex items-center">
            <a href="#about" className="nav-link hidden sm:inline-flex">About</a>
            <a href="#life" className="nav-link">Life</a>
            <a href="#journal" className="nav-link">Journal</a>
            <a href="#visit" className="nav-link">Visit</a>
            <a href="https://david.party" target="_blank" rel="noreferrer" className="nav-link hidden gap-1 md:inline-flex">
              Main site <ArrowUpRight aria-hidden="true" size={15} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </nav>
          {!birthday && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
