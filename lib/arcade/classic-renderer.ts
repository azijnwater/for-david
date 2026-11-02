import { CH, CW, type World, type Body } from "./classic-world";

export const PALETTE = {
  ink: "#25235e",
  cream: "#fff8f3",
  pink: "#f9dde8",
  amber: "#ffb21f",
  fur: "#8f9bb9",
  blue: "#65a5bd",
  green: "#4f7652",
};
export function cat(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  name = "sucuk",
  facing = 1,
) {
  c.save();
  c.translate(x + size / 2, y);
  c.scale((facing * size) / 40, size / 40);
  c.translate(-20, 0);
  const fur =
    name === "miso"
      ? "#d28c50"
      : name === "luna"
        ? "#454969"
        : name === "mochi"
          ? "#e6d7d9"
          : name === "pepper"
            ? "#8f6b66"
            : PALETTE.fur;
  c.fillStyle = fur;
  c.beginPath();
  c.moveTo(1, 25);
  c.lineTo(3, 0);
  c.lineTo(16, 10);
  c.lineTo(27, 10);
  c.lineTo(37, 0);
  c.lineTo(39, 25);
  c.fill();
  c.beginPath();
  c.ellipse(20, 25, 20, 16, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = PALETTE.amber;
  for (const ex of [12, 28]) {
    c.beginPath();
    c.arc(ex, 23, 5, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = PALETTE.ink;
  c.fillRect(11, 20, 2, 7);
  c.fillRect(27, 20, 2, 7);
  c.fillRect(18, 31, 4, 3);
  c.restore();
}
function rect(
  c: CanvasRenderingContext2D,
  o: Pick<Body, "x" | "y" | "w" | "h">,
  color: string,
  r = 4,
) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(o.x, o.y, o.w, o.h, r);
  c.fill();
}
function text(
  c: CanvasRenderingContext2D,
  t: string,
  x: number,
  y: number,
  size = 18,
  color = PALETTE.ink,
) {
  c.fillStyle = color;
  c.font = `600 ${size}px Arial,sans-serif`;
  c.fillText(t, x, y);
}
export function renderWorld(s: World, c: CanvasRenderingContext2D) {
  c.fillStyle = PALETTE.cream;
  c.fillRect(0, 0, CW, CH);
  if (s.variant === "run-3") {
    renderTunnel(s, c);
    return;
  }
  const physics = s.mode === "physics";
  c.save();
  c.translate(-s.camera, 0);
  for (let n = 0; n < Math.ceil((s.width || 960) / 200); n++) {
    rect(c, { x: n * 200 + 50, y: 55, w: 80, h: 100 }, "#e7e7ef", 10);
    c.strokeStyle = "#fff8f3";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(n * 200 + 90, 55);
    c.lineTo(n * 200 + 90, 155);
    c.moveTo(n * 200 + 50, 105);
    c.lineTo(n * 200 + 130, 105);
    c.stroke();
  }
  for (const p of s.platforms) {
    if (!p.active) continue;
    if (p.kind === "ramp") {
      c.fillStyle = PALETTE.fur;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + p.w, p.y + p.tag);
      c.lineTo(p.x + p.w, p.y + 50);
      c.lineTo(p.x, p.y + 50);
      c.fill();
    } else {
      rect(
        c,
        p,
        p.kind === "barrel"
          ? PALETTE.amber
          : p.kind === "barricade"
            ? PALETTE.pink
            : p.kind === "plank"
              ? PALETTE.amber
              : PALETTE.fur,
      );
      if (p.h > 40) {
        c.strokeStyle = "#fff8f380";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(p.x + 4, p.y + 6);
        c.lineTo(p.x + p.w - 4, p.y + 6);
        c.stroke();
      }
    }
  }
  if (physics || s.mode === "artillery" || s.mode === "life") {
    rect(c, { x: s.camera, y: 480, w: CW, h: 60 }, PALETTE.pink, 0);
    c.strokeStyle = PALETTE.ink;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(s.camera, 480);
    c.lineTo(s.camera + CW, 480);
    c.stroke();
  }
  for (const o of s.objects) {
    if (!o.active) continue;
    if (["enemy", "tank", "drone", "goomba"].includes(o.kind)) {
      rect(c, o, o.kind === "tank" ? PALETTE.ink : PALETTE.blue, 10);
      rect(c, { x: o.x + 5, y: o.y + 5, w: o.w - 10, h: 6 }, PALETTE.amber);
      rect(c, { x: o.x + 2, y: o.y + o.h - 3, w: 7, h: 7 }, PALETTE.ink);
      rect(c, { x: o.x + o.w - 8, y: o.y + o.h - 3, w: 7, h: 7 }, PALETTE.ink);
    } else if (["spike", "mine"].includes(o.kind)) {
      c.fillStyle = PALETTE.ink;
      c.beginPath();
      c.moveTo(o.x, o.y + o.h);
      c.lineTo(o.x + o.w / 2, o.y);
      c.lineTo(o.x + o.w, o.y + o.h);
      c.fill();
    } else if (o.kind === "orb") {
      c.fillStyle = PALETTE.blue;
      c.beginPath();
      c.arc(o.x + 11, o.y + 11, 11, 0, Math.PI * 2);
      c.fill();
    } else if (o.kind === "sun" || o.kind === "moon" || o.kind === "poison")
      rect(
        c,
        o,
        o.kind === "sun"
          ? PALETTE.amber
          : o.kind === "moon"
            ? PALETTE.blue
            : PALETTE.green,
      );
    else if (["miso", "pepper", "luna"].includes(o.kind))
      cat(c, o.x, o.y, o.w, o.kind);
    else {
      rect(
        c,
        o,
        o.kind === "castle"
          ? PALETTE.fur
          : o.kind === "ore"
            ? PALETTE.amber
            : o.kind === "soil"
              ? "#baa1a0"
              : o.kind === "rock"
                ? PALETTE.ink
                : o.kind === "gate"
                  ? PALETTE.ink
                  : PALETTE.amber,
      );
      if (o.kind === "star") text(c, "✦", o.x, o.y + 28, 34);
      if (o.kind === "cube" || o.kind === "crate") {
        c.strokeStyle = PALETTE.cream;
        c.strokeRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      }
    }
  }
  for (const coin of s.coins)
    if (coin.active) {
      c.fillStyle = coin.kind === "heart" ? "#ad3f66" : PALETTE.amber;
      c.beginPath();
      c.arc(
        coin.x + coin.w / 2,
        coin.y + coin.h / 2,
        coin.w / 2,
        0,
        Math.PI * 2,
      );
      c.fill();
      c.strokeStyle = PALETTE.ink;
      c.lineWidth = 1;
      c.stroke();
    }
  for (const shot of s.shots)
    if (shot.active)
      rect(c, shot, shot.kind === "bad" ? PALETTE.ink : PALETTE.amber, 5);
  if (s.mode === "platform" || s.mode === "social") {
    if (s.variant === "portal-flash") {
      for (const [x, y, color] of [
        [s.stats.blueX, s.stats.blueY, PALETTE.blue],
        [s.stats.orangeX, s.stats.orangeY, PALETTE.amber],
      ] as const) {
        c.strokeStyle = color;
        c.lineWidth = 7;
        c.beginPath();
        c.ellipse(x + 15, y + 15, 17, 30, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
    if (s.variant !== "achievement-unlocked" && s.variant !== "club-penguin") {
      rect(c, { x: s.stats.goal, y: 408, w: 65, h: 62 }, PALETTE.pink, 18);
      text(c, "Home", s.stats.goal + 6, 450, 15);
    }
    if (s.variant === "dino-run") {
      rect(c, { x: s.stats.doom - 80, y: 0, w: 80, h: CH }, "#4f765280", 0);
      text(c, "VACUUM", s.stats.doom - 170, 70, 16);
    }
    if (s.variant === "n")
      text(c, `${Math.ceil(s.stats.timer)}s`, s.camera + 20, 35, 22);
  }
  if (physics) {
    c.strokeStyle = PALETTE.fur;
    c.lineWidth = 10;
    c.lineCap = "round";
    for (const j of s.joints) {
      const a = s.points[j.a],
        b = s.points[j.b];
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    s.points.slice(1).forEach((p, n) => {
      c.fillStyle = n > 6 ? PALETTE.ink : PALETTE.fur;
      c.beginPath();
      c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      c.fill();
    });
    cat(c, s.points[0].x - 22, s.points[0].y - 25, 44);
    text(c, `${Math.floor(s.stats.distance)} paw-steps`, s.camera + 20, 35, 18);
  } else {
    if (s.player.active && (s.invincible <= 0 || Math.floor(s.time * 10) % 2))
      cat(
        c,
        s.player.x,
        s.player.y,
        s.player.w,
        "sucuk",
        s.player.vx < 0 ? -1 : 1,
      );
    if (
      s.variant === "fireboy-watergirl" ||
      s.mode === "social" ||
      s.mode === "artillery" ||
      s.variant === "duck-life"
    )
      if (s.ally.active)
        cat(
          c,
          s.ally.x,
          s.ally.y,
          s.ally.w,
          s.mode === "artillery" ? "miso" : "luna",
        );
  }
  if (s.mode === "artillery" && s.shots.length === 0 && s.turn === 0) {
    const angle = (s.aim.angle * Math.PI) / 180,
      speed = s.aim.power * 6;
    c.fillStyle = PALETTE.ink;
    for (let t = 0; t < 1.3; t += 0.1) {
      const x = s.player.x + 15 + Math.cos(angle) * speed * t,
        y = s.player.y - 5 - Math.sin(angle) * speed * t + 175 * t * t;
      if (y > 450) break;
      c.beginPath();
      c.arc(x, y, 2, 0, Math.PI * 2);
      c.fill();
    }
    text(
      c,
      `Wind ${s.stats.wind.toFixed(0)} · ${s.stats.ammo} yarn shots`,
      20,
      35,
      17,
    );
  }
  if (s.mode === "shooter") {
    text(
      c,
      `Room ${s.stats.wave}/5${s.variant === "last-stand" ? ` · Fort ${Math.ceil(s.stats.defense)}%` : ""}`,
      s.camera + 20,
      35,
      19,
    );
  }
  if (s.variant === "motherload")
    text(
      c,
      `Fuel ${Math.ceil(s.stats.fuel)} · Cargo ${s.stats.cargo} · Depth ${s.stats.depth}`,
      20,
      35,
      18,
    );
  if (s.variant === "duck-life" && s.phase === "race")
    text(c, "Sucuk vs Luna — first to the flag", 20, 35, 20);
  c.restore();
}
function renderTunnel(s: World, c: CanvasRenderingContext2D) {
  c.fillStyle = PALETTE.ink;
  c.fillRect(0, 0, CW, CH);
  const distance = s.stats.distance || 0,
    lane = s.stats.lane ?? 1;
  const point = (z: number, side: number) => {
    const radius = 390 / (1 + z * 0.28),
      angle = ((side - lane) * Math.PI) / 6 + Math.PI / 2;
    return {
      x: 480 + Math.cos(angle) * radius,
      y: 270 + Math.sin(angle) * radius * 0.65,
    };
  };
  for (let z = 22; z >= 0; z--) {
    const segment = Math.floor(distance) + z,
      offset = 1 - (distance % 1);
    for (let side = 0; side < 12; side++) {
      const hole = (segment * 7 + s.level * 3) % 12;
      if (side === hole || side === (hole + 1) % 12) continue;
      const a = point(z + offset, side),
        b = point(z + offset, side + 1),
        d = point(z + 1 + offset, side),
        e = point(z + 1 + offset, side + 1);
      c.fillStyle = (side + z) % 2 ? "#8f9bb9" : "#c9d0e5";
      c.strokeStyle = "#25235e";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.lineTo(e.x, e.y);
      c.lineTo(d.x, d.y);
      c.closePath();
      c.fill();
      c.stroke();
    }
  }
  cat(c, 465, 420 - (s.stats.jump > 0 ? 65 : 0), 35);
  text(
    c,
    `Tunnel ${s.level}/3 · ${Math.floor(distance)}m`,
    20,
    35,
    20,
    PALETTE.cream,
  );
}
