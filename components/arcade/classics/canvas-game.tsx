"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
} from "lucide-react";
import type { ClassicGame } from "@/lib/arcade/classic-catalog";
import {
  createWorld,
  stepWorld,
  worldCommand,
  type Controls,
  type World,
} from "@/lib/arcade/classic-world";
import { renderWorld } from "@/lib/arcade/classic-renderer";

export function CanvasClassic({
  game,
  onFinish,
}: {
  game: ClassicGame;
  onFinish: (score: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    surface = useRef<HTMLDivElement>(null),
    world = useRef<World | null>(null);
  const input = useRef<Controls>({
    held: new Set(),
    pressed: new Set(),
    pointer: null,
  });
  const running = useRef(true),
    finish = useRef(onFinish);
  const [paused, setPaused] = useState(false),
    [hud, setHud] = useState({
      score: 0,
      lives: 3,
      message: "",
      phase: "play",
      money: 100,
      skill: 1,
      fuel: 100,
      day: 1,
      angle: 45,
      power: 65,
      swing: 0,
    });
  useEffect(() => {
    finish.current = onFinish;
  }, [onFinish]);
  useEffect(() => {
    const s = createWorld(game.variant, game.engine);
    world.current = s;
    let raf = 0,
      last = 0,
      lastHud = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.04, (now - last) / 1000) : 0;
      last = now;
      if (running.current && !s.over) {
        for (let n = 0; n < 2; n++) {
          stepWorld(s, input.current, dt / 2);
          if (n === 0) input.current.pressed.clear();
        }
        if (s.over) finish.current(s.score);
      }
      const c = canvas.current?.getContext("2d");
      if (c) renderWorld(s, c);
      if (now - lastHud > 100) {
        lastHud = now;
        setHud({
          score: s.score,
          lives: s.lives,
          message: s.message,
          phase: s.phase,
          money: s.stats.money || 0,
          skill: s.stats.skill || 1,
          fuel: s.stats.fuel || 0,
          day: s.stats.day || 1,
          angle: s.aim.angle,
          power: s.aim.power,
          swing: s.stats.swing || 0,
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pause = () => {
      running.current = false;
      setPaused(true);
      input.current.held.clear();
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    const release = (e: KeyboardEvent) =>
      input.current.held.delete(
        e.key.length === 1 ? e.key.toLowerCase() : e.key,
      );
    window.addEventListener("keyup", release);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    surface.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [game.variant, game.engine]);
  const press = (key: string) => {
    input.current.held.add(key);
    input.current.pressed.add(key);
  };
  const command = (name: string, value?: number) => {
    if (world.current) worldCommand(world.current, name, value);
  };
  const release = (key: string) => input.current.held.delete(key);
  return (
    <div className="classic-canvas-game">
      <div className="game-hud">
        <span>
          Score <b>{hud.score}</b>
        </span>
        <span>
          {game.engine === "physics"
            ? "Sucuk & the laws of physics"
            : `Lives ${hud.lives}`}
        </span>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            running.current = !running.current;
            setPaused(!running.current);
            if (running.current) surface.current?.focus();
          }}
        >
          {paused ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div
        ref={surface}
        tabIndex={0}
        role="group"
        className="game-surface"
        aria-label="Cat game controls"
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
          if (
            [
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              " ",
              "w",
              "a",
              "s",
              "d",
              "x",
              "e",
              "q",
              "o",
              "p",
              "i",
              "j",
              "k",
              "l",
              "Enter",
            ].includes(key)
          ) {
            e.preventDefault();
            if (!e.repeat) press(key);
          }
        }}
      >
        <canvas
          ref={canvas}
          width={960}
          height={540}
          aria-label={`${game.name} playing field`}
          onPointerDown={(e) => {
            surface.current?.focus();
            const r = e.currentTarget.getBoundingClientRect();
            input.current.pointer = {
              x: ((e.clientX - r.left) / r.width) * 960,
              y: ((e.clientY - r.top) / r.height) * 540,
              down: true,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
            if (game.engine === "platform" && !game.variant.includes("hominid"))
              press(" ");
          }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const old = input.current.pointer;
            input.current.pointer = {
              x: ((e.clientX - r.left) / r.width) * 960,
              y: ((e.clientY - r.top) / r.height) * 540,
              down: old?.down || false,
            };
          }}
          onPointerUp={() => {
            if (input.current.pointer) input.current.pointer.down = false;
            input.current.held.delete(" ");
          }}
          onPointerCancel={() => {
            input.current.pointer = null;
            input.current.held.delete(" ");
          }}
        />
        {paused && (
          <div className="game-overlay">
            <p className="heading heading-md">A little pause for paws.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                running.current = true;
                setPaused(false);
                surface.current?.focus();
              }}
            >
              Resume game
            </button>
          </div>
        )}
      </div>
      <div className="touch-controls">
        {game.variant === "qwop" ? (
          [
            <TouchKey
              key="q"
              code="q"
              label="Q · left thigh"
              onPress={press}
              onRelease={release}
            />,
            <TouchKey
              key="w"
              code="w"
              label="W · right thigh"
              onPress={press}
              onRelease={release}
            />,
            <TouchKey
              key="o"
              code="o"
              label="O · left calf"
              onPress={press}
              onRelease={release}
            />,
            <TouchKey
              key="p"
              code="p"
              label="P · right calf"
              onPress={press}
              onRelease={release}
            />,
          ]
        ) : (
          <>
            {[
              ["ArrowLeft", ArrowLeft, "Move left"],
              ["ArrowUp", ArrowUp, "Move up"],
              ["ArrowDown", ArrowDown, "Move down"],
              ["ArrowRight", ArrowRight, "Move right"],
            ].map(([key, Icon, label]) => {
              const Arrow = Icon as typeof ArrowLeft;
              return (
                <button
                  type="button"
                  key={String(key)}
                  aria-label={String(label)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    press(String(key));
                  }}
                  onPointerUp={() => input.current.held.delete(String(key))}
                  onPointerCancel={() => input.current.held.delete(String(key))}
                  onClick={(e) => {
                    if (e.detail === 0) {
                      press(String(key));
                      setTimeout(
                        () => input.current.held.delete(String(key)),
                        100,
                      );
                    }
                  }}
                >
                  <Arrow size={22} aria-hidden="true" />
                </button>
              );
            })}
            {
              <TouchKey
                code=" "
                label={game.engine === "shooter" ? "Paw fire" : "Jump"}
                onPress={press}
                onRelease={release}
              />
            }
            {
              <TouchKey
                key="x"
                code="x"
                label="X · action"
                onPress={press}
                onRelease={release}
              />
            }
            <TouchKey
              code="e"
              label={
                game.variant === "fireboy-watergirl"
                  ? "Swap cat"
                  : "E · interact"
              }
              onPress={press}
              onRelease={release}
            />
          </>
        )}
      </div>
      {game.engine === "artillery" && (
        <div className="classic-management">
          <label>
            Angle{" "}
            <input
              type="range"
              min={10}
              max={85}
              value={hud.angle}
              onChange={(e) => command("angle", Number(e.target.value))}
            />
            {Math.round(hud.angle)}°
          </label>
          <label>
            Power{" "}
            <input
              type="range"
              min={20}
              max={100}
              value={hud.power}
              onChange={(e) => command("power", Number(e.target.value))}
            />
            {Math.round(hud.power)}
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => command("fire")}
          >
            {game.variant === "crush-castle"
              ? hud.swing
                ? "Release yarn"
                : "Start swing"
              : "Fire yarn"}
          </button>
        </div>
      )}
      {game.variant === "interactive-buddy" && (
        <div className="classic-management">
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("nudge")}
          >
            Gentle nudge
          </button>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("treat")}
          >
            Drop a treat
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => command("finish")}
          >
            Finish playtime
          </button>
        </div>
      )}
      {game.variant === "learn-to-fly" && (
        <div className="classic-management">
          <p>
            Treats {hud.money}. Hold Up to lift, Down to dive; hold Jump to
            boost.
          </p>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("glider")}
          >
            Upgrade glider
          </button>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("engine")}
          >
            Upgrade booster
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => command("launch")}
          >
            Launch Sucuk
          </button>
        </div>
      )}
      {game.variant === "motherload" && (
        <div className="classic-management">
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("sell")}
          >
            Sell cargo & refuel at surface
          </button>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("engine")}
          >
            Upgrade drill
          </button>
        </div>
      )}
      {game.variant === "duck-life" && (
        <div className="classic-management">
          <p>
            Training level {hud.skill}. Complete training runs to improve your
            race speed.
          </p>
          <button
            type="button"
            className="arcade-small-button"
            onClick={() => command("train")}
          >
            Train jumping
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => command("race")}
          >
            Race Luna
          </button>
        </div>
      )}
      {game.engine === "social" && (
        <p className="arcade-fine-print">
          Solo or two cats on this device. Sucuk: arrows + Space. Luna: J/L + I
          or Enter.{" "}
          {game.variant === "transformice"
            ? "E places a shaman plank."
            : game.variant === "platform-racing-2"
              ? "X activates the sprint hat."
              : "Collect the snowballs together."}
        </p>
      )}
      <p className="puzzle-feedback" role="status">
        {hud.message}
      </p>
    </div>
  );
}

function TouchKey({
  code,
  label,
  onPress,
  onRelease,
}: {
  code: string;
  label: string;
  onPress: (key: string) => void;
  onRelease: (key: string) => void;
}) {
  return (
    <button
      type="button"
      className="arcade-small-button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress(code);
      }}
      onPointerUp={() => onRelease(code)}
      onPointerCancel={() => onRelease(code)}
      onClick={(e) => {
        if (e.detail === 0) {
          onPress(code);
          setTimeout(() => onRelease(code), 100);
        }
      }}
    >
      {label}
    </button>
  );
}
