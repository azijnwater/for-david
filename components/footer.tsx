import { ArrowUp } from "lucide-react";
import { BirthdayCopy } from "@/components/birthday-provider";
import { SucukMark } from "@/components/sucuk-mark";

export function Footer() {
  return (
    <footer className="band band-footer">
      <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-16 sm:px-10 sm:pt-24">
        <p className="heading text-[clamp(3rem,10vw,8.5rem)] leading-[0.9]">
          <BirthdayCopy birthday="Happy birthday, Sucuk.">Sucuk.</BirthdayCopy>
        </p>
        <div className="mt-10 flex items-end justify-between gap-6 border-t border-line pt-6">
          <div className="flex items-center gap-3">
            <SucukMark className="size-10 shrink-0" />
            <p className="text-muted">
              <BirthdayCopy birthday="Two years loved, a lifetime to go.">Made from ordinary days. © 2026</BirthdayCopy>
            </p>
          </div>
          <a
            href="#top"
            aria-label="Back to top"
            className="grid size-12 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)] transition-colors hover:bg-foreground hover:text-background"
          >
            <ArrowUp aria-hidden="true" size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
