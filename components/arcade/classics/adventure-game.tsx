"use client";
import { useEffect, useState } from "react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";
import { SucukMark } from "@/components/sucuk-mark";

type Adventure = {
  room: number;
  items: string[];
  flags: string[];
  moves: number;
  message: string;
  code: string;
  ended: boolean;
};
const scenes: Record<string, string[]> = {
  samorost: ["The mossy moon", "The wind garden", "The sleeping branch"],
  machinarium: [
    "The clockwork workshop",
    "The narrow vent",
    "The rooftop machine",
  ],
  submachine: ["The old shaft", "The relay workshop", "The coordinate chamber"],
  "crimson-room": ["The bedside corner", "The red desk", "The locked cat flap"],
  hapland: ["The unlit gate", "The bridge and bell", "The far basket"],
  grow: ["A garden waiting to happen"],
};
const start = (): Adventure => ({
  room: 0,
  items: [],
  flags: [],
  moves: 0,
  message: "Look closely. Sucuk notices the smallest things.",
  code: "",
  ended: false,
});
export function AdventureClassic({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  const [s, setS] = useState(start),
    [selected, setSelected] = useState<string | null>(null),
    [order, setOrder] = useState<string[]>([]),
    [growResult, setGrowResult] = useState("");
  const has = (flag: string) => s.flags.includes(flag);

  const act = (id: string) =>
    setS((old) => {
      const n: Adventure = structuredClone(old);
      if (n.ended) return old;
      n.moves++;
      const has = (x: string) => n.flags.includes(x),
        own = (x: string) => n.items.includes(x);
      const flag = (x: string) => {
        if (!has(x)) n.flags.push(x);
      };
      const take = (x: string) => {
        if (!own(x)) n.items.push(x);
        n.message = `Sucuk found ${x}. Select it in the inventory before using it.`;
      };
      const consume = (x: string) => {
        n.items = n.items.filter((i) => i !== x);
      };
      const use = (x: string) => selected === x && own(x);
      const won = () => {
        n.ended = true;
        n.message = "The last cat flap opens. Sucuk’s adventure is complete.";
      };
      switch (game.variant) {
        case "samorost":
          if (id === "seed") take("silver seed");
          if (id === "soil") {
            if (use("silver seed")) {
              flag("vine");
              consume("silver seed");
              n.message = "A vine curls into a bridge. Sucuk can cross.";
            } else n.message = "The empty soil is waiting for a seed.";
          }
          if (id === "chime") {
            if (has("vine")) {
              take("wind bell");
              n.message = "The branch gives Sucuk a bell.";
            } else n.message = "The chime is beyond the broken branch.";
          }
          if (id === "owl") {
            if (use("wind bell")) {
              flag("owl");
              take("moon key");
              n.message = "The owl wakes and drops a moon-shaped key.";
            } else
              n.message =
                "The owl is fast asleep. Something musical might help.";
          }
          if (id === "flap") {
            if (use("moon key") && has("owl")) won();
            else n.message = "A moon-shaped keyhole is hidden in the bark.";
          }
          break;
        case "machinarium":
          if (id === "body") {
            const wasTall = has("tall");
            n.flags = n.flags.filter((f) => f !== "tall" && f !== "short");
            flag(wasTall ? "short" : "tall");
            n.message = has("tall")
              ? "Sucuk stretches up to the high shelf."
              : "Sucuk folds down to vent height.";
          }
          if (id === "shelf") {
            if (has("tall")) take("brass gear");
            else n.message = "The gear is above Sucuk’s paws. Try stretching.";
          }
          if (id === "vent") {
            if (!has("tall")) {
              flag("vent");
              take("oil can");
              n.message =
                "A folded-up cat fits through the vent. There is oil inside.";
            } else n.message = "Too tall to squeeze through.";
          }
          if (id === "machine") {
            if (use("brass gear")) {
              flag("gear");
              consume("brass gear");
              n.message = "The brass gear fits perfectly.";
            } else if (use("oil can") && has("gear")) {
              flag("oiled");
              n.message = "The machine hums. A lever rises from the floor.";
            } else n.message = "The machine needs a gear, then oil.";
          }
          if (id === "lever") {
            if (has("gear") && has("oiled")) won();
            else n.message = "The lever is stuck until the mechanism works.";
          }
          break;
        case "submachine":
          if (id === "note") take("coordinate note");
          if (id === "fuse") take("copper fuse");
          if (id === "casting") take("lead casting");
          if (id === "socket") {
            if (use("copper fuse")) {
              flag("power");
              consume("copper fuse");
              n.message = "Three amber lights turn on.";
            } else n.message = "A copper fuse would bridge these contacts.";
          }
          if (id === "stone") {
            if (use("lead casting")) {
              flag("stone");
              n.message =
                "The stone lifts. The casting stays in your inventory.";
            } else n.message = "There is a casting-shaped slot in the stone.";
          }
          if (id === "terminal") {
            if (!has("power")) n.message = "No power.";
            else if (n.code === "213" && has("stone")) won();
            else
              n.message =
                "The note reads: two, one, three. The stone must be raised first.";
          }
          break;
        case "crimson-room":
          if (id === "pillow") take("small key");
          if (id === "drawer") {
            if (use("small key")) {
              take("ring");
              take("battery");
              flag("drawer");
            } else n.message = "The drawer is locked. Check around the pillow.";
          }
          if (id === "rug") take("wooden stick");
          if (id === "box") {
            if (use("ring")) {
              flag("ring");
              consume("ring");
            } else if (use("wooden stick")) {
              flag("stick");
              consume("wooden stick");
            } else if (use("battery")) {
              flag("battery");
              consume("battery");
            }
            n.message =
              has("ring") && has("stick") && has("battery")
                ? "The music box projects four numbers onto the wall: 2413."
                : "The music box has a ring slot, a wooden groove, and a battery compartment.";
          }
          if (id === "safe") {
            if (
              has("ring") &&
              has("stick") &&
              has("battery") &&
              n.code === "2413"
            )
              take("cat-flap key");
            else
              n.message =
                "The safe needs the four numbers from the working music box.";
          }
          if (id === "flap") {
            if (use("cat-flap key")) won();
            else n.message = "The final key belongs here.";
          }
          break;
        case "hapland":
          if (id === "torch") {
            flag("torch off");
            n.message =
              "The torch goes dark. It is safe to move the paper bridge.";
          }
          if (id === "crate") {
            if (has("torch off")) {
              flag("bridge");
              n.message = "The crate rolls into place and makes a bridge.";
            } else {
              n.flags = [];
              n.message =
                "The paper bridge caught the torch. Reset: switch the torch off first.";
            }
          }
          if (id === "bell") {
            if (has("bridge")) {
              flag("cat crossing");
              n.message = "Miso hears the bell and crosses safely.";
            } else n.message = "Miso needs a bridge before you ring.";
          }
          if (id === "lever") {
            if (has("cat crossing")) {
              flag("gate");
              n.message = "Miso pulls the far lever. The basket gate opens.";
            } else n.message = "Someone must reach the far lever.";
          }
          if (id === "basket") {
            if (has("gate")) won();
            else n.message = "The gate is still shut.";
          }
          break;
      }
      return n;
    });
  useEffect(() => {
    if (s.ended) onFinish(Math.max(200, 2000 - s.moves * 20));
  }, [s.ended, s.moves, onFinish]);
  const hotspots: Record<
    string,
    { id: string; label: string; x: number; y: number }[]
  > = {
    samorost: [
      { id: "seed", label: "Silver seed", x: 10, y: 70 },
      {
        id: "soil",
        label: has("vine") ? "Growing vine" : "Empty soil",
        x: 35,
        y: 70,
      },
      { id: "chime", label: "Branch chime", x: 57, y: 35 },
      { id: "owl", label: "Sleepy owl", x: 77, y: 30 },
      { id: "flap", label: "Moon cat flap", x: 80, y: 75 },
    ],
    machinarium: [
      {
        id: "body",
        label: has("tall") ? "Fold Sucuk" : "Stretch Sucuk",
        x: 12,
        y: 60,
      },
      { id: "shelf", label: "High gear shelf", x: 35, y: 22 },
      { id: "vent", label: "Narrow vent", x: 35, y: 78 },
      { id: "machine", label: "Clockwork machine", x: 60, y: 50 },
      { id: "lever", label: "Exit lever", x: 82, y: 68 },
    ],
    submachine: [
      { id: "note", label: "Coordinate note", x: 10, y: 70 },
      { id: "fuse", label: "Copper fuse", x: 25, y: 50 },
      { id: "casting", label: "Lead casting", x: 42, y: 77 },
      { id: "socket", label: "Power socket", x: 62, y: 30 },
      { id: "stone", label: "Old stone", x: 62, y: 75 },
      { id: "terminal", label: "Coordinate terminal", x: 82, y: 52 },
    ],
    "crimson-room": [
      { id: "pillow", label: "Under the pillow", x: 12, y: 62 },
      { id: "drawer", label: "Locked drawer", x: 35, y: 50 },
      { id: "rug", label: "Under the rug", x: 48, y: 82 },
      { id: "box", label: "Music box", x: 60, y: 43 },
      { id: "safe", label: "Wall safe", x: 82, y: 28 },
      { id: "flap", label: "Locked cat flap", x: 82, y: 76 },
    ],
    hapland: [
      { id: "torch", label: "Switch off torch", x: 12, y: 30 },
      { id: "crate", label: "Push crate", x: 35, y: 65 },
      { id: "bell", label: "Ring the bell", x: 52, y: 25 },
      { id: "lever", label: "Pull far lever", x: 70, y: 60 },
      { id: "basket", label: "Enter basket", x: 84, y: 76 },
    ],
  };
  if (game.variant === "grow") {
    const target = [
      "water",
      "seed",
      "path",
      "house",
      "food",
      "toy",
      "tree",
      "cat",
    ];
    return (
      <div>
        <div className="game-hud">
          <span>
            Garden stage <b>{order.length}/8</b>
          </span>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => {
              setOrder([]);
              setGrowResult("");
            }}
          >
            Reset garden
          </button>
        </div>
        <div className="grow-garden">
          {order.map((name, index) => (
            <div key={name} className={`grow-object grow-${name}`}>
              <span aria-hidden="true">
                {
                  {
                    water: "≈",
                    seed: "✦",
                    path: "⋯",
                    house: "⌂",
                    food: "◉",
                    toy: "◌",
                    tree: "♧",
                    cat: "🐈",
                  }[name]
                }
              </span>
              <strong>{name}</strong>
              <small>
                Level{" "}
                {1 +
                  order
                    .slice(index + 1)
                    .filter((x) => target.indexOf(x) > target.indexOf(name))
                    .length}
              </small>
            </div>
          ))}
        </div>
        <div className="classic-management">
          {target.map((name) => (
            <button
              type="button"
              className="arcade-small-button"
              disabled={order.includes(name) || !!growResult}
              key={name}
              onClick={() => {
                const next = [...order, name];
                setOrder(next);
                if (next.length === 8) {
                  const correct = next.every((v, i) => v === target[i]);
                  setGrowResult(
                    correct
                      ? "Every part of the garden reached its happy ending."
                      : "The garden grew, but some objects needed a different order. Try water and seed first, and the cat last.",
                  );
                  if (correct) onFinish(2000);
                }
              }}
            >
              Plant {name}
            </button>
          ))}
        </div>
        <p className="puzzle-feedback" role="status">
          {growResult ||
            "Water before seeds. A path leads to a house. A fed cat plays beneath a tree."}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="game-hud">
        <span>
          Moves <b>{s.moves}</b>
        </span>
        <span>{scenes[game.variant]?.[s.room] || "A curious room"}</span>
        <div className="classic-management">
          {scenes[game.variant]?.map((name, index) => (
            <button
              type="button"
              key={name}
              className="arcade-small-button"
              aria-pressed={s.room === index}
              onClick={() =>
                setS((old) => ({
                  ...old,
                  room: index,
                  message: `Sucuk looks around ${name.toLowerCase()}.`,
                }))
              }
            >
              {index + 1} · {name}
            </button>
          ))}
        </div>
      </div>
      <div className={`adventure-scene scene-${game.variant}`}>
        <svg viewBox="0 0 960 480" aria-hidden="true">
          <rect
            x="0"
            y="0"
            width="960"
            height="480"
            fill={
              game.variant === "crimson-room"
                ? "#d8a4ae"
                : game.variant === "samorost"
                  ? "#dbe4d5"
                  : "#c9d0e5"
            }
          />
          <path
            d="M0 380H960M120 0V380M840 0V380"
            stroke="#25235e"
            strokeWidth="5"
            fill="none"
          />
          {game.variant === "samorost" ? (
            <>
              <path d="M70 400Q200 200 400 390T900 380" fill="#8b9e7f" />
              <path
                d="M550 380V170q-120-30-100-100m100 130q100-120 200-80"
                stroke="#4f7652"
                strokeWidth="30"
                fill="none"
              />
            </>
          ) : (
            <>
              <rect
                x="250"
                y="130"
                width="380"
                height="220"
                rx="20"
                fill="#8f9bb9"
              />
              <circle cx="600" cy="200" r="65" fill="#ffb21f" />
              <path
                d="M300 350V80H700V350"
                stroke="#25235e"
                strokeWidth="15"
                fill="none"
              />
            </>
          )}
        </svg>
        <SucukMark className="adventure-cat" />
        {(hotspots[game.variant] || [])
          .filter((_, index) => s.room === 0 || index % s.room === 0)
          .map((spot) => (
            <button
              key={spot.id}
              type="button"
              className="scene-hotspot"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              disabled={s.ended}
              onClick={() => act(spot.id)}
            >
              {spot.label}
            </button>
          ))}
      </div>
      <div className="adventure-inventory">
        <h3 className="heading heading-md">Sucuk&apos;s pockets</h3>
        {s.items.length ? (
          s.items.map((name) => (
            <button
              type="button"
              key={name}
              className="arcade-small-button"
              aria-pressed={selected === name}
              onClick={() => {
                setSelected(selected === name ? null : name);
                if (name === "coordinate note")
                  setS((old) => ({
                    ...old,
                    message:
                      "The note reads 2-1-3. Raise the stone, then power the terminal.",
                  }));
              }}
            >
              {name}
            </button>
          ))
        ) : (
          <p>No objects yet. Explore the scene.</p>
        )}
      </div>
      {["submachine", "crimson-room"].includes(game.variant) && (
        <label className="classic-code">
          {game.variant === "submachine" ? "Coordinates" : "Safe code"}
          <input
            value={s.code}
            maxLength={4}
            inputMode="numeric"
            onChange={(e) => setS((old) => ({ ...old, code: e.target.value }))}
          />
        </label>
      )}
      <p className="game-result" role="status">
        {s.message}
      </p>
    </div>
  );
}

const questions: readonly {
  q: string;
  a: readonly string[];
  correct: number;
  kind?: string;
}[] = [
  {
    q: "Sucuk turned two. How many birthday candles belong on his cake?",
    a: ["1", "2", "3", "All of them"],
    correct: 1,
  },
  {
    q: "Click the word cat. Not an answer below.",
    a: ["Dog", "Mouse", "Bird", "Try the question"],
    correct: -1,
    kind: "word",
  },
  {
    q: "A sleeping cat wants four seconds of peace. Do nothing.",
    a: ["Wake him", "Poke him", "Sing", "Offer a meeting"],
    correct: -1,
    kind: "wait",
  },
  {
    q: "Choose the green button, regardless of what it says.",
    a: ["Red", "Blue", "Yellow", "Green"],
    correct: 1,
    kind: "colour",
  },
  {
    q: "What opens faster: a treat bag or Sucuk’s eyes when he hears it?",
    a: ["The eyes", "The bag", "The calendar", "The website"],
    correct: 0,
  },
  {
    q: "Pet Sucuk five times. The first four are just the introduction.",
    a: ["Pet Sucuk", "Leave", "Nap", "Bark"],
    correct: 0,
    kind: "pets",
  },
  {
    q: "The basket is full of cat. How many empty baskets are shown?",
    a: ["Zero", "One", "Two", "A cat is not a number"],
    correct: 0,
  },
  {
    q: "Miso says the answer is not the last one. Luna says it is the first.",
    a: ["Trust Luna", "Trust Miso", "Neither", "The last one"],
    correct: 0,
  },
  {
    q: "Press M to meow. Touch players may use the Meow button.",
    a: ["Meow", "Woof", "Chirp", "…"],
    correct: 0,
    kind: "meow",
  },
  {
    q: "Which direction is the opposite of the opposite of left?",
    a: ["Right", "Up", "Left", "Lunch"],
    correct: 2,
  },
  {
    q: "Sucuk has four paws. Miso has four paws. How many cats?",
    a: ["Eight", "Four", "Two", "Sixteen"],
    correct: 2,
  },
  {
    q: "A box labelled ‘not a box’ is still…",
    a: ["A meeting", "A fish", "A box", "A problem"],
    correct: 2,
  },
  {
    q: "Choose the smallest number, not the shortest word.",
    a: ["100", "9", "12", "20"],
    correct: 1,
  },
  {
    q: "The answer is hidden in plain sight: LUNA.",
    a: ["Sucuk", "Miso", "Pepper", "Luna"],
    correct: 3,
  },
  {
    q: "Which sound makes a cat appear from another room?",
    a: ["A spreadsheet", "A treat cupboard", "Silence", "A deadline"],
    correct: 1,
  },
  {
    q: "How many letters are in ‘cat’? Count letters, not paws.",
    a: ["Four", "Two", "Three", "Five"],
    correct: 2,
  },
  {
    q: "If every chair belongs to Sucuk, who owns this chair?",
    a: ["You", "Miso", "The chair", "Sucuk"],
    correct: 3,
  },
  {
    q: "Choose an answer that contains no letter A.",
    a: ["Cat", "Paw", "Nap", "Miso"],
    correct: 3,
  },
  {
    q: "What comes directly after this question?",
    a: ["A small nap", "Question 20", "Question 18", "A sequel"],
    correct: 1,
  },
  {
    q: "The final answer is the first answer you gave.",
    a: ["1", "2", "3", "All of them"],
    correct: 1,
  },
] as const;
export function QuizClassic({
  onFinish,
}: {
  onFinish: (score: number) => void;
}) {
  const [index, setIndex] = useState(0),
    [lives, setLives] = useState(3),
    [skips, setSkips] = useState(2),
    [pets, setPets] = useState(0),
    [seconds, setSeconds] = useState(0),
    [message, setMessage] = useState(""),
    [ended, setEnded] = useState(false);
  const q = questions[index];
  const next = () => {
    if (ended) return;
    if (index === questions.length - 1) {
      setEnded(true);
      onFinish(questions.length * 100 + lives * 100 - skips * 10);
    } else {
      setIndex(index + 1);
      setPets(0);
      setSeconds(0);
      setMessage("");
    }
  };
  useEffect(() => {
    if (ended) return;
    const timer = setInterval(() => {
      if (!document.hidden) setSeconds((v) => v + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [index, ended]);
  useEffect(() => {
    if (!ended && q.kind === "wait" && seconds >= 4) {
      const timeout = setTimeout(() => {
        setIndex((v) => v + 1);
        setSeconds(0);
        setMessage("Quiet paws. Exactly right.");
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [seconds, q.kind, ended]);
  function answer(n: number) {
    if (ended) return;
    if (q.kind === "pets" && n === 0 && pets < 4) {
      setPets(pets + 1);
      setMessage(`${pets + 1}/5 gentle pats.`);
      return;
    }
    if (n === q.correct) {
      next();
    } else {
      setLives(lives - 1);
      setMessage("That was the tempting answer. Read it another way.");
      if (lives <= 1) {
        setEnded(true);
        onFinish(index * 100);
      }
    }
  }
  return (
    <div
      className="cat-quiz"
      tabIndex={0}
      role="group"
      aria-label="Cat quiz"
      onKeyDown={(e) => {
        if (q.kind === "meow" && e.key.toLowerCase() === "m") answer(0);
      }}
    >
      <div className="game-hud">
        <span>Question {index + 1}/20</span>
        <span>
          {lives} lives · {skips} skips · {seconds}s
        </span>
      </div>
      <h3 className="heading heading-lg">
        {q.kind === "word" ? (
          <>
            Click the word{" "}
            <button type="button" className="quiz-word" onClick={next}>
              cat
            </button>
            . Not an answer below.
          </>
        ) : (
          q.q
        )}
      </h3>
      <div className="quiz-answers">
        {q.a.map((a, n) => (
          <button
            type="button"
            className={`quiz-answer ${q.kind === "colour" ? `colour-${n}` : ""}`}
            key={a}
            disabled={ended}
            onClick={() => answer(n)}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="arcade-small-button"
        disabled={!skips || ended}
        onClick={() => {
          setSkips(skips - 1);
          next();
        }}
      >
        Use a skip
      </button>
      <p className="puzzle-feedback" role="status">
        {message ||
          (ended
            ? lives
              ? "The impossible cat quiz is complete!"
              : "The quiz claimed another nap."
            : "Read carefully. Sucuk enjoys loopholes.")}
      </p>
    </div>
  );
}
