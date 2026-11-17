"use client";

import { useEffect, type RefObject } from "react";

/**
 * Añade la clase `in` a cada `.reveal` dentro de `scope` cuando entra en el viewport.
 *
 * Se limita al contenedor (y no a `document`) porque con `cacheComponents` Next.js
 * mantiene las rutas visitadas ocultas en el DOM mediante <Activity>.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const els = root.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scope]);
}
