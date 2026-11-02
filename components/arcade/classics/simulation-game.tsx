"use client";
import { useEffect, useRef, useState } from "react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";

export function SimulationClassic({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  return game.variant === "pandemic-2" ? (
    <CatCraze onFinish={onFinish} />
  ) : (
    <Pizzeria onFinish={onFinish} />
  );
}
const regions = [
  "Sucuk City",
  "Miso Meadows",
  "Luna Coast",
  "Mochi Hills",
  "Pepper Port",
  "Yarn Valley",
  "Basket Bay",
  "Miso Island",
];
type Craze = {
  infected: number[];
  visibility: number;
  transmission: number;
  points: number;
  time: number;
  shipping: boolean;
  won: boolean;
  over: boolean;
  message: string;
};
function CatCraze({ onFinish }: { onFinish: (score: number) => void }) {
  const [s, setS] = useState<Craze>({
      infected: [0.02, 0, 0, 0, 0, 0, 0, 0],
      visibility: 5,
      transmission: 1,
      points: 15,
      time: 0,
      shipping: false,
      won: false,
      over: false,
      message:
        "A Sucuk video appeared in one city. Help the harmless cat craze travel.",
    }),
    [paused, setPaused] = useState(false),
    [speed, setSpeed] = useState(1);
  const sent = useRef(false);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () =>
        setS((old) => {
          if (old.over || document.hidden) return old;
          const n = structuredClone(old);
          const dt = 0.2 * speed;
          n.time += dt;
          n.infected = n.infected.map((v, index) => {
            if (v === 0) {
              const adjacent =
                index === 7
                  ? n.shipping && n.infected[6] > 0.1
                  : index > 0 && n.infected[index - 1] > 0.12;
              if (adjacent && n.visibility < 45 && n.time > index * 3)
                return 0.01;
              return 0;
            }
            return Math.min(1, v + v * (1 - v) * n.transmission * dt * 0.8);
          });
          n.points += dt * n.infected.reduce((a, b) => a + b, 0) * 0.2;
          n.visibility = Math.min(
            100,
            n.visibility + dt * n.transmission * 0.12,
          );
          if (n.infected.every((v) => v > 0.95)) {
            n.over = true;
            n.won = true;
            n.message = "Every region fell in love with Sucuk!";
          } else if (n.time > 180) {
            n.over = true;
            n.message =
              "The trend faded before reaching everyone. Try quieter purring and early shipping.";
          }
          return n;
        }),
      200,
    );
    return () => clearInterval(timer);
  }, [paused, speed]);
  useEffect(() => {
    if (s.over && !sent.current) {
      sent.current = true;
      onFinish(
        Math.floor(s.infected.reduce((a, b) => a + b, 0) * 1000) +
          (s.won ? 1000 : 0),
      );
    }
  }, [s, onFinish]);
  const buy = (kind: string) =>
    setS((old) => {
      const n = structuredClone(old),
        cost = kind === "shipping" ? 8 : 5;
      if (n.points < cost) {
        n.message = "Wait for more fans to earn the next upgrade.";
        return n;
      }
      n.points -= cost;
      if (kind === "shipping") {
        n.shipping = true;
        n.message = "Toy deliveries can now reach Miso Island.";
      }
      if (kind === "cute") {
        n.transmission += 0.45;
        n.visibility += 8;
        n.message = "Irresistible whiskers spread the craze faster.";
      }
      if (kind === "quiet") {
        n.visibility = Math.max(0, n.visibility - 18);
        n.message = "Quiet purring keeps the ports open.";
      }
      return n;
    });
  return (
    <div>
      <div className="game-hud">
        <span>
          Fan points <b>{Math.floor(s.points)}</b>
        </span>
        <span>
          Visibility {Math.floor(s.visibility)}% · {Math.floor(s.time)} / 180s
        </span>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => setSpeed(speed === 1 ? 3 : 1)}
        >
          Speed {speed}×
        </button>
      </div>
      <div className="craze-map">
        {regions.map((name, index) => (
          <div
            className={`craze-region ${s.infected[index] > 0.5 ? "popular" : ""}`}
            key={name}
          >
            <h3>{name}</h3>
            <strong>{Math.floor(s.infected[index] * 100)}% fans</strong>
            <progress
              value={s.infected[index]}
              max={1}
              aria-label={`${name} cat fans`}
            />
            <small>
              {index === 7 && !s.shipping
                ? "Needs shipping upgrade"
                : s.visibility >= 45
                  ? "Ports closed: lower visibility"
                  : "Ports open"}
            </small>
          </div>
        ))}
      </div>
      <div className="classic-management">
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => buy("cute")}
          disabled={s.over}
        >
          Irresistible whiskers · 5
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => buy("quiet")}
          disabled={s.over}
        >
          Quiet purring · 5
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => buy("shipping")}
          disabled={s.shipping || s.over}
        >
          Island toy deliveries · 8
        </button>
      </div>
      <p className="game-result" role="status">
        {s.message}
      </p>
    </div>
  );
}
type Order = {
  name: string;
  top: number;
  bottom: number;
  bake: number;
  cuts: number;
};
const orders: Order[] = [
  { name: "Miso", top: 3, bottom: 2, bake: 10, cuts: 2 },
  { name: "Luna", top: 2, bottom: 4, bake: 13, cuts: 3 },
  { name: "Mochi", top: 4, bottom: 0, bake: 8, cuts: 2 },
  { name: "Pepper", top: 1, bottom: 3, bake: 15, cuts: 4 },
  { name: "Sucuk", top: 2, bottom: 2, bake: 11, cuts: 2 },
];
export function Pizzeria({ onFinish }: { onFinish: (score: number) => void }) {
  const [order, setOrder] = useState(0),
    [stage, setStage] = useState<"top" | "bake" | "cut" | "serve">("top"),
    [toppings, setToppings] = useState<{ x: number; y: number }[]>([]),
    [time, setTime] = useState(0),
    [cuts, setCuts] = useState<number[]>([]),
    [score, setScore] = useState(0),
    [message, setMessage] = useState(
      "Miso is first in the queue. Read the order, then place toppings.",
    ),
    [ended, setEnded] = useState(false);
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<{ x: number; y: number } | null>(null);
  const recipe = orders[order];
  useEffect(() => {
    if (stage !== "bake" || ended) return;
    const timer = setInterval(() => {
      if (!document.hidden) setTime((t) => t + 0.2);
    }, 200);
    return () => clearInterval(timer);
  }, [stage, ended]);
  const place = (x: number, y: number) => {
    if (stage === "top" && Math.hypot(x - 200, y - 200) < 160)
      setToppings((old) => [...old, { x, y }]);
  };
  const serve = () => {
    const top = toppings.filter((t) => t.y < 200).length,
      bottom = toppings.length - top;
    const points = Math.max(
      0,
      100 -
        Math.abs(top - recipe.top) * 12 -
        Math.abs(bottom - recipe.bottom) * 12 -
        Math.round(Math.abs(time - recipe.bake) * 4) -
        Math.abs(cuts.length - recipe.cuts) * 15,
    );
    const nextScore = score + points;
    setScore(nextScore);
    if (order === 4) {
      setEnded(true);
      setMessage(`Five orders served! Final kitchen score ${nextScore}/500.`);
      onFinish(nextScore * 4);
    } else {
      setMessage(
        `${recipe.name} gives ${points}/100. ${orders[order + 1].name} is next.`,
      );
      setOrder(order + 1);
      setStage("top");
      setToppings([]);
      setTime(0);
      setCuts([]);
    }
  };
  return (
    <div className="pizzeria">
      <div className="game-hud">
        <span>
          Order {order + 1}/5 · Score {score}
        </span>
        <span>
          {stage === "top"
            ? "Topping station"
            : stage === "bake"
              ? "Baking station"
              : "Cutting station"}
        </span>
      </div>
      <div className="pizza-workbench">
        <aside className="pizza-ticket">
          <h3 className="heading heading-md">{recipe.name}&apos;s order</h3>
          <p>{recipe.top} toppings on the upper half</p>
          <p>{recipe.bottom} on the lower half</p>
          <p>Bake {recipe.bake} seconds</p>
          <p>{recipe.cuts} straight cuts</p>
          <strong>Oven timer: {time.toFixed(1)}s</strong>
        </aside>
        <svg
          ref={svg}
          viewBox="0 0 400 400"
          className="pizza-board"
          role="img"
          aria-label="Pizza topping and cutting board"
          onPointerDown={(e) => {
            if (!svg.current || ended) return;
            const r = svg.current.getBoundingClientRect(),
              x = ((e.clientX - r.left) / r.width) * 400,
              y = ((e.clientY - r.top) / r.height) * 400;
            if (stage === "top") place(x, y);
            else if (stage === "cut") {
              drag.current = { x, y };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerUp={(e) => {
            if (stage !== "cut" || !drag.current || !svg.current) return;
            const r = svg.current.getBoundingClientRect(),
              x = ((e.clientX - r.left) / r.width) * 400,
              y = ((e.clientY - r.top) / r.height) * 400;
            const angle = Math.atan2(y - drag.current.y, x - drag.current.x);
            setCuts((c) => [...c, angle]);
            drag.current = null;
          }}
        >
          <circle cx="200" cy="200" r="180" fill="#d29653" />
          <circle cx="200" cy="200" r="164" fill="#e4b35e" />
          <circle cx="200" cy="200" r="150" fill="#f5d78c" />
          {toppings.map((p, index) => (
            <g key={index}>
              <ellipse cx={p.x} cy={p.y} rx="13" ry="8" fill="#a75a65" />
              <path d={`M${p.x + 8} ${p.y}l10-6v12Z`} fill="#a75a65" />
            </g>
          ))}
          {cuts.map((a, index) => (
            <line
              key={index}
              x1={200 + Math.cos(a) * 170}
              y1={200 + Math.sin(a) * 170}
              x2={200 - Math.cos(a) * 170}
              y2={200 - Math.sin(a) * 170}
              stroke="#25235e"
              strokeWidth="3"
            />
          ))}
          {stage === "bake" && (
            <text
              x="200"
              y="210"
              textAnchor="middle"
              fill="#25235e"
              fontSize="36"
              fontWeight="bold"
            >
              {time.toFixed(1)}s
            </text>
          )}
        </svg>
      </div>
      <div className="classic-management">
        {stage === "top" ? (
          <>
            <button
              type="button"
              className="arcade-small-button"
              disabled={ended}
              onClick={() =>
                place(100 + Math.random() * 180, 100 + Math.random() * 70)
              }
            >
              Add upper topping
            </button>
            <button
              type="button"
              className="arcade-small-button"
              disabled={ended}
              onClick={() =>
                place(100 + Math.random() * 180, 240 + Math.random() * 60)
              }
            >
              Add lower topping
            </button>
            <button
              type="button"
              className="arcade-small-button"
              onClick={() => setToppings([])}
            >
              Clear toppings
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={ended}
              onClick={() => setStage("bake")}
            >
              Put in oven
            </button>
          </>
        ) : stage === "bake" ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStage("cut")}
          >
            Take out of oven
          </button>
        ) : (
          <>
            <button
              type="button"
              className="arcade-small-button"
              onClick={() =>
                setCuts((c) => [...c, (c.length * Math.PI) / recipe.cuts])
              }
            >
              Add evenly spaced cut
            </button>
            <button
              type="button"
              className="arcade-small-button"
              onClick={() => setCuts([])}
            >
              Reset cuts
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={ended}
              onClick={serve}
            >
              Serve {recipe.name}
            </button>
          </>
        )}
      </div>
      <p className="game-result" role="status">
        {message}
      </p>
      <p className="arcade-fine-print">
        Tap the pizza to add toppings. Drag across it to cut, or use the
        labelled buttons. These are pretend cat-friendly toy pizzas.
      </p>
    </div>
  );
}
