"use client";

import { useEffect, useState, useRef } from "react";

const HOLD_MS = 900;

export default function KrisFlash({
  interval = 7000,
}: {
  interval?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [glitchX, setGlitchX] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 1280);
    }
    check();
    window.addEventListener("resize", check); // Fix: Pass the event listener function directly
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    function trigger() {
      setGlitchX((Math.random() - 0.5) * 20);
      setVisible(true);

      setTimeout(() => setVisible(false), HOLD_MS);
      timeoutRef.current = setTimeout(trigger, interval + Math.random() * 2000);
    }

    // Offset from Scarface flash (starts at 2s) — start at 4.5s
    timeoutRef.current = setTimeout(trigger, 4500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobile, interval]);

  if (isMobile || !visible) return null;

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {/* 2nd slot: left 20%, centered in that 20% band */}
      <img
        src="/images/kris.png"
        alt=""
        className="absolute object-contain"
        style={{
          height: "95vh",
          left: "20%",
          top: "50%",
          transform: `translate(-50%, -50%) translateX(${glitchX}px)`,
          filter: "brightness(1.3) contrast(2) grayscale(1) sepia(1) hue-rotate(-30deg) saturate(3.5)",
          opacity: 0.9,
        }}
      />
      {/* 4th slot: left 80%, centered in that 20% band */}
      <img
        src="/images/kris.png"
        alt=""
        className="absolute object-contain"
        style={{
          height: "95vh",
          left: "80%",
          top: "50%",
          transform: `translate(-50%, -50%) translateX(${-glitchX}px)`,
          filter: "brightness(1.3) contrast(2) grayscale(1) sepia(1) hue-rotate(-30deg) saturate(3.5)",
          opacity: 0.9,
        }}
      />
    </div>
  );
}
