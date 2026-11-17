import type { Metadata } from "next";
import { Home } from "@/components/home/home";

export const metadata: Metadata = {
  title: { absolute: "Arcade Vault · El arcade clásico está de vuelta" },
  description:
    "Juega los mejores clásicos arcade en tu navegador, gratis, y compite en el ranking global.",
};

export default function HomePage() {
  return <Home />;
}
