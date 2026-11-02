"use client";

import { BirthdayCopy } from "@/components/birthday-provider";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, PawPrint } from "lucide-react";

function timesForDate(date: string) {
  if (!date) return ["10:30", "12:00", "14:30", "16:00", "18:15"];
  let seed = [...date].reduce((total, character) => total + character.charCodeAt(0), 0);
  const candidates = ["09:45", "10:15", "10:50", "11:30", "12:10", "13:20", "14:05", "14:45", "15:30", "16:10", "17:00", "17:40", "18:15", "19:00"];
  return candidates.map((slot) => ({ slot, sort: (seed = (seed * 9301 + 49297) % 233280) })).sort((a, b) => a.sort - b.sort).slice(0, 5).map(({ slot }) => slot).sort();
}

export function VisitPlanner() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const times = useMemo(() => timesForDate(date), [date]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
  }

  return (
    <section id="visit" className="relative z-10 overflow-hidden bg-[var(--surface)] px-5 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10 lg:py-36">
      <div aria-hidden="true" className="paw-pattern absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="section-kicker"><span><BirthdayCopy birthday="05 / You’re invited">05 / Visiting hours</BirthdayCopy></span><span>By appointment · subject to naps</span></div>
        <div className="grid gap-14 pt-12 lg:grid-cols-[1fr_0.9fr] lg:gap-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"><PawPrint size={13} aria-hidden="true" /> <BirthdayCopy birthday="The second birthday social club">Sucuk social club</BirthdayCopy></div>
            <h2 className="mt-7 max-w-4xl font-display text-[clamp(3.8rem,8vw,9rem)] italic leading-[0.84] tracking-[-0.06em]"><BirthdayCopy birthday="Come say happy birthday.">Come meet Sucuk.</BirthdayCopy></h2>
            <p className="mt-8 max-w-xl text-base leading-8 text-foreground/75"><BirthdayCopy birthday="The guest of honor is accepting gentle compliments and respectful admiration. Pick a time to celebrate with the household. Party hat optional; letting the cat come to you is essential.">Reserve a quiet audience with the smallest host in the house. Bring patience, a respectful distance, and no expectation that Sucuk will follow the itinerary.</BirthdayCopy></p>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-foreground/15 bg-foreground/15">
              <div className="bg-surface p-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/65">Duration</p><p className="mt-2 font-display text-2xl italic">20 minutes</p></div>
              <div className="bg-surface p-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/65">Admission</p><p className="mt-2 font-display text-2xl italic"><BirthdayCopy birthday="A birthday wish">One compliment</BirthdayCopy></p></div>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-6 text-foreground/65">This is a playful request for the household, not a guaranteed public booking. No personal information leaves this page.</p>
          </div>

          <div className="rounded-2xl border border-foreground/15 bg-background/80 p-5 shadow-[0_24px_70px_-40px_rgba(28,24,18,0.45)] backdrop-blur sm:p-8">
            {confirmed ? (
              <div className="flex min-h-[26rem] flex-col items-center justify-center text-center" aria-live="polite">
                <span className="grid size-14 place-items-center rounded-full bg-foreground text-background"><Check size={22} aria-hidden="true" /></span>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/65">Request noted</p>
                <h3 className="mt-3 font-display text-4xl italic">Sucuk will consider it.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-foreground/70">{name || "Esteemed visitor"}, your request for {new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })} at {time} has been added to this browser.</p>
                <button type="button" onClick={() => setConfirmed(false)} className="mt-8 rounded-full border border-foreground/20 px-5 py-3 text-sm font-medium hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">Choose another time</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 className="font-display text-3xl italic"><BirthdayCopy birthday="Your party invitation">Request a visit</BirthdayCopy></h3>
                <p className="mt-2 text-sm text-foreground/65">Choose a day, then select one of Sucuk&apos;s available windows.</p>
                <label className="mt-7 block text-xs font-semibold uppercase tracking-[0.12em]" htmlFor="visitor-name">Your name</label>
                <input id="visitor-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Friend of Sucuk" className="mt-2 h-12 w-full rounded-lg border border-foreground/20 bg-transparent px-4 text-sm outline-none placeholder:text-foreground/40 focus:border-foreground" />
                <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em]" htmlFor="visit-date"><CalendarDays className="mr-2 inline" size={14} aria-hidden="true" />Date</label>
                <input required id="visit-date" type="date" min={minimumDate} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="mt-2 h-12 w-full rounded-lg border border-foreground/20 bg-transparent px-4 text-sm outline-none focus:border-foreground" />
                <fieldset className="mt-6"><legend className="text-xs font-semibold uppercase tracking-[0.12em]"><Clock className="mr-2 inline" size={14} aria-hidden="true" />Times for this day</legend><p className="mt-2 text-xs leading-5 text-foreground/60">Sucuk keeps different visiting hours every day. Choose a date to reveal that day&apos;s schedule.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{times.map((slot) => <label key={slot} className={`cursor-pointer rounded-lg border px-3 py-3 text-center font-mono text-xs transition-colors ${time === slot ? "border-foreground bg-foreground text-background" : "border-foreground/20 hover:border-foreground/50"}`}><input required className="sr-only" type="radio" name="time" value={slot} checked={time === slot} onChange={() => setTime(slot)} />{slot}</label>)}</div></fieldset>
                <button type="submit" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"><PawPrint size={15} aria-hidden="true" /><BirthdayCopy birthday="Count me in, birthday boy">Request time with Sucuk</BirthdayCopy></button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
