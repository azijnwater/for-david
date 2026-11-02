import type { ActionId } from "./catalog";

export const WIDTH = 720;
export const HEIGHT = 440;
type Point = { x: number; y: number };
type Object2D = Point & {
  w: number;
  h: number;
  vx: number;
  vy: number;
  kind?: string;
};
export type Input = {
  held: Set<string>;
  pressed: Set<string>;
  pointer: Point | null;
  action: boolean;
};
export type ArcadeState = {
  id: ActionId;
  score: number;
  lives: number;
  time: number;
  timer: number;
  elapsed: number;
  over: boolean;
  won: boolean;
  player: Object2D;
  ball: Object2D;
  objects: Object2D[];
  shots: Object2D[];
  tail: Point[];
  food: Point;
  dx: number;
  dy: number;
  nx: number;
  ny: number;
  cooldown: number;
  spawn: number;
  wave: number;
  enemy: number;
  message: string;
};
const object = (
  x: number,
  y: number,
  w = 24,
  h = 24,
  vx = 0,
  vy = 0,
): Object2D => ({ x, y, w, h, vx, vy });
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const random = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
export const overlaps = (a: Object2D, b: Object2D) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function yarn(s: ArcadeState) {
  const free: Point[] = [];
  for (let y = 0; y < 22; y++)
    for (let x = 0; x < 36; x++)
      if (!s.tail.some((p) => p.x === x && p.y === y)) free.push({ x, y });
  if (!free.length) {
    s.over = true;
    s.won = true;
    s.message = "Every last ball of yarn. Incredible.";
    return;
  }
  s.food = free[Math.floor(Math.random() * free.length)];
}
function bricks(s: ArcadeState) {
  s.objects = Array.from({ length: 40 }, (_, i) =>
    object(35 + (i % 8) * 82, 40 + Math.floor(i / 8) * 30, 74, 22),
  );
}
function feathers(s: ArcadeState) {
  s.objects = Array.from({ length: 24 }, (_, i) =>
    object(
      65 + (i % 8) * 70,
      36 + Math.floor(i / 8) * 42,
      30,
      26,
      35 + s.wave * 9,
      0,
    ),
  );
}
function traffic(s: ArcadeState) {
  s.objects = Array.from({ length: 12 }, (_, i) => {
    const lane = Math.floor(i / 3);
    return object(
      (i % 3) * 270 + lane * 50,
      66 + lane * 66,
      66,
      38,
      (lane % 2 ? -1 : 1) * (95 + lane * 30 + s.wave * 8),
    );
  });
}
export function createGame(id: ActionId): ArcadeState {
  const s: ArcadeState = {
    id,
    score: 0,
    lives: 3,
    time: id === "catcher" ? 45 : 0,
    timer: 0,
    elapsed: 0,
    over: false,
    won: false,
    player: object(320, 388, 90, 16),
    ball: object(350, 300, 14, 14, 200, -230),
    objects: [],
    shots: [],
    tail: [
      { x: 10, y: 11 },
      { x: 9, y: 11 },
      { x: 8, y: 11 },
    ],
    food: { x: 20, y: 11 },
    dx: 1,
    dy: 0,
    nx: 1,
    ny: 0,
    cooldown: 0,
    spawn: 0,
    wave: 1,
    enemy: 0,
    message: "",
  };
  if (id === "snake") yarn(s);
  if (id === "breakout") bricks(s);
  if (id === "pong") {
    s.player = object(24, 170, 14, 90);
    s.ball = object(352, 210, 16, 16, -260, 130);
  }
  if (id === "invaders") {
    s.player = object(340, 380, 38, 36);
    feathers(s);
  }
  if (id === "flappy") {
    s.player = object(150, 190, 34, 34);
    s.spawn = 0.8;
    s.lives = 1;
  }
  if (id === "runner") {
    s.player = object(100, 330, 40, 40);
    s.spawn = 1.2;
    s.lives = 1;
  }
  if (id === "catcher") s.player = object(320, 375, 80, 38);
  if (id === "frogger") {
    s.player = object(342, 393, 30, 30);
    traffic(s);
  }
  return s;
}
const left = (i: Input) => i.held.has("ArrowLeft") || i.held.has("a");
const right = (i: Input) => i.held.has("ArrowRight") || i.held.has("d");
const up = (i: Input) => i.held.has("ArrowUp") || i.held.has("w");
const down = (i: Input) => i.held.has("ArrowDown") || i.held.has("s");
const pressed = (i: Input, ...keys: string[]) =>
  keys.some((key) => i.pressed.has(key));

