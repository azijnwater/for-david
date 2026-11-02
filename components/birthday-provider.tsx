"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Cake, Sparkles } from "lucide-react";

const BirthdayContext = createContext(true);

export function BirthdayProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <BirthdayContext.Provider value={enabled}>
      <div className={enabled ? "birthday-site" : "standard-site"}>
        <div className="birthday-toolbar">
          <span className="birthday-toolbar-note">{enabled ? "02 NOVEMBER · THE SECOND BIRTHDAY EDITION" : "SUCUK · THE EVERYDAY EDITION"}</span>
          <button className="birthday-switch" type="button" role="switch" aria-checked={enabled} aria-label="Birthday mode" onClick={() => setEnabled(!enabled)}>
            <Cake size={16} aria-hidden="true" />
            <span>Birthday mode <b>{enabled ? "ON" : "OFF"}</b></span>
            <span className="switch-track" aria-hidden="true"><span /></span>
          </button>
        </div>
        {children}
      </div>
    </BirthdayContext.Provider>
  );
}

export function BirthdayCopy({ birthday, children }: { birthday: ReactNode; children: ReactNode }) {
  return <>{useContext(BirthdayContext) ? birthday : children}</>;
}

export function BirthdayDecor() {
  const enabled = useContext(BirthdayContext);
  const [celebrations, setCelebrations] = useState(0);
  if (!enabled) return null;
  return (
    <>
      <div className="party-decoration" aria-hidden="true"><span className="party-star star-one">✳</span><span className="party-star star-two">✦</span><span className="party-doodle">hip, hip,<br />meow!</span></div>
      <div className="birthday-stamp" aria-label="Two years of Sucuk"><span>OFFICIALLY</span><strong>2</strong><span>YEARS OF SUCUK</span></div>
      <button type="button" className="celebrate-button" onClick={() => setCelebrations(value => value + 1)}><Sparkles size={16} aria-hidden="true" /> A little birthday confetti</button>
      <span className="sr-only" role="status">{celebrations > 0 ? `Happy second birthday, Sucuk! Celebration ${celebrations}.` : ""}</span>
      {celebrations > 0 && <div key={celebrations} className="confetti" aria-hidden="true">{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ "--i": index, left: `${(index * 37) % 100}%`, animationDelay: `${(index % 7) * .07}s` } as React.CSSProperties} />)}</div>}
    </>
  );
}
