"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import RedParticles from "@/components/RedParticles";
import LoadingScreen from "@/components/LoadingScreen";
import PreviewScroller from "@/components/PreviewScroller";
import FlashOverlay from "@/components/FlashOverlay";
import KrisFlash from "@/components/KrisFlash";
import StatuesFlash from "@/components/StatuesFlash";
import EyesFlash from "@/components/EyesFlash";
import ColorPicker from "@/components/ColorPicker";
import JacketModal from "@/components/JacketModal";
import { useTheme } from "@/lib/theme";

const RELEASE_DATE = new Date("2026-09-18T00:00:00");

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
  const [isDesktop, setIsDesktop] = useState(false);
  const raf = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function check() { setIsDesktop(window.innerWidth >= 1280); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    if (!isDesktop) {
      setOffset({ x: 0, y: 0 });
      return;
    }

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
  }, [onMove, isDesktop]);

  return offset;
}

const ZINE_PAGE_COUNT = 64;

function getRandomZinePreviews(count: number): string[] {
  const indices = Array.from({ length: ZINE_PAGE_COUNT }, (_, i) => i + 1);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count).map((n) => `/images/zine/page-${n}.png`);
}
const JACKET_PREVIEWS = [
  "/images/jacket/img1.jpg",
  "/images/jacket/img2.jpg",
  "/images/jacket/img3.jpg",
];

const NAV_ITEMS = [
  {
    label: "Zine",
    href: "/home/zine",
    description: "Digital Magazine",
    position: { top: "55%", left: "5%" } as Record<string, string>,
    parallaxScale: 0.5,
    previews: null,
    previewKey: "zine" as const,
    external: false,
    modal: false,
  },
  {
    label: "Jacket",
    href: "#jacket",
    description: "Giveaway",
    position: { top: "30%", right: "4%" } as Record<string, string>,
    parallaxScale: 0.7,
    previews: JACKET_PREVIEWS,
    previewKey: null,
    external: false,
    modal: true,
  },
  {
    label: "Know Your Worth",
    href: "https://www.amazon.ca/Know-Your-Worth-Kris-Gandhi/dp/B0DY69BWG4",
    description: "Previous Book",
    position: { bottom: "6%", right: "18%" } as Record<string, string>,
    parallaxScale: 0.4,
    previews: null,
    previewKey: null,
    external: true,
    modal: false,
  },
];

