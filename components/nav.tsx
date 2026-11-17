"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session-provider";

interface NavLink {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const LINKS: NavLink[] = [
  { href: "/", label: "Inicio", match: (p) => p === "/" },
  {
    href: "/games",
    label: "Biblioteca",
    match: (p) => p === "/games" || p.startsWith("/games/"),
  },
  { href: "/salon", label: "Salón de la Fama", match: (p) => p === "/salon" },
  { href: "/about", label: "Acerca de", match: (p) => p === "/about" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  const isAuth = pathname === "/auth";
  const isActive = (link: NavLink) => link.match(pathname);

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div
          className="pixel neon-cyan"
          style={{ fontSize: 11, marginBottom: 16 }}
        >
          MENÚ
        </div>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l) ? "active" : ""}
            onClick={close}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/auth" className={isAuth ? "active" : ""} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }}></div>
        <div
          className="pixel"
          style={{
            fontSize: 9,
            color: "var(--ink-faint)",
            letterSpacing: "0.16em",
          }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
