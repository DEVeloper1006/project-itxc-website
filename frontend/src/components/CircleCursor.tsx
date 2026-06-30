"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

export default function CircleCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const { hex } = useTheme();

  useEffect(() => {
    function onMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    }

    function checkHover(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) {
        setHovering(false);
        return;
      }
      setHovering(
        !!(
          el.closest("a, button, [data-hover], input, select, textarea") ||
          el.tagName === "A" ||
          el.tagName === "BUTTON"
        )
      );
    }

    function onLeave() {
      setVisible(false);
    }
    function onEnter() {
      setVisible(true);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousemove", checkHover);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let raf: number;
    function tick() {
      pos.current.x += (target.current.x - pos.current.x) * 0.45;
      pos.current.y += (target.current.y - pos.current.y) * 0.45;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", checkHover);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  const outerClass = `circle-cursor ${hovering ? "circle-cursor--hover" : ""}`;
  const innerClass = `circle-cursor__ring ${hovering ? "circle-cursor__ring--visible" : ""}`;

  return (
    <>
      <style>{`
        @keyframes cursor-spin { to { transform: rotate(360deg); } }

        .circle-cursor {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9999;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease,
            border-width 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }

        .circle-cursor--hover {
          width: 56px;
          height: 56px;
          border: 2px solid var(--accent-cursor-border, rgba(255, 60, 60, 0.35));
          background-color: var(--accent-cursor-bg, rgba(255, 20, 20, 0.85));
        }

        .circle-cursor__ring {
          width: 0px;
          height: 0px;
          border-radius: 50%;
          border: 1.5px solid var(--accent-cursor-ring, rgba(255, 200, 200, 0.5));
          border-top-color: transparent;
          border-bottom-color: transparent;
          animation: cursor-spin 3s linear infinite;
          transition: width 0.25s ease, height 0.25s ease, opacity 0.2s ease;
          opacity: 0;
        }

        .circle-cursor__ring--visible {
          width: 28px;
          height: 28px;
          opacity: 1;
        }
      `}</style>
      <div
        ref={cursorRef}
        className={outerClass}
        style={{
          opacity: visible ? 1 : 0,
          ["--accent-cursor-border" as string]: `${hex}59`,
          ["--accent-cursor-bg" as string]: `${hex}d9`,
          ["--accent-cursor-ring" as string]: `${hex}80`,
        }}
      >
        <div className={innerClass} />
      </div>
    </>
  );
}