function finish(s: ArcadeState, won: boolean, message: string) {
  s.over = true;
  s.won = won;
  s.message = message;
}
function lose(s: ArcadeState) {
  s.lives--;
  if (s.lives <= 0) finish(s, false, "Time for a nap. Fancy another round?");
}
export function step(s: ArcadeState, i: Input, dt: number) {
  if (s.over) return;
  dt = Math.min(dt, 0.035);
  s.elapsed += dt;
  s.timer += dt;
  s.cooldown -= dt;
  s.spawn -= dt;
  const p = s.player;
  const action = i.action || pressed(i, " ", "ArrowUp", "w");
  if (s.id === "snake") {
    if (pressed(i, "ArrowLeft", "a") && s.dx !== 1) {
      s.nx = -1;
      s.ny = 0;
    } else if (pressed(i, "ArrowRight", "d") && s.dx !== -1) {
      s.nx = 1;
      s.ny = 0;
    } else if (pressed(i, "ArrowUp", "w") && s.dy !== 1) {
      s.nx = 0;
      s.ny = -1;
    } else if (pressed(i, "ArrowDown", "s") && s.dy !== -1) {
      s.nx = 0;
      s.ny = 1;
    }
    if (s.timer > Math.max(0.065, 0.145 - s.score * 0.0007)) {
      s.timer = 0;
      s.dx = s.nx;
      s.dy = s.ny;
      const head = { x: s.tail[0].x + s.dx, y: s.tail[0].y + s.dy };
      const eating = head.x === s.food.x && head.y === s.food.y;
      if (
        head.x < 0 ||
        head.x >= 36 ||
        head.y < 0 ||
        head.y >= 22 ||
        s.tail
          .slice(0, eating ? undefined : -1)
          .some((t) => t.x === head.x && t.y === head.y)
      ) {
        finish(s, false, "A very tangled tail. Try a new trail.");
        return;
      }
      s.tail.unshift(head);
      if (eating) {
        s.score += 10;
        yarn(s);
      } else s.tail.pop();
    }
  }
  if (["breakout", "invaders", "catcher"].includes(s.id)) {
    p.x = i.pointer
      ? clamp(i.pointer.x - p.w / 2, 0, WIDTH - p.w)
      : clamp(
          p.x + (Number(right(i)) - Number(left(i))) * 420 * dt,
          0,
          WIDTH - p.w,
        );
  }
  if (s.id === "breakout") {
    const b = s.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x <= 0 || b.x >= WIDTH - b.w) {
      b.vx *= -1;
      b.x = clamp(b.x, 0, WIDTH - b.w);
    }
    if (b.y <= 0) {
      b.vy = Math.abs(b.vy);
      b.y = 0;
    }
    if (b.vy > 0 && overlaps(b, p)) {
      b.y = p.y - b.h;
      b.vy = -Math.abs(b.vy);
      b.vx = ((b.x + b.w / 2 - p.x) / p.w - 0.5) * 480;
    }
    const hit = s.objects.findIndex((o) => overlaps(b, o));
    if (hit >= 0) {
      s.objects.splice(hit, 1);
      s.score += 10;
      b.vy *= -1;
      b.y += b.vy * dt;
    }
    if (b.y > HEIGHT) {
      lose(s);
      s.ball = object(p.x + 35, 300, 14, 14, 180, -240);
    }
    if (!s.objects.length)
      finish(s, true, "Every shelf cleared. The household is impressed.");
  }
  if (s.id === "pong") {
    const b = s.ball;
    p.y = i.pointer
      ? clamp(i.pointer.y - p.h / 2, 0, HEIGHT - p.h)
      : clamp(
          p.y + (Number(down(i)) - Number(up(i))) * 390 * dt,
          0,
          HEIGHT - p.h,
        );
    s.food.y = clamp(
      s.food.y + Math.sign(b.y - (s.food.y + 45)) * 185 * dt,
      0,
      HEIGHT - 90,
    );
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y <= 0 || b.y >= HEIGHT - b.h) {
      b.vy *= -1;
      b.y = clamp(b.y, 0, HEIGHT - b.h);
    }
    const ai = object(682, s.food.y, 14, 90);
    if (b.vx < 0 && overlaps(b, p)) {
      b.x = p.x + p.w;
      b.vx = Math.min(520, Math.abs(b.vx) * 1.05);
      b.vy = (b.y + 8 - p.y - 45) * 6;
    }
    if (b.vx > 0 && overlaps(b, ai)) {
      b.x = ai.x - b.w;
      b.vx = -Math.abs(b.vx);
    }
    if (b.x < -20 || b.x > WIDTH + 20) {
      if (b.x > WIDTH) s.score++;
      else s.enemy++;
      s.ball = object(
        352,
        210,
        16,
        16,
        b.x > WIDTH ? -260 : 260,
        random(-170, 170),
      );
      if (s.score >= 7 || s.enemy >= 7)
        finish(
          s,
          s.score >= 7,
          s.score >= 7
            ? "Seven points. Sucuk takes the trophy."
            : "The cushion wins this one. Rematch?",
        );
    }
    if (!s.over) s.message = `Sucuk ${s.score} : ${s.enemy} Cushion`;
  }
  if (s.id === "invaders") {
    if ((i.held.has(" ") || i.action) && s.cooldown <= 0) {
      s.shots.push(object(p.x + 16, p.y, 6, 14, 0, -420));
      s.cooldown = 0.22;
    }
    let edge = false;
    for (const o of s.objects) {
      o.x += o.vx * dt;
      if (o.x < 8 || o.x + o.w > WIDTH - 8) edge = true;
    }
    if (edge)
      for (const o of s.objects) {
        o.vx *= -1;
        o.x = clamp(o.x, 8, WIDTH - o.w - 8);
        o.y += 22;
      }
    if (s.spawn <= 0 && s.objects.length) {
      const o = s.objects[Math.floor(Math.random() * s.objects.length)];
      s.shots.push({
        ...object(o.x + 12, o.y + 20, 8, 16, 0, 150 + s.wave * 25),
        kind: "enemy",
      });
      s.spawn = 0.7;
    }
    for (const shot of s.shots) {
      shot.y += shot.vy * dt;
      if (shot.kind === "enemy") {
        if (overlaps(shot, p)) {
          shot.y = HEIGHT + 50;
          lose(s);
          if (s.over) return;
        }
      } else {
        const index = s.objects.findIndex((o) => overlaps(o, shot));
        if (index >= 0) {
          s.objects.splice(index, 1);
          s.score += 10;
          shot.y = -50;
        }
      }
    }
    s.shots = s.shots.filter((o) => o.y > -20 && o.y < HEIGHT + 20);
    if (s.objects.some((o) => o.y + o.h >= p.y))
      finish(s, false, "The feathers have claimed the room.");
    if (!s.objects.length) {
      if (s.wave === 3)
        finish(s, true, "All three waves cleared. Living room secured.");
      else {
        s.wave++;
        s.shots = [];
        feathers(s);
      }
    }
  }
  if (s.id === "flappy") {
    if (action) p.vy = -255;
    p.vy += 720 * dt;
    p.y += p.vy * dt;
    if (s.spawn <= 0) {
      const gap = random(65, 235);
      s.objects.push(
        object(WIDTH, 0, 65, gap, -185),
        object(WIDTH, gap + 155, 65, HEIGHT - gap - 155, -185),
      );
      s.spawn = 1.75;
    }
    for (const o of s.objects) {
      o.x += o.vx * dt;
      if (!o.kind && o.y === 0 && o.x + o.w < p.x) {
        o.kind = "scored";
        s.score++;
      }
    }
    s.objects = s.objects.filter((o) => o.x > -80);
    if (p.y < 0 || p.y + p.h > HEIGHT || s.objects.some((o) => overlaps(o, p)))
      finish(s, false, "A soft landing. Give those wings another go.");
  }
  if (s.id === "runner") {
    if (action && p.y >= 329.9) p.vy = -490;
    p.vy += 1200 * dt;
    p.y = Math.min(330, p.y + p.vy * dt);
    if (p.y === 330) p.vy = 0;
    if (s.spawn <= 0) {
      s.objects.push(
        object(
          WIDTH,
          330,
          random(26, 45),
          40,
          -Math.min(470, 240 + s.elapsed * 3),
        ),
      );
      s.spawn = random(1.05, 1.7);
    }
    for (const o of s.objects) o.x += o.vx * dt;
    s.objects = s.objects.filter((o) => o.x > -60);
    s.score = Math.floor(s.elapsed * 10);
    const body = { ...p, x: p.x + 6, y: p.y + 6, w: p.w - 12, h: p.h - 8 };
    if (s.objects.some((o) => overlaps(o, body)))
      finish(s, false, "Box encountered. Zoomies temporarily postponed.");
  }
  if (s.id === "catcher") {
    s.time = Math.max(0, 45 - s.elapsed);
    if (s.spawn <= 0) {
      s.objects.push({
        ...object(random(20, 675), -30, 25, 25, 0, random(115, 210)),
        kind: Math.random() > 0.25 ? "treat" : "cucumber",
      });
      s.spawn = 0.38;
    }
    for (const o of s.objects) {
      o.y += o.vy * dt;
      if (overlaps(p, o)) {
        if (o.kind === "treat") s.score += 10;
        else lose(s);
        o.y = HEIGHT + 100;
      }
    }
    s.objects = s.objects.filter((o) => o.y < HEIGHT + 40);
    if (s.time <= 0 && !s.over)
      finish(s, true, "Snack time complete. A very respectable haul.");
  }
  if (s.id === "frogger") {
    if (s.cooldown <= 0) {
      if (pressed(i, "ArrowUp", "w")) p.y -= 66;
      else if (pressed(i, "ArrowDown", "s")) p.y += 66;
      else if (pressed(i, "ArrowLeft", "a")) p.x -= 48;
      else if (pressed(i, "ArrowRight", "d")) p.x += 48;
      p.x = clamp(p.x, 6, WIDTH - p.w - 6);
      p.y = clamp(p.y, -3, 393);
    }
    for (const o of s.objects) {
      o.x += o.vx * dt;
      if (o.x > WIDTH + 90) o.x = -90;
      if (o.x < -100) o.x = WIDTH + 80;
    }
    if (s.cooldown <= 0 && s.objects.some((o) => overlaps(o, p))) {
      lose(s);
      p.x = 342;
      p.y = 393;
      s.cooldown = 0.6;
    }
    if (p.y < 50) {
      s.score += 100;
      s.wave++;
      p.x = 342;
      p.y = 393;
      s.cooldown = 0.3;
      if (s.wave > 5)
        finish(s, true, "Five sofa visits. Officially the comfiest cat.");
      else traffic(s);
    }
  }
}

