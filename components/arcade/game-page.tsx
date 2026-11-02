"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, Maximize } from "lucide-react";
import { BirthdayProvider } from "@/components/birthday-provider";
import { SucukMark } from "@/components/sucuk-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { GameRoom } from "./game-room";
import type { Game } from "@/lib/arcade/catalog";
import "./arcade.css";
import "./classics/classics.css";
export function GamePage({ game }: { game: Game }) {
  const arena = useRef<HTMLDivElement>(null);
  return (
    <BirthdayProvider>
      <main className="game-page" id="main-content">
        <header className="game-page-header">
          <Link href="/#minigames" className="game-back">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to arcade
          </Link>
          <Link href="/" className="brand" aria-label="Sucuk home">
            <SucukMark />
            <span>Sucuk&apos;s arcade</span>
          </Link>
          <ThemeToggle />
        </header>
        <div className="game-page-intro">
          <div>
            <p className="arcade-fine-print">
              {game.genre} · Inspired by {game.classic}
            </p>
            <h1 className="heading heading-xl">{game.name}</h1>
            <p className="lede">{game.description}</p>
          </div>
        </div>
        <div ref={arena} className="game-page-arena">
          <div className="game-page-tools">
            <span>Time to play, Sucuk.</span>
            <button
              type="button"
              className="arcade-small-button"
              onClick={async () => {
                try {
                  if (document.fullscreenElement)
                    await document.exitFullscreen();
                  else await arena.current?.requestFullscreen();
                } catch {
                  /* Full-screen access is optional. */
                }
              }}
            >
              <Maximize size={16} aria-hidden="true" />
              Full screen
            </button>
          </div>
          <GameRoom game={game} />
        </div>
        <footer className="game-page-footer">
          <Link href="/#minigames" className="game-back">
            <ArrowLeft size={18} aria-hidden="true" />
            Choose another game
          </Link>
          <p>Meet the crew: Sucuk, Miso, Luna, Mochi and Pepper.</p>
        </footer>
      </main>
    </BirthdayProvider>
  );
}
