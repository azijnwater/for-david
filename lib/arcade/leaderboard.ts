import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
  open,
} from "node:fs/promises";
import path from "node:path";
import {
  get,
  put,
  BlobNotFoundError,
  BlobPreconditionFailedError,
} from "@vercel/blob";
import { games, type GameId } from "./catalog";

export type Entry = { id: string; name: string; score: number; date: string };
type Recent = { run: string; visitor: string; at: number };
export type Board = { entries: Entry[]; recent: Recent[] };
type Run = { game: GameId; id: string; at: number; visitor: string };
export class ScoreError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const limits: Partial<Record<GameId, number>> = {
  "line-rider": 0,
  snake: 7890,
  breakout: 400,
  pong: 7,
  invaders: 720,
  flappy: 10000,
  runner: 72000,
  catcher: 1200,
  frogger: 500,
  memory: 1600,
  whack: 850,
  merge: 100000,
  lights: 1975,
};

export function gameId(value: unknown): GameId {
  if (value === "line-rider")
    throw new ScoreError(
      "Cushion Rider is a creative track editor and does not submit scores.",
    );
  if (typeof value !== "string" || !games.some((game) => game.id === value))
    throw new ScoreError("Choose a game from the arcade.");
  return value as GameId;
}
function localDirectory() {
  return process.env.NODE_ENV !== "production"
    ? process.env.ARCADE_STORE_DIR
    : undefined;
}
function secret() {
  const value =
    process.env.ARCADE_SIGNING_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (value) return value;
  if (localDirectory()) return "local-development-only-secret";
  throw new ScoreError(
    "Global leaderboards are temporarily unavailable. Please try again later.",
    503,
  );
}
function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function issueTicket(game: GameId, visitorAddress: string) {
  const run: Run = {
    game,
    id: randomUUID(),
    at: Date.now(),
    visitor: hmac(visitorAddress).slice(0, 24),
  };
  const body = Buffer.from(JSON.stringify(run)).toString("base64url");
  return `${body}.${hmac(body)}`;
}
export function verifyTicket(ticket: unknown): Run {
  if (typeof ticket !== "string" || ticket.length > 1000)
    throw new ScoreError("Start a new game before saving a score.");
  const [body, signature, extra] = ticket.split(".");
  const expected = hmac(body);
  if (
    extra ||
    !signature ||
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw new ScoreError("This game session is invalid. Start a new round.");
  let run: Run;
  try {
    run = JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    throw new ScoreError("Invalid game session.");
  }
  gameId(run.game);
  if (
    !run.id ||
    !run.visitor ||
    !Number.isFinite(run.at) ||
    run.at > Date.now() ||
    Date.now() - run.at > 7200000
  )
    throw new ScoreError("This game session has expired. Start a new round.");
  return run;
}
export function validateScore(
  game: GameId,
  score: unknown,
  elapsedSeconds: number,
): number {
  if (
    typeof score !== "number" ||
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > (limits[game] ?? 100000)
  )
    throw new ScoreError("That score is outside this game's range.");
  if (elapsedSeconds < 1.5)
    throw new ScoreError("Finish a round before saving your score.");
  const maxRate: Partial<Record<GameId, number>> = {
    snake: 160,
    breakout: 300,
    invaders: 300,
    flappy: 2,
    runner: 10,
    catcher: 35,
    frogger: 200,
    whack: 40,
    merge: 10000,
  };
  if (maxRate[game] && score > (elapsedSeconds + 2) * maxRate[game]!)
    throw new ScoreError("That score does not match the length of this round.");
  return score;
}
export function updateBoard(
  board: Board,
  run: Run,
  nameValue: unknown,
  scoreValue: unknown,
  now = Date.now(),
): Board {
  if (typeof nameValue !== "string")
    throw new ScoreError("Enter an arcade name.");
  const name = nameValue.normalize("NFKC").trim();
  if (!/^[\p{L}\p{N} ._-]{2,16}$/u.test(name))
    throw new ScoreError(
      "Use 2–16 letters, numbers, spaces, dots, hyphens or underscores.",
    );
  const score = validateScore(run.game, scoreValue, (now - run.at) / 1000);
  const recent = board.recent.filter((entry) => now - entry.at < 7200000);
  if (
    recent.some((entry) => entry.run === run.id) ||
    board.entries.some((entry) => entry.id === run.id)
  )
    throw new ScoreError("This round is already on the leaderboard.", 409);
  if (
    recent.some(
      (entry) => entry.visitor === run.visitor && now - entry.at < 5000,
    )
  )
    throw new ScoreError(
      "Wait a few seconds before saving another score.",
      429,
    );
  const entry: Entry = {
    id: run.id,
    name,
    score,
    date: new Date(now).toISOString(),
  };
  return {
    entries: [...board.entries, entry]
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.date.localeCompare(b.date) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, 100),
    recent: [...recent, { run: run.id, visitor: run.visitor, at: now }].slice(
      -2000,
    ),
  };
}
const empty = (): Board => ({ entries: [], recent: [] });
async function readBoard(
  game: GameId,
): Promise<{ board: Board; etag?: string }> {
  const local = localDirectory();
  if (local) {
    try {
      return {
        board: JSON.parse(
          await readFile(path.join(local, `${game}.json`), "utf8"),
        ),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return { board: empty() };
      throw error;
    }
  }
  secret();
  try {
    const result = await get(`arcade-v1/${game}.json`, {
      access: "private",
      useCache: false,
    });
    if (!result || !result.stream) return { board: empty() };
    return {
      board: JSON.parse(await new Response(result.stream).text()),
      etag: result.blob.etag,
    };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { board: empty() };
    throw error;
  }
}
export async function scores(game: GameId) {
  return (await readBoard(game)).board.entries.slice(0, 20);
}
export async function submitScore(run: Run, name: unknown, score: unknown) {
  const local = localDirectory();
  if (local) {
    await mkdir(local, { recursive: true });
    const filename = path.join(local, `${run.game}.json`);
    for (let attempt = 0; attempt < 20; attempt++) {
      let lock;
      try {
        lock = await open(`${filename}.lock`, "wx");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        await new Promise((resolve) => setTimeout(resolve, 30));
        continue;
      }
      try {
        const { board } = await readBoard(run.game);
        const next = updateBoard(board, run, name, score);
        await writeFile(`${filename}.tmp`, JSON.stringify(next));
        await rename(`${filename}.tmp`, filename);
        return;
      } finally {
        await lock.close();
        await unlink(`${filename}.lock`);
      }
    }
    throw new ScoreError("The scoreboard is busy. Try saving again.", 503);
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const { board, etag } = await readBoard(run.game);
    const next = updateBoard(board, run, name, score);
    try {
      await put(`arcade-v1/${run.game}.json`, JSON.stringify(next), {
        access: "private",
        addRandomSuffix: false,
        contentType: "application/json",
        ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
      });
      return;
    } catch (error) {
      const concurrentCreation =
        !etag &&
        error instanceof Error &&
        /already exists/i.test(error.message);
      if (
        !(error instanceof BlobPreconditionFailedError) &&
        !concurrentCreation
      )
        throw error;
    }
  }
  throw new ScoreError(
    "The scoreboard is busy. Your score is ready; try saving again.",
    503,
  );
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new ScoreError(
      "Open the arcade on this website to save a score.",
      403,
    );
}
export async function jsonBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ScoreError("Invalid score request.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2048) {
      await reader.cancel();
      throw new ScoreError("The score request is too large.", 413);
    }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new ScoreError("Invalid score request.");
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof ScoreError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error(
    "Arcade storage operation failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    { error: "Global scores could not be reached. Please try again." },
    { status: 503 },
  );
}
