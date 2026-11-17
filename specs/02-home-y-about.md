# SPEC 02 — Home y Acerca de, con rutas unificadas bajo /games

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-17
> **Objective:** Portar a Next.js el Home (landing) y la pantalla Acerca de + Contacto de `resources/templates/home-about/`, mover la Biblioteca a `/games` y unificar todas las rutas de juegos bajo `/games`.

## Por qué existe este spec

La SPEC 01 dejó la Biblioteca en `/`. La plantilla `home-about/` añade una landing que debe ocupar `/`, así que la Biblioteca se mueve. Aprovechando el cambio, las rutas de juegos pasan a un solo prefijo (`/games`) para que las URLs sean coherentes.

Estado actual del repo (ya hecho, no se rehace):

- `app/globals.css` contiene el CSS de la SPEC 01 (970 líneas) pero **no** los estilos del Home ni de Acerca de.
- `resources/templates/home-about/styles.css` (1744 líneas) los trae a partir de `.home-hero` (línea 933 aprox.). Es solo referencia; `app/globals.css` es la versión viva.
- `app/page.tsx` renderiza `<Library />`. `components/nav.tsx` resalta "Biblioteca" en `/`, `/juegos/*` y `/jugar/*`.

## Alcance

**Dentro:**

- Home en `/` con las secciones de `home.jsx`: hero con siluetas flotantes, "¿Por qué Arcade Vault?", juegos disponibles, stats, actividad en vivo, precios + FAQ y CTA final.
- Acerca de en `/about` con las secciones de `about.jsx`: misión, highlights, divisor animado y formulario de contacto.
- Formulario de contacto simulado en cliente: validación de campos vacíos con animación `shake` y terminal de éxito con el nombre en mayúsculas. No envía nada.
- Efecto de aparición al hacer scroll (`.reveal` / `.in`) con IntersectionObserver.
- Rutas nuevas y renombradas:
  - `/` → Home.
  - `/games` → Biblioteca (antes `/`).
  - `/games/[id]` → Detalle (antes `/juegos/[id]`).
  - `/games/[id]/play` → Reproductor (antes `/jugar/[id]`).
  - `/about` → Acerca de.
- Actualizar todos los links internos (Nav, footer, tarjetas, Detalle, Reproductor, Auth, Salón) y los links activos del Nav.
- Añadir "Inicio" y "Acerca de" al Nav (escritorio y menú móvil), como en `nav.jsx`.
- Copiar a `app/globals.css` los estilos del Home y de Acerca de desde `home-about/styles.css`.
- Constantes tipadas del Home en `lib/data.ts`.
- Metadatos por ruta con `generateMetadata` o `metadata`.
- Fidelidad visual con la plantilla, incluido el diseño responsive.

**Fuera de alcance (para futuros specs):**

- Envío real del formulario de contacto (Route Handler, Server Action, email, base de datos).
- Datos reales en "Actividad en vivo" y "Top jugadores": son simulados y no leen `av_scores`.
- Autenticación real y cualquier backend.
- Juegos jugables.
- Contador de créditos funcional.
- Tests automatizados (no hay framework configurado).
- Reescritura del CSS a utilidades Tailwind.
- Redirecciones desde las URLs antiguas (`/juegos/*`, `/jugar/*`): el proyecto no está en producción.

## Modelo de datos

Tipos y constantes nuevos en `lib/data.ts`; el resto del modelo de la SPEC 01 no cambia.

```ts
export interface RecentScore {
  player: string;    // "NEONFOX"
  gameId: string;    // Game.id, se resuelve a Game.title al renderizar
  score: number;
  ago: string;       // ya formateado: "hace 2 min"
  color: Accent;
}

export interface TopPlayer {
  rank: number;      // 1..5
  player: string;
  score: number;
}

export const RECENT_SCORES: RecentScore[]; // 7 filas, valores de home.jsx
export const TOP_TODAY: TopPlayer[];       // 5 filas, valores de home.jsx
```

Contenido que se queda en los componentes (es texto estático, no datos): features, stats, plan de precios, FAQ y highlights.

Estado local del formulario de contacto (no se persiste):

