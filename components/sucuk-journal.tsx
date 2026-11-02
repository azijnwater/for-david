import { BirthdayCopy } from "@/components/birthday-provider";
const achievements = [
  ["2024", "The story begins. A small cat makes a very big entrance."],
  ["2025", "First birthday. Already an expert in naps and household supervision."],
  ["2026", "Two years old. Still finding new ways to make ordinary days better."],
];
const reviews = [
  ["The windowsill", "A committed regular. Arrives early, stays for hours."],
  ["The basket", "Difficult client, but brings undeniable atmosphere."],
  ["A local feather", "Fast paws. No comment on the ongoing investigation."],
  ["The hallway", "Maintains standards through frequent surprise inspections."],
];
const rules = [
  "Announce your arrival calmly. Sucuk dislikes unnecessary plot twists.",
  "Offer one hand for inspection; do not pursue the inspector.",
  "The tail makes its own decisions and accepts no responsibility.",
  "Photography is permitted when Sucuk is feeling editorial.",
  "If a chair is occupied, the chair no longer belongs to you.",
  "Compliments should be sincere, specific, and reasonably frequent.",
];
const questions = [
  ["Is Sucuk named after sausage?", "The archive declines to clarify. The resemblance is conceptual, not physical."],
  ["Can Sucuk be picked up?", "This depends on timing, trust, atmospheric pressure, and whether Sucuk has already left."],
  ["What should visitors bring?", "A calm disposition and one genuinely good compliment. Treats require prior diplomatic approval."],
  ["Does Sucuk enjoy company?", "Sucuk enjoys having the option of company and the freedom to ignore it completely."],
  ["Who runs this website?", "Officially, the household. Operationally, Sucuk reviews all major decisions from a nearby blanket."],
];

export function SucukJournal() {
  return (
    <section id="journal" className="relative z-10 bg-[var(--surface-strong)] px-5 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="section-kicker"><span><BirthdayCopy birthday="04 / Two years of good trouble">04 / The journal</BirthdayCopy></span><span><BirthdayCopy birthday="The birthday scrapbook">Notes, honors &amp; household policy</BirthdayCopy></span></div>
        <div className="grid gap-14 pt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24 lg:pt-20">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">Selected achievements</p><h2 className="mt-5 max-w-3xl font-display text-[clamp(3.6rem,7vw,8rem)] italic leading-[0.86] tracking-[-0.055em]"><BirthdayCopy birthday="Little paws. Big milestones.">A distinguished career in being Sucuk.</BirthdayCopy></h2></div>
          <div className="border-t border-foreground/20">{achievements.map(([year, item]) => <div key={year} className="grid grid-cols-[4rem_1fr] gap-5 border-b border-foreground/15 py-5"><span className="font-mono text-xs text-foreground/60">{year}</span><p className="text-sm leading-7 sm:text-base">{item}</p></div>)}</div>
        </div>
        <div className="mt-24 grid gap-8 lg:grid-cols-2">
          <div className="border-t border-foreground/20 pt-7"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70"><BirthdayCopy birthday="Party etiquette">House rules</BirthdayCopy></p><ol className="mt-7">{rules.map((rule, index) => <li key={rule} className="grid grid-cols-[2.5rem_1fr] border-b border-foreground/15 py-4"><span className="font-display text-lg italic text-foreground/55">{index + 1}</span><span className="text-sm leading-7">{rule}</span></li>)}</ol></div>
          <div className="border-t border-foreground/20 pt-7"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70"><BirthdayCopy birthday="Birthday wishes from the household">Peer reviews</BirthdayCopy></p><div className="mt-7 grid gap-3 sm:grid-cols-2">{reviews.map(([author, quote]) => <figure key={author} className="rounded-xl border border-foreground/15 bg-background/35 p-5"><blockquote className="font-display text-xl italic leading-snug">“{quote}”</blockquote><figcaption className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/65">— {author}</figcaption></figure>)}</div></div>
        </div>
        <div className="mt-24 border-t border-foreground/20 pt-12"><div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">Frequently asked</p><h3 className="mt-4 font-display text-4xl italic sm:text-5xl"><BirthdayCopy birthday="Before you join the party.">Questions from the public.</BirthdayCopy></h3></div><dl>{questions.map(([question, answer]) => <div key={question} className="border-b border-foreground/15 py-5 first:border-t"><dt className="font-semibold">{question}</dt><dd className="mt-2 max-w-3xl text-sm leading-7 text-foreground/70">{answer}</dd></div>)}</dl></div></div>
      </div>
    </section>
  );
}
