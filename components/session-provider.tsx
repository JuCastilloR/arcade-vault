"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SavedScore, SessionUser } from "@/lib/data";

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

interface SessionContextValue {
  user: SessionUser | null;
  login: (name: string) => void;
  signOut: () => void;
  saveScore: (game: string, score: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as SessionUser).name === "string"
    ) {
      return { name: (parsed as SessionUser).name };
    }
  } catch {
    // localStorage bloqueado o JSON inválido: se ignora
  }
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Siempre empieza en null para que SSR y primer render del cliente coincidan.
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de localStorage tras montar (evita errores de hidratación)
    setUser(readUser());
  }, []);

  const login = useCallback((name: string) => {
    const next: SessionUser = {
      name: name.trim().toUpperCase().slice(0, 10) || "JUGADOR",
    };
    setUser(next);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {
      // sin persistencia
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // sin persistencia
    }
  }, []);

  const saveScore = useCallback(
    (game: string, score: number) => {
      try {
        const raw = localStorage.getItem(SCORES_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const list: SavedScore[] = Array.isArray(parsed) ? parsed : [];
        list.push({
          game,
          score,
          name: user?.name ?? "INVITADO",
          at: Date.now(),
        });
        localStorage.setItem(SCORES_KEY, JSON.stringify(list));
      } catch {
        // sin persistencia
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, login, signOut, saveScore }),
    [user, login, signOut, saveScore],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