```ts
const form = { name: "", email: "", msg: "" };
const sent: string | null; // nombre enviado; null = formulario visible
```

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`.
- El rail de juegos usa `GAMES.slice(0, 6)`.
- Los nombres de juego de `RECENT_SCORES` se resuelven por `gameId`; ninguna fila usa un id que no exista en `GAMES`.

## Plan de implementación

Antes del paso 1, leer en `node_modules/next/dist/docs/` lo relativo a `cacheComponents`, rutas dinámicas anidadas, `params` asíncronos y componentes cliente, según exige `CLAUDE.md`. Los componentes de UI siguen `/frontend-design`, respetando el diseño de la plantilla.

1. **Reubicar rutas existentes.** Mover `app/juegos/[id]` a `app/games/[id]`, `app/jugar/[id]` a `app/games/[id]/play`, y la Biblioteca a `app/games/page.tsx`. Dejar un `app/page.tsx` provisional que renderice `<Library />`. Actualizar los `href` de `game-card.tsx`, `library.tsx`, Detalle, `game-player.tsx`, `auth-form.tsx` y `hall-of-fame.tsx`. Verificación: `/games`, `/games/<id>` y `/games/<id>/play` cargan y `npx tsc --noEmit` pasa.
2. **Nav y footer.** En `components/nav.tsx` añadir Inicio (activo solo en `/`), Biblioteca (activo en `/games` y `/games/*`) y Acerca de (activo en `/about`), en escritorio y panel móvil. Actualizar `components/footer.tsx` si enlaza rutas antiguas. Verificación: los links resaltan según la ruta.
3. **Datos del Home.** Añadir `RecentScore`, `TopPlayer`, `RECENT_SCORES` y `TOP_TODAY` a `lib/data.ts`. Verificación: `npx tsc --noEmit` pasa.
4. **Estilos.** Copiar a `app/globals.css` los bloques del Home y de Acerca de de `home-about/styles.css` (desde `.home-hero` hasta el final), sin duplicar reglas que ya existan. Verificación: `npm run build` pasa y `/games` no cambia visualmente.
5. **Utilidades compartidas.** Crear `hooks/use-reveal.ts` (`"use client"`, IntersectionObserver sobre `.reveal`, con cleanup) y `components/home/floating-silhouettes.tsx` (8 SVG decorativos, `aria-hidden`).
6. **Home.** Crear `components/home/home.tsx`, `mini-card.tsx` y `feature-icon.tsx`. Las navegaciones usan `next/link` en lugar de `navigate`. Reemplazar `app/page.tsx` por el Home y añadir metadatos. Verificación: `/` muestra las 6 secciones y el CTA lleva a `/games`.
7. **Acerca de.** Crear `components/about/about.tsx` y `contact-form.tsx` (`"use client"`, validación + `shake` + terminal de éxito) y `app/about/page.tsx` con metadatos. Verificación: enviar vacío hace `shake`; enviar completo muestra la terminal.
8. **Limpieza.** Borrar `app/juegos` y `app/jugar` si quedaron vacíos, comprobar que no queden referencias a `/juegos` ni `/jugar` (`grep`), y correr `npm run lint` y `npm run build`.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] `/`, `/games`, `/games/[id]`, `/games/[id]/play`, `/about`, `/auth` y `/salon` cargan sin errores en la consola ni avisos de hidratación.
- [ ] `/juegos/bloque-buster` y `/jugar/bloque-buster` devuelven 404, y `/games/inexistente` y `/games/inexistente/play` también.
- [ ] No queda ninguna referencia a `/juegos` ni `/jugar` en `app/` ni `components/`.
- [ ] `/` muestra el hero con el título "EL ARCADE CLÁSICO ESTÁ DE VUELTA" y las 8 siluetas flotantes.
- [ ] `/` muestra 4 tarjetas de features, 6 mini-cards de juegos, 3 bloques de stats, 7 filas de últimas puntuaciones, 5 filas de top jugadores, la tarjeta de precios con 6 ítems y 3 preguntas de FAQ.
- [ ] El botón EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA llevan a `/games`; CREAR CUENTA y EMPEZAR GRATIS llevan a `/auth`; VER SALÓN lleva a `/salon`.
- [ ] Hacer clic en una mini-card navega a `/games/<id>` de ese juego.
- [ ] Las secciones con `.reveal` reciben la clase `in` al entrar en el viewport.
- [ ] `/games` muestra los 8 juegos y conserva búsqueda, chips y estado vacío de la SPEC 01.
- [ ] JUGAR AHORA en el Detalle lleva a `/games/<id>/play`; SALIR del Reproductor lleva a `/games/<id>`.
- [ ] El Nav muestra Inicio, Biblioteca, Salón de la Fama y Acerca de, en escritorio y en el panel móvil.
- [ ] El link activo del Nav es: Inicio en `/`; Biblioteca en `/games`, `/games/*` y `/games/*/play`; Salón en `/salon`; Acerca de en `/about`.
- [ ] En `/about`, enviar el formulario con algún campo vacío activa `shake` y no muestra la terminal.
- [ ] En `/about`, enviar con nombre "px_kai", correo y mensaje muestra "MENSAJE RECIBIDO" con "PX_KAI" en la terminal.
- [ ] ENVIAR OTRO MENSAJE vuelve al formulario con los tres campos vacíos.
- [ ] En un ancho de 375 px, `/` y `/about` no tienen scroll horizontal y el Nav colapsa a hamburguesa.
- [ ] Cada ruta tiene un `<title>` propio.

## Decisiones tomadas y descartadas

- **Sí:** Home en `/` y Biblioteca en `/games`, tal como pidió el usuario. **No:** `/biblioteca` o `/juegos`, descartadas por el usuario.
- **Sí:** unificar todo bajo `/games` (`/games`, `/games/[id]`, `/games/[id]/play`) por coherencia, a petición del usuario. **No:** mantener `/juegos/[id]` y `/jugar/[id]`, que mezclaría español e inglés.
- **Sí:** `/games/[id]/play` para el Reproductor, anidado bajo su juego. **No:** `/play/[id]`, que abriría un segundo prefijo. El usuario pidió "todo con /games"; esta forma concreta es una interpretación y se puede cambiar antes de implementar.
- **Sí:** incluir Acerca de en este spec, a petición del usuario. **No:** dejarlo para otro spec.
- **Sí:** ruta `/about` y formulario simulado en cliente, consistente con la plantilla y con el MVP visual de la SPEC 01. **No:** `/acerca-de` ni envío real. Ambas son opciones por defecto que no se confirmaron con el usuario; el envío real iría en su propio spec.
- **Sí:** añadir los estilos a `app/globals.css`, consistente con la SPEC 01. **No:** un `home.css` aparte, que rompe la regla "globals.css es la versión viva".
- **Sí:** `RECENT_SCORES` y `TOP_TODAY` tipados en `lib/data.ts`, con `gameId` en vez de título duplicado. **No:** arrays inline en el componente, que dispersan los datos.
- **Sí:** `next/link` para la navegación. **No:** replicar `navigate({ name })` de la plantilla, que pertenece a la SPA con hash.
- **Sí:** un solo hook `useReveal` compartido por Home y Acerca de. **No:** duplicar el IntersectionObserver como hacen `home.jsx` y `about.jsx`.
- **Sí:** sin redirecciones desde las URLs antiguas. **No:** `redirects()` en `next.config.ts`, porque no hay tráfico que conservar.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Quedan links a `/juegos` o `/jugar` tras el renombrado | El paso 8 incluye `grep` y un criterio de aceptación que lo verifica. |
| Reglas CSS del Home chocan o duplican las de la SPEC 01 | Copiar solo desde `.home-hero`, revisar selectores repetidos y comprobar `/games` tras el paso 4. |
| IntersectionObserver y `.reveal` fallan tras navegar entre rutas | El hook se registra en `useEffect` con cleanup y se prueba navegando Home → Biblioteca → Home. |
| Hidratación: `toLocaleString("es-ES")` difiere entre servidor y cliente | Es determinista con locale explícito; verificar que no haya avisos en consola. |
| `cacheComponents` altera el render de las rutas nuevas | Leer los docs antes del paso 1; Home y Acerca de son contenido estático con islas cliente. |
| Un `gameId` de `RECENT_SCORES` no existe en `GAMES` | `tsc` no lo detecta con `string`; comprobarlo manualmente en el paso 3 (los títulos de la plantilla deben mapear a ids reales). |

## Lo que **no** está en este spec

- Envío real del formulario de contacto.
- Datos reales de actividad y ranking en el Home.
- Backend, base de datos y autenticación real.
- Juegos jugables.
- Créditos funcionales.
- Redirecciones desde `/juegos` y `/jugar`.
- Tests automatizados.
- Reescritura del CSS a Tailwind.

Cada uno de estos puntos, si se aborda, va en su propio spec.
