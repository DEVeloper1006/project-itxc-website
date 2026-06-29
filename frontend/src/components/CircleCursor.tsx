"use client";

import { useEffect, useRef, useState } from "react";

export default function CircleCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

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
      // Much faster interpolation for responsiveness
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

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        width: hovering ? "56px" : "28px",
        height: hovering ? "56px" : "28px",
        borderRadius: "50%",
        border: hovering
          ? "2px solid rgba(255, 60, 60, 0.8)"
          : "1.5px solid rgba(255, 255, 255, 0.7)",
        backgroundColor: hovering
          ? "rgba(255, 0, 0, 0.08)"
          : "transparent",
        transition:
          "width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border 0.2s ease",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
