import { BirthdayCopy } from "@/components/birthday-provider";

export function About() {
  return (
    <section id="about" className="band band-about" aria-labelledby="about-title">
      <div className="section-inner">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
          <h2 id="about-title" className="heading heading-xl max-w-[12ch]">
            <BirthdayCopy birthday="Two years of making life a little sweeter.">A very small cat with a very large world.</BirthdayCopy>
          </h2>

          <div className="flex flex-col justify-end gap-5 text-lg leading-relaxed">
            <p className="body-copy">
              <BirthdayCopy birthday="On 2 November 2024, the world got a little more Sucuk. Today he turns two, and we’re celebrating every sunbeam, every slow blink, and every seat he has claimed along the way.">
                Sucuk collects sunbeams, familiar corners, and the exact spot beneath the furniture. This archive keeps the evidence.
              </BirthdayCopy>
            </p>
            <p className="body-copy">
              <BirthdayCopy birthday="The birthday wish? More soft landings, more favourite corners, more ordinary days together. And perhaps an extra nap in the middle of all this attention.">
                Nothing here needs a grand story. Just one attentive observer, ten ordinary moments, and all the quiet space in between.
              </BirthdayCopy>
            </p>
            <p className="font-semibold">
              <BirthdayCopy birthday="Two years old, ten photos, and naps beyond counting.">One cat, ten photos, and naps beyond counting.</BirthdayCopy>
            </p>
          </div>
        </div>

        <p className="signoff">
          <BirthdayCopy birthday="All paws for the birthday boy!">Ordinary days, held closely.</BirthdayCopy>
        </p>
      </div>
    </section>
  );
}
