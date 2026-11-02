"use client";
import { useEffect, useRef, useState } from "react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";
import { SucukMark } from "@/components/sucuk-mark";
type Fighter = {
  name: string;
  hp: number;
  max: number;
  focus: number;
  poison: number;
  stun: number;
  guard: boolean;
  weak: string;
};
type Battle = {
  party: Fighter[];
  foes: Fighter[];
  turn: number;
  wave: number;
  gold: number;
  charm: number;
  score: number;
  phase: string;
  message: string;
  over: boolean;
};
const fighter = (name: string, hp: number, weak = "water"): Fighter => ({
  name,
  hp,
  max: hp,
  focus: 40,
  poison: 0,
  stun: 0,
  guard: false,
  weak,
});
const foes = (wave: number) => [
  fighter("Vacuum sentry", 35 + wave * 12, "fire"),
  fighter("Clockwork mouse", 28 + wave * 10, "water"),
  ...(wave > 2 ? [fighter("Attic guardian", 40 + wave * 10, "wind")] : []),
];
const initial = (): Battle => ({
  party: [fighter("Sucuk", 110), fighter("Miso", 90), fighter("Luna", 85)],
  foes: foes(1),
  turn: 0,
  wave: 1,
  gold: 30,
  charm: 0,
  score: 0,
  phase: "battle",
  message: "Select an ability, then choose its target.",
  over: false,
});
export function RPGClassic({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  const [s, setS] = useState(initial),
    [skill, setSkill] = useState("strike"),
    [catClass, setCatClass] = useState("balanced");
  const ended = useRef(false);
  useEffect(() => {
    if (s.over && !ended.current) {
      ended.current = true;
      onFinish(s.score);
    }
  }, [s.over, s.score, onFinish]);
  function turn(target: number) {
    setS((old) => {
      const n = structuredClone(old);
      if (n.phase !== "battle" || n.over) return old;
      const actor = n.party[n.turn];
      if (!actor || actor.hp <= 0) return old;
      const enemy = n.foes[target];
      const cost =
        skill === "strike" || skill === "guard"
          ? 0
          : skill === "heal"
            ? 14
            : 10;
      if (actor.focus < cost) {
        n.message = "Not enough focus. Guard restores focus.";
        return n;
      }
      actor.focus -= cost;
      if (skill === "heal") {
        const friend = n.party
          .filter((f) => f.hp > 0)
          .sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
        friend.hp = Math.min(friend.max, friend.hp + 35 + n.charm);
        n.message = `${actor.name} heals ${friend.name}.`;
      } else if (skill === "guard") {
        actor.guard = true;
        actor.focus = Math.min(50, actor.focus + 18);
        n.message = `${actor.name} guards and restores focus.`;
      } else if (enemy && enemy.hp > 0) {
        let damage = skill === "strike" ? 18 + n.charm : 25 + n.charm;
        if (game.variant === "epic-battle-fantasy" && enemy.weak === skill)
          damage *= 2;
        if (skill === "poison") {
          enemy.poison = 3;
          damage = 12 + (catClass === "herbalist" ? 10 : 0);
        }
        if (skill === "stun") {
          enemy.stun = 1;
          damage = 10;
        }
        enemy.hp = Math.max(0, enemy.hp - damage);
        n.message = `${actor.name} uses ${skill} on ${enemy.name}: ${damage} damage.`;
      } else return old;
      if (n.foes.every((f) => f.hp <= 0)) {
        n.gold += 60;
        n.score += 200;
        n.phase = "camp";
        if (n.wave >= 5) {
          n.over = true;
          n.phase = "won";
          n.score += 500;
          n.message = "Five encounters cleared. The cat party saved the house.";
        }
        return n;
      }
      let next = n.turn + 1;
      while (next < n.party.length && n.party[next].hp <= 0) next++;
      if (next < n.party.length) n.turn = next;
      else {
        for (const e of n.foes) {
          if (e.hp <= 0) continue;
          if (e.poison) {
            e.hp = Math.max(0, e.hp - 10);
            e.poison--;
          }
          if (e.hp <= 0) continue;
          if (e.stun) {
            e.stun--;
            continue;
          }
          const alive = n.party.filter((p) => p.hp > 0);
          if (!alive.length) break;
          const victim = alive[Math.floor(Math.random() * alive.length)];
          const damage = (9 + n.wave * 2) * (victim.guard ? 0.4 : 1);
          victim.hp = Math.max(0, victim.hp - Math.ceil(damage));
        }
        n.party.forEach((p) => {
          p.guard = false;
          p.focus = Math.min(50, p.focus + 4);
        });
        n.turn = Math.max(
          0,
          n.party.findIndex((p) => p.hp > 0),
        );
        if (n.party.every((p) => p.hp <= 0)) {
          n.over = true;
          n.message =
            "The party needs a nap. Try different abilities and equipment.";
        }
        if (n.foes.every((f) => f.hp <= 0)) {
          n.phase = "camp";
          n.score += 200;
          n.gold += 60;
          if (n.wave >= 5) {
            n.over = true;
            n.phase = "won";
            n.score += 500;
            n.message = "Five encounters cleared. The cat party saved the house.";
          }
        }
      }
      return n;
    });
  }
  const act = (fn: (n: Battle) => void) =>
    setS((old) => {
      const n = structuredClone(old);
      fn(n);
      return n;
    });
  return (
    <div className="cat-rpg">
      <div className="game-hud">
        <span>
          Encounter {s.wave}/5 · Treats {s.gold}
        </span>
        <span>
          Score {s.score} · {s.party[s.turn]?.name}&apos;s turn
        </span>
      </div>
      {game.variant === "sonny" && (
        <label className="classic-code">
          Sucuk&apos;s class
          <select
            value={catClass}
            onChange={(e) => setCatClass(e.target.value)}
          >
            <option value="balanced">Balanced guardian</option>
            <option value="herbalist">Herbalist · stronger poison</option>
          </select>
        </label>
      )}
      <div className="rpg-battlefield">
        <div className="rpg-party">
          {s.party.map((p, index) => (
            <div
              key={p.name}
              className={`rpg-fighter ${s.turn === index ? "active" : ""} ${p.hp <= 0 ? "fallen" : ""}`}
            >
              <SucukMark />
              <h3>{p.name}</h3>
              <progress
                value={p.hp}
                max={p.max}
                aria-label={`${p.name} health`}
              />
              <span>
                {p.hp}/{p.max} HP · {p.focus} focus
              </span>
            </div>
          ))}
        </div>
        <div className="rpg-enemies">
          {s.foes.map((f, index) => (
            <button
              type="button"
              key={f.name}
              className="rpg-foe"
              disabled={f.hp <= 0 || s.phase !== "battle" || s.over}
              onClick={() => turn(index)}
            >
              <span aria-hidden="true">{index % 2 ? "◈" : "◉"}</span>
              <strong>{f.name}</strong>
              <progress
                value={f.hp}
                max={f.max}
                aria-label={`${f.name} health`}
              />
              <small>
                {f.hp}/{f.max} HP ·{" "}
                {game.variant === "epic-battle-fantasy"
                  ? `weak to ${f.weak}`
                  : `poison ${f.poison}, stun ${f.stun}`}
              </small>
            </button>
          ))}
        </div>
      </div>
      <div
        className="classic-management"
        role="group"
        aria-label="Battle abilities"
      >
        {(game.variant === "sonny"
          ? ["strike", "poison", "stun", "heal", "guard"]
          : ["strike", "fire", "water", "wind", "heal", "guard"]
        ).map((ability) => (
          <button
            type="button"
            key={ability}
            className="arcade-small-button"
            disabled={s.phase !== "battle" || s.over}
            aria-pressed={skill === ability}
            onClick={() => {
              setSkill(ability);
              if (ability === "guard" || ability === "heal") {
                setS((old) => ({
                  ...old,
                  message: `${ability} selected. Choose any living enemy to confirm the turn.`,
                }));
              }
            }}
          >
            {ability}
            {ability === "heal"
              ? " · 14 focus"
              : ["guard", "strike"].includes(ability)
                ? ""
                : " · 10 focus"}
          </button>
        ))}
      </div>
      {s.phase === "camp" && (
        <div className="classic-management">
          <h3 className="heading heading-md">A camp between battles.</h3>
          <button
            type="button"
            className="arcade-small-button"
            disabled={s.gold < 30}
            onClick={() =>
              act((n) => {
                n.gold -= 30;
                n.party.forEach((p) => {
                  p.hp = p.max;
                  p.focus = 40;
                });
                n.message = "Everyone rests. Health and focus restored.";
              })
            }
          >
            Rest party · 30
          </button>
          <button
            type="button"
            className="arcade-small-button"
            disabled={s.gold < 50}
            onClick={() =>
              act((n) => {
                n.gold -= 50;
                n.charm += 4;
                n.message = "A new charm strengthens every attack.";
              })
            }
          >
            Buy party charm · 50
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              act((n) => {
                n.wave++;
                n.foes = foes(n.wave);
                n.phase = "battle";
                n.turn = Math.max(
                  0,
                  n.party.findIndex((p) => p.hp > 0),
                );
              })
            }
          >
            Explore the next room
          </button>
        </div>
      )}
      <p className="game-result" role="status">
        {s.message}
      </p>
      <div className="classic-management">
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            try {
              localStorage.setItem(
                `sucuk-campaign-${game.id}`,
                JSON.stringify(s),
              );
              act((n) => {
                n.message = "Campaign saved on this device.";
              });
            } catch {
              act((n) => {
                n.message = "Device storage is unavailable.";
              });
            }
          }}
        >
          Save campaign
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            try {
              const data = JSON.parse(
                localStorage.getItem(`sucuk-campaign-${game.id}`) || "null",
              );
              if (
                data &&
                Array.isArray(data.party) &&
                data.party.length === 3 &&
                Array.isArray(data.foes) &&
                data.wave >= 1 &&
                data.wave <= 5 &&
                !data.over
              )
                setS(data);
              else
                act((n) => {
                  n.message = "No unfinished campaign is saved.";
                });
            } catch {
              act((n) => {
                n.message = "The saved campaign could not be read.";
              });
            }
          }}
        >
          Load campaign
        </button>
      </div>
    </div>
  );
}

