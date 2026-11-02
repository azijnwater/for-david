import { BirthdayCopy } from "@/components/birthday-provider";
import { ArrowUpRight } from "lucide-react";

export function RelatedSite() {
  return (
    <section
      aria-labelledby="related-site-heading"
      className="relative z-10 bg-[var(--surface-strong)] px-5 pb-10 text-foreground sm:px-8 sm:pb-12 lg:px-10"
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 border-y border-foreground/15 py-5 sm:py-6">
        <h2
          id="related-site-heading"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70"
        >
          <BirthdayCopy birthday="From Sucuk’s household, with love">Main site</BirthdayCopy>
        </h2>
        <a
          href="https://david.party"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit david.party in a new tab"
          className="group inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span className="underline decoration-foreground/25 underline-offset-4 transition-colors group-hover:decoration-foreground/60">
            david.party
          </span>
          <ArrowUpRight
            aria-hidden="true"
            size={15}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </section>
  );
}
