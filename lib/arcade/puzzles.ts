export function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function toggleLights(board: boolean[], index: number): boolean[] {
  const next = [...board];
  for (const target of [
    index,
    index % 5 > 0 ? index - 1 : -1,
    index % 5 < 4 ? index + 1 : -1,
    index - 5,
    index + 5,
  ])
    if (target >= 0 && target < 25) next[target] = !next[target];
  return next;
}
export function newLights(): boolean[] {
  let board = Array<boolean>(25).fill(false);
  // Build from a solved board: every generated puzzle has a solution.
  for (const index of shuffle(Array.from({ length: 25 }, (_, i) => i)).slice(
    0,
    9,
  ))
    board = toggleLights(board, index);
  return board;
}
export function slideBoard(
  board: number[],
  direction: string,
): { board: number[]; gained: number; changed: boolean } {
  const next = [...board];
  let gained = 0;
  for (let line = 0; line < 4; line++) {
    const indices = Array.from({ length: 4 }, (_, n) =>
      direction === "left"
        ? line * 4 + n
        : direction === "right"
          ? line * 4 + 3 - n
          : direction === "up"
            ? n * 4 + line
            : (3 - n) * 4 + line,
    );
    const tiles = indices.map((index) => board[index]).filter(Boolean);
    const merged: number[] = [];
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === tiles[i + 1]) {
        merged.push(tiles[i] * 2);
        gained += tiles[i] * 2;
        i++;
      } else merged.push(tiles[i]);
    }
    indices.forEach((index, i) => {
      next[index] = merged[i] || 0;
    });
  }
  return { board: next, gained, changed: next.some((v, i) => v !== board[i]) };
}
export function addTile(board: number[]) {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] =
    Math.random() < 0.9 ? 2 : 4;
  return next;
}
export function hasMoves(board: number[]) {
  return (
    board.includes(0) ||
    ["left", "right", "up", "down"].some((d) => slideBoard(board, d).changed)
  );
}
