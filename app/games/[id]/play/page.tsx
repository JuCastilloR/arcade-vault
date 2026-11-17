import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";
import { GAMES } from "@/lib/data";

// Ruta bloqueante (sin Suspense). Aun así el shell de PPR se envía antes de
// notFound(), así que el 404 real para ids inexistentes lo garantiza proxy.ts.
export const instant = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]/play">): Promise<Metadata> {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) return {};
  return {
    title: `Jugando ${game.title}`,
    description: `Partida de ${game.title} en Arcade Vault.`,
  };
}

export default async function PlayPage({ params }: PageProps<"/games/[id]/play">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
