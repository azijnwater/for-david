import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEMO_TRACK,
  trackEngine,
  validateTrack,
  pointDistance,
} from "../lib/arcade/line-rider";

test("Cushion Rider uses deterministic constrained rider simulation", () => {
  const first = trackEngine(DEMO_TRACK),
    second = trackEngine(DEMO_TRACK);
  const a = first.getRider(120),
    b = second.getRider(120);
  assert.deepEqual(a.position, b.position);
  assert.deepEqual(a.get("NOSE").pos, b.get("NOSE").pos);
  assert.ok(a.position.x > DEMO_TRACK.start.x);
  assert.ok(Number.isFinite(a.position.y));
  assert.ok(
    first.getRider(0).get("NOSE").pos.x !== first.getRider(0).get("TAIL").pos.x,
  );
});
test("Scenery does not collide, but a solid line does", () => {
  const line = { id: 0, type: 0 as const, x1: -100, y1: 5, x2: 300, y2: 5 };
  const base = { version: 1 as const, start: { x: 0, y: 0 }, lines: [line] };
  const solid = trackEngine(base),
    scenery = trackEngine({ ...base, lines: [{ ...line, type: 2 }] });
  assert.ok(solid.getRider(11).position.y < scenery.getRider(11).position.y);
});
test("Acceleration lines change the actual engine trajectory", () => {
  const line = { id: 0, type: 0 as const, x1: 0, y1: 5, x2: 300, y2: 5 };
  const solid = trackEngine({
    version: 1,
    start: { x: 0, y: 0 },
    lines: [line],
  });
  const boost = trackEngine({
    version: 1,
    start: { x: 0, y: 0 },
    lines: [{ ...line, type: 1 }],
  });
  assert.ok(boost.getRider(30).position.x > solid.getRider(30).position.x);
});
test("Track import preserves data and rejects malformed or unbounded input", () => {
  assert.equal(
    validateTrack(JSON.parse(JSON.stringify(DEMO_TRACK))).lines.length,
    6,
  );
  assert.throws(() =>
    validateTrack({ version: 1, start: { x: Infinity, y: 0 }, lines: [] }),
  );
  assert.throws(() =>
    validateTrack({
      ...DEMO_TRACK,
      lines: [DEMO_TRACK.lines[0], DEMO_TRACK.lines[0]],
    }),
  );
  assert.throws(() =>
    validateTrack({
      ...DEMO_TRACK,
      lines: [{ ...DEMO_TRACK.lines[0], x1: 999999 }],
    }),
  );
  assert.throws(() =>
    validateTrack({
      ...DEMO_TRACK,
      lines: [{ ...DEMO_TRACK.lines[0], x2: 0, y2: 70 }],
    }),
  );
  assert.equal(
    pointDistance(
      { x: 5, y: 3 },
      { id: 1, type: 0, x1: 0, y1: 0, x2: 10, y2: 0 },
    ),
    3,
  );
});
test("Research catalogue covers all 54 requests without claiming completed clones", () => {
  const catalogue = JSON.parse(
    readFileSync(
      new URL("../research/flash-classics/catalog.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(catalogue.games.length, 54);
  assert.equal(
    new Set(catalogue.games.map((game: { id: string }) => game.id)).size,
    54,
  );
  for (const game of catalogue.games) {
    assert.ok(game.mechanics.length >= 3);
    assert.ok(game.page.startsWith("https://"));
    assert.ok(game.sourceStatus);
    assert.ok(game.sucuk);
  }
});