const colors = {
  ink: "#25235e",
  pink: "#f9dde8",
  cream: "#fff8f3",
  amber: "#ffb21f",
  fur: "#8f9bb9",
  green: "#4f7652",
};
function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  radius = 5,
) {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, radius);
  c.fill();
}
export function drawCat(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  c.save();
  c.translate(x, y);
  c.scale(size / 40, size / 40);
  c.fillStyle = colors.fur;
  c.beginPath();
  c.moveTo(2, 20);
  c.lineTo(3, 0);
  c.lineTo(16, 9);
  c.lineTo(27, 9);
  c.lineTo(37, 0);
  c.lineTo(39, 22);
  c.fill();
  c.beginPath();
  c.ellipse(20, 24, 20, 16, 0, 0, Math.PI * 2);
  c.fill();
  for (const ex of [12, 28]) {
    c.fillStyle = colors.amber;
    c.beginPath();
    c.arc(ex, 23, 5, 0, Math.PI * 2);
    c.fill();
    rect(c, ex - 1, 20, 2, 6, colors.ink, 1);
  }
  rect(c, 18, 30, 4, 3, colors.ink, 1);
  c.restore();
}
function ball(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill = colors.amber,
) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = colors.ink;
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(x, y, r * 0.5, r, -0.5, 0, Math.PI * 2);
  c.stroke();
}
export function draw(s: ArcadeState, c: CanvasRenderingContext2D) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
  rect(c, 0, 0, WIDTH, HEIGHT, colors.cream, 0);
  c.fillStyle = "#25235e10";
  for (let x = 10; x < WIDTH; x += 20)
    for (let y = 10; y < HEIGHT; y += 20) c.fillRect(x, y, 2, 2);
  const p = s.player;
  if (s.id === "snake") {
    for (const [index, t] of s.tail.entries()) {
      if (index === 0) drawCat(c, t.x * 20, t.y * 20, 20);
      else rect(c, t.x * 20 + 1, t.y * 20 + 1, 18, 18, colors.fur, 6);
    }
    ball(c, s.food.x * 20 + 10, s.food.y * 20 + 10, 8);
  }
  if (s.id === "breakout") {
    s.objects.forEach((o) => {
      rect(
        c,
        o.x,
        o.y,
        o.w,
        o.h,
        [colors.pink, colors.fur, colors.amber][Math.floor(o.y / 30) % 3],
      );
      rect(c, o.x + 5, o.y + o.h - 3, o.w - 10, 2, colors.ink, 0);
    });
    rect(c, p.x, p.y, p.w, p.h, colors.ink, 8);
    ball(c, s.ball.x + 7, s.ball.y + 7, 7);
  }
  if (s.id === "pong") {
    c.setLineDash([8, 12]);
    c.strokeStyle = "#25235e35";
    c.beginPath();
    c.moveTo(360, 0);
    c.lineTo(360, HEIGHT);
    c.stroke();
    c.setLineDash([]);
    rect(c, p.x, p.y, p.w, p.h, colors.ink);
    rect(c, 682, s.food.y, 14, 90, colors.fur);
    ball(c, s.ball.x + 8, s.ball.y + 8, 8);
  }
  if (s.id === "invaders") {
    for (const o of s.objects) {
      c.save();
      c.translate(o.x + 15, o.y + 13);
      c.rotate(-0.5);
      rect(c, -6, -14, 12, 28, colors.fur, 6);
      rect(c, -1, -14, 2, 32, colors.ink, 0);
      c.restore();
    }
    for (const o of s.shots)
      rect(
        c,
        o.x,
        o.y,
        o.w,
        o.h,
        o.kind === "enemy" ? colors.ink : colors.amber,
      );
    drawCat(c, p.x, p.y, p.w);
  }
  if (s.id === "flappy") {
    for (const o of s.objects) {
      rect(c, o.x, o.y, o.w, o.h, colors.pink, 3);
      rect(c, o.x, o.y > 0 ? o.y : o.h - 10, o.w, 10, colors.ink, 2);
    }
    drawCat(c, p.x, p.y, p.w);
  }
  if (s.id === "runner") {
    rect(c, 0, 371, WIDTH, 3, colors.ink, 0);
    for (let n = 0; n < 9; n++)
      rect(c, n * 100 - ((s.elapsed * 150) % 100), 398, 28, 2, colors.fur, 0);
    for (const o of s.objects) {
      rect(c, o.x, o.y, o.w, o.h, colors.amber, 2);
      rect(c, o.x + o.w / 2 - 2, o.y, 4, o.h, colors.cream, 0);
    }
    drawCat(c, p.x, p.y, p.w);
  }
  if (s.id === "catcher") {
    for (const o of s.objects) {
      if (o.kind === "treat") ball(c, o.x + 12, o.y + 12, 11);
      else {
        rect(c, o.x + 5, o.y, 14, 28, colors.green, 7);
        rect(c, o.x + 9, o.y + 4, 3, 17, "#d0e5c1", 2);
      }
    }
    rect(c, p.x, p.y + 15, p.w, 22, colors.pink, 9);
    drawCat(c, p.x + 22, p.y - 12, 36);
  }
  if (s.id === "frogger") {
    rect(c, 0, 6, WIDTH, 48, colors.pink, 0);
    rect(c, 0, 380, WIDTH, 60, "#e2e6f0", 0);
    c.fillStyle = colors.ink;
    c.font = "bold 18px sans-serif";
    c.textAlign = "center";
    c.fillText("The sunny sofa", 360, 36);
    for (const o of s.objects) {
      rect(c, o.x, o.y, o.w, o.h, colors.ink, 18);
      rect(c, o.x + 7, o.y + 7, o.w - 14, o.h - 14, colors.fur, 12);
      rect(c, o.x + 25, o.y + 14, 16, 5, colors.amber, 3);
    }
    if (s.cooldown <= 0 || Math.floor(s.elapsed * 10) % 2)
      drawCat(c, p.x, p.y, 30);
  }
}
