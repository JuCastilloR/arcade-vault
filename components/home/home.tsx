import Link from "next/link";
import { GAMES, RECENT_SCORES, TOP_TODAY, type Accent } from "@/lib/data";
import { RevealScope } from "@/components/reveal-scope";
import { FloatingSilhouettes } from "@/components/home/floating-silhouettes";
import { FeatureIcon, type FeatureIconKind } from "@/components/home/feature-icon";
import { MiniCard } from "@/components/home/mini-card";

const FEATURES: { i: FeatureIconKind; t: string; d: string; c: Accent }[] = [
  { i: "GAMEPAD", t: "JUEGOS CLÁSICOS", d: "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.", c: "cyan" },
  { i: "FREE", t: "100% GRATIS", d: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.", c: "yellow" },
  { i: "TROPHY", t: "LADDER BOARDS", d: "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.", c: "magenta" },
  { i: "ROCKET", t: "SIEMPRE CRECIENDO", d: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.", c: "green" },
];

const STATS = [
  { n: "12+", u: "JUEGOS", s: "Y CONTANDO" },
  { n: "MILES", u: "DE PARTIDAS", s: "JUGADAS CADA DÍA" },
  { n: "GLOBAL", u: "RANKING", s: "COMPITE CON EL MUNDO" },
];

const PLAN_ITEMS = [
  "Acceso a todos los juegos",
  "Ranking global y salón de la fama",
  "Sin anuncios entre partidas",
  "Guarda tus puntuaciones",
  "Nuevos juegos cada mes",
  "Funciona en cualquier navegador",
];

const FAQ = [
  { q: "¿REALMENTE ES GRATIS?", a: 'Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión "premium" escondida.' },
  { q: "¿NECESITO CREAR CUENTA?", a: "No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate en 10 segundos." },
  { q: "¿CÓMO SOBREVIVEN SIN COBRAR?", a: "Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos." },
];

const gameTitle = (id: string) => GAMES.find((g) => g.id === id)?.title ?? id;
const fmt = (n: number) => n.toLocaleString("es-ES");

function SectionHead({ kicker, color, title }: { kicker: string; color: Accent; title: string }) {
  return (
    <div className="section-head">
      <div className={"kicker pixel neon-" + color}>{kicker}</div>
      <h2 className="section-title">{title}</h2>
      <div className="section-rule"></div>
    </div>
  );
}

export function Home() {
  return (
    <RevealScope className="home fade-in">
      {/* HERO */}
      <section className="home-hero">
        <FloatingSilhouettes />
        <div className="home-hero-inner">
          <div className="hero-eyebrow pixel neon-yellow">
            ▸ INSERTA UNA MONEDA<span className="blink">_</span>
          </div>
          <h1 className="home-title">
            <span className="line-1">EL ARCADE</span>
            <span className="line-2">CLÁSICO ESTÁ</span>
            <span className="line-3">DE VUELTA</span>
          </h1>
          <p className="home-sub">
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className="home-ctas">
            <Link href="/games" className="btn xl pulse">
              ▶ EXPLORAR JUEGOS
            </Link>
            <Link href="/auth" className="btn xl magenta">
              ✦ CREAR CUENTA
            </Link>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>DESLIZA</span>
            <span className="arrow">▼</span>
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="home-section reveal">
        <SectionHead kicker="// 01" color="magenta" title="¿POR QUÉ ARCADE VAULT?" />
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.t}
              className={"feature-card " + f.c}
              style={{ transitionDelay: i * 80 + "ms" }}
            >
              <FeatureIcon kind={f.i} />
              <div className="ft-title pixel">{f.t}</div>
              <div className="ft-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* JUEGOS */}
      <section className="home-section reveal">
        <SectionHead kicker="// 02" color="cyan" title="JUEGOS DISPONIBLES AHORA" />
        <div className="mini-rail">
          {GAMES.slice(0, 6).map((g) => (
            <MiniCard key={g.id} game={g} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/games" className="btn lg">
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats reveal">
        <div className="stats-inner">
          {STATS.map((st, i) => (
            <div
              key={st.u}
              className="stat-block"
              style={{ transitionDelay: i * 90 + "ms" }}
            >
              <div className="stat-n neon-yellow">{st.n}</div>
              <div className="stat-u pixel">{st.u}</div>
              <div className="stat-s">{st.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVIDAD */}
      <section className="home-section reveal">
        <SectionHead kicker="// 03" color="yellow" title="ACTIVIDAD EN VIVO" />
        <div className="activity-grid">
          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel">▸ ÚLTIMAS PUNTUACIONES</div>
            </div>
            <div className="ticker">
              {RECENT_SCORES.map((r, i) => (
                <div
                  key={r.player + r.gameId}
                  className="tick-row"
                  style={{ animationDelay: i * 60 + "ms" }}
                >
                  <span className={"tk-p neon-" + r.color}>{r.player}</span>
                  <span className="tk-mid">▸ {gameTitle(r.gameId)}</span>
                  <span className="tk-s">+{fmt(r.score)}</span>
                  <span className="tk-t">{r.ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel neon-magenta">▸ TOP JUGADORES · HOY</div>
              <Link href="/salon" className="lb-link">
                VER SALÓN →
              </Link>
            </div>
            <div className="top-list">
              {TOP_TODAY.map((r, i) => (
                <div
                  key={r.rank}
                  className={"top-row" + (i < 3 ? " top" + (i + 1) : "")}
                >
                  <span className="tp-rk">#{String(r.rank).padStart(2, "0")}</span>
                  <span className="tp-bar">
                    <span className="tp-fill" style={{ width: 100 - i * 16 + "%" }}></span>
                  </span>
                  <span className="tp-p">{r.player}</span>
                  <span className="tp-s">{fmt(r.score)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="home-section reveal">
        <SectionHead kicker="// 04" color="green" title="PRECIOS" />
        <div className="pricing-grid">
          <div className="price-card">
            <div className="pc-label pixel">PLAN ÚNICO</div>
            <div className="pc-name pixel">JUGADOR VAULT</div>
            <div className="pc-amount">
              <span className="pc-amount-n">$0</span>
              <span className="pc-amount-u">/ SIEMPRE</span>
            </div>
            <div className="pc-tag">SIN TRUCOS · SIN LETRA PEQUEÑA</div>
            <ul className="pc-list">
              {PLAN_ITEMS.map((item) => (
                <li key={item}>✔ {item}</li>
              ))}
            </ul>
            <Link href="/auth" className="btn xl pulse" style={{ width: "100%" }}>
              EMPEZAR GRATIS →
            </Link>
            <div className="pc-foot">No pedimos tarjeta. Nunca lo haremos.</div>
            <div className="pc-stamp pixel" aria-hidden="true">
              FREE
              <br />
              PLAY
            </div>
          </div>

          <div className="pricing-faq">
            {FAQ.map((f) => (
              <div key={f.q} className="faq-item">
                <div className="faq-q pixel">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="home-final reveal">
        <h2 className="final-title pixel">¿LISTO PARA JUGAR?</h2>
        <Link href="/games" className="btn xl pulse final-cta">
          INSERTAR MONEDA →
        </Link>
        <div className="final-tag">Gratis. Sin registro obligatorio. Empieza en segundos.</div>
      </section>
    </RevealScope>
  );
}
