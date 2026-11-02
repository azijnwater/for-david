"use client";
import { useCallback, useRef, useState } from "react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";
import { CanvasClassic } from "./canvas-game";
import { StrategyClassic } from "./strategy-game";
import { AdventureClassic, QuizClassic } from "./adventure-game";
import { RPGClassic, CatLifeRPG } from "./rpg-game";
import { SimulationClassic } from "./simulation-game";
import { ClubSucuk } from "./social-game";
export function ModernGame({
  game,
  onStart,
  onFinish,
}: {
  game: ClassicGame;
  onStart: () => void;
  onFinish: (score: number) => void;
}) {
  const [started, setStarted] = useState(false),
    [round, setRound] = useState(0),
    [result, setResult] = useState<number | null>(null);
  const ended = useRef(false);
  const complete = useCallback(
    (score: number) => {
      if (ended.current) return;
      ended.current = true;
      const points = Math.max(0, Math.min(100000, Math.floor(score)));
      setResult(points);
      onFinish(points);
    },
    [onFinish],
  );
  function start() {
    ended.current = false;
    setResult(null);
    setRound((value) => value + 1);
    setStarted(true);
    onStart();
  }
  let player;
  if (game.variant === "club-penguin")
    player = <ClubSucuk onFinish={complete} />;
  else if (game.engine === "defense" || game.engine === "war")
    player = <StrategyClassic game={game} onFinish={complete} />;
  else if (game.engine === "adventure")
    player = <AdventureClassic game={game} onFinish={complete} />;
  else if (game.engine === "quiz") player = <QuizClassic onFinish={complete} />;
  else if (game.engine === "rpg")
    player = <RPGClassic game={game} onFinish={complete} />;
  else if (game.variant === "stick-rpg")
    player = <CatLifeRPG onFinish={complete} />;
  else if (game.engine === "simulation")
    player = <SimulationClassic game={game} onFinish={complete} />;
  else player = <CanvasClassic game={game} onFinish={complete} />;
  return (
    <div className="modern-classic">
      {!started ? (
        <div className="puzzle-start">
          <h3 className="heading heading-md">{game.name}</h3>
          <p>
            {game.variant === "fireboy-watergirl"
              ? "Sunbeam Sucuk and Moonbeam Luna need each other."
              : game.engine === "social"
                ? "Play solo or with a second cat on this device."
                : "Sucuk and the crew are ready when you are."}
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start game
          </button>
        </div>
      ) : (
        <div key={round}>{player}</div>
      )}
      {result !== null ? (
        <div className="game-result" role="status">
          <h3 className="heading heading-md">Your scorecard</h3>
          <p>Final score: {result}</p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Play again
          </button>
        </div>
      ) : (
        started && (
          <button
            type="button"
            className="arcade-small-button classic-restart"
            onClick={start}
          >
            Restart game
          </button>
        )
      )}
    </div>
  );
}
