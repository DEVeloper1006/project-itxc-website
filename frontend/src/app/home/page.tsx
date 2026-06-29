"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

const RELEASE_DATE = new Date("2026-09-01T00:00:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = RELEASE_DATE.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function useParallax(strength: number = 20) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const raf = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      target.current = {
        x: -((e.clientX - cx) / cx) * strength,
        y: -((e.clientY - cy) / cy) * strength,
      };
    },
    [strength]
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMove);

    function tick() {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      setOffset({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [onMove]);

  return offset;
}

const NAV_ITEMS = [
  {
    label: "Zine",
    href: "/home/zine",
    description: "Digital Magazine",
    // Bottom-left area
    position: { top: "68%", left: "8%" },
    parallaxScale: 0.5,
  },
  {
    label: "Jacket",
    href: "/home/jacket",
    description: "Custom Piece",
    // Right side, mid-height
    position: { top: "42%", right: "6%" },
    parallaxScale: 0.7,
  },
  {
    label: "Game",
    href: "/home/game",
    description: "Mini-Game",
    // Bottom-right area
    position: { bottom: "10%", right: "22%" },
    parallaxScale: 0.4,
  },
];

export default function Home() {
  const [authorized, setAuthorized] = useState(false);
  const countdown = useCountdown();
  const parallax = useParallax(25);
  const bgParallax = useParallax(10);

  useEffect(() => {
    if (sessionStorage.getItem("gate1") !== "open") {
      window.location.href = "/";
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden cursor-none">
      {/* Background image with parallax */}
      <div
        className="absolute -inset-10 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: "url('/images/homepage-bg.jpg')",
          transform: `translate(${bgParallax.x}px, ${bgParallax.y}px) scale(1.1)`,
        }}
      />
      {/* Darken overlay */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Content with parallax */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-4 will-change-transform"
        style={{
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
      >
        {/* Title */}
        <h1
          className="font-gothic text-red-600 text-6xl sm:text-7xl md:text-8xl tracking-wide"
          style={{
            textShadow:
              "0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.3), 0 0 80px rgba(255, 0, 0, 0.15)",
          }}
        >
          ITXC
        </h1>

        {/* Countdown */}
        <div className="flex items-baseline gap-2 sm:gap-3 md:gap-4">
          <CountdownUnit value={countdown.days} label="DAYS" />
          <Separator />
          <CountdownUnit value={countdown.hours} label="HRS" />
          <Separator />
          <CountdownUnit value={countdown.minutes} label="MIN" />
          <Separator />
          <CountdownUnit value={countdown.seconds} label="SEC" />
        </div>
      </div>

      {/* Floating nav items scattered with individual parallax */}
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-hover
          className="absolute z-10 group flex flex-col items-center gap-2 px-5 py-4 sm:px-8 sm:py-5 border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 will-change-transform"
          style={{
            ...item.position,
            transform: `translate(${parallax.x * item.parallaxScale}px, ${parallax.y * item.parallaxScale}px)`,
          }}
        >
          <span
            className="font-gothic text-red-500 text-2xl sm:text-3xl md:text-4xl group-hover:text-red-400 transition-colors"
            style={{
              textShadow: "0 0 12px rgba(255, 0, 0, 0.4)",
            }}
          >
            {item.label}
          </span>
          <span className="text-zinc-400 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
            {item.description}
          </span>
        </Link>
      ))}
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-gothic text-red-600 text-5xl sm:text-7xl md:text-9xl leading-none tabular-nums"
        style={{
          textShadow:
            "0 0 15px rgba(255, 0, 0, 0.5), 0 0 30px rgba(255, 0, 0, 0.25), 0 0 60px rgba(255, 0, 0, 0.1)",
        }}
      >
        {pad(value)}
      </span>
      <span className="text-zinc-400 text-[10px] sm:text-xs font-mono tracking-[0.3em] mt-1">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="font-gothic text-red-600/70 text-4xl sm:text-6xl md:text-8xl leading-none self-start mt-1 sm:mt-2"
      style={{
        textShadow: "0 0 15px rgba(255, 0, 0, 0.4)",
      }}
    >
      :
    </span>
  );
}
