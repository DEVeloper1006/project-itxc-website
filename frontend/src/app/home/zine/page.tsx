"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ZineViewer from "@/components/ZineViewer";
import RedParticles from "@/components/RedParticles";
import ColorPicker from "@/components/ColorPicker";
import { useTheme } from "@/lib/theme";

export default function ZinePage() {
  const [authorized, setAuthorized] = useState(false);
  const { hex } = useTheme();

  useEffect(() => {
    if (sessionStorage.getItem("gate1") !== "open") {
      window.location.href = "/";
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden cursor-none">
      <ColorPicker />
      {/* VHS scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
        }}
      />
      {/* VHS noise grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />
      {/* Red katakana particles */}
      <RedParticles />
      {/* VHS vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-red-900/30">
        <Link
          href="/home"
          className="text-zinc-500 text-xs font-mono uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
        >
          <span>←</span>
          <span>Back</span>
        </Link>

        <h1
          className="text-xl sm:text-2xl font-gothic tracking-wide"
          style={{ color: hex }}
        >
          Intoxicated Zine
        </h1>

        <div className="w-16" />
      </header>

      {/* Viewer */}
      <div className="relative z-10 flex-1 flex flex-col pt-4 sm:pt-6">
        <ZineViewer />
      </div>
    </div>
  );
}
