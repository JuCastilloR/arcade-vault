# SPEC 03 — Envío real del formulario de contacto con Resend

> **Status:** Aprobado
> **Depends on:** SPEC 02
> **Date:** 2026-11-18
> **Objective:** Reemplazar la simulación del formulario de contacto de `/about` por un envío real de correo al equipo mediante un Route Handler `POST /api/contact` que usa Resend.

## Por qué existe este spec

La SPEC 02 portó `/about` desde `resources/templates/home-about/about.jsx` y dejó el formulario de contacto como simulación en cliente: valida campos vacíos, hace `shake` y muestra la terminal de éxito sin enviar nada. El envío real quedó explícitamente fuera de alcance de esa spec y es lo que se aborda aquí.

Estado actual del repo (ya hecho, no se rehace):

- `/about` existe con `components/about/about.tsx` y `components/about/contact-form.tsx` (`"use client"`), con los textos, estilos y la terminal de éxito (`.terminal-success`) de la plantilla.
- `.env.template` existe y está vacío; `.gitignore` ya lo excluye de la regla `.env*` (`!.env.template`).
- No hay dependencia de `resend` ni carpeta `app/api/`.

## Alcance

**Dentro:**

- Dependencia `resend` (SDK oficial).
- Route Handler `POST /api/contact` en `app/api/contact/route.ts` que valida el cuerpo y envía un correo de notificación al equipo con Resend.
- Módulo de validación compartido `lib/contact.ts`, usado por el cliente (antes de enviar) y por el servidor (fuente de verdad).
- Validación endurecida: nombre, email con formato válido y mensaje con longitudes acotadas.
- Honeypot: campo oculto que los bots rellenan; el servidor responde éxito sin enviar nada.
- Configuración por variables de entorno (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) documentadas en `.env.template`.
- Cambios en `components/about/contact-form.tsx`: llamada `fetch` real, estado "enviando", mensaje de error con reintento, y la terminal de éxito solo tras respuesta 200.
- Estilos mínimos en `app/globals.css` para el aviso de error y el estado deshabilitado del botón.
- Remitente por defecto `onboarding@resend.dev` (sandbox de Resend).

**Fuera de alcance (para futuros specs):**

- Correo de confirmación al visitante (acuse automático).
- Dominio propio verificado en Resend (el sandbox solo entrega al correo dueño de la cuenta de Resend).
- Rate limiting por IP (en memoria no funciona en serverless y requeriría Redis/KV).
- Guardar los mensajes en base de datos o cualquier otro almacenamiento.
- Plantillas de correo HTML (React Email); el correo es texto plano.
- CAPTCHA (Turnstile, reCAPTCHA).
- Tests automatizados (no hay framework configurado).
- Cambios de diseño en `/about`: la UI de la plantilla no se toca más allá de lo listado arriba.

## Modelo de datos

No hay persistencia. Solo tipos y contratos nuevos.

En `lib/contact.ts`:

```ts
export interface ContactInput {
  name: string;     // 1..50 caracteres tras trim
  email: string;    // formato válido, máx. 254
  msg: string;      // 10..2000 caracteres tras trim
  website?: string; // honeypot: debe llegar vacío
}

export type ContactField = "name" | "email" | "msg";

export const CONTACT_LIMITS = {
  nameMax: 50,
  emailMax: 254,
  msgMin: 10,
  msgMax: 2000,
} as const;

/** Devuelve los campos inválidos; lista vacía = válido. Sin dependencias, usable en cliente y servidor. */
export function validateContact(input: Partial<ContactInput>): ContactField[];
```

Contrato de `POST /api/contact` (JSON):

| Caso | Estado | Cuerpo |
| --- | --- | --- |
| Éxito (o honeypot relleno) | `200` | `{ "ok": true }` |
| JSON inválido o campos inválidos | `400` | `{ "ok": false, "fields": ContactField[] }` |
| Resend rechaza o falla | `502` | `{ "ok": false, "error": "send_failed" }` |
| Falta configuración del servidor | `500` | `{ "ok": false, "error": "not_configured" }` |

Variables de entorno (`.env.template` documenta los nombres con valores vacíos o de ejemplo, nunca secretos reales):

