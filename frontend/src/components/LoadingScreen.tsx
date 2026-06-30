"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getStoredColor } from "@/lib/theme";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const LOAD_DURATION = 3500;

const GLITCH_LINES = [
  "ITXC SYSTEM v2.06",
  "ESTABLISHING CONNECTION...",
  "LOADING ASSETS",
  "DECRYPTING VISUAL DATA",
  "INITIALIZING ENVIRONMENT",
];

const FLASH_IMAGES = ["/images/flash-scarface.png"];
const COPY_COUNT = 5;
const STAGGER_MS = 100;

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [scrambledText, setScrambledText] = useState("");
  const [activeLine, setActiveLine] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [flash, setFlash] = useState<{
    src: string;
    scale: number;
    glitchX: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTime = useRef(Date.now());
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const accent = useRef(getStoredColor());

  // Minimal matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const cols = Math.floor(w / 18);
    const drops = new Float32Array(cols);
    for (let i = 0; i < cols; i++) drops[i] = Math.random() * -h;

    let raf: number;
    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "14px monospace";

      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const a = 0.15 + Math.random() * 0.15;
        ctx.fillStyle = `rgba(${accent.current.r}, ${accent.current.g}, ${accent.current.b}, ${a})`;
        ctx.fillText(ch, i * 18, drops[i]);
        drops[i] += 12 + Math.random() * 4;
        if (drops[i] > h) drops[i] = Math.random() * -100;
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function onResize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Flashing image bursts
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let flashTimeout: ReturnType<typeof setTimeout>;

    function triggerFlash() {
      const src = FLASH_IMAGES[Math.floor(Math.random() * FLASH_IMAGES.length)];
      setFlash({
        src,
        scale: 0.9 + Math.random() * 0.3,
        glitchX: (Math.random() - 0.5) * 40,
      });
      setVisibleCount(0);

      for (let i = 0; i < COPY_COUNT; i++) {
        setTimeout(() => setVisibleCount(i + 1), i * STAGGER_MS);
      }

      // Hold all visible, then clear
      flashTimeout = setTimeout(() => {
        setVisibleCount(0);
        setFlash(null);
      }, COPY_COUNT * STAGGER_MS + 600);

      timeout = setTimeout(triggerFlash, COPY_COUNT * STAGGER_MS + 600 + 300 + Math.random() * 400);
    }

    timeout = setTimeout(triggerFlash, 600);

    return () => {
      clearTimeout(timeout);
      clearTimeout(flashTimeout);
    };
  }, []);

  // Progress bar + scramble text
  useEffect(() => {
    let raf: number;
    function tick() {
      const elapsed = Date.now() - startTime.current;
      const t = Math.min(elapsed / LOAD_DURATION, 1);
      const eased = 1 - (1 - t) ** 3;
      setProgress(eased);

      const lineIdx = Math.min(
        Math.floor(t * GLITCH_LINES.length),
        GLITCH_LINES.length - 1
      );
      setActiveLine(lineIdx);

      const line = GLITCH_LINES[lineIdx];
      const reveal = Math.floor(t * 3 * line.length) - lineIdx * line.length;
      let out = "";
      for (let i = 0; i < line.length; i++) {
        if (i < reveal) {
          out += line[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setScrambledText(out);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current();
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Flashing distorted image — sequential diagonal cascade */}
      {flash && visibleCount > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
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
                  opacity: decay * 0.8,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1
          className="font-gothic text-5xl sm:text-6xl md:text-7xl tracking-wide"
          style={{
            color: accent.current.hex,
            textShadow:
              `0 0 20px ${accent.current.hex}99, 0 0 40px ${accent.current.hex}4d`,
          }}
        >
          ITXC
        </h1>

        <p
          className="font-mono text-xs sm:text-sm tracking-[0.3em] h-5"
          style={{ color: `${accent.current.hex}b3` }}
        >
          {scrambledText}
        </p>
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center px-6 pb-2">
          <span
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color: `${accent.current.hex}80` }}
          >
            {GLITCH_LINES[activeLine]}
          </span>
          <span
            className="font-mono text-xs tabular-nums"
            style={{ color: `${accent.current.hex}99` }}
          >
            {Math.floor(progress * 100)}%
          </span>
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: `${accent.current.hex}1a` }}>
          <div
            className="h-full transition-none"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: accent.current.hex,
              boxShadow: `0 0 12px ${accent.current.hex}99, 0 0 4px ${accent.current.hex}cc`,
            }}
          />
        </div>
      </div>

    </div>
  );
}
