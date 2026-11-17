import type { Metadata } from "next";
import { About } from "@/components/about/about";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Conoce la misión de Arcade Vault y escríbenos con sugerencias o propuestas de juegos.",
};

export default function AboutPage() {
  return <About />;
}
