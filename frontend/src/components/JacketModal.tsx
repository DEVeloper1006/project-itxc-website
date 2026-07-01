"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";

const PIN_LENGTH = 6;

export default function JacketModal({ onClose }: { onClose: () => void }) {
  const { hex } = useTheme();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    inputRefs.current[0]?.focus();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (!char) return;
    const next = [...pin];
    next[index] = char;
    setPin(next);

    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === PIN_LENGTH - 1 && next.every((c) => c !== "")) {
      const answer = next.join("");
      // TODO: replace with real answer check
      if (answer === "XXXXXX") {
        // success handler
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(Array(PIN_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (pin[index]) {
        const next = [...pin];
        next[index] = "";
        setPin(next);
      } else if (index > 0) {
        const next = [...pin];
        next[index - 1] = "";
        setPin(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center cursor-none"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0)",
        transition: "background-color 300ms ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-[90%] sm:w-[80%] max-w-2xl border backdrop-blur-md flex flex-col items-center px-6 sm:px-10 py-8 sm:py-12"
        style={{
          borderColor: `${hex}33`,
          backgroundColor: `rgba(0,0,0,0.8)`,
          boxShadow: `0 0 60px ${hex}15, inset 0 0 60px ${hex}08`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
          transition: "opacity 300ms ease, transform 300ms ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          data-hover
          className="absolute top-3 right-4 sm:top-4 sm:right-5 font-gothic text-2xl sm:text-3xl transition-opacity hover:opacity-70 cursor-none"
          style={{ color: `${hex}99` }}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          className="font-gothic text-3xl sm:text-4xl md:text-5xl tracking-wide text-center"
          style={{
            color: hex,
            textShadow: `0 0 20px ${hex}66, 0 0 40px ${hex}33`,
          }}
        >
          Jacket Giveaway
        </h2>

        {/* Riddle / prompt */}
        <p
          className="font-mono text-xs sm:text-sm text-center mt-4 sm:mt-6 max-w-md leading-relaxed tracking-wide uppercase"
          style={{ color: `${hex}99` }}
        >
          Solve the riddle to enter the giveaway
        </p>

        <p
          className="font-gothic text-base sm:text-lg md:text-xl text-center mt-3 sm:mt-4 max-w-md leading-relaxed"
          style={{ color: `${hex}cc` }}
        >
          &quot;Riddle placeholder — coming soon&quot;
        </p>

        {/* PIN boxes */}
        <div
          className={`flex gap-2 sm:gap-3 mt-6 sm:mt-8 ${shake ? "animate-shake" : ""}`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={pin[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center font-gothic text-xl sm:text-2xl md:text-3xl bg-transparent border outline-none uppercase cursor-none transition-all duration-200 focus:scale-105"
              style={{
                borderColor: pin[i] ? hex : `${hex}40`,
                color: hex,
                textShadow: pin[i] ? `0 0 8px ${hex}66` : "none",
                boxShadow: pin[i] ? `0 0 12px ${hex}22, inset 0 0 8px ${hex}11` : "none",
              }}
            />
          ))}
        </div>

        {/* Hint */}
        <span
          className="font-mono text-[10px] sm:text-xs mt-4 tracking-[0.3em] uppercase"
          style={{ color: `${hex}55` }}
        >
          Enter 6-character code
        </span>
      </div>
    </div>
  );
}
