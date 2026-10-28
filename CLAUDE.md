# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Arcade Vault: plataforma para jugar online y competir por la mayor cantidad de puntos. El repo es todavía el scaffold de Create Next App (solo `app/layout.tsx` y `app/page.tsx`). El README indica que se trabaja con Spec Driven Design (`/spec` y `/spec-impl`) usando los skills de `Klerith/fernando-skills`.

## Comandos

```bash
npm run dev     # servidor de desarrollo (next dev)
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint (flat config en eslint.config.mjs)
```

No hay framework de tests configurado todavía.

## Next.js no es el que conoces

Next 16.4.3 + React 19.3 con breaking changes respecto a versiones anteriores. Antes de escribir código, lee la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) y respeta los avisos de deprecación. `AGENTS.md` lo exige y `next dev` lo regenera.

## Arquitectura / configuración

- App Router en `app/` (no hay `pages/`). El layout raíz usa el tipo global `LayoutProps<"/">` en lugar de tipar `children` a mano.
- `next.config.ts` activa flags experimentales/nuevos que cambian el modelo de render: `cacheComponents: true`, `partialPrefetching: true` y `experimental.agentFeedback`. Consulta los docs antes de usar fetch/datos dinámicos, porque `cacheComponents` altera el comportamiento de caché y renderizado.
- Tailwind v4 se carga vía regla de Turbopack (`@tailwindcss/turbopack` para `*.css`) en `next.config.ts`; los estilos entran por `@import "tailwindcss"` en `app/globals.css`, con tokens de tema en `@theme inline`.
- Alias de imports: `@/*` apunta a la raíz del repo.
- Fuentes Geist vía `next/font/google`, expuestas como variables CSS `--font-geist-sans` / `--font-geist-mono`.