export default function Home() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jacketOpen, setJacketOpen] = useState(false);
  const [zinePreviews] = useState(() => getRandomZinePreviews(4));
  const countdown = useCountdown();
  const parallax = useParallax(25);
  const bgParallax = useParallax(10);
  const { hex } = useTheme();

  useEffect(() => {
    if (sessionStorage.getItem("gate1") !== "open") {
      window.location.href = "/";
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center xl:justify-center overflow-x-hidden overflow-y-auto cursor-none">
      <ColorPicker />
      {/* Background image with parallax */}
      <div
        className="fixed -inset-10 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: "url('/images/homepage-bg.jpg')",
          transform: `translate(${bgParallax.x}px, ${bgParallax.y}px) scale(1.15)`,
        }}
      />
      {/* Flashing image overlays — desktop only */}
      <FlashOverlay interval={5000} holdDuration={130} />
      <KrisFlash interval={7000} />
      <StatuesFlash interval={6000} />
      <EyesFlash interval={8000} />
      {/* Darken overlay */}
      <div className="fixed inset-0 bg-black/50" />
      {/* Red particles */}
      <RedParticles />
      {/* Vignette */}
      <div
        className="fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Desktop corner text — absolute positioned, hidden below lg */}
      <span
        className="absolute top-4 left-4 z-10 font-gothic text-lg xl:text-xl tracking-wide hidden xl:block"
        style={{ color: `${hex}b3`, textShadow: `0 0 10px ${hex}40` }}
      >
        Created By Project ITXC
      </span>
      <div
        className="absolute top-4 right-4 z-10 font-gothic text-right text-lg xl:text-xl leading-relaxed tracking-wide hidden xl:block"
        style={{ color: `${hex}b3`, textShadow: `0 0 10px ${hex}40` }}
      >
        <div>MR. TXC</div>
        <div>ISSUE 01</div>
        <div>FALL 2026</div>
      </div>

      {/* Mobile/tablet header — stacked text, visible below lg */}
      <div className="relative z-10 w-full flex flex-col items-center pt-6 pb-2 xl:hidden">
        <span
          className="font-gothic text-sm sm:text-base tracking-wide"
          style={{ color: `${hex}b3`, textShadow: `0 0 10px ${hex}40` }}
        >
          Created By Dev Mody
        </span>
        <div
          className="font-gothic text-sm sm:text-base tracking-wide text-center mt-1"
          style={{ color: `${hex}b3`, textShadow: `0 0 10px ${hex}40` }}
        >
          MR. TXC / ISSUE 01 / FALL 2026
        </div>
      </div>

      {/* Coming Soon box — desktop: absolute positioned, mobile/tablet: in flow */}
      <div
        className="hidden xl:flex absolute z-10"
        style={{
          top: "5%",
          left: "32%",
          transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`,
        }}
      >
        <div className="border border-white/20 backdrop-blur-sm bg-white/5 px-14 py-8 flex flex-col items-center">
          <span
            className="font-gothic text-6xl xl:text-7xl tracking-wide leading-tight text-center"
            style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
          >
            Coming
          </span>
          <span
            className="font-gothic text-6xl xl:text-7xl tracking-wide leading-tight text-center"
            style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
          >
            Soon
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 px-4 will-change-transform w-full"
        style={{
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
      >
        {/* Title */}
        <h1
          className="font-gothic text-[2.5rem] sm:text-5xl md:text-7xl xl:text-8xl tracking-wide text-center"
          style={{
            color: hex,
            textShadow:
              `0 0 20px ${hex}99, 0 0 40px ${hex}4d, 0 0 80px ${hex}26`,
          }}
        >
          INTOXICATED
        </h1>

        {/* Countdown */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 md:gap-3 xl:gap-4">
          <CountdownUnit value={countdown.days} label="DAYS" hex={hex} />
          <Separator hex={hex} />
          <CountdownUnit value={countdown.hours} label="HRS" hex={hex} />
          <Separator hex={hex} />
          <CountdownUnit value={countdown.minutes} label="MIN" hex={hex} />
          <Separator hex={hex} />
          <CountdownUnit value={countdown.seconds} label="SEC" hex={hex} />
        </div>

        {/* Mobile/tablet Coming Soon box */}
        <div className="xl:hidden border border-white/20 backdrop-blur-sm bg-white/5 px-10 py-5 flex flex-col items-center mt-2">
          <span
            className="font-gothic text-3xl sm:text-4xl md:text-5xl tracking-wide leading-tight text-center"
            style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
          >
            Coming
          </span>
          <span
            className="font-gothic text-3xl sm:text-4xl md:text-5xl tracking-wide leading-tight text-center"
            style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
          >
            Soon
          </span>
        </div>

        {/* Mobile/tablet nav — full-width vertical stack, visible below xl */}
        <div className="flex xl:hidden flex-col items-stretch gap-3 mt-4 sm:mt-6 w-full pb-24">
          {NAV_ITEMS.map((item) => {
            const previews = item.previewKey === "zine" ? zinePreviews : item.previews;
            if (item.modal) {
              return (
                <button
                  key={item.href}
                  onClick={() => setJacketOpen(true)}
                  data-hover
                  className="w-full group flex flex-col overflow-hidden border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-none"
                >
                  {previews && (
                    <PreviewScroller images={previews} />
                  )}
                  <div className="flex flex-col items-center gap-1 px-5 py-4">
                    <span
                      className="font-gothic text-2xl sm:text-3xl transition-colors"
                      style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
                    >
                      {item.label}
                    </span>
                    <span className="text-zinc-400 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            }
            const Tag = item.external ? "a" : Link;
            const extra = item.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Tag
                key={item.href}
                href={item.href}
                data-hover
                className="w-full group flex flex-col overflow-hidden border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300"
                {...extra}
              >
                {previews && (
                  <PreviewScroller images={previews} />
                )}
                <div className="flex flex-col items-center gap-1 px-5 py-4">
                  <span
                    className="font-gothic text-2xl sm:text-3xl transition-colors"
                    style={{ color: hex, textShadow: `0 0 12px ${hex}66` }}
                  >
                    {item.label}
                  </span>
                  <span className="text-zinc-400 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                    {item.description}
                  </span>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>

      {/* Desktop floating nav — scattered with individual parallax, hidden below xl */}
      {NAV_ITEMS.map((item) => {
        const previews = item.previewKey === "zine" ? zinePreviews : item.previews;
        const sharedClass = "hidden xl:flex absolute z-10 group flex-col overflow-hidden border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 will-change-transform";
        const sharedStyle = {
          ...item.position,
          width: previews ? "280px" : "200px",
          transform: `translate(${parallax.x * item.parallaxScale}px, ${parallax.y * item.parallaxScale}px)`,
        };
        const inner = (
          <>
            {previews && (
              <PreviewScroller images={previews} />
            )}
            <div className="flex flex-col items-center gap-1.5 px-8 py-5">
              <span
                className="font-gothic text-4xl xl:text-5xl transition-colors"
                style={{
                  color: hex,
                  textShadow: `0 0 12px ${hex}66`,
                }}
              >
                {item.label}
              </span>
              <span className="text-zinc-400 text-sm font-mono uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                {item.description}
              </span>
            </div>
          </>
        );

        if (item.modal) {
          return (
            <button
              key={item.href}
              onClick={() => setJacketOpen(true)}
              data-hover
              className={`${sharedClass} cursor-none`}
              style={sharedStyle}
            >
              {inner}
            </button>
          );
        }

        const Tag = item.external ? "a" : Link;
        const extra = item.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
        return (
          <Tag
            key={item.href}
            href={item.href}
            data-hover
            className={sharedClass}
            style={sharedStyle}
            {...extra}
          >
            {inner}
          </Tag>
        );
      })}

      {/* Jacket Giveaway Modal */}
      {jacketOpen && <JacketModal onClose={() => setJacketOpen(false)} />}
    </div>
  );
}

function CountdownUnit({ value, label, hex }: { value: number; label: string; hex: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-gothic text-3xl sm:text-5xl md:text-7xl xl:text-9xl leading-none tabular-nums"
        style={{
          color: hex,
          textShadow:
            `0 0 15px ${hex}80, 0 0 30px ${hex}40, 0 0 60px ${hex}1a`,
        }}
      >
        {pad(value)}
      </span>
      <span
        className="text-[8px] sm:text-[10px] md:text-xs font-mono tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1"
        style={{ color: `${hex}99` }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ hex }: { hex: string }) {
  return (
    <span
      className="font-gothic text-2xl sm:text-4xl md:text-6xl xl:text-8xl leading-none self-start mt-0.5 sm:mt-1 md:mt-2"
      style={{
        color: `${hex}b3`,
        textShadow: `0 0 15px ${hex}66`,
      }}
    >
      :
    </span>
  );
}
