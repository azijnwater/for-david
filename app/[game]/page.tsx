import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games, gameSlug } from "@/lib/arcade/catalog";
import { GamePage } from "@/components/arcade/game-page";

export function generateStaticParams() {
  return games.map((game) => ({ game: gameSlug(game) }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game: slug } = await params;
  const game = games.find((item) => gameSlug(item) === slug);
  return game
    ? {
        title: `${game.name} — Sucuk’s arcade`,
        description: game.description,
        alternates: { canonical: `/${slug}` },
      }
    : {};
}
export default async function PlayPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: slug } = await params;
  const game = games.find((item) => gameSlug(item) === slug);
  if (!game) notFound();
  return <GamePage game={game} />;
}
