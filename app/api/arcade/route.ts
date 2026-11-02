import {
  errorResponse,
  gameId,
  jsonBody,
  sameOrigin,
  scores,
  submitScore,
  verifyTicket,
} from "@/lib/arcade/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const game = gameId(new URL(request.url).searchParams.get("game"));
    return Response.json(
      { entries: await scores(game) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await jsonBody(request);
    const run = verifyTicket(body.ticket);
    await submitScore(run, body.name, body.score);
    return Response.json({ saved: true });
  } catch (error) {
    return errorResponse(error);
  }
}
