"use client";

import { useRef } from "react";
import { useTheme } from "@/lib/theme";

export default function ColorPicker() {
  const { hex, setColor } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      onClick={() => inputRef.current?.click()}
      data-hover
      className="fixed bottom-4 left-4 z-[60] w-8 h-8 rounded-full border border-white/20 hover:border-white/50 transition-all hover:scale-110 cursor-none"
      style={{
        backgroundColor: hex,
        boxShadow: `0 0 12px ${hex}66, 0 0 4px ${hex}44`,
      }}
    >
      <input
        ref={inputRef}
        type="color"
        value={hex}
        onChange={(e) => setColor(e.target.value)}
        className="sr-only"
      />
    </button>
  );
}
