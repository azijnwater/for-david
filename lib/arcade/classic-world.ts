import type { ClassicVariant } from "./classic-catalog";

export const CW = 960,
  CH = 540;
export type Body = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  kind: string;
  active: boolean;
  tag: number;
};
export type Controls = {
  held: Set<string>;
  pressed: Set<string>;
  pointer: { x: number; y: number; down: boolean } | null;
};
export type World = {
  variant: ClassicVariant;
  mode: string;
  level: number;
  score: number;
  lives: number;
  time: number;
  over: boolean;
  won: boolean;
  message: string;
  player: Body;
  ally: Body;
  objects: Body[];
  platforms: Body[];
  coins: Body[];
  shots: Body[];
  particles: Body[];
  camera: number;
  width: number;
  cooldown: number;
  invincible: number;
  spawn: number;
  ground: boolean;
  wall: number;
  jumps: number;
  checkpoint: { x: number; y: number };
  stats: Record<string, number>;
  flags: string[];
  joints: { a: number; b: number; length: number }[];
  points: { x: number; y: number; ox: number; oy: number; radius: number }[];
  aim: { angle: number; power: number };
  turn: number;
  phase: string;
};
export const body = (
  x: number,
  y: number,
  w = 30,
  h = 30,
  kind = "solid",
): Body => ({ x, y, w, h, vx: 0, vy: 0, hp: 1, kind, active: true, tag: 0 });
export const hits = (a: Body, b: Body) =>
  a.active &&
  b.active &&
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y;
export const clamp = (x: number, min: number, max: number) =>
  Math.max(min, Math.min(max, x));
const has = (i: Controls, ...keys: string[]) =>
  keys.some((key) => i.held.has(key));
const tap = (i: Controls, ...keys: string[]) =>
  keys.some((key) => i.pressed.has(key));
