"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eraser,
  Flag,
  Hand,
  Pencil,
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Redo2,
  Download,
  Upload,
  Minus,
  Plus,
  StepForward,
} from "lucide-react";
import {
  DEMO_TRACK,
  MAX_FRAMES,
  MAX_LINES,
  pointDistance,
  trackEngine,
  validateTrack,
  type Track,
} from "@/lib/arcade/line-rider";
import { drawCat } from "@/lib/arcade/engine";
import type LineRiderEngine from "lr-core/line-rider-engine";
import type { Vector } from "lr-core/line-rider-engine";

type Tool = "draw" | "line" | "erase" | "pan" | "flag";
type View = Vector & { scale: number };
const STORAGE = "sucuk-line-rider-v1";
function initialTrack() {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) return validateTrack(JSON.parse(saved));
  } catch {
    /* Storage is optional. */
  }
  return structuredClone(DEMO_TRACK);
}
export function LineRiderGame() {
  const [track, setTrack] = useState<Track>(initialTrack);
  const [tool, setTool] = useState<Tool>("draw");
  const [kind, setKind] = useState<0 | 1 | 2>(0);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const [frame, setFrame] = useState(0);
  const [furthest, setFurthest] = useState(1);
  const [mounted, setMounted] = useState(true);
  const [message, setMessage] = useState("");
  const [historyCounts, setHistoryCounts] = useState([0, 0]);
  const [saving, setSaving] = useState("Tracks save on this device.");
  const canvas = useRef<HTMLCanvasElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const engine = useRef<LineRiderEngine | null>(null);
  const frameRef = useRef(0);
  const running = useRef(false);
  const followRef = useRef(true);
  const view = useRef<View>({ x: -20, y: -20, scale: 2 });
  const gesture = useRef<{
    start: Vector;
    last: Vector;
    points: Vector[];
    originalView: View;
    clientStart: Vector;
  } | null>(null);
  const history = useRef<{ undo: Track[]; redo: Track[] }>({
    undo: [],
    redo: [],
  });

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(track));
      } catch {
        setSaving(
          "Device storage is unavailable. Export the track to keep it.",
        );
      }
    }, 100);
    const simulation = trackEngine(track);
    engine.current = simulation;
    let request = 0,
      last = 0,
      accumulator = 0,
      lastHud = 0;
    const loop = (now: number) => {
      const elapsed = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (running.current) {
        accumulator += elapsed;
        while (accumulator >= 1 / 40 && frameRef.current < MAX_FRAMES) {
          frameRef.current++;
          accumulator -= 1 / 40;
        }
        if (frameRef.current >= MAX_FRAMES) {
          running.current = false;
          setPlaying(false);
          setMessage("Two minutes recorded. Rewind to take another ride.");
        }
      } else accumulator = 0;
      const rider = simulation.getRider(frameRef.current);
      if (Math.abs(rider.position.y) > 10000 && running.current) {
        running.current = false;
        setPlaying(false);
        setMessage(
          "Sucuk drifted beyond the track. Rewind or extend your drawing.",
        );
      }
      if (running.current && followRef.current) {
        view.current.x = rider.position.x - 200 / view.current.scale;
        view.current.y = rider.position.y - 170 / view.current.scale;
      }
      if (now - lastHud > 100) {
        lastHud = now;
        setFrame(frameRef.current);
        setFurthest((value) => Math.max(value, frameRef.current));
        setMounted(rider.get("RIDER_MOUNTED").framesSinceUnbind < 0);
      }
      const c = canvas.current?.getContext("2d");
      if (c) {
        c.fillStyle = "#fff8f3";
        c.fillRect(0, 0, 720, 440);
        const v = view.current;
        c.save();
        c.scale(v.scale, v.scale);
        c.translate(-v.x, -v.y);
        c.lineCap = "round";
        for (const line of track.lines) {
          c.strokeStyle = ["#25235e", "#a95800", "#42744c"][line.type];
          c.lineWidth = (line.type === 2 ? 1.5 : 2.5) / v.scale;
          c.beginPath();
          c.moveTo(line.x1, line.y1);
          c.lineTo(line.x2, line.y2);
          c.stroke();
          if (line.type === 1) {
            const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1),
              mx = (line.x1 + line.x2) / 2,
              my = (line.y1 + line.y2) / 2;
            c.beginPath();
            c.moveTo(
              mx - Math.cos(angle - 0.5) * 5,
              my - Math.sin(angle - 0.5) * 5,
            );
            c.lineTo(mx, my);
            c.lineTo(
              mx - Math.cos(angle + 0.5) * 5,
              my - Math.sin(angle + 0.5) * 5,
            );
            c.stroke();
          }
        }
        const preview = gesture.current;
        if (preview && preview.points.length > 1) {
          c.strokeStyle = "#8f9bb9";
          c.lineWidth = 2 / v.scale;
          c.beginPath();
          preview.points.forEach((p, i) => {
            if (!i) c.moveTo(p.x, p.y);
            else c.lineTo(p.x, p.y);
          });
          c.stroke();
        }
        c.strokeStyle = "#a95800";
        c.lineWidth = 1.5 / v.scale;
        c.beginPath();
        c.moveTo(track.start.x, track.start.y - 28);
        c.lineTo(track.start.x, track.start.y);
        c.stroke();
        c.fillStyle = "#ffb21f";
        c.fillRect(track.start.x, track.start.y - 28, 13, 9);
        const chain = (ids: string[], color: string, width: number) => {
          c.strokeStyle = color;
          c.lineWidth = width;
          c.beginPath();
          ids.forEach((id, i) => {
            const p = rider.get(id).pos;
            if (!i) c.moveTo(p.x, p.y);
            else c.lineTo(p.x, p.y);
          });
          c.stroke();
        };
        chain(["TAIL", "NOSE", "STRING", "PEG", "TAIL"], "#25235e", 1.5);
        chain(["BUTT", "LFOOT", "NOSE"], "#8f9bb9", 2);
        chain(["SHOULDER", "LHAND", "STRING"], "#8f9bb9", 2);
        chain(["BUTT", "SHOULDER"], "#8f9bb9", 5);
        chain(
          [
            "SHOULDER",
            "SCARF_0",
            "SCARF_1",
            "SCARF_2",
            "SCARF_3",
            "SCARF_4",
            "SCARF_5",
            "SCARF_6",
          ],
          "#ce668e",
          2,
        );
        const shoulder = rider.get("SHOULDER").pos,
          butt = rider.get("BUTT").pos;
        c.save();
        c.translate(shoulder.x, shoulder.y);
        c.rotate(
          Math.atan2(shoulder.y - butt.y, shoulder.x - butt.x) + Math.PI / 2,
        );
        drawCat(c, -6, -12, 12);
        c.restore();
        c.restore();
      }
      request = requestAnimationFrame(loop);
    };
    request = requestAnimationFrame(loop);
    const pause = () => {
      running.current = false;
      setPlaying(false);
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(request);
      clearTimeout(saveTimer);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [track]);

  function pause() {
    running.current = false;
    setPlaying(false);
  }
  function replace(next: Track, remember = true) {
    pause();
    if (remember) {
      history.current.undo.push(track);
      history.current.undo = history.current.undo.slice(-50);
      history.current.redo = [];
    }
    frameRef.current = 0;
    setFrame(0);
    setFurthest(1);
    setTrack(next);
    setMounted(true);
    setMessage("");
    setHistoryCounts([
      history.current.undo.length,
      history.current.redo.length,
    ]);
  }
  function undo(redo = false) {
    const from = redo ? history.current.redo : history.current.undo,
      to = redo ? history.current.undo : history.current.redo;
    const next = from.pop();
    if (next) {
      to.push(track);
      replace(next, false);
    }
  }
  function rewind() {
    pause();
    frameRef.current = 0;
    setFrame(0);
    view.current = { x: -20, y: -20, scale: 2 };
    setMessage("");
  }
  function togglePlay() {
    if (running.current) pause();
    else {
      running.current = true;
      setPlaying(true);
      setMessage("");
      surface.current?.focus();
    }
  }
  function point(event: React.PointerEvent<HTMLCanvasElement>): Vector {
    const r = event.currentTarget.getBoundingClientRect();
    return {
      x:
        (((event.clientX - r.left) / r.width) * 720) / view.current.scale +
        view.current.x,
      y:
        (((event.clientY - r.top) / r.height) * 440) / view.current.scale +
        view.current.y,
    };
  }
  function changeZoom(factor: number) {
    const v = view.current,
      scale = Math.min(6, Math.max(0.5, v.scale * factor));
    view.current = {
      x: v.x + 360 / v.scale - 360 / scale,
      y: v.y + 220 / v.scale - 220 / scale,
      scale,
    };
  }
  function commitGesture() {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (tool === "flag") {
      replace({ ...track, start: g.last });
      return;
    }
    if (tool === "pan") return;
    if (tool === "erase") {
      const lines = track.lines.filter(
        (line) =>
          !g.points.some(
            (p) => pointDistance(p, line) < 9 / view.current.scale,
          ),
      );
      if (lines.length !== track.lines.length) replace({ ...track, lines });
      return;
    }
    const points = tool === "line" ? [g.start, g.last] : g.points;
    let id = Math.max(-1, ...track.lines.map((line) => line.id)) + 1;
    const lines = points.slice(1).flatMap((p, index) =>
      Math.hypot(p.x - points[index].x, p.y - points[index].y) < 1
        ? []
        : [
            {
              id: id++,
              type: kind,
              x1: points[index].x,
              y1: points[index].y,
              x2: p.x,
              y2: p.y,
              flipped,
              leftExtended: true,
              rightExtended: true,
            },
          ],
    );
    if (track.lines.length + lines.length > MAX_LINES) {
      setMessage(
        `A track can contain ${MAX_LINES} lines. Erase a few before drawing more.`,
      );
      return;
    }
    if (lines.length) {
      try {
        replace(validateTrack({ ...track, lines: [...track.lines, ...lines] }));
      } catch {
        setMessage("Keep the track within 20,000 units of the start area.");
      }
    }
  }
  return (
    <div className="line-rider-room">
      <p className="game-instructions">
        Draw from left to right, then press Play. Sucuk rides on the upper side
        of the line. Use Flip side to draw the opposite surface. The flag sets
        his starting point.
      </p>
      <div
        className="track-tools"
        role="group"
        aria-label="Track drawing tools"
      >
        {(
          [
            ["draw", Pencil, "Pencil"],
            ["line", Minus, "Straight line"],
            ["erase", Eraser, "Eraser"],
            ["pan", Hand, "Pan"],
            ["flag", Flag, "Start flag"],
          ] as const
        ).map(([value, Icon, label]) => (
          <button
            key={value}
            type="button"
            className="arcade-small-button"
            aria-pressed={tool === value}
            onClick={() => {
              pause();
              setTool(value);
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className="track-options">
        <label>
          <span id="track-type-label">Line type</span>
          <select
            aria-labelledby="track-type-label"
            value={kind}
            onChange={(event) =>
              setKind(Number(event.target.value) as 0 | 1 | 2)
            }
          >
            <option value={0}>Solid</option>
            <option value={1}>Acceleration</option>
            <option value={2}>Scenery (no collision)</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={flipped}
            onChange={(event) => setFlipped(event.target.checked)}
          />{" "}
          Flip side
        </label>
        <label>
          <input
            type="checkbox"
            checked={follow}
            onChange={(event) => {
              setFollow(event.target.checked);
              followRef.current = event.target.checked;
            }}
          />{" "}
          Follow Sucuk
        </label>
      </div>
      <div
        ref={surface}
        className="game-surface track-surface"
        tabIndex={0}
        role="group"
        aria-label="Track editor. Space plays or pauses. Arrow keys pan while paused."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === " ") {
            event.preventDefault();
            togglePlay();
          } else if (event.key.startsWith("Arrow") && !running.current) {
            event.preventDefault();
            if (event.key === "ArrowLeft") view.current.x -= 40;
            if (event.key === "ArrowRight") view.current.x += 40;
            if (event.key === "ArrowUp") view.current.y -= 40;
            if (event.key === "ArrowDown") view.current.y += 40;
          } else if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "z"
          ) {
            event.preventDefault();
            undo(event.shiftKey);
          }
        }}
      >
        <canvas
          ref={canvas}
          width={720}
          height={440}
          aria-label="Draw a track for Sucuk"
          onPointerDown={(event) => {
            pause();
            surface.current?.focus();
            const p = point(event);
            gesture.current = {
              start: p,
              last: p,
              points: [p],
              originalView: { ...view.current },
              clientStart: { x: event.clientX, y: event.clientY },
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const g = gesture.current;
            if (!g) return;
            const p = point(event);
            if (tool === "pan") {
              const r = event.currentTarget.getBoundingClientRect();
              view.current.x =
                g.originalView.x -
                (((event.clientX - g.clientStart.x) / r.width) * 720) /
                  g.originalView.scale;
              view.current.y =
                g.originalView.y -
                (((event.clientY - g.clientStart.y) / r.height) * 440) /
                  g.originalView.scale;
            } else {
              const previous = g.last;
              g.last = p;
              if (tool === "line") g.points = [g.start, p];
              else if (
                Math.hypot(p.x - previous.x, p.y - previous.y) >=
                1 / view.current.scale
              )
                g.points.push(p);
              if (g.points.length > 500) commitGesture();
            }
          }}
          onPointerUp={commitGesture}
          onPointerCancel={() => {
            gesture.current = null;
          }}
        />
      </div>
      <div className="track-playback">
        <button type="button" className="btn btn-primary" onClick={togglePlay}>
          {playing ? (
            <Pause size={17} aria-hidden="true" />
          ) : (
            <Play size={17} aria-hidden="true" />
          )}
          {playing ? "Pause ride" : "Play ride"}
        </button>
        <button type="button" className="arcade-small-button" onClick={rewind}>
          <RotateCcw size={16} aria-hidden="true" />
          Rewind
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            pause();
            frameRef.current = Math.min(MAX_FRAMES, frameRef.current + 1);
            setFrame(frameRef.current);
          }}
        >
          <StepForward size={16} aria-hidden="true" />
          Step
        </button>
        <button
          type="button"
          className="arcade-small-button"
          aria-label="Zoom out"
          onClick={() => changeZoom(1 / 1.25)}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="arcade-small-button"
          aria-label="Zoom in"
          onClick={() => changeZoom(1.25)}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
        <span className="arcade-fine-print">
          {(frame / 40).toFixed(2)}s · {mounted ? "On the sled" : "Tumbled off"}
        </span>
      </div>
      <label className="track-timeline">
        Playback frame{" "}
        <input
          type="range"
          min={0}
          max={furthest}
          value={frame}
          onChange={(event) => {
            pause();
            frameRef.current = Number(event.target.value);
            setFrame(frameRef.current);
          }}
        />
      </label>
      <div className="track-tools">
        <button
          type="button"
          className="arcade-small-button"
          disabled={!historyCounts[0]}
          onClick={() => undo()}
        >
          <Undo2 size={16} aria-hidden="true" />
          Undo
        </button>
        <button
          type="button"
          className="arcade-small-button"
          disabled={!historyCounts[1]}
          onClick={() => undo(true)}
        >
          <Redo2 size={16} aria-hidden="true" />
          Redo
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            replace(structuredClone(DEMO_TRACK));
            view.current = { x: -20, y: -20, scale: 2 };
          }}
        >
          Example track
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() =>
            replace({ version: 1, start: { x: 40, y: 35 }, lines: [] })
          }
        >
          Clear track
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(track, null, 2)], {
                type: "application/json",
              }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "sucuk-track.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          <Download size={16} aria-hidden="true" />
          Export track
        </button>
        <button
          type="button"
          className="arcade-small-button"
          onClick={() => upload.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          Import track
        </button>
        <input
          ref={upload}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Import Sucuk track JSON"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 500000)
                throw new Error("Choose a track smaller than 500 KB.");
              replace(validateTrack(JSON.parse(await file.text())));
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Could not read that track.",
              );
            }
            event.target.value = "";
          }}
        />
      </div>
      <p className="arcade-fine-print">
        {track.lines.length} / {MAX_LINES} lines. {saving} Creative mode saves
        tracks rather than leaderboard scores.
      </p>
      <p className="puzzle-feedback" role="status">
        {message}
      </p>
      <details className="track-source">
        <summary>About the physics</summary>
        <p>
          Uses David Lu&apos;s MIT-licensed lr-core 0.8.2 Line Rider
          compatibility engine at 40 frames per second, with original Sucuk
          rendering. Solid, acceleration and scenery lines run through the
          engine&apos;s constrained rider and sled simulation. This is a
          source-based adaptation, not a claim of exact parity with every
          historic Flash version.
        </p>
        <a
          href="https://github.com/conundrumer/lr-core"
          target="_blank"
          rel="noreferrer"
        >
          Physics source and attribution
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </details>
    </div>
  );
}
