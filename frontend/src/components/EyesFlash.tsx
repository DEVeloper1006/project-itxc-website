"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const COPY_COUNT = 6;
const STAGGER_MS = 100;
const HOLD_MS = 800;

export default function EyesFlash({
  interval = 8000,
}: {
  interval?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [glitchY, setGlitchY] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const triggerSequence = useCallback(() => {
    setGlitchY((Math.random() - 0.5) * 10);
    setVisibleCount(0);

    for (let i = 0; i < COPY_COUNT; i++) {
      setTimeout(() => setVisibleCount(i + 1), i * STAGGER_MS);
    }

    setTimeout(() => {
      setVisibleCount(0);
    }, COPY_COUNT * STAGGER_MS + HOLD_MS);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    function loop() {
      triggerSequence();
      timeoutRef.current = setTimeout(loop, interval + Math.random() * 2000);
    }

    timeoutRef.current = setTimeout(loop, 5500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isMobile, interval, triggerSequence]);

  if (isMobile || visibleCount === 0) return null;

  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      {Array.from({ length: COPY_COUNT }).map((_, i) => {
        if (i >= visibleCount) return null;
        const pct = i / (COPY_COUNT - 1);
        const decay = 1 - i * 0.1;
        return (
          <img
            key={i}
            src="/images/eyes.png"
            alt=""
            className="absolute object-contain"
            style={{
              height: "18vh",
              left: `${pct * 85}%`,
              top: "8%",
              transform: `translateY(${glitchY * (1 - i * 0.15)}px)`,
              filter: `brightness(${1.2 + i * 0.15}) contrast(${2 + i * 0.2}) grayscale(1) sepia(1) hue-rotate(-30deg) saturate(${3 + i * 0.5})`,
              mixBlendMode: i === 0 ? "normal" : "screen",
              opacity: decay * 0.55,
            }}
          />
        );
      })}
    </div>
  );
}
