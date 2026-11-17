import type { Metadata } from "next";
import { Library } from "@/components/library";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Explora todos los juegos de Arcade Vault: busca por nombre o filtra por categoría.",
};

export default function GamesPage() {
  return <Library />;
}
