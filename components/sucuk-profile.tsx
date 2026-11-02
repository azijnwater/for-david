import { BirthdayCopy } from "@/components/birthday-provider";

const dailySchedule = [
  ["06:12", "Inspect the hallway"],
  ["08:40", "First serious nap"],
  ["12:03", "Request lunch as if breakfast never happened"],
  ["15:20", "Window patrol and neighbourhood research"],
  ["19:00", "Appear wherever dinner is being prepared"],
  ["23:11", "Unexplained sprint through the house"],
];

const favorites = [
  ["Best room", "The one everyone else is using"],
  ["Favourite sound", "A cupboard opening two rooms away"],
  ["Preferred weather", "Sunbeam with a light blanket"],
  ["Signature move", "Sitting exactly where you need to be"],
  ["Current project", "Making the basket more comfortable"],
  ["Known weakness", "Feathers with suspicious intentions"],
];

export function SucukProfile() {
  return (
    <section id="life" className="band band-life" aria-labelledby="life-title">
      <div className="section-inner">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <div>
            <h2 id="life-title" className="heading heading-xl">
              <BirthdayCopy birthday="Older. Softer. Still in charge.">The Sucuk dossier.</BirthdayCopy>
            </h2>
            <p className="lede mt-7">
              <BirthdayCopy birthday="Two candles, zero responsibilities. He has spent two years perfecting the art of being Sucuk, and he has opinions.">
                A quiet domestic strategist with excellent hearing, soft opinions, and a firm belief that every object improves once a cat sits on it.
              </BirthdayCopy>
            </p>
          </div>

          <dl className="grid gap-x-10 sm:grid-cols-2">
            {favorites.map(([label, value]) => (
              <div key={label} className="border-t border-line py-5">
                <dt className="label">{label}</dt>
                <dd className="mt-1 text-xl font-semibold leading-snug tracking-[-0.01em] sm:text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <div>
            <h3 className="heading heading-md">
              <BirthdayCopy birthday="The birthday itinerary">A typical day</BirthdayCopy>
            </h3>
            <p className="body-copy mt-4 max-w-sm">
              <BirthdayCopy birthday="The party follows his usual schedule. Celebrations must fit around six extremely important appointments with nothing.">
                Times are approximate. Sucuk does not recognise clocks, deadlines, or the concept of being late.
              </BirthdayCopy>
            </p>
          </div>
          <ol className="timeline">
            {dailySchedule.map(([time, activity], index) => (
              <li key={time} className="relative grid grid-cols-[4.5rem_1.5rem_1fr] items-baseline gap-x-3 pb-6 last:pb-0 sm:grid-cols-[5.5rem_1.5rem_1fr]">
                <time className="tabular font-semibold">{time}</time>
                <span className="relative flex justify-center self-stretch" aria-hidden="true">
                  {index < dailySchedule.length - 1 && <span className="absolute top-3 bottom-[-1.5rem] w-0.5 bg-line" />}
                  <span className="timeline-dot relative mt-1.5" />
                </span>
                <span className="text-lg">{activity}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
