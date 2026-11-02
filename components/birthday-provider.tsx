"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { Cake, Wind, Flame } from "lucide-react";

const BirthdayContext = createContext(true);

export function useBirthday() {
  return useContext(BirthdayContext);
}

export function BirthdayProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <BirthdayContext.Provider value={enabled}>
      <div id="top" className={`site ${enabled ? "birthday-site" : "standard-site"}`}>
        <aside className="edition-bar" aria-label="Site edition">
          <span className="edition-note hidden sm:inline">
            {enabled ? "Sucuk turns two today, 2 November" : "The everyday edition"}
          </span>
          <button
            className="birthday-switch"
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
          >
            <Cake size={18} aria-hidden="true" />
            <span>Birthday mode</span>
            <span className="switch-track" aria-hidden="true"><span /></span>
          </button>
        </aside>
        {children}
      </div>
    </BirthdayContext.Provider>
  );
}

export function BirthdayCopy({ birthday, children }: { birthday: ReactNode; children: ReactNode }) {
  return <>{useBirthday() ? birthday : children}</>;
}

/** The striped number candle shown in the birthday headline. Decorative; the h1 text carries the meaning. */
export function Candle({ lit }: { lit: boolean }) {
  return (
    <span className="candle" data-lit={lit} aria-hidden="true">
      <span className="candle-smoke" />
      <span className="candle-flame" />
      <span className="candle-wick" />
      <span className="candle-number">2</span>
    </span>
  );
}

/** Blowing out the candle is the one celebration moment: the flame goes out and confetti falls. */
export function useCandle() {
  const [lit, setLit] = useState(true);
  const [wishes, setWishes] = useState(0);
  const toggle = () => {
    if (lit) setWishes((count) => count + 1);
    setLit(!lit);
  };
  return { lit, wishes, toggle };
}

export function CandleButton({ lit, wishes, onToggle }: { lit: boolean; wishes: number; onToggle: () => void }) {
  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={onToggle}>
        {lit ? <Wind size={17} aria-hidden="true" /> : <Flame size={17} aria-hidden="true" />}
        {lit ? "Blow out the candle" : "Light it again"}
      </button>
      <span className="sr-only" role="status">
        {!lit ? "Candle blown out. Happy second birthday, Sucuk!" : ""}
      </span>
      {!lit && (
        <div key={wishes} className="confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <i
              key={index}
              style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 7) * 0.07}s` } as CSSProperties}
            />
          ))}
        </div>
      )}
    </>
  );
}
