import { NextResponse, type NextRequest } from "next/server";
import { GAMES } from "@/lib/data";

// /games/[id] y /games/[id]/play son Partial Prerender: la respuesta empieza a
// enviarse antes de que la página llame a notFound(), así que un id inexistente
// mostraría la pantalla 404 con código 200. Comprobamos el id aquí, antes de
// renderizar, y reescribimos a una ruta sin coincidencia para que Next sirva su
// página 404 con el código 404.
const GAME_IDS = new Set(GAMES.map((g) => g.id));

export const config = {
  matcher: ["/games/:id", "/games/:id/play"],
};

export function proxy(request: NextRequest) {
  const id = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (!GAME_IDS.has(id)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }
}
