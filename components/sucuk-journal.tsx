import { Plus } from "lucide-react";
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
    <section id="journal" className="band band-journal" aria-labelledby="journal-title">
      <div className="section-inner">
        <h2 id="journal-title" className="heading heading-xl max-w-[14ch]">
          <BirthdayCopy birthday="Little paws, big milestones.">A distinguished career in being Sucuk.</BirthdayCopy>
        </h2>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:mt-16" aria-label="Milestones">
          {achievements.map(([year, item], index) => {
            const current = index === achievements.length - 1;
            return (
              <li key={year} className="timeline-item relative" data-current={current}>
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="timeline-dot shrink-0" />
                  {!current && <span className="hidden h-0.5 flex-1 bg-line sm:block" />}
                </div>
                <p className="heading heading-lg mt-4 tabular">{year}{current && <span className="sr-only"> (today)</span>}</p>
                <p className="body-copy mt-2 max-w-[22em]">{item}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-20 grid gap-14 lg:mt-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="heading heading-md"><BirthdayCopy birthday="Party etiquette">House rules</BirthdayCopy></h3>
            <ol className="rule-list mt-6">
              {rules.map((rule, index) => (
                <li key={rule} className="grid grid-cols-[2rem_1fr] py-4">
                  <span className="tabular font-semibold text-muted">{index + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="heading heading-md"><BirthdayCopy birthday="Birthday wishes from around the house">Reviews from around the house</BirthdayCopy></h3>
            <div className="mt-6 grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {reviews.map(([author, quote]) => (
                <figure key={author}>
                  <span className="quote-mark block" aria-hidden="true">“</span>
                  <blockquote className="text-xl font-semibold leading-snug tracking-[-0.01em]">{quote}</blockquote>
                  <figcaption className="label mt-3">{author}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="faq mt-20 grid gap-8 lg:mt-28 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <h3 className="heading heading-md"><BirthdayCopy birthday="Before you join the party">Questions people ask</BirthdayCopy></h3>
          <div className="rule-list">
            {questions.map(([question, answer]) => (
              <details key={question} className="group">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-lg font-semibold">
                  {question}
                  <Plus className="faq-icon shrink-0" size={20} aria-hidden="true" />
                </summary>
                <p className="body-copy pb-5 pr-10">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
