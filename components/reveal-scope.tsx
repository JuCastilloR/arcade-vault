"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

/** Contenedor cliente que activa `useReveal` sobre sus hijos (que pueden ser de servidor). */
export function RevealScope({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
