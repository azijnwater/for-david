"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import dynamic from "next/dynamic";
import { ActionGame } from "./action-game";
import { PuzzleGame } from "./puzzle-game";
import { saveRecord, type ActionId, type Game } from "@/lib/arcade/catalog";
import { classicById } from "@/lib/arcade/classic-catalog";

type Entry = { id: string; name: string; score: number; date: string };
const LineRiderGame = dynamic(
  () => import("./line-rider-game").then((module) => module.LineRiderGame),
  { ssr: false, loading: () => <p role="status">Opening the track editor…</p> },
);
const ModernGame = dynamic(
  () => import("./classics/modern-game").then((module) => module.ModernGame),
  { ssr: false, loading: () => <p role="status">Getting the cats ready…</p> },
);
export function GameRoom({ game }: { game: Game }) {
  return game.id === "line-rider" ? (
    <LineRiderGame />
  ) : (
    <ScoredGameRoom game={game} />
  );
}
function ScoredGameRoom({ game }: { game: Game }) {
  const [completed, setCompleted] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [boardStatus, setBoardStatus] = useState("Loading global scores…");
  const [refresh, setRefresh] = useState(0);
  const ticket = useRef<Promise<string | null>>(Promise.resolve(null));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/arcade?game=${game.id}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Scores could not load.");
        setEntries(data.entries);
        setBoardStatus(
          data.entries.length ? "" : "No scores yet. Set the first one.",
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBoardStatus(error.message);
      });
    return () => controller.abort();
  }, [game.id, refresh]);

  function start() {
    setCompleted(null);
    setSaved(false);
    setStatus("");
    ticket.current = fetch("/api/arcade/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game: game.id }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()).ticket as string;
      })
      .catch(() => null);
  }
  function finish(score: number) {
    setCompleted(score);
    saveRecord(game.id, score);
  }
  const isPuzzle = ["memory", "merge", "lights", "whack"].includes(game.id);
  const classic = classicById.get(game.id);

  return (
    <div className="game-room">
      <p className="game-instructions">{game.controls}</p>
      <p className="game-goal">{game.goal}</p>
      {classic ? (
        <ModernGame game={classic} onStart={start} onFinish={finish} />
      ) : isPuzzle ? (
        <PuzzleGame id={game.id} onStart={start} onFinish={finish} />
      ) : (
        <ActionGame
          id={game.id as ActionId}
          onStart={start}
          onFinish={finish}
        />
      )}
      {completed !== null && (
        <div className="score-entry">
          <div>
            <h3 className="heading heading-md">Put your name on the board.</h3>
            <p>
              You scored <strong>{completed}</strong>. Your name and score will
              be public.
            </p>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (saving || saved) return;
              setSaving(true);
              setStatus("");
              try {
                const runTicket = await ticket.current;
                if (!runTicket)
                  throw new Error(
                    "Global scores are unavailable. Your personal best is kept on this device. Try a new round later.",
                  );
                const response = await fetch("/api/arcade", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: name.trim(),
                    score: completed,
                    ticket: runTicket,
                  }),
                });
                const data = await response.json();
                if (!response.ok)
                  throw new Error(
                    data.error || "Score could not be saved. Try again.",
                  );
                setSaved(true);
                setStatus("Score saved globally! The top 20 are shown below.");
                setRefresh((value) => value + 1);
              } catch (error) {
                setStatus(
                  error instanceof Error
                    ? error.message
                    : "Could not save your score. Try again.",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <label htmlFor="arcade-name">Arcade name</label>
            <div className="score-input-row">
              <input
                id="arcade-name"
                name="name"
                autoComplete="nickname"
                minLength={2}
                maxLength={16}
                required
                pattern="[\p{L}\p{N} ._\-]{2,16}"
                placeholder="Your arcade name"
                value={name}
                disabled={saved || saving}
                onChange={(event) => setName(event.target.value)}
                aria-describedby="name-help"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saved || saving}
              >
                {saved ? "Score saved" : saving ? "Saving…" : "Save score"}
              </button>
            </div>
            <p id="name-help" className="arcade-fine-print">
              2–16 letters, numbers, spaces, dots, hyphens or underscores.
            </p>
            <p role="status">{status}</p>
          </form>
        </div>
      )}
      <section className="global-board" aria-labelledby="leaderboard-title">
        <div className="board-heading">
          <h3 id="leaderboard-title" className="heading heading-md">
            <Trophy size={23} aria-hidden="true" />
            Global leaderboard
          </h3>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Refresh scores
          </button>
        </div>
        <p className="arcade-fine-print">
          {game.name}. Top 20 scores; earlier scores win ties.
        </p>
        {boardStatus && <p role="status">{boardStatus}</p>}
        {!!entries.length && (
          <ol className="leaderboard-list">
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <span className="board-rank">{index + 1}</span>
                <span>{entry.name}</span>
                <strong>{entry.score.toLocaleString()}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
