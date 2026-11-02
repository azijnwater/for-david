"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Gamepad2, Trophy } from "lucide-react";
import {
  games,
  readRecords,
  subscribeRecords,
  gameSlug,
} from "@/lib/arcade/catalog";
import { GameArt } from "./game-art";
import { SucukMark } from "@/components/sucuk-mark";
import "./arcade.css";
import "./classics/classics.css";

const filters = [
  "All games",
  "Platform",
  "Strategy",
  "Adventure",
  "RPG",
  "Action",
  "Physics",
  "Social",
  "Puzzle",
  "Arcade",
  "Reflex",
  "Creative",
];
export function Arcade() {
  const [filter, setFilter] = useState("All games");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(12);
  const rawRecords = useSyncExternalStore(
    subscribeRecords,
    readRecords,
    () => "{}",
  );
  let records: Record<string, number> = {};
  try {
    const parsed = JSON.parse(rawRecords);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      records = Object.fromEntries(
        Object.entries(parsed).filter(
          ([, value]) =>
            typeof value === "number" && Number.isFinite(value) && value >= 0,
        ),
      ) as Record<string, number>;
  } catch {
    /* Ignore corrupt device records. */
  }
  const visible = games.filter(
    (game) =>
      (filter === "All games" || game.genre === filter) &&
      `${game.name} ${game.classic} ${game.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      id="minigames"
      className="band band-arcade"
      aria-labelledby="arcade-title"
    >
      <div className="section-inner">
        <div className="arcade-intro">
          <div>
            <h2 id="arcade-title" className="heading heading-xl">
              All play.
              <br />
              No responsibilities.
            </h2>
            <p className="lede">
              Welcome to Sucuk&apos;s toy cupboard. A whole library of games for
              busy paws, inspired by the browser classics we lost entire
              afternoons to.
            </p>
          </div>
          <div className="arcade-sign" aria-hidden="true">
            <SucukMark />
            <span>
              Sucuk&apos;s
              <br />
              <strong>arcade</strong>
            </span>
            <Gamepad2 />
          </div>
        </div>
        <label className="arcade-search">
          Find a game
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
            }}
            placeholder="Search by game, classic, or cat…"
          />
        </label>
        <div className="arcade-shelf-bar">
          <div
            className="arcade-filters"
            role="group"
            aria-label="Filter minigames"
          >
            {filters.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={filter === item}
                onClick={() => {
                  setFilter(item);
                  setLimit(12);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="arcade-fine-print">
            {Math.min(limit, visible.length)} of {visible.length} games. No
            coins needed.
          </span>
        </div>
        <div className="arcade-grid">
          {visible.slice(0, limit).map((game) => (
            <Link
              key={game.id}
              href={`/${gameSlug(game)}`}
              className="arcade-card"
              aria-label={`Play ${game.name}`}
            >
              <GameArt art={game.art} />
              <div className="arcade-card-copy">
                <span className="arcade-genre">
                  {game.genre} <span aria-hidden="true">/</span> {game.classic}
                </span>
                <div className="arcade-card-title">
                  <h3 className="heading heading-md">{game.name}</h3>
                  <ArrowUpRight size={24} aria-hidden="true" />
                </div>
                <p>{game.description}</p>
                <span className="arcade-card-bottom">
                  <span>
                    {game.genre === "Creative" ? "Open editor" : "Let’s play"}
                  </span>
                  <span className="arcade-record">
                    {game.genre === "Creative" ? (
                      "Save your tracks"
                    ) : (
                      <>
                        <Trophy size={13} aria-hidden="true" />
                        {records[game.id]
                          ? `Your best ${records[game.id]}`
                          : "Set a score"}
                      </>
                    )}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
        {visible.length > limit && (
          <button
            type="button"
            className="btn btn-primary arcade-more"
            onClick={() => setLimit((value) => value + 12)}
          >
            Show more games
          </button>
        )}
        {!visible.length && (
          <p role="status">
            No matching games. Try a classic title or a different category.
          </p>
        )}
        <p className="arcade-footnote">
          Made for Sucuk. Played by everyone. Play for a high score, or draw a
          track and take the long way home.
        </p>
      </div>
    </section>
  );
}
