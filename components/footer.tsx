import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--surface-strong)] px-5 pb-6 text-foreground sm:px-8 sm:pb-8 lg:px-10">
      <div className="mx-auto flex max-w-[1500px] items-end justify-between border-t border-foreground/15 pt-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em]">SUCUK</p>
          <p className="mt-1 text-xs text-foreground/70">Made from ordinary days.</p>
        </div>
        <div className="flex items-center gap-5">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/65 sm:block">
            © 2026
          </p>
          <a
            href="#top"
            aria-label="Back to top"
            className="grid size-10 place-items-center rounded-full border border-foreground/15 transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ArrowUp aria-hidden="true" size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
