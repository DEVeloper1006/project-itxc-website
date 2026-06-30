"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ThemeCtx {
  hex: string;
  r: number;
  g: number;
  b: number;
  setColor: (hex: string) => void;
}

const DEFAULT = "#ff1e1e";

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const ThemeContext = createContext<ThemeCtx>({
  hex: DEFAULT,
  ...hexToRgb(DEFAULT),
  setColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hex, setHex] = useState(DEFAULT);
  const { r, g, b } = hexToRgb(hex);

  useEffect(() => {
    const stored = localStorage.getItem("itxc-accent");
    if (stored && /^#[0-9a-f]{6}$/i.test(stored)) {
      setHex(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty("--accent-r", String(r));
    document.documentElement.style.setProperty("--accent-g", String(g));
    document.documentElement.style.setProperty("--accent-b", String(b));
  }, [hex, r, g, b]);

  const setColor = useCallback((newHex: string) => {
    setHex(newHex);
    localStorage.setItem("itxc-accent", newHex);
  }, []);

  return (
    <ThemeContext.Provider value={{ hex, r, g, b, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function getStoredColor(): { hex: string; r: number; g: number; b: number } {
  if (typeof window === "undefined") return { hex: DEFAULT, ...hexToRgb(DEFAULT) };
  const stored = localStorage.getItem("itxc-accent");
  const hex = stored && /^#[0-9a-f]{6}$/i.test(stored) ? stored : DEFAULT;
  return { hex, ...hexToRgb(hex) };
}
