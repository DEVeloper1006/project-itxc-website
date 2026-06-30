"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

interface PreviewScrollerProps {
  images: string[];
  interval?: number;
}

function PlaceholderSlide({ index, hex }: { index: number; hex: string }) {
  return (
    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
      <span className="text-3xl font-bold" style={{ color: `${hex}4d` }}>{index + 1}</span>
    </div>
  );
}

export default function PreviewScroller({
  images,
  interval = 2500,
}: PreviewScrollerProps) {
  const { hex } = useTheme();
  const [active, setActive] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, interval);
    return () => clearInterval(id);
  }, [count, interval]);

  const hasReal = images.some((src) => src !== "");

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/60 border-t border-white/10">
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          {src ? (
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter:
                  "grayscale(0.6) contrast(1.2) brightness(0.8) sepia(0.2) hue-rotate(-10deg)",
              }}
              loading="lazy"
            />
          ) : (
            <PlaceholderSlide index={i} hex={hex} />
          )}
        </div>
      ))}

      {/* Tint overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ backgroundColor: `${hex}26` }}
      />

      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
        }}
      />

      {/* Dot indicators */}
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                i === active ? `${hex}cc` : "rgba(255, 255, 255, 0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
