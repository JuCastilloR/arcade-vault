# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Status:** Implemented
> **Depends on:** Ninguna
> **Date:** 2026-11-09
> **Objective:** Portar a Next.js (App Router) las 5 pantallas de `resources/templates/` (Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama) con datos y sesión simulados en el cliente y sin ningún juego real.

## Por qué existe este spec

`resources/templates/` es un prototipo SPA en React 18 + Babel en el navegador, con navegación por hash y datos simulados. El proyecto real es Next 16 con App Router, así que este spec define cómo trasladar el prototipo sin cambiar el diseño.

Estado actual del repo (ya hecho, no se rehace):

- `app/globals.css` ya contiene el CSS de la plantilla (`styles.css`) con `@import "tailwindcss"` y tokens `@theme inline`.
- `app/layout.tsx` ya carga Press Start 2P, JetBrains Mono y Courier Prime con `next/font/google`, y renderiza `av-bg` y `av-noise`. Geist ya no está.
- `app/page.tsx` sigue siendo el scaffold de Create Next App.

## Alcance

**Dentro:**

- Rutas del App Router: `/` (Biblioteca), `/juegos/[id]` (Detalle), `/jugar/[id]` (Reproductor), `/auth` y `/salon`.
- Nav (con menú móvil) y footer compartidos, montados en el layout raíz.
- Módulo de datos tipado `lib/data.ts` con `GAMES`, `CATS`, `PLAYERS` y `seededScores`, copiados de `data.jsx`.
- Sesión simulada en cliente (`av_user` en localStorage) con un provider de contexto.
- Reproductor igual que la plantilla: HUD, puntaje simulado con `setInterval`, pausa, FIN, modal de fin de juego, guardado en localStorage (`av_scores`) y arena decorativa.
- Auth con pestañas Iniciar sesión / Crear cuenta, "Jugar como invitado" y botones sociales sin acción.
- Búsqueda y filtro por categoría en la Biblioteca, y efecto tilt en las tarjetas.
- Fidelidad visual con la plantilla, incluido el diseño responsive.

**Fuera de alcance (para futuros specs):**

- Cualquier juego jugable (lógica, canvas, controles, colisiones).
- Backend, base de datos, autenticación real (OAuth Google/GitHub, hashing, sesiones del servidor).
- Ranking real: el Salón y el Detalle usan puntuaciones generadas con semilla.
- Lectura de `av_scores` en el Salón o el Detalle (solo se guarda).
- Contador de créditos funcional (el "03" es decorativo).
- Tests automatizados (no hay framework configurado).
- Reescritura del CSS a utilidades Tailwind.

## Modelo de datos

Tipos nuevos en `lib/data.ts`, con los mismos valores que `data.jsx`:

```ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type Accent = "cyan" | "magenta" | "green" | "yellow";

export interface Game {
  id: string;        // slug de la ruta: "bloque-buster", "caida", ...
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;     // clase CSS: "cover-bricks", "cover-tetro", ...
  color: Accent;
  best: number;
  plays: string;     // ya formateado: "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;      // "DD/MM/2026"
}

export interface SessionUser {
  name: string;      // mayúsculas, máx. 10 caracteres
}

export interface SavedScore {
  game: string;      // Game.id
  score: number;
  name: string;
  at: number;        // Date.now()
}
```

Persistencia (solo cliente, sin versionar en el MVP):

- `localStorage["av_user"]`: `SessionUser | null` en JSON.
- `localStorage["av_scores"]`: `SavedScore[]` en JSON.

Convenciones:

- `CATS = ["TODOS", ...categorías]`.
- Los números se formatean con `toLocaleString("es-ES")`.
- `seededScores(seed, count)` conserva el algoritmo de la plantilla para que las tablas sean deterministas. Las semillas son `id.length * 17 + 3` en el Detalle y `id.length * 23 + 7` en el Salón.

## Plan de implementación

1. **Datos.** Crear `lib/data.ts` con los tipos, `GAMES`, `CATS`, `PLAYERS` y `seededScores`. Verificación: `npx tsc --noEmit` pasa.
2. **Sesión.** Crear `components/session-provider.tsx` (`"use client"`) con contexto `{ user, login, signOut, saveScore }`. Lee `av_user` en un efecto tras montar para evitar errores de hidratación, y envuelve cada acceso a localStorage en try/catch.
3. **Shell.** Crear `components/nav.tsx` (con menú móvil y estado activo según `usePathname`) y `components/footer.tsx`. Montar `SessionProvider`, `Nav` y `<main className="av-main">` en `app/layout.tsx`, y sustituir el `<div id="root">`. Verificación: `/` muestra Nav y footer.
4. **Biblioteca.** Crear `components/game-card.tsx` (tilt) y `components/library.tsx` (hero, búsqueda, chips, grilla, estado vacío). Reemplazar `app/page.tsx`. La tarjeta y el botón JUGAR llevan a `/juegos/[id]`.
5. **Detalle.** Crear `app/juegos/[id]/page.tsx` con `generateStaticParams` sobre `GAMES` y `notFound()` si el id no existe. Incluye portada, tags, stats, leaderboard con `seededScores` y acciones.
6. **Auth.** Crear `app/auth/page.tsx` con `components/auth-form.tsx` (pestañas, campo email solo en "Crear cuenta", login simulado, invitado). Tras entrar, redirige a `/` con `router.push`.
7. **Salón de la Fama.** Crear `app/salon/page.tsx` con `components/hall-of-fame.tsx` (tabs por juego, podio, tabla, fila "tu mejor marca" solo con sesión).
8. **Reproductor.** Crear `app/jugar/[id]/page.tsx` con `components/game-player.tsx` (HUD, CRT, pausa, FIN, modal, guardado vía `saveScore`). SALIR lleva a `/juegos/[id]` y VOLVER AL VAULT a `/`.
9. **Limpieza y metadatos.** Eliminar restos del scaffold, añadir `generateMetadata` por ruta y comprobar `npm run lint` y `npm run build`.

