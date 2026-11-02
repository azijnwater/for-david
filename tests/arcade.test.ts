import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createGame, step, type Input } from "../lib/arcade/engine";
import {
  addTile,
  hasMoves,
  newLights,
  slideBoard,
  toggleLights,
} from "../lib/arcade/puzzles";
import {
  issueTicket,
  jsonBody,
  scores,
  submitScore,
  updateBoard,
  validateScore,
  verifyTicket,
} from "../lib/arcade/leaderboard";

test("Leaderboard rejects oversized bodies and invalid JSON", async () => {
  await assert.rejects(
    jsonBody(
      new Request("http://localhost/api", {
        method: "POST",
        body: "x".repeat(3000),
      }),
    ),
    /too large/,
  );
  await assert.rejects(
    jsonBody(
      new Request("http://localhost/api", { method: "POST", body: "not json" }),
    ),
    /Invalid/,
  );
  assert.deepEqual(
    await jsonBody(
      new Request("http://localhost/api", {
        method: "POST",
        body: '{"name":"Sucuk"}',
      }),
    ),
    { name: "Sucuk" },
  );
});

const input = (...keys: string[]): Input => ({
  held: new Set(keys),
  pressed: new Set(keys),
  action: false,
  pointer: null,
});
test("2048 merges once per move in each direction and accounts for points", () => {
  const board = [2, 2, 2, 2, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual(
    slideBoard(board, "left").board.slice(0, 8),
    [4, 4, 0, 0, 8, 0, 0, 0],
  );
  assert.equal(slideBoard(board, "left").gained, 16);
  assert.deepEqual(slideBoard(board, "right").board.slice(0, 4), [0, 0, 4, 4]);
  assert.deepEqual(
    slideBoard(
      [2, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0],
      "up",
    ).board.filter(Boolean),
    [4, 8],
  );
  assert.deepEqual(
    slideBoard(
      [2, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0],
      "down",
    ).board.filter(Boolean),
    [4, 8],
  );
  assert.equal(slideBoard([2, ...Array(15).fill(0)], "left").changed, false);
});
test("2048 detects full boards with and without a possible merge", () => {
  const stuck = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
  assert.equal(hasMoves(stuck), false);
  assert.equal(hasMoves([2, 2, ...stuck.slice(2)]), true);
  const added = addTile(Array(16).fill(0));
  assert.equal(added.filter(Boolean).length, 1);
});
test("Lights Out toggles only neighbours, is reversible, and generates nonempty puzzles", () => {
  const empty = Array<boolean>(25).fill(false);
  assert.equal(toggleLights(empty, 0).filter(Boolean).length, 3);
  assert.equal(toggleLights(empty, 12).filter(Boolean).length, 5);
  assert.deepEqual(toggleLights(toggleLights(empty, 7), 7), empty);
  for (let i = 0; i < 30; i++) assert.ok(newLights().some(Boolean));
});
test("Snake eats yarn, rejects reversal, and ends on walls", () => {
  const s = createGame("snake");
  s.food = { x: 11, y: 11 };
  s.timer = 0.2;
  step(s, input("ArrowLeft"), 0.016);
  assert.equal(s.score, 10);
  assert.equal(s.tail.length, 4);
  assert.equal(s.dx, 1);
  s.tail = [{ x: 35, y: 11 }];
  s.timer = 0.2;
  step(s, input(), 0.016);
  assert.equal(s.over, true);
});
test("Snake may move into its vacating tail, but not another body segment", () => {
  const s = createGame("snake");
  s.tail = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 5 },
  ];
  s.dx = 1;
  s.nx = 1;
  s.dy = 0;
  s.ny = 0;
  s.timer = 0.2;
  s.food = { x: 30, y: 10 };
  step(s, input(), 0.016);
  assert.equal(s.over, false);
  s.tail.push({ x: 7, y: 6 });
  s.nx = 0;
  s.ny = 1;
  s.timer = 0.2;
  step(s, input(), 0.016);
  assert.equal(s.over, true);
});
test("Breakout clears bricks and loses the round after three misses", () => {
  const s = createGame("breakout");
  s.objects = [{ x: 100, y: 100, w: 50, h: 20, vx: 0, vy: 0 }];
  s.ball = { x: 110, y: 100, w: 14, h: 14, vx: 0, vy: 100 };
  step(s, input(), 0.016);
  assert.equal(s.won, true);
  assert.equal(s.score, 10);
  const loss = createGame("breakout");
  for (let i = 0; i < 3; i++) {
    loss.ball.y = 450;
    step(loss, input(), 0.016);
  }
  assert.equal(loss.over, true);
  assert.equal(loss.lives, 0);
});
test("Pong ends at seven points; the enemy can win too", () => {
  const s = createGame("pong");
  s.score = 6;
  s.ball.x = 750;
  step(s, input(), 0.016);
  assert.equal(s.won, true);
  assert.equal(s.score, 7);
  const loss = createGame("pong");
  loss.enemy = 6;
  loss.ball.x = -40;
  step(loss, input(), 0.016);
  assert.equal(loss.over, true);
  assert.equal(loss.won, false);
});
test("Feather patrol fires, advances waves and detects invasion", () => {
  const s = createGame("invaders");
  step(s, input(" "), 0.016);
  assert.ok(s.shots.some((o) => o.vy < 0));
  s.objects = [];
  step(s, input(), 0.016);
  assert.equal(s.wave, 2);
  assert.equal(s.objects.length, 24);
  s.objects.forEach((o) => (o.y = 380));
  step(s, input(), 0.016);
  assert.equal(s.over, true);
});
test("Flying floof flaps, awards passed gaps only once, and collides", () => {
  const s = createGame("flappy");
  step(s, input(" "), 0.016);
  assert.ok(s.player.vy < 0);
  s.objects = [{ x: 40, y: 0, w: 65, h: 40, vx: -185, vy: 0 }];
  step(s, input(), 0.016);
  assert.equal(s.score, 1);
  step(s, input(), 0.016);
  assert.equal(s.score, 1);
  s.player.y = 440;
  step(s, input(), 0.016);
  assert.equal(s.over, true);
});
test("Zoomies jumps from the floor and lands without a double jump", () => {
  const s = createGame("runner");
  step(s, input(" "), 0.016);
  const velocity = s.player.vy;
  assert.ok(velocity < 0);
  step(s, input(" "), 0.016);
  assert.ok(s.player.vy > velocity);
  for (let i = 0; i < 100; i++) step(s, input(), 0.016);
  assert.equal(s.player.y, 330);
});
test("Treat rain distinguishes treats from cucumbers and finishes on the timer", () => {
  const s = createGame("catcher");
  s.spawn = 5;
  s.objects = [{ ...s.player, vx: 0, vy: 0, kind: "treat" }];
  step(s, input(), 0.016);
  assert.equal(s.score, 10);
  s.objects = [{ ...s.player, vx: 0, vy: 0, kind: "cucumber" }];
  step(s, input(), 0.016);
  assert.equal(s.lives, 2);
  s.elapsed = 45;
  step(s, input(), 0.016);
  assert.equal(s.over, true);
  assert.equal(s.won, true);
});
test("Sofa safari crosses five times and moves by one lane per press", () => {
  const s = createGame("frogger");
  s.objects = [];
  step(s, input("ArrowUp"), 0.016);
  assert.equal(s.player.y, 327);
  for (let i = 0; i < 5; i++) {
    s.player.y = 0;
    s.cooldown = 0;
    s.objects = [];
    step(s, input(), 0.016);
  }
  assert.equal(s.won, true);
  assert.equal(s.score, 500);
});
test("Server validates scores, names, ties, replays and cooldowns", () => {
  const now = Date.now();
  const run = {
    game: "snake" as const,
    id: "run1",
    at: now - 10000,
    visitor: "visitor1",
  };
  const board = updateBoard(
    { entries: [], recent: [] },
    run,
    "Sucuk",
    100,
    now,
  );
  assert.equal(board.entries[0].name, "Sucuk");
  assert.throws(() => updateBoard(board, run, "Sucuk", 100, now), /already/);
  assert.throws(
    () => updateBoard(board, { ...run, id: "run2" }, "Sucuk", 100, now),
    /Wait/,
  );
  assert.throws(
    () => updateBoard({ entries: [], recent: [] }, run, "<script>", 100, now),
    /letters/,
  );
  assert.throws(() => validateScore("pong", 8, 10), /range/);
  assert.throws(() => validateScore("runner", 10000, 10), /length/);
  const second = updateBoard(
    board,
    { ...run, id: "run2", visitor: "visitor2" },
    "Guest",
    100,
    now + 1,
  );
  assert.equal(second.entries[0].name, "Sucuk");
});
test("Signed sessions reject tampering and persist concurrent scores across reads", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sucuk-scores-test-"));
  process.env.ARCADE_STORE_DIR = directory;
  try {
    const ticket = issueTicket("snake", "test-address");
    const run = verifyTicket(ticket);
    assert.equal(run.game, "snake");
    assert.throws(() => verifyTicket(ticket.slice(0, -4) + "AAAA"), /invalid/);
    await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        submitScore(
          {
            ...run,
            id: `concurrent${i}`,
            visitor: `visitor${i}`,
            at: Date.now() - 10000,
          },
          `Cat ${i}`,
          i * 10,
        ),
      ),
    );
    const board = await scores("snake");
    assert.equal(board.length, 8);
    assert.equal(board[0].score, 70);
    const stored = await import("node:fs/promises").then((fs) =>
      fs.readFile(path.join(directory, "snake.json"), "utf8"),
    );
    assert.equal(stored.includes("test-address"), false);
  } finally {
    delete process.env.ARCADE_STORE_DIR;
    await rm(directory, { recursive: true, force: true });
  }
});
