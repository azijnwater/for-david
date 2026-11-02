import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { games, gameSlug } from "../lib/arcade/catalog";
import { classicGames } from "../lib/arcade/classic-catalog";
import {
  createWorld,
  stepWorld,
  worldCommand,
  body,
  type Controls,
  type World,
} from "../lib/arcade/classic-world";
import {
  createDefense,
  defensePath,
  placeTower,
  startWave,
  tickDefense,
  creepPath,
} from "../lib/arcade/defense";
const input = (...keys: string[]): Controls => ({
  held: new Set(keys),
  pressed: new Set(keys),
  pointer: null,
});
const frames = (s: World, count: number, keys: string[] = []) => {
  const i = input(...keys);
  for (let n = 0; n < count; n++) {
    stepWorld(s, i, 1 / 120);
    i.pressed.clear();
  }
};

test("Every requested classic maps to a distinct game page, including Cushion Rider", () => {
  const research = JSON.parse(
    readFileSync(
      new URL("../research/flash-classics/catalog.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(games.length, 66);
  assert.equal(new Set(games.map((g) => g.id)).size, 66);
  assert.equal(new Set(games.map(gameSlug)).size, 66);
  assert.equal(
    gameSlug(games.find((g) => g.id === "line-rider")!),
    "cushion-rider",
  );
  for (const game of research.games)
    assert.ok(
      game.id === "line-rider" ||
        classicGames.some((g) => g.variant === game.id),
      game.id,
    );
  for (const game of games)
    assert.match(gameSlug(game), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

for (const game of classicGames.filter(
  (g) =>
    ["platform", "social", "shooter", "artillery", "physics", "life"].includes(
      g.engine,
    ) && g.variant !== "club-penguin",
)) {
  test(`${game.name}: simulation stays finite under movement and action input`, () => {
    const s = createWorld(game.variant, game.engine);
    if (game.variant === "learn-to-fly") worldCommand(s, "launch");
    if (game.variant === "duck-life") worldCommand(s, "train");
    if (game.engine === "artillery") worldCommand(s, "fire");
    frames(s, 600, ["ArrowRight", " ", "x", "q", "p"]);
    for (const entity of [s.player, s.ally, ...s.objects, ...s.shots])
      for (const key of ["x", "y", "vx", "vy"] as const)
        assert.ok(Number.isFinite(entity[key]), `${key} ${entity.kind}`);
    for (const point of s.points)
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
    assert.ok(Number.isFinite(s.score) && s.score >= 0);
  });
}

test("Platform movement, jumping and a three-chapter completion work", () => {
  const s = createWorld("fancy-pants", "platform");
  frames(s, 100);
  assert.equal(s.ground, true);
  const x = s.player.x;
  frames(s, 30, ["ArrowRight"]);
  assert.ok(s.player.x > x);
  const y = s.player.y;
  frames(s, 5, [" "]);
  assert.ok(s.player.y < y);
  for (let n = 0; n < 3; n++) {
    s.player.x = 1980;
    s.player.y = 400;
    s.objects = [];
    frames(s, 1);
  }
  assert.equal(s.over, true);
  assert.equal(s.won, true);
});
test("Dino Cat resets the doom wall and a safe respawn after a fall", () => {
  const s = createWorld("dino-run", "platform");
  s.player.y = 700;
  s.player.x = 1200;
  s.stats.doom = 1000;
  frames(s, 1);
  assert.equal(s.lives, 2);
  assert.equal(s.checkpoint.y, 330);
  assert.ok(s.stats.doom < s.player.x - 300);
  frames(s, 150);
  assert.ok(s.lives >= 2);
});
test("Run 3 keeps lane zero and rotates continuously around its tunnel", () => {
  const s = createWorld("run-3", "platform");
  s.stats.lane = 0;
  frames(s, 1);
  assert.equal(s.stats.lane, 0);
  frames(s, 1, ["ArrowLeft"]);
  assert.equal(s.stats.lane, 11);
  frames(s, 1, ["ArrowRight"]);
  assert.equal(s.stats.lane, 0);
});
test("Sun and Moon cats swap independently and both are required at the exit", () => {
  const s = createWorld("fireboy-watergirl", "platform");
  s.objects = [];
  s.player.x = 1980;
  s.ally.x = 100;
  frames(s, 1);
  assert.equal(s.level, 1);
  assert.match(s.message, /Luna/);
  frames(s, 1, ["e"]);
  assert.equal(s.stats.controlled, 1);
  const x = s.player.x,
    allyX = s.ally.x;
  frames(s, 10, ["ArrowRight"]);
  assert.equal(s.player.x, x);
  assert.ok(s.ally.x > allyX);
});
test("Portal cat flaps preserve movement and the cube opens its gate", () => {
  const s = createWorld("portal-flash", "platform");
  s.player.x = 100;
  s.player.y = 300;
  s.stats.blueX = 100;
  s.stats.blueY = 300;
  s.stats.orangeX = 700;
  s.stats.orangeY = 200;
  frames(s, 1, ["e"]);
  assert.ok(s.player.x > 650);
  assert.ok(s.player.vy < 0);
  const cube = s.objects.find((o) => o.kind === "cube")!,
    plate = s.objects.find((o) => o.kind === "switch")!;
  cube.x = plate.x;
  frames(s, 2);
  assert.equal(s.stats.gate, 1);
  assert.equal(s.objects.find((o) => o.kind === "gate")!.active, false);
});
test("Shooter walls block movement and defeated rooms advance", () => {
  const s = createWorld("binding-of-isaac", "shooter");
  s.player.x = 265;
  s.player.y = 230;
  frames(s, 15, ["ArrowRight"]);
  assert.ok(s.player.x + s.player.w <= 301);
  s.objects = [];
  frames(s, 1);
  assert.equal(s.stats.wave, 2);
});
test("Cardboard castle awards falling-block points only once", () => {
  const s = createWorld("crush-castle", "artillery");
  s.objects = [
    { ...body(700, 451, 32, 40, "castle"), tag: 1 },
    { ...body(850, 430, 32, 40, "castle") },
  ];
  frames(s, 1);
  const score = s.score;
  frames(s, 10);
  assert.equal(s.score, score);
  assert.equal(s.objects[0].active, false);
});
test("Motherload mining, sales, upgrades and surface fuel restoration work", () => {
  const s = createWorld("motherload", "life");
  s.player.x = 10;
  s.player.y = 100;
  frames(s, 1);
  assert.equal(s.stats.cargo, 1);
  s.player.y = 40;
  s.stats.fuel = 20;
  worldCommand(s, "sell");
  assert.equal(s.stats.cargo, 0);
  assert.equal(s.stats.fuel, 100);
  assert.equal(s.stats.money, 115);
  worldCommand(s, "engine");
  assert.equal(s.stats.engine, 1);
  assert.equal(s.stats.money, 65);
});
test("Flight has a full landing/shop loop and kitten training affects race outcomes", () => {
  const flight = createWorld("learn-to-fly", "life");
  worldCommand(flight, "launch");
  frames(flight, 2400);
  assert.equal(flight.phase, "shop");
  assert.ok(flight.stats.money > 100);
  const race = createWorld("duck-life", "life");
  race.stats.skill = 5;
  worldCommand(race, "race");
  frames(race, 1200);
  assert.equal(race.won, true);
});
test("Desktop maze building rejects a sealed route without spending treats", () => {
  assert.equal(defensePath(new Set([24, 37, 48])), null);
  const s = createDefense("desktop-td");
  s.money = 1000;
  placeTower(s, 24, "dart");
  placeTower(s, 48, "dart");
  const money = s.money;
  placeTower(s, 37, "dart");
  assert.equal(s.money, money);
  assert.match(s.message, /block/);
});
test("Tower defense resolves damage/rewards, leaks and an eight-wave victory", () => {
  const s = createDefense("bloons-td");
  s.money = 10000;
  for (const cell of [13, 25, 27, 39, 51, 63, 55, 41, 31, 32, 33, 34, 35])
    placeTower(s, cell, "mage");
  s.towers.forEach((t) => (t.level = 6));
  for (let wave = 0; wave < 8; wave++) {
    startWave(s);
    for (let n = 0; n < 1000 && s.active; n++) tickDefense(s, 0.1);
  }
  assert.equal(s.won, true);
  assert.equal(s.over, true);
  assert.ok(s.score > 500);
  const loss = createDefense("desktop-td");
  loss.lives = 1;
  startWave(loss);
  for (let n = 0; n < 1000 && !loss.over; n++) tickDefense(loss, 0.1);
  assert.equal(loss.over, true);
  assert.equal(loss.won, false);
});
test("Flying creeps use a direct route across a Desktop maze", () => {
  const s = createDefense("desktop-td");
  placeTower(s, 39, "dart");
  const flyer = {
    id: 1,
    cell: 36,
    next: 1,
    progress: 0,
    hp: 4,
    maxHp: 4,
    speed: 1,
    slow: 0,
    flying: true,
  };
  assert.deepEqual(
    creepPath(s, flyer),
    Array.from({ length: 12 }, (_, i) => 36 + i),
  );
  assert.notDeepEqual(s.path, creepPath(s, flyer));
});
