"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  createGame,
  draw,
  step,
  WIDTH,
  HEIGHT,
  type Input,
} from "@/lib/arcade/engine";
import type { ActionId } from "@/lib/arcade/catalog";

export function ActionGame({
  id,
  onStart,
  onFinish,
}: {
  id: ActionId;
  onStart: () => void;
  onFinish: (score: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const state = useRef(createGame(id));
  const input = useRef<Input>({
    held: new Set(),
    pressed: new Set(),
    pointer: null,
    action: false,
  });
  const running = useRef(false);
  const [phase, setPhase] = useState<"ready" | "playing" | "paused" | "over">(
    "ready",
  );
  const [hud, setHud] = useState({
    score: 0,
    lives: id === "flappy" || id === "runner" ? 1 : 3,
    time: id === "catcher" ? 45 : 0,
    message: "",
    won: false,
  });
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  }, [onFinish]);

  const pause = useCallback(() => {
    if (!running.current) return;
    running.current = false;
    input.current.held.clear();
    input.current.pressed.clear();
    input.current.action = false;
    input.current.pointer = null;
    setPhase("paused");
  }, []);

  useEffect(() => {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    let frame = 0,
      last = 0,
      hudTime = 0;
    const update = (now: number) => {
      const dt = last ? Math.min(0.035, (now - last) / 1000) : 0;
      last = now;
      if (running.current) {
        step(state.current, input.current, dt);
        input.current.pressed.clear();
        input.current.action = false;
        if (state.current.over) {
          running.current = false;
          setPhase("over");
          finish.current(state.current.score);
        }
        if (now - hudTime > 100 || state.current.over) {
          hudTime = now;
          const s = state.current;
          setHud({
            score: s.score,
            lives: s.lives,
            time: s.time,
            message: s.message,
            won: s.won,
          });
        }
      }
      draw(state.current, c);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    const visibility = () => {
      if (document.hidden) pause();
    };
    const release = (event: KeyboardEvent) =>
      input.current.held.delete(
        event.key.length === 1 ? event.key.toLowerCase() : event.key,
      );
    window.addEventListener("blur", pause);
    window.addEventListener("keyup", release);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", pause);
      window.removeEventListener("keyup", release);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [pause]);

  function start() {
    state.current = createGame(id);
    input.current = {
      held: new Set(),
      pressed: new Set(),
      pointer: null,
      action: false,
    };
    setHud({
      score: 0,
      lives: state.current.lives,
      time: state.current.time,
      message: "",
      won: false,
    });
    onStart();
    running.current = true;
    setPhase("playing");
    surface.current?.focus();
  }
  function resume() {
    running.current = true;
    setPhase("playing");
    surface.current?.focus();
  }
  function press(key: string) {
    input.current.pointer = null;
    input.current.held.add(key);
    input.current.pressed.add(key);
    if (key === " ") input.current.action = true;
  }
  const directions =
    id === "pong"
      ? ([
          ["ArrowUp", ArrowUp],
          ["ArrowDown", ArrowDown],
        ] as const)
      : id === "flappy" || id === "runner"
        ? []
        : ["breakout", "invaders", "catcher"].includes(id)
          ? ([
              ["ArrowLeft", ArrowLeft],
              ["ArrowRight", ArrowRight],
            ] as const)
          : ([
              ["ArrowLeft", ArrowLeft],
              ["ArrowUp", ArrowUp],
              ["ArrowDown", ArrowDown],
              ["ArrowRight", ArrowRight],
            ] as const);

  return (
    <div className="action-game">
      <div className="game-hud">
        <span>
          Score <b>{hud.score}</b>
        </span>
        <span>
          {id === "catcher" ? `Time ${Math.ceil(hud.time)}s · ` : ""}
          {id === "pong"
            ? hud.message || "First to 7"
            : id === "snake" || id === "runner" || id === "flappy"
              ? ""
              : `Lives ${hud.lives}`}
        </span>
        <button
          className="arcade-small-button"
          type="button"
          disabled={phase === "ready" || phase === "over"}
          onClick={phase === "paused" ? resume : pause}
        >
          {phase === "paused" ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
          {phase === "paused" ? "Resume" : "Pause"}
        </button>
      </div>
      <div
        ref={surface}
        className="game-surface"
        tabIndex={0}
        role="group"
        aria-label="Game controls. Arrow keys or WASD to move. Space to act. P to pause."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const key =
            event.key.length === 1 ? event.key.toLowerCase() : event.key;
          if (key === "p") {
            event.preventDefault();
            if (running.current) pause();
            else if (phase === "paused") resume();
            return;
          }
          if (
            [
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "a",
              "d",
              "w",
              "s",
              " ",
            ].includes(key)
          ) {
            event.preventDefault();
            if (!event.repeat) press(key);
          }
        }}
      >
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Sucuk game board"
          onPointerMove={(event) => {
            if (
              !running.current ||
              !["breakout", "pong", "catcher", "invaders"].includes(id)
            )
              return;
            if (event.pointerType !== "mouse" && event.buttons === 0) return;
            const r = event.currentTarget.getBoundingClientRect();
            input.current.pointer = {
              x: ((event.clientX - r.left) / r.width) * WIDTH,
              y: ((event.clientY - r.top) / r.height) * HEIGHT,
            };
          }}
          onPointerDown={(event) => {
            surface.current?.focus();
            if (running.current) {
              input.current.action = true;
              if (["breakout", "pong", "catcher", "invaders"].includes(id)) {
                const r = event.currentTarget.getBoundingClientRect();
                input.current.pointer = {
                  x: ((event.clientX - r.left) / r.width) * WIDTH,
                  y: ((event.clientY - r.top) / r.height) * HEIGHT,
                };
              }
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
        />
        {phase !== "playing" && (
          <div className="game-overlay">
            <p className="heading heading-md">
              {phase === "ready"
                ? "Ready, Sucuk?"
                : phase === "paused"
                  ? "Taking a little nap."
                  : hud.won
                    ? "Pawsitively brilliant!"
                    : "One more go?"}
            </p>
            <p>
              {phase === "ready"
                ? "Your game starts when you are."
                : phase === "paused"
                  ? "The game is paused."
                  : hud.message}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={phase === "paused" ? resume : start}
            >
              {phase === "paused" ? (
                <Play size={17} aria-hidden="true" />
              ) : (
                <RotateCcw size={17} aria-hidden="true" />
              )}
              {phase === "ready"
                ? "Start game"
                : phase === "paused"
                  ? "Resume game"
                  : "Play again"}
            </button>
          </div>
        )}
      </div>
      <div className="touch-controls" aria-label="Touch and mouse controls">
        {directions.map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            aria-label={`Move ${key.replace("Arrow", "").toLowerCase()}`}
            disabled={phase !== "playing"}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              press(key);
            }}
            onPointerUp={() => input.current.held.delete(key)}
            onPointerCancel={() => input.current.held.delete(key)}
            onClick={(event) => {
              if (event.detail === 0) {
                press(key);
                input.current.held.delete(key);
              }
            }}
          >
            <Icon size={22} aria-hidden="true" />
          </button>
        ))}
        {["flappy", "runner", "invaders"].includes(id) && (
          <button
            type="button"
            className="touch-action"
            disabled={phase !== "playing"}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              press(" ");
            }}
            onPointerUp={() => input.current.held.delete(" ")}
            onPointerCancel={() => input.current.held.delete(" ")}
            onClick={(event) => {
              if (event.detail === 0) {
                press(" ");
                input.current.held.delete(" ");
              }
            }}
          >
            {id === "flappy" ? "Flap" : id === "runner" ? "Jump" : "Paw"}
          </button>
        )}
        <button
          type="button"
          className="arcade-small-button"
          onClick={start}
          aria-label="Restart game"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Restart
        </button>
      </div>
      <span className="sr-only" role="status">
        {phase === "over"
          ? `Game finished. Score ${hud.score}. ${hud.message}`
          : phase === "paused"
            ? "Game paused"
            : ""}
      </span>
    </div>
  );
}
