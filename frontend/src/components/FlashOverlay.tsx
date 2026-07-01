"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const FLASH_IMAGES = ["/images/flash-scarface.png"];
const COPY_COUNT = 5;
const STAGGER_MS = 120;

export default function FlashOverlay({
  interval = 4000,
  holdDuration = 800,
}: {
  interval?: number;
  holdDuration?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [flash, setFlash] = useState<{
    src: string;
    scale: number;
    glitchX: number;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 1280);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const triggerSequence = useCallback(() => {
    const src = FLASH_IMAGES[Math.floor(Math.random() * FLASH_IMAGES.length)];
    setFlash({
      src,
      scale: 0.9 + Math.random() * 0.3,
      glitchX: (Math.random() - 0.5) * 40,
    });
    setVisibleCount(0);

    // Stagger each copy appearing one by one
    for (let i = 0; i < COPY_COUNT; i++) {
      setTimeout(() => setVisibleCount(i + 1), i * STAGGER_MS);
    }

    // Hold all visible, then clear
    setTimeout(() => {
      setVisibleCount(0);
      setFlash(null);
    }, COPY_COUNT * STAGGER_MS + holdDuration);
  }, [holdDuration]);

  useEffect(() => {
    if (isMobile) return;

    function loop() {
      triggerSequence();
      timeoutRef.current = setTimeout(loop, interval + Math.random() * 1500);
    }

    timeoutRef.current = setTimeout(loop, 2000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isMobile, interval, triggerSequence]);

  if (isMobile || !flash || visibleCount === 0) return null;

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {Array.from({ length: COPY_COUNT }).map((_, i) => {
        if (i >= visibleCount) return null;
        const pct = i / (COPY_COUNT - 1);
        const ox = pct * 100 - 15;
        const oy = pct * 100 - 15;
        const decay = 1 - i * 0.12;
        return (
          <img
            key={i}
            src={flash.src}
            alt=""
            className="absolute object-contain"
            style={{
              width: "55vw",
              maxWidth: "600px",
              left: `${ox}%`,
              top: `${oy}%`,
              transform: `translate(-30%, -30%) translateX(${flash.glitchX * (1 - i * 0.2)}px) scale(${flash.scale})`,
              filter: `brightness(${1.2 + i * 0.2}) contrast(${2 + i * 0.3}) grayscale(1) sepia(1) hue-rotate(-30deg) saturate(${3 + i})`,
              mixBlendMode: i === 0 ? "normal" : "screen",
              opacity: decay * 0.45,
            }}
          />
        );
      })}
    </div>
  );
}
