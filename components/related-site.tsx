import { ArrowUpRight } from "lucide-react";
import { BirthdayCopy } from "@/components/birthday-provider";

export function RelatedSite() {
  return (
    <section aria-labelledby="related-site-heading" className="band band-related">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-7 sm:px-10">
        <h2 id="related-site-heading" className="text-lg font-semibold">
          <BirthdayCopy birthday="With love from Sucuk’s household">Sucuk lives with the people behind david.party</BirthdayCopy>
        </h2>
        <a
          href="https://david.party"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          Visit david.party <ArrowUpRight aria-hidden="true" size={17} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
