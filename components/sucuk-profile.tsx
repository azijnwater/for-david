const dailySchedule = [
  ["06:12", "Inspect the hallway"],
  ["08:40", "First serious nap"],
  ["12:03", "Request lunch as if breakfast never happened"],
  ["15:20", "Window patrol and neighborhood research"],
  ["19:00", "Appear wherever dinner is being prepared"],
  ["23:11", "Unexplained sprint through the house"],
];

const favorites = [
  ["Best room", "The one everyone else is using"],
  ["Favorite sound", "A cupboard opening two rooms away"],
  ["Preferred weather", "Sunbeam with a light blanket"],
  ["Signature move", "Sitting exactly where you need to be"],
  ["Current project", "Making the basket more comfortable"],
  ["Known weakness", "Feathers with suspicious intentions"],
];

export function SucukProfile() {
  return (
    <section id="life" className="relative z-10 bg-background px-5 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div className="section-kicker">
          <span>03 / Field notes</span>
          <span className="sucuk-seal" aria-label="Sucuk approved">S</span>
        </div>

        <div className="grid gap-12 pt-12 lg:grid-cols-[0.85fr_1.35fr] lg:gap-24 lg:pt-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">A life in detail</p>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(3.5rem,7vw,8rem)] italic leading-[0.88] tracking-[-0.055em]">
              The Sucuk dossier.
            </h2>
            <p className="mt-8 max-w-md text-base leading-8 text-foreground/75">
              Sucuk is a quiet domestic strategist with excellent hearing, soft opinions, and a firm belief that every object becomes better when occupied by a cat.
            </p>
          </div>

          <div className="border-t border-foreground/20">
            {favorites.map(([label, value], index) => (
              <div key={label} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-foreground/15 py-5 sm:grid-cols-[3.5rem_12rem_1fr] sm:items-baseline">
                <span className="font-mono text-[10px] text-foreground/60">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70 sm:block">{label}</span>
                <span className="font-display text-xl italic sm:text-2xl"><span className="mb-1 block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-foreground/65 sm:hidden">{label}</span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-12 border-t border-foreground/20 pt-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">A typical day</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-foreground/70">Times are approximate. Sucuk does not recognize clocks, deadlines, or the concept of being late.</p>
          </div>
          <ol>
            {dailySchedule.map(([time, activity]) => (
              <li key={time} className="grid grid-cols-[4.5rem_1fr] border-b border-foreground/15 py-4 sm:grid-cols-[6rem_1fr]">
                <time className="font-mono text-xs text-foreground/65">{time}</time>
                <span className="text-sm sm:text-base">{activity}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
