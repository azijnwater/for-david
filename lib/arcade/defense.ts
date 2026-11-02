export type TowerKind = "dart" | "rapid" | "mage" | "frost" | "guard";
export type Tower = {
  cell: number;
  kind: TowerKind;
  level: number;
  cooldown: number;
};
export type Creep = {
  id: number;
  cell: number;
  next: number;
  progress: number;
  hp: number;
  maxHp: number;
  speed: number;
  slow: number;
  flying: boolean;
};
export type DefenseState = {
  variant: string;
  towers: Tower[];
  creeps: Creep[];
  path: number[];
  money: number;
  lives: number;
  wave: number;
  spawn: number;
  remaining: number;
  active: boolean;
  over: boolean;
  won: boolean;
  score: number;
  message: string;
  spell: number;
  nextId: number;
};
export const COLS = 12,
  ROWS = 8;
export const creepPath = (s: DefenseState, c: Creep) =>
  c.flying ? Array.from({ length: 12 }, (_, i) => 36 + i) : s.path;
export const towerInfo: Record<
  TowerKind,
  { name: string; cost: number; range: number; damage: number; rate: number }
> = {
  dart: {
    name: "Sucuk · yarn darts",
    cost: 50,
    range: 3,
    damage: 1,
    rate: 0.65,
  },
  rapid: {
    name: "Miso · feather flurry",
    cost: 80,
    range: 2.5,
    damage: 1,
    rate: 0.3,
  },
  mage: {
    name: "Luna · moon magic",
    cost: 100,
    range: 3.5,
    damage: 3,
    rate: 1,
  },
  frost: {
    name: "Mochi · frosty paws",
    cost: 75,
    range: 2.7,
    damage: 1,
    rate: 0.9,
  },
  guard: {
    name: "Pepper · basket guard",
    cost: 90,
    range: 1.8,
    damage: 2,
    rate: 0.6,
  },
};
export function defensePath(blocked: Set<number>) {
  const start = 36,
    end = 47,
    queue = [start],
    from = new Map<number, number>();
  from.set(start, -1);
  for (let n = 0; n < queue.length; n++) {
    const p = queue[n];
    if (p === end) break;
    for (const q of [
      p % COLS > 0 ? p - 1 : -1,
      p % COLS < COLS - 1 ? p + 1 : -1,
      p - COLS,
      p + COLS,
    ])
      if (q >= 0 && q < COLS * ROWS && !blocked.has(q) && !from.has(q)) {
        from.set(q, p);
        queue.push(q);
      }
  }
  if (!from.has(end)) return null;
  const path = [];
  for (let p = end; p >= 0; p = from.get(p)!) {
    path.unshift(p);
  }
  return path;
}
export function createDefense(variant: string): DefenseState {
  const path =
    variant === "desktop-td"
      ? defensePath(new Set())!
      : [
          36, 37, 38, 26, 14, 15, 16, 28, 40, 52, 64, 65, 66, 54, 42, 43, 44,
          45, 46, 47,
        ];
  return {
    variant,
    towers: [],
    creeps: [],
    path,
    money: variant === "gemcraft" ? 240 : 180,
    lives: 20,
    wave: 0,
    spawn: 0,
    remaining: 0,
    active: false,
    over: false,
    won: false,
    score: 0,
    message: "Build your first defenses, then send a wave.",
    spell: 0,
    nextId: 0,
  };
}
export function placeTower(s: DefenseState, cell: number, kind: TowerKind) {
  if (s.over || s.towers.some((t) => t.cell === cell)) return;
  if (s.money < towerInfo[kind].cost) {
    s.message = "Not enough treats for that tower.";
    return;
  }
  if (
    cell === 36 ||
    cell === 47 ||
    (s.variant !== "desktop-td" && s.path.includes(cell))
  ) {
    s.message = "Keep the path clear.";
    return;
  }
  if (
    s.variant === "kingdom-rush" &&
    ![13, 18, 25, 30, 39, 49, 56, 67, 69, 32].includes(cell)
  ) {
    s.message = "This kingdom builds on the marked tower sites.";
    return;
  }
  const blocked = new Set([...s.towers.map((t) => t.cell), cell]);
  const path = s.variant === "desktop-td" ? defensePath(blocked) : s.path;
  if (!path) {
    s.message = "That would block the creeps' route. Leave a path through.";
    return;
  }
  if (s.variant === "desktop-td" && s.active) {
    s.message = "Remodel the maze between waves.";
    return;
  }
  s.money -= towerInfo[kind].cost;
  s.towers.push({ cell, kind, level: 1, cooldown: 0 });
  s.path = path;
  s.message = `${towerInfo[kind].name} joins the defense.`;
}
export function startWave(s: DefenseState) {
  if (s.active || s.over) return;
  s.wave++;
  s.remaining = 5 + s.wave * 2;
  s.active = true;
  s.spawn = 0.1;
  s.message = `Wave ${s.wave}/8. Here come the toys.`;
}
export function tickDefense(s: DefenseState, dt: number) {
  if (s.over) return;
  s.spell = Math.max(0, s.spell - dt);
  if (!s.active) return;
  s.spawn -= dt;
  if (s.remaining > 0 && s.spawn <= 0) {
    const hp = 1 + Math.floor(s.wave / 2) + (s.nextId % 5 === 0 ? 3 : 0);
    s.creeps.push({
      id: s.nextId++,
      cell: s.path[0],
      next: 1,
      progress: 0,
      hp,
      maxHp: hp,
      speed: 0.7 + s.wave * 0.08,
      slow: 0,
      flying: s.wave % 4 === 0 && s.nextId % 3 === 0,
    });
    s.remaining--;
    s.spawn = 0.65;
  }
  for (const t of s.towers) {
    t.cooldown -= dt;
    const info = towerInfo[t.kind];
    if (t.cooldown > 0) continue;
    const target = s.creeps
      .filter(
        (c) =>
          c.hp > 0 &&
          Math.hypot(
            (c.cell % COLS) - (t.cell % COLS),
            Math.floor(c.cell / COLS) - Math.floor(t.cell / COLS),
          ) <=
            info.range + t.level * 0.15,
      )
      .sort((a, b) => b.next - a.next)[0];
    if (target) {
      target.hp -= info.damage * t.level;
      if (t.kind === "frost") target.slow = 2;
      if (t.kind === "guard" && !target.flying) target.progress -= 0.1;
      t.cooldown = info.rate / Math.sqrt(t.level);
    }
  }
  for (const creep of s.creeps) {
    if (creep.hp <= 0) {
      s.money += 8 + s.wave;
      s.score += 20;
      continue;
    }
    creep.slow = Math.max(0, creep.slow - dt);
    creep.progress += dt * creep.speed * (creep.slow > 0 ? 0.45 : 1);
    if (creep.progress >= 1) {
      creep.progress -= 1;
      const path = creepPath(s, creep);
      creep.cell = path[Math.min(creep.next++, path.length - 1)];
      if (creep.next > path.length) {
        creep.hp = -999;
        s.lives--;
      }
    }
  }
  s.creeps = s.creeps.filter((c) => c.hp > 0);
  if (s.lives <= 0) {
    s.over = true;
    s.won = false;
    s.message = "The toys reached the basket. Try a different defense.";
  }
  if (!s.remaining && !s.creeps.length) {
    s.active = false;
    s.money += 35;
    if (s.wave >= 8) {
      s.over = true;
      s.won = true;
      s.score += 500;
      s.message = "Eight waves held. The basket is safe!";
    } else s.message = "Wave cleared. Upgrade or reshape your maze.";
  }
}
