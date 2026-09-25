import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between border-b border-foreground/15 pb-3">
        <a
          href="#top"
          className="group flex items-baseline gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          aria-label="Sucuk, back to top"
        >
          <span aria-hidden="true" className="cat-mark"><span /><span /><b>•</b></span>
          <span className="text-sm font-semibold tracking-[0.2em]">SUCUK</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/50 transition-colors group-hover:text-foreground sm:inline">
            Photo archive
          </span>
        </a>
        <div className="flex items-center gap-1 sm:gap-3">
          <nav aria-label="Primary navigation" className="flex items-center text-xs font-medium">
            <a
              href="#work"
              className="rounded-full px-3 py-2 transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-foreground"
            >
              Gallery
            </a>
            <a
              href="#about"
              className="rounded-full px-3 py-2 transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-foreground"
            >
              About
            </a>
            <a href="#life" className="hidden rounded-full px-3 py-2 transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-foreground md:inline-flex">Life</a>
            <a href="#visit" className="rounded-full px-3 py-2 transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-foreground">Visit</a>
            <a
              href="https://david.party"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full px-3 py-2 transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:inline-flex"
            >
              Main site <span aria-hidden="true" className="ml-1">↗</span>
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