const random = (a: number, b: number) => a + Math.random() * (b - a);
const armed = new Set<ClassicVariant>([
  "alien-hominid",
  "madness-interactive",
  "thing-thing",
  "strike-force-heroes",
]);
const runners = new Set<ClassicVariant>([
  "dino-run",
  "robot-unicorn",
  "canabalt",
]);
export function finishWorld(s: World, success: boolean, message: string) {
  if (s.over) return;
  s.over = true;
  s.won = success;
  s.message = message;
  if (success) s.score += 500;
}
export function createWorld(
  variant: ClassicVariant,
  mode: string,
  level = 1,
): World {
  const s: World = {
    variant,
    mode,
    level,
    score: 0,
    lives: 3,
    time: 0,
    over: false,
    won: false,
    message: "",
    player: body(80, 380, 30, 34, "sucuk"),
    ally: body(130, 380, 30, 34, "luna"),
    objects: [],
    platforms: [],
    coins: [],
    shots: [],
    particles: [],
    camera: 0,
    width: 2100,
    cooldown: 0,
    invincible: 0,
    spawn: 0,
    ground: false,
    wall: 0,
    jumps: 0,
    checkpoint: { x: 80, y: 380 },
    stats: {},
    flags: [],
    joints: [],
    points: [],
    aim: { angle: 45, power: 65 },
    turn: 0,
    phase: "play",
  };
  if (mode === "platform" || mode === "social") setupPlatform(s);
  if (mode === "shooter") setupShooter(s);
  if (mode === "artillery") setupArtillery(s);
  if (mode === "physics") setupPhysics(s);
  if (mode === "life") setupLife(s);
  return s;
}
export function setupPlatform(s: World) {
  s.platforms = [
    body(0, 470, 360, 70),
    body(440, 470, 320, 70),
    body(840, 470, 380, 70),
    body(1300, 470, 800, 70),
    body(240, 375, 170, 18),
    body(520, 300, 150, 18),
    body(850, 365, 150, 18),
    body(1120, 295, 150, 18),
    body(1450, 370, 180, 18),
  ];
  s.objects = [560, 960, 1400, 1720].map((x, n) => {
    const o = body(x, 436, 30, 34, armed.has(s.variant) ? "enemy" : "spike");
    o.hp = armed.has(s.variant) ? 2 : 1;
    o.tag = n;
    return o;
  });
  s.coins = Array.from({ length: 12 }, (_, n) =>
    body(
      180 + n * 145,
      n % 3 === 1 ? 330 : n % 3 === 2 ? 260 : 420,
      14,
      14,
      "treat",
    ),
  );
  s.stats.goal = 1960;
  s.stats.timer = 70;
  s.stats.energy = 100;
  if (s.variant === "fancy-pants") {
    s.platforms.push({ ...body(690, 390, 150, 25, "ramp"), tag: -70 });
    s.objects[1].kind = "shell";
  }
  if (s.variant === "n") {
    s.stats.timer = 60;
    s.objects.forEach((o, n) => {
      o.kind = n % 2 ? "drone" : "mine";
      o.y = 340;
      o.tag = n;
    });
  }
  if (s.variant === "vex")
    s.platforms.push({ ...body(1000, 410, 100, 15, "moving"), tag: 410 });
  if (s.variant === "super-mario-63") {
    s.stats.fuel = 100;
    s.objects.forEach((o) => (o.kind = "goomba"));
    s.platforms.push(body(680, 220, 150, 18));
  }
  if (s.variant === "fireboy-watergirl") {
    s.objects = [
      body(470, 450, 90, 20, "sun"),
      body(880, 450, 90, 20, "moon"),
      body(1350, 450, 80, 20, "poison"),
    ];
    s.stats.controlled = 0;
    s.stats.gate = 0;
  }
  if (s.variant === "portal-flash") {
    s.objects = [
      body(620, 340, 50, 50, "cube"),
      body(1000, 460, 65, 10, "switch"),
      body(1570, 250, 25, 220, "gate"),
    ];
    s.stats.blueX = 400;
    s.stats.blueY = 430;
    s.stats.orangeX = 1300;
    s.stats.orangeY = 220;
    s.platforms.push(body(1220, 250, 180, 18));
  }
  if (s.variant === "achievement-unlocked") {
    s.width = 960;
    s.stats.goal = 900;
    s.objects = [body(400, 445, 60, 25, "spike")];
    s.coins = s.coins.slice(0, 5).map((o, n) => ({ ...o, x: 180 + n * 135 }));
    s.platforms = [
      body(0, 470, 960, 70),
      body(300, 350, 200, 20),
      body(650, 260, 160, 20),
    ];
  }
  if (s.variant === "worlds-hardest-game") {
    s.width = 960;
    s.player = body(60, 245, 24, 24, "sucuk");
    s.ally = body(60, 245, 24, 24, "luna");
    s.platforms = [];
    s.objects = Array.from({ length: 8 + s.level * 2 }, (_, n) => ({
      ...body(200 + n * 55, 120 + (n % 4) * 80, 22, 22, "orb"),
      tag: n,
    }));
    s.coins = [
      body(470, 100, 14, 14, "treat"),
      body(700, 420, 14, 14, "treat"),
      body(850, 240, 14, 14, "treat"),
    ];
    s.stats.goal = 900;
  }
  if (runners.has(s.variant)) {
    s.player.y = 330;
    s.checkpoint = { x: 80, y: 330 };
    s.platforms = [
      body(0, 390, 450, 150),
      body(550, 410, 400, 130),
      body(1060, 360, 450, 180),
      body(1640, 420, 600, 120),
    ];
    s.objects = [
      body(300, 376, 14, 14, "crate"),
      body(760, 396, 14, 14, "crate"),
      body(1270, 320, 35, 40, s.variant === "robot-unicorn" ? "star" : "crate"),
    ];
    s.stats.doom = -350;
    s.stats.speed = s.variant === "canabalt" ? 100 : 210;
    s.stats.goal = 2000;
  }
  if (s.mode === "social") {
    s.objects = [];
    s.coins = [body(900, 260, 18, 18, "cheese")];
    s.stats.goal = 1900;
    s.stats.connected = 0;
    s.stats.cheese = 0;
    if (s.variant === "club-penguin") {
      s.width = 960;
      s.platforms = [body(0, 470, 960, 70)];
      s.coins = Array.from({ length: 8 }, (_, n) =>
        body(120 + n * 95, 440, 16, 16, "snowball"),
      );
    }
  }
}
function advance(s: World) {
  s.score += 300;
  if (s.level >= 3) {
    finishWorld(s, true, "The whole cat crew made it home. Campaign complete!");
    return;
  }
  const next = createWorld(s.variant, s.mode, s.level + 1);
  next.score = s.score;
  next.lives = s.lives;
  Object.assign(s, next);
  s.message = `Chapter ${s.level}. A new room to explore.`;
}
function damage(s: World, reset = false) {
  if (s.invincible > 0) return;
  s.lives--;
  s.invincible = 1.4;
  if (s.lives <= 0) {
    finishWorld(s, false, "A well-earned nap. Try the campaign again.");
    return;
  }
  if (reset) {
    s.player.x = s.checkpoint.x;
    s.player.y = s.checkpoint.y;
    s.player.vx = 0;
    s.player.vy = 0;
    s.ally.x = s.checkpoint.x + 40;
    s.ally.y = s.checkpoint.y;
    s.stats.fuel = 100;
    s.stats.dash = 0;
    if (s.variant === "dino-run") s.stats.doom = s.player.x - 430;
  }
  if (!s.flags.includes("first tumble")) s.flags.push("first tumble");
}
function movePlatform(
  s: World,
  p: Body,
  dx: number,
  jump: boolean,
  heldJump: boolean,
  dt: number,
  secondary = false,
) {
  const auto = runners.has(s.variant),
    gravity = s.variant === "canabalt" ? 1200 : 1050;
  const speed = auto
    ? s.stats.speed || 220
    : s.variant === "meat-boy"
      ? 270
      : s.variant === "n"
        ? 250
        : 220;
  const momentum = ["fancy-pants", "n"].includes(s.variant);
  p.vx = auto
    ? speed
    : momentum
      ? clamp(p.vx + dx * 1100 * dt, -speed, speed)
      : dx * speed;
  if (!auto && !dx) p.vx *= Math.pow(momentum ? 0.08 : 0.001, dt);
  const previousY = p.y,
    previousX = p.x;
  const wasGround = secondary ? Boolean(s.stats.allyGround) : s.ground;
  if (jump) {
    if (wasGround) {
      p.vy = -440;
      s.jumps = 1;
      if (!s.flags.includes("jump")) s.flags.push("jump");
    } else if (
      ["meat-boy", "n", "vex", "fancy-pants"].includes(s.variant) &&
      s.wall
    ) {
      p.vy = -430;
      p.vx = -s.wall * 300;
    } else if (
      ["robot-unicorn", "super-mario-63"].includes(s.variant) &&
      s.jumps < 2
    ) {
      p.vy = -390;
      s.jumps++;
    }
  }
  if (
    s.variant === "canabalt" &&
    heldJump &&
    p.vy < 0 &&
    s.stats.jumpHeld < Math.min(0.35, speed / 2000)
  ) {
    p.vy = -300;
    s.stats.jumpHeld += dt;
  } else if (!heldJump) s.stats.jumpHeld = 0;
  if (!heldJump && p.vy < -170) p.vy += gravity * dt * 0.8;
  if (
    s.variant === "super-mario-63" &&
    heldJump &&
    !wasGround &&
    s.stats.fuel > 0
  ) {
    p.vy -= 1300 * dt;
    s.stats.fuel -= 35 * dt;
  }
  p.vy = Math.min(650, p.vy + gravity * dt);
  p.x = clamp(p.x + p.vx * dt, 0, s.width - p.w);
  p.y += p.vy * dt;
  let grounded = false;
  s.wall = 0;
  for (const platform of s.platforms) {
    if (platform.kind === "moving")
      platform.y = platform.tag + Math.sin(s.time * 1.4) * 50;
    const floor =
      platform.y +
      (platform.kind === "ramp"
        ? platform.tag * clamp((p.x + 15 - platform.x) / platform.w, 0, 1)
        : 0);
    if (
      p.x + p.w > platform.x &&
      p.x < platform.x + platform.w &&
      p.vy >= 0 &&
      previousY + p.h <= floor + Math.max(10, p.vy * dt) &&
      p.y + p.h >= floor
    ) {
      p.y = floor - p.h;
      p.vy = 0;
      grounded = true;
      s.jumps = 0;
    } else if (
      platform.kind !== "ramp" &&
      hits(p, platform) &&
      previousY + p.h > platform.y + 10 &&
      previousY < platform.y + platform.h - 5
    ) {
      if (previousX + p.w <= platform.x + 8) {
        p.x = platform.x - p.w;
        s.wall = 1;
      } else if (previousX >= platform.x + platform.w - 8) {
        p.x = platform.x + platform.w;
        s.wall = -1;
      }
      if (auto && Math.abs(p.vx) > 100) damage(s, true);
    }
  }
  if (secondary) s.stats.allyGround = Number(grounded);
  else s.ground = grounded;
  if (p.y > CH + 100) damage(s, true);
}
export function stepWorld(s: World, i: Controls, elapsed: number) {
  if (s.over) return;
  const dt = Math.min(elapsed, 0.025);
  s.time += dt;
  s.cooldown -= dt;
  s.invincible -= dt;
  s.spawn -= dt;
  if (s.mode === "platform" || s.mode === "social") stepPlatform(s, i, dt);
  if (s.mode === "shooter") stepShooter(s, i, dt);
  if (s.mode === "artillery") stepArtillery(s, dt);
  if (s.mode === "physics") stepPhysics(s, i, dt);
  if (s.mode === "life") stepLife(s, i, dt);
}
function stepPlatform(s: World, i: Controls, dt: number) {
  if (s.variant === "run-3") {
    stepTunnel(s, i, dt);
    return;
  }
  if (s.variant === "worlds-hardest-game") {
    const p = s.player;
    p.x = clamp(
      p.x +
        (Number(has(i, "ArrowRight", "d")) - Number(has(i, "ArrowLeft", "a"))) *
          170 *
          dt,
      10,
      930,
    );
    p.y = clamp(
      p.y +
        (Number(has(i, "ArrowDown", "s")) - Number(has(i, "ArrowUp", "w"))) *
          170 *
          dt,
      20,
      505,
    );
    s.objects.forEach((o) => {
      o.y = 255 + Math.sin(s.time * (1 + s.level * 0.25) + o.tag * 0.7) * 190;
      if (hits(p, o)) damage(s, true);
    });
  } else {
    let dx =
      Number(has(i, "ArrowRight", "d")) - Number(has(i, "ArrowLeft", "a"));
    if (s.variant === "fireboy-watergirl") {
      if (tap(i, "e")) s.stats.controlled = 1 - s.stats.controlled;
      const p = s.stats.controlled ? s.ally : s.player;
      movePlatform(
        s,
        p,
        dx,
        tap(i, " ", "ArrowUp", "w"),
        has(i, " ", "ArrowUp", "w"),
        dt,
        Boolean(s.stats.controlled),
      );
      const other = s.stats.controlled ? s.player : s.ally;
      movePlatform(s, other, 0, false, false, dt, !s.stats.controlled);
    } else {
      if (s.variant === "madness-interactive" && has(i, "ArrowDown", "s"))
        dx *= 1.5;
      movePlatform(
        s,
        s.player,
        dx,
        tap(i, " ", "ArrowUp", "w"),
        has(i, " ", "ArrowUp", "w"),
        dt,
      );
      if (s.mode === "social") {
        if (has(i, "l", "j", "i", "Enter")) s.stats.connected = 1;
        const autoRace =
          s.variant === "platform-racing-2" && !s.stats.connected;
        const dx2 = autoRace ? 0.75 : Number(has(i, "l")) - Number(has(i, "j"));
        const autoJump =
          autoRace &&
          Boolean(s.stats.allyGround) &&
          (s.platforms.every(
            (tile) => s.ally.x + 85 < tile.x || s.ally.x + 85 > tile.x + tile.w,
          ) ||
            Math.sin(s.time * 2.7) > 0.8);
        movePlatform(
          s,
          s.ally,
          dx2,
          autoJump || tap(i, "Enter", "i"),
          autoJump || has(i, "Enter", "i"),
          dt,
          true,
        );
      }
    }
  }
  const p = s.player;
  if (
    s.variant === "platform-racing-2" &&
    s.ally.x > s.stats.goal &&
    p.x <= s.stats.goal
  ) {
    finishWorld(
      s,
      false,
      "Luna reached the finish first. Try the sprint hat and a faster line.",
    );
    return;
  }
  if (s.ground && p.x > 400 && !runners.has(s.variant)) {
    s.checkpoint = { x: p.x, y: p.y };
    if (s.variant === "vex") s.message = "Checkpoint reached.";
  }
  if (s.variant === "n") {
    s.stats.timer -= dt;
    if (s.stats.timer <= 0) damage(s, true);
    if (s.invincible > 1.3) s.stats.timer = 60;
  }
  if (runners.has(s.variant)) {
    s.stats.speed = Math.min(
      800,
      s.stats.speed +
        dt *
          (s.variant === "canabalt"
            ? s.stats.speed < 250
              ? 30
              : s.stats.speed < 400
                ? 20
                : 10
            : 8),
    );
    s.stats.doom += dt * 200;
    if (s.variant === "dino-run" && p.x < s.stats.doom) damage(s, true);
  }
  if (s.variant === "robot-unicorn" && tap(i, "x") && s.cooldown <= 0) {
    s.stats.dash = 0.3;
    s.cooldown = 1;
  }
  if (s.stats.dash > 0) {
    s.stats.dash -= dt;
    p.x += 600 * dt;
  }
  for (const coin of s.coins)
    if (
      coin.active &&
      (hits(p, coin) ||
        (s.variant === "fireboy-watergirl" && hits(s.ally, coin)))
    ) {
      coin.active = false;
      s.score += 25;
      s.stats.timer += 2;
      if (coin.kind === "cheese") s.stats.cheese = 1;
      if (!s.flags.includes("treat")) s.flags.push("treat");
    }
  if (armed.has(s.variant) && has(i, "x") && s.cooldown <= 0) {
    const target = i.pointer
      ? { x: i.pointer.x + s.camera, y: i.pointer.y }
      : { x: p.x + 500, y: p.y };
    const angle = Math.atan2(target.y - p.y, target.x - p.x);
    const shot = body(p.x + 15, p.y + 15, 9, 6, "paw");
    shot.vx = Math.cos(angle) * 650;
    shot.vy = Math.sin(angle) * 650;
    s.shots.push(shot);
    s.cooldown = 0.18;
  }
  if (armed.has(s.variant) && tap(i, "e")) {
    s.objects.forEach((o) => {
      if (Math.abs(o.x - p.x) < 160 && o.kind === "enemy") {
        o.active = false;
        s.score += 75;
      }
    });
  }
  for (const o of s.objects) {
    if (!o.active) continue;
    if (o.kind === "drone") {
      o.y = 300 + Math.sin(s.time * 2 + o.tag) * 100;
      o.x += Math.sign(p.x - o.x) * 35 * dt;
    }
    if (["enemy", "goomba"].includes(o.kind)) {
      o.x += Math.sign(p.x - o.x) * 45 * dt;
      if (armed.has(s.variant) && s.spawn <= 0) {
        const shot = body(o.x, o.y + 10, 7, 7, "bad");
        shot.vx = Math.sign(p.x - o.x) * 220;
        s.shots.push(shot);
        s.spawn = 0.8;
      }
    }
    if (o.kind === "cube") {
      if (hits(p, o)) o.x += p.vx * dt;
    }
    if (o.kind === "switch") {
      if (
        s.objects.some((c) => c.kind === "cube" && Math.abs(c.x - o.x) < 65) ||
        Math.abs(p.x - o.x) < 45
      )
        s.stats.gate = 1;
    }
    if (o.kind === "gate" && s.stats.gate) o.active = false;
    if (o.kind === "gate" && hits(p, o)) p.x = o.x - p.w;
    const actors = s.variant === "fireboy-watergirl" ? [p, s.ally] : [p];
    for (const actor of actors) {
      if (!hits(actor, o)) continue;
      if (o.kind === "crate" && s.variant === "canabalt") {
        p.vx *= 0.7;
        s.stats.speed = Math.max(100, s.stats.speed * 0.7);
        o.active = false;
        s.score += 10;
        s.message = "Stumbled! Speed reduced.";
      } else if (o.kind === "star" && s.stats.dash > 0) {
        o.active = false;
        s.score += 80;
      } else if (o.kind === "goomba" && p.vy > 0 && p.y + 20 < o.y + 10) {
        o.active = false;
        p.vy = -300;
        s.score += 50;
      } else if (o.kind === "sun" && actor === p) continue;
      else if (o.kind === "moon" && actor === s.ally) continue;
      else if (!["cube", "switch", "gate", "shell"].includes(o.kind))
        damage(s, true);
      else if (o.kind === "shell") {
        o.x += Math.sign(p.vx || 1) * 150 * dt;
        s.score += 1;
      }
    }
  }
  for (const shot of s.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (shot.kind === "bad" && hits(p, shot)) {
      shot.active = false;
      damage(s);
    }
    if (shot.kind === "paw")
      for (const o of s.objects)
        if (o.kind === "enemy" && hits(o, shot)) {
          o.hp--;
          shot.active = false;
          if (o.hp <= 0) {
            o.active = false;
            s.score += 100;
          }
        }
  }
  s.shots = s.shots.filter(
    (o) => o.active && o.x > s.camera - 100 && o.x < s.camera + 1100,
  );
  if (s.variant === "portal-flash" && tap(i, "e") && s.cooldown <= 0) {
    const a = { x: s.stats.blueX, y: s.stats.blueY },
      b = { x: s.stats.orangeX, y: s.stats.orangeY };
    if (Math.hypot(p.x - a.x, p.y - a.y) < 100) {
      p.x = b.x;
      p.y = b.y;
      p.vy = -Math.max(250, Math.abs(p.vx));
      s.cooldown = 0.6;
    } else if (Math.hypot(p.x - b.x, p.y - b.y) < 100) {
      p.x = a.x;
      p.y = a.y;
      s.cooldown = 0.6;
    } else {
      s.stats.blueX = p.x;
      s.stats.blueY = p.y;
      s.message =
        "First cat flap placed. Move and press X to place its partner.";
    }
  }
  if (s.variant === "portal-flash" && tap(i, "x")) {
    s.stats.orangeX = p.x;
    s.stats.orangeY = p.y;
  }
  if (s.variant === "achievement-unlocked") {
    for (const [key, ok] of [
      ["left", has(i, "ArrowLeft", "a")],
      ["right", has(i, "ArrowRight", "d")],
      ["time", s.time > 10],
      ["west", p.x < 20],
      ["east", p.x > 880],
      ["high", p.y < 220],
      ["all treats", s.coins.every((c) => !c.active)],
      ["action", tap(i, "x")],
    ] as const)
      if (ok && !s.flags.includes(key)) {
        s.flags.push(key);
        s.score += 50;
      }
    s.message = `Achievements ${s.flags.length}/10: ${s.flags.join(", ")}`;
    if (s.flags.length >= 10) advance(s);
  } else if (s.variant === "club-penguin") {
    if (s.coins.every((c) => !c.active)) {
      s.score += 300;
      finishWorld(
        s,
        true,
        "The snowball hunt is complete. Welcome to Club Sucuk!",
      );
    }
  } else if (p.x > s.stats.goal) {
    if (s.variant === "fireboy-watergirl" && s.ally.x < s.stats.goal - 80)
      s.message = "Luna needs to reach the second cat flap too. E swaps cats.";
    else if (
      s.variant === "worlds-hardest-game" &&
      s.coins.some((c) => c.active)
    )
      s.message = "Collect every treat before entering the basket.";
    else if (s.variant === "transformice" && !s.stats.cheese)
      s.message = "Bring the cheese to the basket first.";
    else advance(s);
  }
  if (s.variant === "transformice" && tap(i, "e"))
    s.platforms.push(body(p.x + 60, p.y + 45, 90, 12, "plank"));
  if (s.variant === "platform-racing-2" && tap(i, "x") && s.cooldown <= 0) {
    p.vx += 350;
    p.x += 70;
    s.cooldown = 2;
    s.message = "Sprint hat activated!";
  }
  s.camera = clamp(p.x - 240, 0, Math.max(0, s.width - CW));
}
function stepTunnel(s: World, i: Controls, dt: number) {
  if (s.stats.lane === undefined) s.stats.lane = 1;
  s.stats.distance = (s.stats.distance || 0) + dt * 9;
  if (tap(i, "ArrowLeft", "a")) s.stats.lane = (s.stats.lane + 11) % 12;
  if (tap(i, "ArrowRight", "d")) s.stats.lane = (s.stats.lane + 1) % 12;
  if (tap(i, " ")) s.stats.jump = 0.75;
  s.stats.jump = Math.max(0, (s.stats.jump || 0) - dt);
  const tile = Math.floor(s.stats.distance),
    lane = s.stats.lane;
  if (tile !== s.stats.lastTile) {
    s.stats.lastTile = tile;
    const hole = (tile * 7 + s.level * 3) % 12;
    if ((lane === hole || lane === (hole + 1) % 12) && s.stats.jump <= 0)
      damage(s);
    else s.score += 10;
  }
  s.message =
    "Left/right rotate around the tunnel. Space jumps the missing tiles.";
  if (s.stats.distance > 70 + s.level * 15) advance(s);
}
function setupShooter(s: World) {
  s.width = CW;
  s.player = body(450, 350, 30, 30, "sucuk");
  s.stats.wave = 1;
  s.stats.defense = 100;
  s.stats.day = 1;
  s.stats.survivors = 0;
  s.stats.weapon = 1;
  s.stats.supplies = 0;
  spawnEnemies(s);
  if (s.variant === "last-stand") {
    s.player.x = 130;
    s.platforms = [body(190, 0, 25, 540, "barricade")];
  }
}
function spawnEnemies(s: World) {
  s.objects = Array.from({ length: 4 + (s.stats.wave || 1) * 2 }, (_, n) => {
    const e = body(
      s.variant === "last-stand" ? 800 + n * 55 : 80 + (n % 4) * 220,
      70 + Math.floor(n / 4) * 100,
      28,
      28,
      n % 4 === 0 ? "tank" : "enemy",
    );
    e.hp = e.kind === "tank" ? 4 : 2;
    return e;
  });
  if (s.variant === "binding-of-isaac") {
    s.platforms = [body(300, 210, 55, 80), body(600, 210, 55, 80)];
  }
  if (s.variant === "boxhead")
    s.platforms = [
      body(300, 180, 38, 38, "barrel"),
      body(620, 320, 38, 38, "barrel"),
    ];
}
function stepShooter(s: World, i: Controls, dt: number) {
  const p = s.player;
  const oldX = p.x,
    oldY = p.y;
  if (s.phase === "day") {
    s.message =
      "Daylight: E searches for supplies; X repairs the blanket fort. Space starts the next night.";
    if (tap(i, "e")) {
      s.stats.supplies += 1;
      s.stats.survivors += 1;
      s.score += 50;
    }
    if (tap(i, "x")) {
      s.stats.defense = Math.min(100, s.stats.defense + 25);
    }
    if (tap(i, " ")) {
      s.phase = "play";
      s.stats.wave++;
      spawnEnemies(s);
    }
    return;
  }
  p.x = clamp(
    p.x +
      (Number(has(i, "ArrowRight", "d")) - Number(has(i, "ArrowLeft", "a"))) *
        230 *
        dt,
    20,
    s.variant === "last-stand" ? 160 : 910,
  );
  p.y = clamp(
    p.y +
      (Number(has(i, "ArrowDown", "s")) - Number(has(i, "ArrowUp", "w"))) *
        230 *
        dt,
    20,
    490,
  );
  if (
    s.platforms.some(
      (o) => o.kind !== "barrel" && o.kind !== "barricade" && hits(p, o),
    )
  ) {
    p.x = oldX;
    p.y = oldY;
  }
  if ((has(i, " ", "x") || i.pointer?.down) && s.cooldown <= 0) {
    const target = i.pointer ||
      s.objects.find((o) => o.active) || { x: 900, y: p.y };
    const a = Math.atan2(target.y - p.y, target.x - p.x);
    for (let n = 0; n < (s.stats.weapon >= 3 ? 3 : 1); n++) {
      const angle = a + (n - 1) * (s.stats.weapon >= 3 ? 0.13 : 0);
      const shot = body(p.x + 15, p.y + 15, 9, 9, "paw");
      shot.vx = Math.cos(angle) * 600;
      shot.vy = Math.sin(angle) * 600;
      s.shots.push(shot);
    }
    s.cooldown = 0.2;
  }
  if (tap(i, "e") && s.variant !== "last-stand") {
    s.objects.forEach((o) => {
      if (Math.hypot(o.x - p.x, o.y - p.y) < 150) {
        o.hp -= 3;
        if (o.hp <= 0) {
          o.active = false;
          s.score += 50;
        }
      }
    });
    if (s.variant === "sas-zombie-assault") s.lives = Math.min(5, s.lives + 1);
  }
  for (const o of s.objects) {
    if (!o.active) continue;
    const a = Math.atan2(p.y - o.y, p.x - o.x);
    const speed = o.kind === "tank" ? 35 : 70 + (s.stats.wave || 1) * 8;
    o.x += (s.variant === "last-stand" ? -1 : Math.cos(a)) * speed * dt;
    o.y += (s.variant === "last-stand" ? 0 : Math.sin(a)) * speed * dt;
    if (hits(p, o)) damage(s);
    if (s.variant === "last-stand" && o.x < 210) {
      s.stats.defense -= dt * 15;
      o.x = 212;
      if (s.stats.defense <= 0)
        finishWorld(
          s,
          false,
          "The blanket fort fell. Try a different day plan.",
        );
    }
  }
  for (const shot of s.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    for (const o of s.objects)
      if (hits(shot, o)) {
        shot.active = false;
        o.hp--;
        if (o.hp <= 0) {
          o.active = false;
          s.score += 50;
          if (Math.random() < 0.3)
            s.coins.push(
              body(o.x, o.y, 16, 16, Math.random() < 0.5 ? "heart" : "upgrade"),
            );
        }
      }
    for (const wall of s.platforms)
      if (hits(shot, wall) && wall.kind === "barrel") {
        shot.active = false;
        wall.active = false;
        s.objects.forEach((o) => {
          if (Math.hypot(o.x - wall.x, o.y - wall.y) < 180) {
            o.active = false;
            s.score += 50;
          }
        });
      }
  }
  s.shots = s.shots.filter(
    (o) => o.active && o.x > 0 && o.x < CW && o.y > 0 && o.y < CH,
  );
  s.coins.forEach((o) => {
    if (hits(p, o)) {
      o.active = false;
      if (o.kind === "heart") s.lives = Math.min(6, s.lives + 1);
      else s.stats.weapon++;
      s.score += 25;
    }
  });
  s.coins = s.coins.filter((o) => o.active);
  if (s.objects.every((o) => !o.active)) {
    if (s.stats.wave >= 5) {
      finishWorld(s, true, "Five rooms secured. The cats can finally nap.");
    } else if (s.variant === "last-stand") {
      s.phase = "day";
      s.stats.day++;
    } else {
      s.stats.wave++;
      s.lives = Math.min(5, s.lives + 1);
      spawnEnemies(s);
      s.message = `Room ${s.stats.wave}. New toys incoming.`;
    }
  }
}
function setupArtillery(s: World) {
  s.width = CW;
  s.player = body(95, 400, 34, 34, "sucuk");
  s.ally = body(800, 400, 34, 34, "miso");
  s.ally.hp = 3;
  s.player.hp = 3;
  s.stats.wind = random(-20, 20);
  s.stats.ammo = 6;
  s.stats.movement = 90;
  s.stats.swing = 0;
  s.platforms = [body(0, 450, 960, 90)];
  if (s.variant === "crush-castle") {
    s.objects = Array.from({ length: 12 }, (_, n) =>
      body(650 + (n % 3) * 36, 430 - Math.floor(n / 3) * 42, 32, 40, "castle"),
    );
    s.ally.active = false;
  } else if (s.variant === "territory-war")
    s.objects = [
      body(750, 400, 30, 34, "miso"),
      body(820, 400, 30, 34, "pepper"),
      body(880, 400, 30, 34, "luna"),
    ];
}
export function worldCommand(s: World, command: string, value?: number) {
  if (s.over) return;
  if (command === "angle") s.aim.angle = clamp(value || 45, 10, 85);
  if (command === "power") s.aim.power = clamp(value || 50, 20, 100);
  if (
    command === "fire" &&
    s.mode === "artillery" &&
    s.shots.length === 0 &&
    s.turn === 0
  ) {
    if (s.variant === "crush-castle" && s.stats.swing === 0) {
      s.stats.swing = 1;
      return;
    }
    fire(s, false);
    s.stats.swing = 0;
  }
  if (command === "nudge") {
    s.points.forEach((p, n) => {
      p.ox -= n % 2 ? 6 : -6;
    });
    s.score += 10;
  }
  if (command === "treat") {
    s.objects.push({ ...body(random(100, 850), 50, 20, 20, "treat"), vy: 0 });
    s.score += 25;
  }
  if (command === "finish")
    finishWorld(s, true, "A very good afternoon with Sucuk.");
  if (command === "launch" && s.mode === "life") {
    s.phase = "flight";
    s.player = body(50, 350, 32, 32, "sucuk");
    s.player.vx = 180 + (s.stats.engine || 0) * 55;
    s.player.vy = -160 - (s.stats.glider || 0) * 25;
    s.stats.fuel = 3 + (s.stats.engine || 0);
  }
  if (command === "glider" || command === "engine") {
    const cost = 50 + (s.stats[command] || 0) * 50;
    if ((s.stats.money || 0) >= cost) {
      s.stats.money -= cost;
      s.stats[command] = (s.stats[command] || 0) + 1;
      s.message = `${command} upgraded.`;
    } else s.message = `You need ${cost} treats for that upgrade.`;
  }
  if (command === "sell" && s.variant === "motherload" && s.player.y < 100) {
    s.stats.money += (s.stats.cargo || 0) * 15;
    s.score += (s.stats.cargo || 0) * 15;
    s.stats.cargo = 0;
    s.stats.fuel = 100;
    s.message = "Cargo sold, fuel refilled.";
  }
  if (command === "train") {
    s.stats.training = (s.stats.training || 0) + 1;
    s.phase = "train";
    s.player.y = 400;
    s.player.vy = 0;
    s.spawn = 0.5;
    s.time = 0;
    s.objects = [];
  }
  if (command === "race" && s.variant === "duck-life") {
    s.phase = "race";
    s.player.x = 30;
    s.ally.x = 30;
    s.time = 0;
  }
}
function fire(s: World, enemy: boolean) {
  const from = enemy ? s.ally : s.player;
  const angle = enemy ? random(35, 65) : s.aim.angle;
  const power = enemy
    ? clamp(
        Math.sqrt(
          (Math.abs(s.ally.x - s.player.x) * 350) /
            Math.sin((angle * Math.PI) / 90),
        ) /
          6 +
          random(-5, 5),
        20,
        100,
      )
    : s.aim.power;
  const shot = body(from.x + 15, from.y - 5, 12, 12, "projectile");
  shot.vx = Math.cos((angle * Math.PI) / 180) * (power * 6) * (enemy ? -1 : 1);
  shot.vy = -Math.sin((angle * Math.PI) / 180) * power * 6;
  s.shots = [shot];
  s.stats.ammo--;
}
function stepArtillery(s: World, dt: number) {
  for (const block of s.objects)
    if (
      block.kind === "castle" &&
      block.active &&
      !block.tag &&
      block.y + block.h < 465
    ) {
      const supported = s.objects.some(
        (other) =>
          other !== block &&
          other.active &&
          !other.tag &&
          Math.abs(other.x - block.x) < 25 &&
          other.y > block.y &&
          other.y - (block.y + block.h) < 5,
      );
      if (!supported) {
        block.tag = 1;
        block.vy = 0;
      }
    }
  if (s.stats.swing) s.aim.angle = 20 + (Math.sin(s.time * 3) + 1) * 30;
  for (const shot of s.shots) {
    shot.vx += s.stats.wind * dt;
    shot.vy += 350 * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (s.variant === "crush-castle") {
      for (const o of s.objects)
        if (hits(o, shot)) {
          o.vx = shot.vx * 0.45;
          o.vy = -80;
          o.tag = 1;
          shot.active = false;
          s.score += 50;
        }
    } else {
      const targets =
        s.turn === 0
          ? s.variant === "territory-war"
            ? s.objects
            : [s.ally]
          : [s.player];
      for (const o of targets)
        if (hits(o, shot)) {
          o.hp--;
          shot.active = false;
          s.score += s.turn === 0 ? 100 : 0;
          if (o.hp <= 0) o.active = false;
        }
    }
    if (shot.y > 450 || shot.x < 0 || shot.x > 960) shot.active = false;
  }
  for (const o of s.objects)
    if (o.active && o.kind === "castle" && o.tag) {
      o.vy += 450 * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (o.y > 450) {
        o.active = false;
        s.score += 50;
      }
      for (const other of s.objects)
        if (other !== o && other.active && hits(o, other)) {
          other.tag = 1;
          other.vx = o.vx * 0.7;
        }
    }
  if (s.shots.some((o) => !o.active)) {
    s.shots = [];
    if (s.variant === "crush-castle") {
      if (s.stats.ammo <= 0) s.stats.outOfAmmoAt = s.time + 1;
    } else {
      s.turn = 1 - s.turn;
      s.cooldown = 0.8;
    }
  }
  if (
    s.variant === "crush-castle" &&
    s.objects.every((o) => !o.active || o.tag)
  ) {
    finishWorld(s, true, "The cardboard castle has tumbled!");
  }
  if (s.stats.outOfAmmoAt && s.time > s.stats.outOfAmmoAt && !s.over)
    finishWorld(s, false, "Out of yarn. Try a different release angle.");
  if (
    s.variant !== "crush-castle" &&
    ((s.variant === "territory-war" && s.objects.every((o) => !o.active)) ||
      !s.ally.active)
  )
    finishWorld(s, true, "Sucuk wins the yarn duel!");
  if (!s.player.active)
    finishWorld(s, false, "Miso wins this one. Try another angle.");
  if (s.turn === 1 && s.shots.length === 0 && s.cooldown <= 0) fire(s, true);
}
function setupPhysics(s: World) {
  s.width = s.variant === "interactive-buddy" ? CW : 2000;
  s.points = [
    { x: 160, y: 290 },
    { x: 160, y: 340 },
    { x: 135, y: 380 },
    { x: 120, y: 430 },
    { x: 185, y: 380 },
    { x: 200, y: 430 },
    { x: 125, y: 330 },
    { x: 195, y: 330 },
  ].map((p) => ({ ...p, ox: p.x, oy: p.y, radius: 10 }));
  s.joints = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [1, 6],
    [1, 7],
  ].map(([a, b]) => ({
    a,
    b,
    length: Math.hypot(
      s.points[a].x - s.points[b].x,
      s.points[a].y - s.points[b].y,
    ),
  }));
  if (s.variant === "happy-wheels") {
    s.points.push(
      { x: 120, y: 460, ox: 120, oy: 460, radius: 17 },
      { x: 205, y: 460, ox: 205, oy: 460, radius: 17 },
    );
    s.joints.push(
      { a: 8, b: 9, length: 85 },
      { a: 1, b: 8, length: 75 },
      { a: 1, b: 9, length: 75 },
    );
    s.objects = [
      body(450, 425, 80, 55, "box"),
      body(850, 410, 60, 70, "box"),
      body(1250, 435, 90, 45, "box"),
    ];
  }
  s.stats.distance = 0;
  s.stats.fun = 0;
}
function stepPhysics(s: World, i: Controls, dt: number) {
  const factor = dt * 60;
  if (s.variant === "interactive-buddy" && i.pointer?.down) {
    const p = s.points.reduce((best, p) =>
      Math.hypot(p.x - i.pointer!.x, p.y - i.pointer!.y) <
      Math.hypot(best.x - i.pointer!.x, best.y - i.pointer!.y)
        ? p
        : best,
    );
    p.x = i.pointer.x;
    p.y = i.pointer.y;
    s.score += 1;
  }
  for (const p of s.points) {
    const vx = (p.x - p.ox) * 0.995,
      vy = (p.y - p.oy) * 0.995;
    p.ox = p.x;
    p.oy = p.y;
    p.x += vx * factor;
    p.y += vy * factor + 0.38 * factor * factor;
    if (p.y > 480 - p.radius) {
      p.y = 480 - p.radius;
      p.oy = p.y + vy * 0.12;
      p.ox = p.x - vx * 0.7;
    }
    if (p.x < 10) {
      p.x = 10;
      p.ox = p.x;
    }
    if (s.variant === "interactive-buddy" && p.x > 950) p.x = 950;
  }
  if (s.variant === "happy-wheels") {
    const drive =
      Number(has(i, "ArrowRight", "d")) - Number(has(i, "ArrowLeft", "a"));
    s.points[8].x += drive * 2.2 * factor;
    s.points[9].x += drive * 2.2 * factor;
    if (has(i, "ArrowUp", "w")) s.points[0].x -= 1.2 * factor;
    if (has(i, "ArrowDown", "s")) s.points[0].x += 1.2 * factor;
  }
  if (s.variant === "qwop") {
    // Soft posture support lets coordinated steps balance the cat, while the
    // four independently driven leg segments can still topple the body.
    s.points[0].y += (s.points[1].y - 50 - s.points[0].y) * 0.045 * factor;
    const angles = [
      has(i, "q") ? -0.12 : has(i, "w") ? 0.12 : 0,
      has(i, "o") ? -0.12 : has(i, "p") ? 0.12 : 0,
    ];
    for (const [index, a] of angles.entries()) {
      const hip = s.points[1],
        knee = s.points[index ? 4 : 2],
        foot = s.points[index ? 5 : 3];
      knee.x += Math.cos(a) * a * 30 * factor;
      foot.x -= a * 25 * factor;
      if (foot.y > 455) hip.x += a * (index ? -18 : 18) * factor;
    }
  }
  for (let iteration = 0; iteration < 8; iteration++)
    for (const j of s.joints) {
      const a = s.points[j.a],
        b = s.points[j.b],
        dx = b.x - a.x,
        dy = b.y - a.y,
        dist = Math.max(0.001, Math.hypot(dx, dy)),
        offset = ((dist - j.length) / dist) * 0.5;
      a.x += dx * offset;
      a.y += dy * offset;
      b.x -= dx * offset;
      b.y -= dy * offset;
    }
  if (s.variant === "happy-wheels")
    for (const obstacle of s.objects)
      for (const p of s.points)
        if (
          p.x > obstacle.x - p.radius &&
          p.x < obstacle.x + obstacle.w + p.radius &&
          p.y > obstacle.y - p.radius
        ) {
          p.y = obstacle.y - p.radius;
          p.oy = p.y + 1;
        }
  const head = s.points[0];
  s.player.x = head.x;
  s.player.y = head.y;
  s.stats.distance = Math.max(s.stats.distance, head.x - 160);
  s.camera = clamp(head.x - 240, 0, s.width - CW);
  if (s.variant !== "interactive-buddy") {
    s.score = Math.floor(s.stats.distance);
    if (head.y > 457) {
      finishWorld(
        s,
        false,
        "Sucuk took a tumble. The paws need a different rhythm.",
      );
    }
    if (s.stats.distance > 1000)
      finishWorld(s, true, "A thousand paw-steps! Sucuk made it.");
  } else {
    for (const o of s.objects) {
      o.vy += 300 * dt;
      o.y += o.vy * dt;
      if (o.y > 450) o.y = 450;
      if (Math.hypot(o.x - head.x, o.y - head.y) < 60) {
        o.active = false;
        s.score += 50;
      }
    }
    s.objects = s.objects.filter((o) => o.active);
  }
}
function setupLife(s: World) {
  s.stats.money = 100;
  s.stats.glider = 0;
  s.stats.engine = 0;
  s.stats.best = 0;
  s.stats.fuel = 100;
  s.stats.cargo = 0;
  s.stats.skill = 1;
  s.phase =
    s.variant === "learn-to-fly"
      ? "shop"
      : s.variant === "duck-life"
        ? "academy"
        : "play";
  s.width = 3000;
  if (s.variant === "motherload") {
    s.player = body(70, 40, 28, 28, "drill");
    s.width = CW;
    s.objects = Array.from({ length: 20 * 14 }, (_, n) =>
      body(
        10 + (n % 20) * 46,
        100 + Math.floor(n / 20) * 30,
        44,
        28,
        n % 11 === 0 ? "ore" : n % 17 === 0 ? "rock" : "soil",
      ),
    );
    s.stats.depth = 0;
  }
}
function stepLife(s: World, i: Controls, dt: number) {
  const p = s.player;
  if (s.variant === "learn-to-fly") {
    if (s.phase !== "flight") return;
    const pitch =
      Number(has(i, "ArrowUp", "w")) - Number(has(i, "ArrowDown", "s"));
    p.vy += (90 - s.stats.glider * 12 - pitch * 55) * dt;
    p.vx = Math.max(40, p.vx - (8 + Math.abs(pitch) * 4) * dt);
    if (has(i, " ", "x") && s.stats.fuel > 0) {
      p.vx += 110 * dt;
      p.vy -= 30 * dt;
      s.stats.fuel -= dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    s.camera = clamp(p.x - 230, 0, 10000);
    if (p.y > 450) {
      const distance = Math.floor(p.x);
      s.stats.best = Math.max(s.stats.best, distance);
      s.stats.money += Math.floor(distance / 5);
      s.score = s.stats.best;
      s.phase = "shop";
      s.camera = 0;
      s.message = `Flight: ${distance}m. Spend treats on a glider or booster.`;
      if (distance > 1500)
        finishWorld(s, true, "Sucuk learned to fly beyond the garden!");
    }
  }
  if (s.variant === "motherload") {
    const dx =
        Number(has(i, "ArrowRight", "d")) - Number(has(i, "ArrowLeft", "a")),
      dy = Number(has(i, "ArrowDown", "s")) - Number(has(i, "ArrowUp", "w"));
    p.x = clamp(p.x + dx * 95 * dt, 10, 900);
    p.y = clamp(p.y + dy * 95 * dt, 25, 490);
    s.stats.fuel -= Math.abs(dx + dy) * dt * 2;
    for (const tile of s.objects)
      if (tile.active && hits(p, tile)) {
        if (tile.kind === "rock" && s.stats.engine < 1) {
          p.x -= dx * 95 * dt;
          p.y -= dy * 95 * dt;
          s.message = "Rock needs an engine upgrade.";
        } else {
          tile.active = false;
          if (tile.kind === "ore") {
            s.stats.cargo++;
            s.score += 20;
          }
          s.stats.depth = Math.max(s.stats.depth, Math.floor(tile.y));
        }
      }
    if (s.stats.fuel <= 0)
      finishWorld(s, false, "Out of fuel. Return to the surface more often.");
    if (s.stats.depth >= 460 && s.stats.cargo >= 3)
      finishWorld(
        s,
        true,
        "The deep treat seam is yours. Mining expedition complete.",
      );
  }
  if (s.variant === "duck-life") {
    if (s.phase === "train") {
      if (tap(i, " ", "ArrowUp", "w") && p.y >= 399) p.vy = -420;
      p.vy += 1000 * dt;
      p.y = Math.min(400, p.y + p.vy * dt);
      if (s.spawn <= 0) {
        const o = body(960, 405, 26, 28, "cone");
        o.vx = -260;
        s.objects.push(o);
        s.spawn = 1.3;
      }
      s.objects.forEach((o) => {
        o.x += o.vx * dt;
        if (hits(p, o)) {
          s.phase = "academy";
          s.message =
            "Training complete. Spend a little time practising before racing.";
        }
        if (o.x < 0 && o.active) {
          o.active = false;
          s.stats.skill++;
          s.score += 25;
        }
      });
      s.objects = s.objects.filter((o) => o.x > -40);
      if (s.time > 20) {
        s.phase = "academy";
        s.message = "A full training session! Time to race.";
      }
    } else if (s.phase === "race") {
      p.x += (70 + s.stats.skill * 15) * dt;
      s.ally.x += 110 * dt;
      if (p.x > 850)
        finishWorld(s, true, "Sucuk wins the kitten championship!");
      else if (s.ally.x > 850) {
        s.phase = "academy";
        s.message = "Luna won. More training will improve your speed.";
      }
    }
  }
}
