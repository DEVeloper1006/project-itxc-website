"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
const FONT_SIZES = [10, 12, 14, 16];
const MAX_DROPS = 350;

export default function RedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hex, r, g, b } = useTheme();
  const colorRef = useRef({ hex, r, g, b });
  colorRef.current = { hex, r, g, b };
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function check() { setIsDesktop(window.innerWidth >= 1280); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const x = new Float32Array(MAX_DROPS);
    const y = new Float32Array(MAX_DROPS);
    const speed = new Float32Array(MAX_DROPS);
    const opacity = new Float32Array(MAX_DROPS);
    const fontSize = new Uint8Array(MAX_DROPS);
    const charIdx = new Uint8Array(MAX_DROPS);
    const tick = new Uint16Array(MAX_DROPS);

    function init(i: number, scatter: boolean) {
      x[i] = Math.random() * w;
      y[i] = scatter ? Math.random() * h : -(Math.random() * 100);
      speed[i] = Math.random() * 2.5 + 0.8;
      opacity[i] = Math.random() * 0.4 + 0.15;
      fontSize[i] = FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)];
      charIdx[i] = Math.floor(Math.random() * CHARS.length);
      tick[i] = Math.floor(Math.random() * 120);
    }

    for (let i = 0; i < MAX_DROPS; i++) init(i, true);

    let raf: number;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const { hex: col, r: cr, g: cg, b: cb } = colorRef.current;

      for (let i = 0; i < MAX_DROPS; i++) {
        y[i] += speed[i];
        tick[i]++;

        if (tick[i] % 8 === 0) {
          charIdx[i] = Math.floor(Math.random() * CHARS.length);
        }

        if (y[i] > h + 20) {
          init(i, false);
          continue;
        }

        const a = opacity[i];
        const fs = fontSize[i];
        const ch = CHARS[charIdx[i]];

        ctx.font = `${fs}px monospace`;
        ctx.globalAlpha = a * 0.4;
        ctx.shadowColor = col;
        ctx.shadowBlur = fs;
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.fillText(ch, x[i], y[i]);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = a;
        ctx.fillText(ch, x[i], y[i]);
      }

      ctx.globalAlpha = 1;
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
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[5]"
    />
  );
}
