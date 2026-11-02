"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, PawPrint } from "lucide-react";
import { BirthdayCopy, useBirthday } from "@/components/birthday-provider";

function timesForDate(date: string) {
  let seed = [...date].reduce((total, character) => total + character.charCodeAt(0), 0);
  const candidates = ["09:45", "10:15", "10:50", "11:30", "12:10", "13:20", "14:05", "14:45", "15:30", "16:10", "17:00", "17:40", "18:15", "19:00"];
  return candidates
    .map((slot) => ({ slot, sort: (seed = (seed * 9301 + 49297) % 233280) }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 6)
    .map(({ slot }) => slot)
    .sort();
}

export function VisitPlanner() {
  const birthday = useBirthday();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const times = useMemo(() => (date ? timesForDate(date) : []), [date]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
  }

  const action = birthday ? "RSVP to the party" : "Request a visit";

  return (
    <section id="visit" className="band band-visit" aria-labelledby="visit-title">
      <div className="section-inner grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
        <div>
          <h2 id="visit-title" className="heading heading-xl max-w-[11ch]">
            <BirthdayCopy birthday="Come say happy birthday.">Come meet Sucuk.</BirthdayCopy>
          </h2>
          <p className="lede mt-7">
            <BirthdayCopy birthday="The guest of honour is accepting gentle compliments and respectful admiration. Pick a time to celebrate with the household. Party hat optional; letting the cat come to you is essential.">
              Ask for a quiet audience with the smallest host in the house. Bring patience, keep a respectful distance, and don’t expect Sucuk to follow the plan.
            </BirthdayCopy>
          </p>
          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-6 border-t border-line pt-6">
            <div>
              <dt className="label">Visits last</dt>
              <dd className="mt-1 text-2xl font-semibold">20 minutes</dd>
            </div>
            <div>
              <dt className="label">Admission</dt>
              <dd className="mt-1 text-2xl font-semibold"><BirthdayCopy birthday="One birthday wish">One compliment</BirthdayCopy></dd>
            </div>
          </dl>
        </div>

        <div className="card p-6 sm:p-9">
          {confirmed ? (
            <div className="flex min-h-[26rem] flex-col items-center justify-center text-center" role="status">
              <span className="grid size-16 place-items-center rounded-full bg-accent text-on-accent"><Check size={26} aria-hidden="true" /></span>
              <h3 className="heading heading-md mt-6">
                {birthday ? "You’re on the guest list." : "Visit requested."}
              </h3>
              <p className="body-copy mt-4 max-w-sm">
                {name || "Friend of Sucuk"}, you asked for{" "}
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {time}. Sucuk will consider it.
              </p>
              <button type="button" onClick={() => setConfirmed(false)} className="btn btn-ghost mt-8">Choose another time</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3 className="heading heading-md"><BirthdayCopy birthday="Your party invitation">Plan a visit</BirthdayCopy></h3>
              <p className="body-copy mt-2">Pick a day to see when Sucuk is free.</p>

              <label className="label mt-7 block" htmlFor="visitor-name">Your name</label>
              <input id="visitor-name" autoComplete="given-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Friend of Sucuk" className="field mt-2" />

              <label className="label mt-6 block" htmlFor="visit-date">Day</label>
              <input required id="visit-date" type="date" min={minimumDate} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="field mt-2" />

              <fieldset className="mt-6">
                <legend className="label">Time</legend>
                {date ? (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {times.map((slot) => (
                      <label key={slot} className="slot">
                        <input required className="sr-only" type="radio" name="time" value={slot} checked={time === slot} onChange={() => setTime(slot)} />
                        {slot}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-line px-4 py-4 text-muted">
                    Sucuk keeps different hours every day. Choose a day first.
                  </p>
                )}
              </fieldset>

              <button type="submit" className="btn btn-primary mt-8 w-full">
                <PawPrint size={17} aria-hidden="true" />{action}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