```
RESEND_API_KEY=            # API key de Resend (empieza por re_)
CONTACT_TO_EMAIL=          # destino de los mensajes; en sandbox, el correo de la cuenta de Resend
CONTACT_FROM_EMAIL=Arcade Vault <onboarding@resend.dev>
```

Correo enviado (texto plano):

- `from`: `CONTACT_FROM_EMAIL`.
- `to`: `CONTACT_TO_EMAIL`.
- `replyTo`: el `email` del visitante.
- `subject`: `[Arcade Vault] Mensaje de <name>`, con saltos de línea del nombre eliminados.
- `text`: nombre, email y mensaje.

## Plan de implementación

Antes del paso 1, leer en `node_modules/next/dist/docs/` lo relativo a Route Handlers y a su comportamiento con `cacheComponents`, según exige `CLAUDE.md`, y la documentación vigente del SDK de Resend (`emails.send` y forma de su respuesta).

1. **Dependencia y entorno.** Instalar `resend` con `npm install resend`. Rellenar `.env.template` con los tres nombres de variable y comentarios. Verificación: `npx tsc --noEmit` pasa y `.env.template` aparece como archivo versionable en `git status`.
2. **Validación compartida.** Crear `lib/contact.ts` con `ContactInput`, `ContactField`, `CONTACT_LIMITS` y `validateContact`. Verificación: `npx tsc --noEmit` pasa; revisión manual con casos límite (email sin dominio, mensaje de 9 y 10 caracteres, nombre de 51 caracteres).
3. **Route Handler.** Crear `app/api/contact/route.ts` con `POST`: parsear JSON (400 si falla), descartar con 200 si `website` no está vacío, validar con `validateContact` (400 con `fields`), comprobar variables de entorno (500 `not_configured`), enviar con `Resend` en texto plano con `replyTo` y manejar el `error` de la respuesta del SDK (502 `send_failed`) sin filtrar detalles ni la API key al cliente. Verificación: `curl` a `/api/contact` con cuerpo vacío devuelve 400 y con cuerpo válido devuelve 200 y llega el correo.
4. **Formulario.** Modificar `components/about/contact-form.tsx`: añadir el campo honeypot oculto (fuera de pantalla, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`); validar en cliente con `validateContact` y mantener `shake` para campos inválidos; `fetch("/api/contact")` con estado `sending` (botón deshabilitado y texto "ENVIANDO…"); en 200 mostrar la terminal de éxito con el nombre; en cualquier otro resultado o error de red mostrar un aviso de error conservando los datos y permitiendo reintentar. Verificación: los tres escenarios (éxito, validación, fallo) se comportan según los criterios.
5. **Estilos.** Añadir a `app/globals.css` las reglas del aviso de error del formulario (reutilizando los tokens de color existentes) y del botón deshabilitado, siguiendo `/frontend-design` y la estética terminal de la plantilla. Verificación: `/about` no cambia visualmente en su estado normal.
6. **Verificación final.** Probar el flujo completo en el navegador con una API key real de sandbox, forzar el fallo (API key inválida) y correr `npm run lint` y `npm run build`.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] `resend` figura en `dependencies` de `package.json`.
- [ ] `.env.template` lista `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL`, sin ningún valor secreto real, y `.env.local` (con los valores reales) no aparece en `git status`.
- [ ] `POST /api/contact` con un cuerpo válido devuelve `200 { "ok": true }` y el correo llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <name>`, y su `Reply-To` es el email del visitante.
- [ ] `POST /api/contact` con cuerpo vacío, email `abc`, mensaje de 9 caracteres o nombre de 51 caracteres devuelve `400` con los campos inválidos en `fields` y no envía ningún correo.
- [ ] `POST /api/contact` con JSON malformado devuelve `400`.
- [ ] `POST /api/contact` con `website` relleno devuelve `200 { "ok": true }` y no envía ningún correo.
- [ ] Con `RESEND_API_KEY` ausente devuelve `500 { "error": "not_configured" }`; con una API key inválida devuelve `502 { "error": "send_failed" }`. Ninguna respuesta contiene la API key ni el mensaje de error crudo de Resend.
- [ ] En `/about`, enviar con algún campo vacío o inválido activa `shake`, no llama a la API y no muestra la terminal.
- [ ] En `/about`, enviar un formulario válido deshabilita el botón y muestra "ENVIANDO…" mientras la petición está en curso.
- [ ] En `/about`, tras la respuesta 200 aparece la terminal con "MENSAJE RECIBIDO" y el nombre en mayúsculas, y ENVIAR OTRO MENSAJE vuelve al formulario con los tres campos vacíos.
- [ ] En `/about`, si la API responde error o no hay red, se muestra un aviso de error, los tres campos conservan lo escrito, el botón vuelve a estar habilitado y la terminal de éxito no aparece.
- [ ] El campo honeypot no es visible ni enfocable con teclado y no altera el diseño en 375 px ni en escritorio.
- [ ] `RESEND_API_KEY` no aparece en el bundle del cliente (no hay prefijo `NEXT_PUBLIC_` y `route.ts` es el único módulo que la lee).
- [ ] En un ancho de 375 px, `/about` sigue sin scroll horizontal.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en `/about`.

## Decisiones tomadas y descartadas

- **Sí:** alcance limitado al envío real, reutilizando la UI de `/about` de la SPEC 02, a elección del usuario. **No:** rehacer o re-portar `about.jsx`, que duplicaría trabajo ya implementado.
- **Sí:** Route Handler `POST /api/contact`, a elección del usuario. **No:** Server Action, que evitaría exponer un endpoint pero ata el envío al formulario; el endpoint HTTP permite probarlo con `curl` y consumirlo desde otros clientes más adelante.
- **Sí:** solo notificación al equipo. **No:** correo de confirmación al visitante, que exige dominio verificado en Resend y abre decisiones sobre contenido y spam.
- **Sí:** remitente `onboarding@resend.dev` (sandbox). **No:** dominio propio por ahora; queda para un spec posterior cuando exista dominio verificado. Consecuencia conocida: en sandbox Resend solo entrega al correo de la cuenta, por lo que `CONTACT_TO_EMAIL` debe ser ese correo.
- **Sí:** tres variables de entorno (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`), para pasar a dominio propio solo cambiando configuración. **No:** valores fijos en el código.
- **Sí:** error visible en el formulario con los datos conservados y reintento. **No:** terminal de error con estilos nuevos, que añade diseño no pedido, ni ocultar el fallo mostrando éxito.
- **Sí:** validación en servidor como fuente de verdad más honeypot, y la misma función `validateContact` en cliente para no duplicar reglas. **No:** confiar solo en la validación del cliente, que se elude con `curl`.
- **Sí:** correo en texto plano. **No:** HTML con los datos del visitante, que obliga a escapar contenido no confiable y añade React Email sin necesidad.
- **Sí:** sin rate limiting. **No:** limitador en memoria, que no es fiable en serverless; si el abuso aparece, irá en su propio spec con almacenamiento externo.
- **Sí:** endurecer la validación (email con formato, nombre ≤ 50, mensaje 10–2000). **No:** mantener solo "no vacío", que dejaría pasar basura al buzón del equipo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Sandbox de Resend rechaza destinatarios distintos al dueño de la cuenta | Documentarlo en `.env.template` y en las decisiones; el criterio de aceptación usa el correo de la cuenta. |
| Abuso del endpoint (spam al buzón del equipo, consumo de cuota de Resend) | Honeypot y validación de longitudes; el rate limiting queda como siguiente spec si hace falta. |
| Fuga de la API key o de errores internos al cliente | Variable sin prefijo `NEXT_PUBLIC_`, lectura solo en `route.ts` y respuestas de error genéricas. |
| Inyección de cabeceras o contenido en el asunto/cuerpo | Se eliminan saltos de línea del nombre en el asunto y el cuerpo va en texto plano. |
| `cacheComponents` altera el comportamiento del Route Handler | Leer los docs antes del paso 1; un `POST` no se cachea, pero se verifica con la prueba real. |
| La API key real se sube al repo por error | `.gitignore` ya excluye `.env*` salvo `.env.template`; el criterio de aceptación comprueba `git status`. |
| El SDK de Resend cambia la forma de su respuesta | Consultar la documentación vigente antes del paso 3 y manejar tanto `error` como excepciones de red. |

## Lo que **no** está en este spec

- Correo de confirmación al visitante.
- Dominio propio verificado en Resend.
- Rate limiting y CAPTCHA.
- Almacenamiento de mensajes en base de datos.
- Plantillas de correo HTML.
- Cambios de diseño en `/about`.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propio spec.
