"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Gamepad2, Trophy, X } from "lucide-react";
import {
  games,
  readRecords,
  subscribeRecords,
  type Game,
} from "@/lib/arcade/catalog";
import { GameArt } from "./game-art";
import { SucukMark } from "@/components/sucuk-mark";
import { useBirthday } from "@/components/birthday-provider";
import "./arcade.css";

const GameRoom = dynamic(
  () => import("./game-room").then((module) => module.GameRoom),
  {
    loading: () => (
      <p className="arcade-loading" role="status">
        Opening the toy cupboard…
      </p>
    ),
    ssr: false,
  },
);
const filters = ["All games", "Arcade", "Reflex", "Puzzle"];
export function Arcade() {
  const birthday = useBirthday();
  const [filter, setFilter] = useState("All games");
  const [selected, setSelected] = useState<Game | null>(null);
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
    (game) => filter === "All games" || game.genre === filter,
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
              Welcome to Sucuk&apos;s toy cupboard. Twelve little games for busy
              paws, inspired by the browser classics we lost entire afternoons
              to.
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
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="arcade-fine-print">
            {visible.length} games. No coins needed.
          </span>
        </div>
        <Dialog.Root
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <div className="arcade-grid">
            {visible.map((game) => (
              <Dialog.Trigger asChild key={game.id}>
                <button
                  type="button"
                  className="arcade-card"
                  onClick={() => setSelected(game)}
                  aria-label={`Play ${game.name}`}
                >
                  <GameArt art={game.art} />
                  <div className="arcade-card-copy">
                    <span className="arcade-genre">
                      {game.genre} <span aria-hidden="true">/</span>{" "}
                      {game.classic}
                    </span>
                    <div className="arcade-card-title">
                      <h3 className="heading heading-md">{game.name}</h3>
                      <ArrowUpRight size={24} aria-hidden="true" />
                    </div>
                    <p>{game.description}</p>
                    <span className="arcade-card-bottom">
                      <span>Let&apos;s play</span>
                      <span className="arcade-record">
                        <Trophy size={13} aria-hidden="true" />
                        {records[game.id]
                          ? `Your best ${records[game.id]}`
                          : "Set a score"}
                      </span>
                    </span>
                  </div>
                </button>
              </Dialog.Trigger>
            ))}
          </div>
          <Dialog.Portal>
            <Dialog.Overlay className="arcade-backdrop" />
            <Dialog.Content
              className={`arcade-dialog ${birthday ? "birthday-site" : "standard-site"}`}
              aria-describedby="arcade-description"
            >
              <div className="arcade-dialog-head">
                <div>
                  <Dialog.Title className="heading heading-lg">
                    {selected?.name}
                  </Dialog.Title>
                  <Dialog.Description id="arcade-description">
                    {selected?.description}
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  className="arcade-close"
                  aria-label="Close minigame"
                >
                  <X size={24} aria-hidden="true" />
                </Dialog.Close>
              </div>
              {selected && <GameRoom key={selected.id} game={selected} />}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <p className="arcade-footnote">
          Made for Sucuk. Played by everyone. Original little tributes to the
          classics, with global scoreboards and a name for every high score.
        </p>
      </div>
    </section>
  );
}
