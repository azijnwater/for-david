import { classicGames } from "./classic-catalog";

const originalGames = [
  {
    id: "line-rider",
    name: "Cushion Rider",
    genre: "Creative",
    classic: "Line Rider",
    description:
      "Draw a route. Ride a cushion sled. See what happens to Sucuk.",
    controls:
      "Draw left to right, then play. Pencil, straight lines, erasing, a start flag, pan and zoom are available. Space plays or pauses; arrow keys pan while paused.",
    goal: "Build your own track. Export it to keep or share it.",
    art: "sled",
  },
  {
    id: "snake",
    name: "Yarn trail",
    genre: "Arcade",
    classic: "Snake",
    description:
      "A ball of yarn, an ever-longer tail, and absolutely no brakes.",
    controls:
      "Arrow keys or WASD to steer. Eat yarn; avoid the walls and your tail.",
    goal: "Collect as much yarn as you can.",
    art: "yarn",
  },
  {
    id: "breakout",
    name: "Shelf demolition",
    genre: "Arcade",
    classic: "Breakout",
    description: "Everything on that shelf? Sucuk has other plans for it.",
    controls:
      "Move the pointer, drag, or use Left and Right to move the cushion. Keep the yarn bouncing.",
    goal: "Clear every shelf with three lives.",
    art: "shelf",
  },
  {
    id: "pong",
    name: "Paw pong",
    genre: "Arcade",
    classic: "Pong",
    description:
      "A friendly rally against the world's most competitive cushion.",
    controls:
      "Move the pointer, drag, or use Up and Down. Get the yarn past the cushion on the right.",
    goal: "First to seven points wins.",
    art: "pong",
  },
  {
    id: "invaders",
    name: "Feather patrol",
    genre: "Arcade",
    classic: "Space Invaders",
    description: "Suspicious feathers are descending. Defend the living room.",
    controls:
      "Left and Right to move; hold Space or the Paw button to fire. Dodge falling feathers.",
    goal: "Clear all three waves. You have three lives.",
    art: "feather",
  },
  {
    id: "flappy",
    name: "Flying floof",
    genre: "Reflex",
    classic: "Flappy Bird",
    description:
      "An airborne Sucuk. A hallway full of very inconvenient furniture.",
    controls:
      "Tap the game, press Space, or use the Flap button to fly through the gaps.",
    goal: "Pass as many gaps as possible.",
    art: "fly",
  },
  {
    id: "runner",
    name: "Midnight zoomies",
    genre: "Reflex",
    classic: "Endless runners",
    description: "It's 3 a.m. The hallway is now a racetrack.",
    controls:
      "Tap, press Space, or use the Jump button to jump over boxes. Hold nothing; time each jump.",
    goal: "Keep running. The boxes get faster.",
    art: "run",
  },
  {
    id: "catcher",
    name: "Treat rain",
    genre: "Reflex",
    classic: "Catch-and-dodge",
    description: "Catch the treats. Politely decline the cucumbers.",
    controls:
      "Move the pointer, drag, or use Left and Right. Catch amber treats; avoid green cucumbers.",
    goal: "Score as much as you can in 45 seconds. Three cucumber hits end the round.",
    art: "treat",
  },
  {
    id: "frogger",
    name: "Sofa safari",
    genre: "Arcade",
    classic: "Frogger",
    description: "Cross the busy room. Claim the sunny sofa. Repeat.",
    controls:
      "Arrow keys, WASD, or the direction buttons move one square. Avoid the rolling vacuum cleaners.",
    goal: "Reach the sofa five times with three lives.",
    art: "sofa",
  },
  {
    id: "memory",
    name: "Nap-time pairs",
    genre: "Puzzle",
    classic: "Concentration",
    description: "Match Sucuk's favourite things before he falls asleep again.",
    controls:
      "Reveal two cards at a time. Use a pointer or Tab and Enter. Find all eight pairs.",
    goal: "Clear the board in as few turns as possible.",
    art: "memory",
  },
  {
    id: "whack",
    name: "Box inspector",
    genre: "Reflex",
    classic: "Whac-A-Mole",
    description: "Every cardboard box needs a thorough paw inspection.",
    controls:
      "Tap the box with the feather. With a keyboard, use the number keys 1–9 or Tab and Enter.",
    goal: "Inspect as many feathers as possible in 30 seconds.",
    art: "box",
  },
  {
    id: "merge",
    name: "Treats, squared",
    genre: "Puzzle",
    classic: "2048",
    description: "Slide, combine, and work your way up to a legendary snack.",
    controls:
      "Arrow keys, WASD, a swipe, or direction buttons slide the whole board. Equal treats combine.",
    goal: "Make a 2048 tile before the board fills up.",
    art: "merge",
  },
  {
    id: "lights",
    name: "Lights out, Sucuk",
    genre: "Puzzle",
    classic: "Lights Out",
    description: "Bedtime means bedtime. Switch off every light in the house.",
    controls:
      "Tap a window to toggle it and its neighbours. Use Tab and Enter with a keyboard.",
    goal: "Turn all the windows dark in as few moves as possible.",
    art: "lights",
  },
] as const;

export const games = [
  originalGames[0],
  ...classicGames,
  ...originalGames.slice(1),
] as const;
export function gameSlug(game: { name: string }) {
  return game.name
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type GameId = (typeof games)[number]["id"];
export type Game = (typeof games)[number];
export type ActionId =
  | "snake"
  | "breakout"
  | "pong"
  | "invaders"
  | "flappy"
  | "runner"
  | "catcher"
  | "frogger";

export function readRecords(): string {
  try {
    return localStorage.getItem("sucuk-arcade-v1") || "{}";
  } catch {
    return "{}";
  }
}

export function saveRecord(id: GameId, score: number) {
  try {
    const records = JSON.parse(readRecords());
    records[id] = Math.max(Number(records[id]) || 0, score);
    localStorage.setItem("sucuk-arcade-v1", JSON.stringify(records));
    window.dispatchEvent(new Event("sucuk-records"));
  } catch {
    /* Games remain playable with storage disabled. */
  }
}

export function subscribeRecords(callback: () => void) {
  window.addEventListener("sucuk-records", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("sucuk-records", callback);
    window.removeEventListener("storage", callback);
  };
}
