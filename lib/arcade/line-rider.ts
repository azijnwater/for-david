import LineRiderEngine, {
  createLineFromJson,
  type LineData,
  type Vector,
} from "lr-core/line-rider-engine";

export type Track = { version: 1; start: Vector; lines: LineData[] };
export const MAX_LINES = 2000;
export const MAX_FRAMES = 4800;
export const DEMO_TRACK: Track = {
  version: 1,
  start: { x: 40, y: 35 },
  lines: [
    { id: 0, type: 0, x1: 0, y1: 70, x2: 150, y2: 105 },
    { id: 1, type: 0, x1: 150, y1: 105, x2: 260, y2: 140 },
    { id: 2, type: 0, x1: 260, y1: 140, x2: 350, y2: 140 },
    { id: 3, type: 0, x1: 350, y1: 140, x2: 430, y2: 120 },
    { id: 4, type: 0, x1: 490, y1: 155, x2: 650, y2: 190 },
    { id: 5, type: 0, x1: 650, y1: 190, x2: 900, y2: 190 },
  ],
};
const validNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 20000;
export function validateTrack(value: unknown): Track {
  if (!value || typeof value !== "object")
    throw new Error("Choose a Sucuk track JSON file.");
  const candidate = value as Partial<Track>;
  if (
    candidate.version !== 1 ||
    !candidate.start ||
    !validNumber(candidate.start.x) ||
    !validNumber(candidate.start.y) ||
    !Array.isArray(candidate.lines) ||
    candidate.lines.length > MAX_LINES
  )
    throw new Error(
      `A track needs a start flag and at most ${MAX_LINES} lines within the drawing area.`,
    );
  const ids = new Set<number>();
  const lines = candidate.lines.map((line) => {
    if (
      !line ||
      typeof line !== "object" ||
      !Number.isSafeInteger(line.id) ||
      line.id < 0 ||
      ![0, 1, 2].includes(line.type) ||
      ![line.x1, line.y1, line.x2, line.y2].every(validNumber) ||
      Math.hypot(line.x2 - line.x1, line.y2 - line.y1) < 0.01 ||
      ids.has(line.id)
    )
      throw new Error("The track contains an invalid or duplicate line.");
    ids.add(line.id);
    return {
      id: line.id,
      type: line.type,
      x1: line.x1,
      y1: line.y1,
      x2: line.x2,
      y2: line.y2,
      flipped: Boolean(line.flipped),
      leftExtended: true,
      rightExtended: true,
    };
  });
  return {
    version: 1,
    start: { x: candidate.start.x, y: candidate.start.y },
    lines,
  };
}
export function trackEngine(track: Track) {
  return new LineRiderEngine().setStart(track.start).addLine(
    track.lines.map((line) =>
      createLineFromJson({
        ...line,
        leftExtended: true,
        rightExtended: true,
      }),
    ),
  );
}
export function pointDistance(point: Vector, line: LineData) {
  const dx = line.x2 - line.x1,
    dy = line.y2 - line.y1;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - line.x1) * dx + (point.y - line.y1) * dy) /
        (dx * dx + dy * dy),
    ),
  );
  return Math.hypot(point.x - line.x1 - t * dx, point.y - line.y1 - t * dy);
}
