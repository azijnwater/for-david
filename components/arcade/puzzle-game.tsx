"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
} from "lucide-react";
import {
  addTile,
  hasMoves,
  newLights,
  shuffle,
  slideBoard,
  toggleLights,
} from "@/lib/arcade/puzzles";
import type { GameId } from "@/lib/arcade/catalog";

const toys = ["🧶", "🐾", "🐟", "🪶", "🎂", "📦", "🌙", "☀️"];
const names = ["Yarn", "Paw", "Fish", "Feather", "Cake", "Box", "Moon", "Sun"];
export function PuzzleGame({
  id,
  onStart,
  onFinish,
}: {
  id: GameId;
  onStart: () => void;
  onFinish: (score: number) => void;
}) {
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [board, setBoard] = useState<number[]>(Array(16).fill(0));
  const [lights, setLights] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [target, setTarget] = useState(-1);
  const boxTarget = useRef(-1);
  const hits = useRef(0);
  const deadline = useRef(0);
  const hiddenAt = useRef(0);
  const [suspended, setSuspended] = useState(false);
  const [feedback, setFeedback] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  function finish(finalScore: number, success = true) {
    setOver(true);
    setWon(success);
    setScore(finalScore);
    onFinish(finalScore);
  }
  function start() {
    setStarted(true);
    setOver(false);
    setWon(false);
    setMoves(0);
    setScore(0);
    setRevealed([]);
    setMatched([]);
    setTime(30);
    hits.current = 0;
    setFeedback("");
    if (id === "memory")
      setBoard(shuffle(Array.from({ length: 16 }, (_, i) => i % 8)));
    if (id === "lights") setLights(newLights());
    if (id === "merge") setBoard(addTile(addTile(Array(16).fill(0))));
    if (id === "whack") {
      deadline.current = Date.now() + 30000;
      boxTarget.current = Math.floor(Math.random() * 9);
      setTarget(boxTarget.current);
    }
    onStart();
    root.current?.focus();
  }
  useEffect(() => {
    if (id !== "memory" || revealed.length !== 2 || over) return;
    const timeout = window.setTimeout(() => setRevealed([]), 750);
    return () => clearTimeout(timeout);
  }, [id, revealed, over]);

  useEffect(() => {
    if (!started || over) return;
    const visibility = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
        setSuspended(true);
      } else {
        if (hiddenAt.current) deadline.current += Date.now() - hiddenAt.current;
        hiddenAt.current = 0;
        setSuspended(false);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [started, over]);

  useEffect(() => {
    if (id !== "whack" || !started || over || suspended) return;
    let lastChange = Date.now();
    const timer = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setTime(remaining);
      if (remaining <= 0) {
        setOver(true);
        setWon(true);
        boxTarget.current = -1;
        setTarget(-1);
        finishRef.current(hits.current);
      } else if (
        Date.now() - lastChange >
        Math.max(360, 850 - hits.current * 2)
      ) {
        const old = boxTarget.current;
        boxTarget.current = (old + 1 + Math.floor(Math.random() * 8)) % 9;
        setTarget(boxTarget.current);
        lastChange = Date.now();
      }
    }, 70);
    return () => clearInterval(timer);
  }, [id, started, over, suspended]);

  function inspect(index: number) {
    if (!started || over || suspended) return;
    if (index === boxTarget.current) {
      hits.current += 10;
      setScore(hits.current);
      boxTarget.current = -1;
      setTarget(-1);
      setFeedback("Feather inspected! +10");
    } else {
      hits.current = Math.max(0, hits.current - 5);
      setScore(hits.current);
      setFeedback("Empty box. −5");
    }
  }
  function reveal(index: number) {
    if (
      !started ||
      over ||
      matched.includes(index) ||
      revealed.includes(index) ||
      revealed.length === 2
    )
      return;
    const next = [...revealed, index];
    setRevealed(next);
    if (next.length === 2) {
      const count = moves + 1;
      setMoves(count);
      if (board[next[0]] === board[next[1]]) {
        const found = [...matched, ...next];
        setMatched(found);
        setRevealed([]);
        setFeedback(
          `A pair of ${names[board[index]].toLowerCase()} cards. ${found.length / 2} of 8 pairs.`,
        );
        if (found.length === 16) finish(Math.max(100, 1600 - (count - 8) * 30));
      } else setFeedback("No match. Try another pair.");
    }
  }
  function light(index: number) {
    if (!started || over) return;
    const next = toggleLights(lights, index);
    setLights(next);
    setMoves(moves + 1);
    if (next.every((v) => !v)) finish(Math.max(100, 2000 - (moves + 1) * 25));
  }
  function move(direction: string) {
    if (!started || over || id !== "merge") return;
    const next = slideBoard(board, direction);
    if (!next.changed) return;
    const nextBoard = addTile(next.board);
    const points = score + next.gained;
    setBoard(nextBoard);
    setScore(points);
    setMoves(moves + 1);
    setFeedback(
      next.gained ? `Combined treats. ${next.gained} points.` : "Tiles moved.",
    );
    if (nextBoard.includes(2048)) finish(points);
    else if (!hasMoves(nextBoard)) finish(points, false);
  }
  const arrows: Record<string, string> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
  };
  return (
    <div
      ref={root}
      tabIndex={0}
      className="puzzle-game"
      role="group"
      aria-label={`${id} game controls`}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement) return;
        if (id === "merge" && arrows[event.key]) {
          event.preventDefault();
          move(arrows[event.key]);
        }
        if (id === "whack" && /^[1-9]$/.test(event.key) && !event.repeat) {
          event.preventDefault();
          inspect(Number(event.key) - 1);
        }
      }}
    >
      <div className="game-hud">
        <span>
          {id === "lights" || id === "memory" ? "Moves" : "Score"}{" "}
          <b>{id === "lights" || id === "memory" ? moves : score}</b>
        </span>
        <span>
          {id === "whack"
            ? `${time}s remaining`
            : id === "memory"
              ? `${matched.length / 2} / 8 pairs`
              : id === "lights"
                ? `${lights.filter(Boolean).length} lights on`
                : "Aim for 2048"}
        </span>
        <button type="button" className="arcade-small-button" onClick={start}>
          <RotateCcw size={16} aria-hidden="true" />
          Restart
        </button>
      </div>
      {!started ? (
        <div className="puzzle-start">
          <p className="heading heading-md">
            {id === "lights"
              ? "Bedtime for a very good cat."
              : id === "memory"
                ? "A little game before a nap."
                : id === "merge"
                  ? "The snack cupboard is open."
                  : "The boxes need you."}
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start game
          </button>
        </div>
      ) : (
        <>
          {id === "memory" && (
            <div className="memory-grid">
              {board.map((toy, index) => {
                const face =
                  revealed.includes(index) || matched.includes(index);
                return (
                  <button
                    type="button"
                    key={index}
                    disabled={matched.includes(index) || over}
                    aria-label={
                      face
                        ? `${names[toy]}${matched.includes(index) ? ", matched" : ""}`
                        : `Reveal card ${index + 1}`
                    }
                    className={`memory-card ${face ? "revealed" : ""}`}
                    onClick={() => reveal(index)}
                  >
                    <span aria-hidden="true">{face ? toys[toy] : "?"}</span>
                  </button>
                );
              })}
            </div>
          )}
          {id === "whack" && (
            <div
              className="whack-grid"
              aria-label="Nine boxes, numbered left to right"
            >
              {Array.from({ length: 9 }, (_, index) => (
                <button
                  type="button"
                  key={index}
                  disabled={over || suspended}
                  className={`whack-box ${target === index ? "occupied" : ""}`}
                  aria-label={`Box ${index + 1}${target === index ? ", feather" : ", empty"}`}
                  onClick={() => inspect(index)}
                >
                  <span className="box-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span aria-hidden="true">
                    {target === index ? "🪶" : "📦"}
                  </span>
                </button>
              ))}
            </div>
          )}
          {id === "lights" && (
            <div className="lights-grid">
              {lights.map((on, index) => (
                <button
                  type="button"
                  key={index}
                  disabled={over}
                  onClick={() => light(index)}
                  className={`window-tile ${on ? "lit" : ""}`}
                  aria-label={`Window ${index + 1}, ${on ? "on" : "off"}`}
                  aria-pressed={on}
                >
                  <span aria-hidden="true">{on ? "☀" : "☾"}</span>
                </button>
              ))}
            </div>
          )}
          {id === "merge" && (
            <>
              <div
                className="merge-grid"
                aria-label="Treat tile board"
                onTouchStart={(event) => {
                  swipe.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY,
                  };
                }}
                onTouchEnd={(event) => {
                  if (!swipe.current) return;
                  const dx = event.changedTouches[0].clientX - swipe.current.x,
                    dy = event.changedTouches[0].clientY - swipe.current.y;
                  if (Math.max(Math.abs(dx), Math.abs(dy)) > 20)
                    move(
                      Math.abs(dx) > Math.abs(dy)
                        ? dx > 0
                          ? "right"
                          : "left"
                        : dy > 0
                          ? "down"
                          : "up",
                    );
                  swipe.current = null;
                }}
              >
                {board.map((value, index) => (
                  <div
                    key={index}
                    className="merge-tile"
                    data-level={value ? Math.min(5, Math.log2(value)) : 0}
                    aria-label={value ? `${value} treats` : "Empty"}
                  >
                    {value || ""}
                  </div>
                ))}
              </div>
              <div className="touch-controls">
                {[
                  ["left", ArrowLeft],
                  ["up", ArrowUp],
                  ["down", ArrowDown],
                  ["right", ArrowRight],
                ].map(([direction, Icon]) => {
                  const Arrow = Icon as typeof ArrowLeft;
                  return (
                    <button
                      key={String(direction)}
                      type="button"
                      disabled={over}
                      aria-label={`Slide ${direction}`}
                      onClick={() => move(String(direction))}
                    >
                      <Arrow size={22} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {suspended && (
            <p className="game-result" role="status">
              Paused while this tab is hidden.
            </p>
          )}
          {over && (
            <div className="game-result" role="status">
              <p className="heading heading-md">
                {won
                  ? id === "lights"
                    ? "Good night, Sucuk."
                    : id === "memory"
                      ? "Every toy in its place."
                      : id === "merge"
                        ? "The legendary snack!"
                        : "Inspection complete."
                  : "The cupboard is full."}
              </p>
              <p>Final score: {score}</p>
              <button type="button" className="btn btn-primary" onClick={start}>
                Play again
              </button>
            </div>
          )}
        </>
      )}
      <p className="puzzle-feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
