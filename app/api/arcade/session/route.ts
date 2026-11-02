import {
  errorResponse,
  gameId,
  issueTicket,
  jsonBody,
  sameOrigin,
} from "@/lib/arcade/leaderboard";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const game = gameId((await jsonBody(request)).game);
    const address =
      request.headers.get("x-vercel-forwarded-for") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    return Response.json(
      { ticket: issueTicket(game, address) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
