import { BirthdayCopy } from "@/components/birthday-provider";
export function About() {
  return (
    <section
      id="about"
      className="relative z-10 overflow-hidden border-t border-foreground/10 bg-[var(--surface-strong)] px-5 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10 lg:py-36"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="flex items-center justify-between border-b border-foreground/15 pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
          <span><BirthdayCopy birthday="02 / The birthday cat">02 / About</BirthdayCopy></span>
          <span><BirthdayCopy birthday="Two years. One very good cat.">Photo archive · 2026</BirthdayCopy></span>
        </div>

        <div className="grid gap-12 pt-12 sm:pt-16 lg:grid-cols-[1.55fr_0.75fr] lg:gap-24 lg:pt-24">
          <h2 className="max-w-5xl font-display text-[clamp(3.2rem,7.4vw,8.5rem)] italic leading-[0.88] tracking-[-0.055em]">
            <BirthdayCopy birthday="Two years of making life a little sweeter.">A very small cat with a very large world.</BirthdayCopy>
          </h2>

          <div className="flex flex-col justify-end lg:pb-3">
            <div className="space-y-5 text-sm leading-7 text-foreground/75 sm:text-base sm:leading-8">
              <p>
                <BirthdayCopy birthday="On November 2, 2024, the world got a little more Sucuk. Today he turns two, and we’re celebrating every sunbeam, every slow blink, and every seat he has claimed along the way.">Sucuk collects sunbeams, familiar corners, and the exact spot beneath the furniture. This archive keeps the evidence.</BirthdayCopy>
              </p>
              <p>
                <BirthdayCopy birthday="The birthday wish? More soft landings. More favorite corners. More ordinary days together. And perhaps an extra nap in the middle of all this attention.">Nothing here needs a grand story. Just one attentive observer, ten ordinary moments, and all the quiet space in between.</BirthdayCopy>
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-3 border-y border-foreground/15 py-5">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">Frames</dt>
                <dd className="mt-2 font-display text-3xl italic">10</dd>
              </div>
              <div className="border-l border-foreground/15 pl-4 sm:pl-6">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70"><BirthdayCopy birthday="Years">Subject</BirthdayCopy></dt>
                <dd className="mt-2 font-display text-3xl italic"><BirthdayCopy birthday="02">01</BirthdayCopy></dd>
              </div>
              <div className="border-l border-foreground/15 pl-4 sm:pl-6">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">Naps</dt>
                <dd className="mt-2 font-display text-3xl italic">Many</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-20 flex min-h-40 items-center justify-center overflow-hidden border-y border-foreground/10 py-10 sm:mt-28 sm:min-h-56">
          <p className="whitespace-nowrap font-display text-[clamp(2.8rem,9vw,9rem)] italic leading-none tracking-[-0.055em] text-foreground/45">
            <BirthdayCopy birthday="all paws for the birthday boy!">ordinary days, held closely</BirthdayCopy>
          </p>
        </div>
      </div>
    </section>
  );
}