type Day = {
  money: number;
  energy: number;
  hours: number;
  day: number;
  intellect: number;
  strength: number;
  charm: number;
  bike: boolean;
  basket: boolean;
  message: string;
  won: boolean;
};
const firstDay = (): Day => ({
  money: 20,
  energy: 12,
  hours: 16,
  day: 1,
  intellect: 1,
  strength: 1,
  charm: 1,
  bike: false,
  basket: false,
  message:
    "Build a life for Sucuk: study, work, make friends and buy a perfect basket.",
  won: false,
});
export function CatLifeRPG({
  onFinish,
}: {
  onFinish: (score: number) => void;
}) {
  const [s, setS] = useState(firstDay);
  const sent = useRef(false);
  useEffect(() => {
    if (s.won && !sent.current) {
      sent.current = true;
      onFinish(
        Math.floor(
          s.money + s.intellect * 100 + s.strength * 50 + s.charm * 50,
        ),
      );
    }
  }, [s, onFinish]);
  function act(action: string) {
    setS((old) => {
      const n = { ...old };
      if (n.won) return old;
      if (action === "sleep") {
        n.day++;
        n.hours = 16;
        n.energy = 12;
        n.message = "A fresh day. Sucuk has ambitious plans after breakfast.";
        return n;
      }
      const cost = action === "work" ? (n.bike ? 2 : 3) : 2;
      if (n.hours < cost || n.energy < 2) {
        n.message =
          "Time for sleep or a snack. You need more hours and energy.";
        return n;
      }
      n.hours -= cost;
      n.energy -= 2;
      if (action === "work") {
        const wage = 12 + n.intellect * 4 + n.charm * 2;
        n.money += wage;
        n.message = `A productive shift earned ${wage} treats.`;
      }
      if (action === "study") {
        if (n.money >= 5) {
          n.money -= 5;
          n.intellect++;
          n.message = "An excellent book. Intellect +1.";
        } else n.message = "Study costs 5 treats.";
      }
      if (action === "gym") {
        n.strength++;
        n.message = "A vigorous climb. Strength +1.";
      }
      if (action === "chat") {
        n.charm++;
        n.message = "Miso enjoyed that conversation. Charm +1.";
      }
      if (action === "food") {
        if (n.money >= 8) {
          n.money -= 8;
          n.energy = Math.min(12, n.energy + 8);
          n.message = "A snack restores energy.";
        } else n.message = "A snack costs 8 treats.";
      }
      if (action === "bike" && n.money >= 100) {
        n.money -= 100;
        n.bike = true;
        n.message = "A faster commute: work takes one less hour.";
      }
      if (action === "basket") {
        if (n.money >= 200) {
          n.money -= 200;
          n.basket = true;
          n.message = "The perfect basket is yours.";
        } else n.message = "The basket costs 200 treats.";
      }
      if (n.basket && n.intellect >= 5 && n.charm >= 3) {
        n.won = true;
        n.message =
          "A fine home, good friends, and a curious mind. Sucuk has made it!";
      }
      return n;
    });
  }
  return (
    <div className="life-rpg">
      <div className="game-hud">
        <span>
          Day {s.day} · {s.hours} hours left
        </span>
        <span>
          Treats {s.money} · Energy {s.energy}/12
        </span>
      </div>
      <div className="life-city">
        <div className="life-house">
          <SucukMark />
          <h3>Sucuk&apos;s home</h3>
          <p>{s.basket ? "A perfect new basket" : "One ordinary blanket"}</p>
        </div>
        {[
          { id: "study", name: "Library", text: "Intellect +1 · 5 treats" },
          {
            id: "work",
            name: "Treat office",
            text: `Earn ${12 + s.intellect * 4 + s.charm * 2} treats`,
          },
          { id: "gym", name: "Climbing gym", text: "Strength +1" },
          { id: "chat", name: "Miso’s café", text: "Charm +1" },
          { id: "food", name: "Snack shop", text: "Energy +8 · 8 treats" },
          {
            id: "bike",
            name: "Bicycle shop",
            text: "Faster work · 100 treats",
          },
          {
            id: "basket",
            name: "Basket boutique",
            text: "Your dream home · 200 treats",
          },
          { id: "sleep", name: "Go to sleep", text: "New day, full energy" },
        ].map((place) => (
          <button
            type="button"
            key={place.id}
            disabled={s.won}
            className="life-building"
            onClick={() => act(place.id)}
          >
            <strong>{place.name}</strong>
            <span>{place.text}</span>
          </button>
        ))}
      </div>
      <div className="classic-stats">
        <span>Intellect {s.intellect}/5</span>
        <span>Strength {s.strength}</span>
        <span>Charm {s.charm}/3</span>
        <span>Basket {s.basket ? "Owned" : "Not yet"}</span>
      </div>
      <p className="game-result" role="status">
        {s.message}
      </p>
      <p className="arcade-fine-print">
        Goal: buy the basket, reach intellect 5 and charm 3. Better stats
        increase your wages.
      </p>
    </div>
  );
}
