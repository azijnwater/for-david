"use client";
import { useEffect, useRef, useState } from "react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";
import {
  COLS,
  ROWS,
  createDefense,
  creepPath,
  placeTower,
  startWave,
  tickDefense,
  towerInfo,
  type DefenseState,
  type TowerKind,
} from "@/lib/arcade/defense";
import { SucukMark } from "@/components/sucuk-mark";
const copy = <T,>(value: T): T => structuredClone(value);
export function StrategyClassic({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  return game.engine === "war" ? (
    <WarGame game={game} onFinish={onFinish} />
  ) : (
    <DefenseGame game={game} onFinish={onFinish} />
  );
}
function DefenseGame({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  const [state, setState] = useState(() => createDefense(game.variant)),
    [kind, setKind] = useState<TowerKind>("dart"),
    [selected, setSelected] = useState<number | null>(null),
    [paused, setPaused] = useState(false),
    [combining, setCombining] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () =>
        setState((old) => {
          if (document.hidden || old.over) return old;
          const next = copy(old);
          tickDefense(next, 0.1);
          return next;
        }),
      100,
    );
    return () => clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    if (state.over && !done.current) {
      done.current = true;
      onFinish(state.score);
    }
  }, [state.over, state.score, onFinish]);
  const mutate = (fn: (s: DefenseState) => void) =>
    setState((old) => {
      const s = copy(old);
      fn(s);
      return s;
    });
  const tower = state.towers.find((t) => t.cell === selected);
  return (
    <div className="classic-strategy">
      <div className="game-hud">
        <span>
          Treats <b>{state.money}</b>
        </span>
        <span>
          Basket {state.lives} · Wave {state.wave}/8 · Score {state.score}
        </span>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div
        className="classic-tower-shop"
        role="group"
        aria-label="Choose a cat tower"
      >
        {(Object.keys(towerInfo) as TowerKind[]).map((k) => (
          <button
            type="button"
            key={k}
            aria-pressed={kind === k}
            className="arcade-small-button"
            onClick={() => {
              setKind(k);
              setSelected(null);
            }}
          >
            {towerInfo[k].name} · {towerInfo[k].cost}
          </button>
        ))}
      </div>
      <div className="defense-scroll">
        <div
          className="defense-map"
          style={{ gridTemplateColumns: `repeat(${COLS},44px)` }}
        >
          {Array.from({ length: COLS * ROWS }, (_, cell) => {
            const t = state.towers.find((t) => t.cell === cell);
            const path = state.path.includes(cell);
            const site =
              game.variant === "kingdom-rush" &&
              [13, 18, 25, 30, 39, 49, 56, 67, 69, 32].includes(cell);
            return (
              <button
                type="button"
                key={cell}
                aria-label={
                  t
                    ? `${towerInfo[t.kind].name}, level ${t.level}`
                    : `${path ? "Path" : "Build site"} row ${Math.floor(cell / COLS) + 1} column ${(cell % COLS) + 1}`
                }
                className={`defense-cell ${path ? "path" : ""} ${site ? "build-site" : ""} ${selected === cell ? "selected" : ""}`}
                disabled={state.over}
                onClick={() => {
                  if (t) {
                    if (combining && selected !== null && selected !== cell) {
                      mutate((s) => {
                        const first = s.towers.find((t) => t.cell === selected),
                          second = s.towers.find((t) => t.cell === cell);
                        if (first && second && s.money >= 30) {
                          first.level = Math.min(
                            6,
                            Math.max(first.level, second.level) + 1,
                          );
                          s.towers = s.towers.filter((t) => t !== second);
                          s.money -= 30;
                          s.message =
                            "Two yarn gems combined into a stronger defense.";
                        }
                      });
                      setCombining(false);
                    } else setSelected(cell);
                  } else mutate((s) => placeTower(s, cell, kind));
                }}
              >
                {t ? (
                  <>
                    <SucukMark />
                    <span className="tower-level">{t.level}</span>
                  </>
                ) : cell === 36 ? (
                  "IN"
                ) : cell === 47 ? (
                  "HOME"
                ) : site ? (
                  "+"
                ) : (
                  ""
                )}
              </button>
            );
          })}
          {state.creeps.map((creep) => {
            const path = creepPath(state, creep);
            const next =
              path[Math.min(creep.next, path.length - 1)] ?? creep.cell;
            const x =
                ((creep.cell % COLS) +
                  ((next % COLS) - (creep.cell % COLS)) * creep.progress) *
                44,
              y =
                (Math.floor(creep.cell / COLS) +
                  (Math.floor(next / COLS) - Math.floor(creep.cell / COLS)) *
                    creep.progress) *
                44;
            return (
              <span
                key={creep.id}
                className={`defense-creep ${creep.flying ? "flying" : ""}`}
                style={{
                  left: x + 11,
                  top: y + 11,
                  background:
                    creep.hp > 3
                      ? "#25235e"
                      : creep.hp > 1
                        ? "#65a5bd"
                        : "#ffb21f",
                }}
                aria-hidden="true"
              >
                {creep.hp}
              </span>
            );
          })}
        </div>
      </div>
      <div className="classic-management">
        {tower && (
          <>
            <p>
              {towerInfo[tower.kind].name}, level {tower.level}.
            </p>
            <button
              type="button"
              className="arcade-small-button"
              onClick={() =>
                mutate((s) => {
                  const t = s.towers.find((t) => t.cell === selected);
                  const cost = (t?.level || 1) * 40;
                  if (t && t.level < 6 && s.money >= cost) {
                    s.money -= cost;
                    t.level++;
                  } else
                    s.message =
                      "Save more treats or choose a lower-level tower.";
                })
              }
            >
              Upgrade · {tower.level * 40}
            </button>
            <button
              type="button"
              className="arcade-small-button"
              onClick={() => {
                mutate((s) => {
                  s.towers = s.towers.filter((t) => t.cell !== selected);
                  s.money += 25;
                });
                setSelected(null);
              }}
            >
              Sell · +25
            </button>
            {game.variant === "gemcraft" && (
              <button
                type="button"
                className="arcade-small-button"
                aria-pressed={combining}
                onClick={() => setCombining(!combining)}
              >
                Combine with another gem · 30
              </button>
            )}
          </>
        )}
        {(game.variant === "kingdom-rush" || game.variant === "gemcraft") && (
          <button
            type="button"
            className="arcade-small-button"
            disabled={state.spell > 0}
            onClick={() =>
              mutate((s) => {
                s.creeps.forEach((c) => (c.hp -= 4));
                s.spell = 18;
                s.message = "Luna’s meteor yarn clears the path!";
              })
            }
          >
            {state.spell > 0
              ? `Spell ready in ${Math.ceil(state.spell)}s`
              : "Meteor yarn"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          disabled={state.active || state.over}
          onClick={() => mutate(startWave)}
        >
          Send wave {state.wave + 1}
        </button>
      </div>
      <p className="puzzle-feedback" role="status">
        {state.message}
      </p>
      <p className="arcade-fine-print">
        {game.variant === "desktop-td"
          ? "Build your own maze between waves. You cannot seal the route."
          : game.variant === "kingdom-rush"
            ? "Build on the + sites. Guards hold ground; magic and frost support them."
            : game.variant === "gemcraft"
              ? "Combine two placed yarn gems to raise their grade."
              : "Balloon layers need multiple hits. Frost slows; different cats cover different ranges."}{" "}
        Swipe the map sideways on small screens.
      </p>
    </div>
  );
}
type Unit = {
  id: number;
  x: number;
  hp: number;
  kind: string;
  team: 0 | 1;
  cooldown: number;
};
type WarState = {
  gold: number;
  xp: number;
  era: number;
  home: number;
  enemy: number;
  morale: number;
  units: Unit[];
  clock: number;
  spawn: number;
  order: string;
  score: number;
  special: number;
  over: boolean;
  won: boolean;
  message: string;
  nextId: number;
};
const initialWar = (): WarState => ({
  gold: 180,
  xp: 0,
  era: 1,
  home: 150,
  enemy: 150,
  morale: 100,
  units: [],
  clock: 0,
  spawn: 2,
  order: "defend",
  score: 0,
  special: 0,
  over: false,
  won: false,
  message:
    "Recruit your first cats. Miners earn treats; fighters defend the basket.",
  nextId: 0,
});
function WarGame({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  const [s, setS] = useState(initialWar),
    [paused, setPaused] = useState(false);
  const finished = useRef(false);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () =>
        setS((old) => {
          const n = copy(old);
          if (n.over || document.hidden) return old;
          n.clock += 0.1;
          n.spawn -= 0.1;
          n.special = Math.max(0, n.special - 0.1);
          n.gold +=
            0.4 +
            n.units.filter((u) => u.kind === "miner" && u.team === 0).length *
              0.5;
          if (n.spawn <= 0) {
            n.units.push({
              id: n.nextId++,
              x: 860,
              hp: 25 + n.era * 8,
              kind: n.nextId % 3 ? "warrior" : "archer",
              team: 1,
              cooldown: 0,
            });
            n.spawn = Math.max(1.7, 4 - n.clock / 90);
          }
          for (const u of n.units) {
            u.cooldown -= 0.1;
            if (u.kind === "miner") continue;
            const range =
              u.kind === "archer" ? 180 : u.kind === "mage" ? 130 : 28;
            const enemies = n.units.filter(
              (e) => e.team !== u.team && e.hp > 0,
            );
            const target = enemies.sort(
              (a, b) => Math.abs(a.x - u.x) - Math.abs(b.x - u.x),
            )[0];
            if (target && Math.abs(target.x - u.x) < range) {
              if (u.cooldown <= 0) {
                target.hp -=
                  u.kind === "giant" ? 18 : u.kind === "mage" ? 12 : 7 + n.era;
                u.cooldown = u.kind === "archer" ? 0.8 : 0.6;
              }
            } else {
              let stop =
                u.team === 0 && n.order === "defend"
                  ? 230
                  : u.team === 0 && n.order === "retreat"
                    ? 100
                    : u.team === 0
                      ? 850
                      : 90;
              if (
                game.variant === "warfare-1917" &&
                n.order !== "advance" &&
                u.team === 0
              )
                stop = 260;
              u.x +=
                Math.sign(stop - u.x) * (u.kind === "giant" ? 18 : 35) * 0.1;
              if ((u.team === 0 && u.x > 830) || (u.team === 1 && u.x < 110)) {
                if (u.cooldown <= 0) {
                  if (u.team === 0) n.enemy -= 4 + n.era;
                  else n.home -= 5;
                  u.cooldown = 0.8;
                }
              }
            }
          }
          for (const u of n.units)
            if (u.hp <= 0) {
              if (u.team) {
                n.gold += 18;
                n.xp += 25;
                n.score += 30;
              } else n.morale -= 4;
            }
          n.units = n.units.filter((u) => u.hp > 0);
          if (n.home <= 0 || n.morale <= 0) {
            n.over = true;
            n.message = "The blanket fort fell. Try a different army mix.";
          }
          if (n.enemy <= 0) {
            n.over = true;
            n.won = true;
            n.score += 1000;
            n.message = "The cat army captured the rival scratching post!";
          }
          return n;
        }),
      100,
    );
    return () => clearInterval(timer);
  }, [game.variant, paused]);
  useEffect(() => {
    if (s.over && !finished.current) {
      finished.current = true;
      onFinish(s.score);
    }
  }, [s.over, s.score, onFinish]);
  const act = (fn: (n: WarState) => void) =>
    setS((old) => {
      const n = copy(old);
      fn(n);
      return n;
    });
  return (
    <div>
      <div className="game-hud">
        <span>
          Treats <b>{Math.floor(s.gold)}</b> · XP {s.xp}
        </span>
        <span>
          Fort {Math.ceil(s.home)} · Rival {Math.ceil(s.enemy)} · Morale{" "}
          {s.morale}
        </span>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div className="war-field" aria-label="Cat armies and blanket forts">
        <span className="war-fort home">Sucuk&apos;s fort</span>
        <span className="war-fort rival">Rival post</span>
        {game.variant === "warfare-1917" &&
          [25, 50, 75].map((x) => (
            <span key={x} className="war-trench" style={{ left: `${x}%` }} />
          ))}
        {s.units.map((u) => (
          <span
            key={u.id}
            className={`war-unit team-${u.team}`}
            style={{ left: `${u.x / 9.6}%`, bottom: 25 + (u.id % 3) * 35 }}
          >
            <SucukMark />
            <small>
              {u.kind} {Math.max(0, Math.ceil(u.hp))}
            </small>
          </span>
        ))}
      </div>
      <div className="classic-management">
        {(
          [
            ["miner", 40],
            ["warrior", 50],
            ["archer", 75],
            ["mage", 110],
            ["giant", 160],
          ] as const
        ).map(([kind, cost]) => (
          <button
            type="button"
            key={kind}
            className="arcade-small-button"
            disabled={s.gold < cost || s.over}
            onClick={() =>
              act((n) => {
                n.gold -= cost;
                n.units.push({
                  id: n.nextId++,
                  x: 100,
                  hp: kind === "giant" ? 130 : kind === "warrior" ? 60 : 35,
                  kind,
                  team: 0,
                  cooldown: 0,
                });
              })
            }
          >
            {kind} · {cost}
          </button>
        ))}
      </div>
      <div className="classic-management">
        {["defend", "advance", "retreat"].map((order) => (
          <button
            type="button"
            className="arcade-small-button"
            key={order}
            aria-pressed={s.order === order}
            onClick={() =>
              act((n) => {
                n.order = order;
              })
            }
          >
            {order}
          </button>
        ))}
        <button
          type="button"
          className="arcade-small-button"
          disabled={s.special > 0}
          onClick={() =>
            act((n) => {
              n.units.filter((u) => u.team === 1).forEach((u) => (u.hp -= 35));
              n.special = 20;
              n.message = "A shower of yarn scatters the enemy!";
            })
          }
        >
          {s.special > 0
            ? `Support in ${Math.ceil(s.special)}s`
            : game.variant === "warfare-1917"
              ? "Support barrage"
              : "Yarn storm"}
        </button>
        {game.variant === "age-of-war" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={s.xp < 100 * s.era || s.era >= 5}
            onClick={() =>
              act((n) => {
                n.xp -= 100 * n.era;
                n.era++;
                n.home += 50;
                n.message = `Age ${n.era}: stronger cats and a sturdier fort.`;
              })
            }
          >
            Evolve to age {s.era + 1}
          </button>
        )}
      </div>
      <p className="puzzle-feedback" role="status">
        {s.message}
      </p>
      <p className="arcade-fine-print">
        {game.variant === "stick-war"
          ? "Miners keep your economy alive. Balance archers, fighters and giants before advancing."
          : game.variant === "warfare-1917"
            ? "Defend holds your cats at the trench. Advance sends them toward the rival post; support fire can break a stalemate."
            : `Age ${s.era}/5. Defeating rivals earns XP for evolution.`}
      </p>
    </div>
  );
}
