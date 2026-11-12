import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";
import { GAMES } from "@/lib/data";

// Ruta bloqueante: mantiene el 404 real para ids inexistentes (con Suspense el
// notFound() llegaría con el stream ya iniciado y respondería 200).
export const instant = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/jugar/[id]">): Promise<Metadata> {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) return {};
  return {
    title: `Jugando ${game.title}`,
    description: `Partida de ${game.title} en Arcade Vault.`,
  };
}

export default async function PlayPage({ params }: PageProps<"/jugar/[id]">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
