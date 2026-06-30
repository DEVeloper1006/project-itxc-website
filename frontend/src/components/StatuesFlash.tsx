"use client";

import { useEffect, useState, useRef } from "react";

const HOLD_MS = 700;

export default function StatuesFlash({
  interval = 6000,
}: {
  interval?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [glitchX, setGlitchX] = useState(0);
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

  useEffect(() => {
    if (isMobile) return;

    function trigger() {
      setGlitchX((Math.random() - 0.5) * 15);
      setVisible(true);

      setTimeout(() => setVisible(false), HOLD_MS);
      timeoutRef.current = setTimeout(trigger, interval + Math.random() * 2000);
    }

    timeoutRef.current = setTimeout(trigger, 3500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobile, interval]);

  if (isMobile || !visible) return null;

  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      <img
        src="/images/statues.png"
        alt=""
        className="absolute object-contain"
        style={{
          height: "45vh",
          left: "50%",
          top: "78%",
          transform: `translate(-50%, -50%) translateX(${glitchX}px)`,
          filter: "brightness(1.3) contrast(2) grayscale(1) sepia(1) hue-rotate(-30deg) saturate(3.5)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