Antes del paso 2, leer en `node_modules/next/dist/docs/` lo relativo a `cacheComponents`, `params` asíncronos, `generateStaticParams` y componentes cliente, según exige `CLAUDE.md`. Los componentes de UI deben seguir `/frontend-design`, respetando el diseño de la plantilla y sin inventar uno nuevo.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] Existen las rutas `/`, `/juegos/[id]`, `/jugar/[id]`, `/auth` y `/salon`, y todas cargan sin errores en la consola ni avisos de hidratación.
- [ ] `/juegos/inexistente` y `/jugar/inexistente` devuelven 404.
- [ ] `/` muestra los 8 juegos de `GAMES`.
- [ ] Escribir "gl" en la búsqueda deja solo GLOTÓN, y elegir el chip SHOOTER deja solo INVASORES y ROCAS.
- [ ] Una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en JUGAR navega a `/juegos/<id>` de ese juego.
- [ ] El Detalle muestra título, descripción larga, los 4 tags, Partidas, Mejor global, Dificultad y 10 filas de puntuaciones con las 3 primeras destacadas.
- [ ] JUGAR AHORA lleva a `/jugar/<id>` y VOLVER AL VAULT a `/`.
- [ ] En el Reproductor el puntaje sube solo, PAUSA lo detiene y muestra "EN PAUSA", y REANUDAR lo retoma.
- [ ] FIN abre el modal con la puntuación final, y GUARDAR PUNTUACIÓN añade una entrada a `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA_".
- [ ] JUGAR DE NUEVO reinicia puntaje, vidas y nivel.
- [ ] En `/auth`, la pestaña "Crear cuenta" muestra el campo de correo y "Iniciar sesión" lo oculta.
- [ ] Enviar el formulario con usuario "px_kai" guarda `{"name":"PX_KAI"}` en `av_user`, redirige a `/` y el Nav muestra "PX_KAI ▾".
- [ ] "Jugar como invitado" redirige a `/` y el Nav sigue mostrando "Iniciar Sesión".
- [ ] Tras recargar la página, la sesión se conserva.
- [ ] Hacer clic en el botón de usuario cierra la sesión y borra `av_user`.
- [ ] El Salón muestra 8 tabs, un podio con 3 puestos y 12 filas, y cambiar de tab cambia los datos.
- [ ] La fila "TU MEJOR MARCA" aparece en el Salón solo con sesión iniciada.
- [ ] En un ancho de 375 px el Nav colapsa a hamburguesa y el panel lateral abre y cierra, sin scroll horizontal.
- [ ] El link activo del Nav se resalta: Biblioteca en `/`, `/juegos/*` y `/jugar/*`, y Salón en `/salon`.
- [ ] Las fuentes pixel y mono se ven aplicadas (títulos con Press Start 2P).

## Decisiones tomadas y descartadas

- **Sí:** rutas del App Router, para tener URLs reales y compartibles. **No:** SPA con hash JSON, que ignora el router de Next.
- **Sí:** reutilizar el CSS ya portado en `app/globals.css` con las clases originales, para conservar fidelidad visual. **No:** reescribirlo en Tailwind, que supone mucho trabajo y riesgo de desviarse del diseño.
- **Sí:** mocks en cliente (localStorage y `seededScores`), con tipos en `lib/data.ts`, porque el MVP es solo visual. **No:** backend o base de datos, que van en otro spec.
- **Sí:** provider de sesión en el layout, porque el Nav, el Salón y el Reproductor necesitan el usuario. **No:** pasar `user` por props, que en App Router no es viable entre páginas.
- **Sí:** reproductor idéntico a la plantilla (puntaje simulado, modal y guardado). **No:** solo el marco estático, porque se pierde el flujo de fin de partida.
- **Sí:** fuentes con `next/font/google`, ya resuelto en `app/layout.tsx`. **No:** mantener Geist ni usar el `<link>` de Google Fonts de la plantilla.
- **Sí:** guardar `av_scores` sin leerlo todavía. **No:** mezclarlo con las puntuaciones simuladas, porque eso exige definir reglas de ranking en un spec propio.
- **Sí:** `generateStaticParams` en las rutas dinámicas. Con `cacheComponents` activo evita renderizado dinámico innecesario para un catálogo fijo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Errores de hidratación al leer localStorage en el primer render | `SessionProvider` empieza con `user = null` y lee el storage en `useEffect`. |
| `cacheComponents` y `params` asíncronos cambian el comportamiento esperado | Leer los docs de `node_modules/next/dist/docs/` antes del paso 2 y usar `await params` en las páginas. |
| localStorage bloqueado (modo privado) | Todo acceso va en try/catch y la app funciona sin persistir. |
| Desvío visual respecto a la plantilla | Mantener las clases CSS originales y comparar cada pantalla con `resources/templates/Arcade Vault.html` abierto en el navegador. |
| Fuente de verdad duplicada del CSS (`styles.css` y `globals.css`) | Tratar `app/globals.css` como la versión viva. `resources/templates/` es solo referencia. |

## Lo que **no** está en este spec

- Ningún juego jugable.
- Backend, base de datos y autenticación real.
- Ranking real y lectura de `av_scores`.
- Créditos funcionales.
- Tests automatizados.
- Reescritura del CSS a Tailwind.

Cada uno de estos puntos, si se aborda, va en su propio spec.
