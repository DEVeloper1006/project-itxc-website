"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { checkPassword } from "@/lib/auth";

type Line = { text: string; type: "system" | "input" | "error" | "success" };

const BOOT_LINES = [
  "ITXC SYSTEM v2.06",
  "INITIALIZING...",
  "",
  "ESTABLISHING SECURE CONNECTION.......... OK",
  "LOADING ENCRYPTION MODULES.............. OK",
  "VERIFYING SYSTEM INTEGRITY.............. OK",
  "",
  "WARNING: RESTRICTED ACCESS",
  "UNAUTHORIZED ENTRY WILL BE LOGGED",
  "",
];

const TYPEWRITER_SPEED = 35;
const LINE_DELAY = 120;

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [booting, setBooting] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const typewriterLine = useCallback(
    (text: string): Promise<void> =>
      new Promise((resolve) => {
        let i = 0;
        const partial: Line = { text: "", type: "system" };
        setLines((prev) => [...prev, partial]);

        const tick = setInterval(() => {
          i++;
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = { text: text.slice(0, i), type: "system" };
            return next;
          });
          if (i >= text.length) {
            clearInterval(tick);
            resolve();
          }
        }, TYPEWRITER_SPEED);
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      for (const line of BOOT_LINES) {
        if (cancelled) return;
        if (line === "") {
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          await new Promise((r) => setTimeout(r, LINE_DELAY));
        } else {
          await typewriterLine(line);
          await new Promise((r) => setTimeout(r, LINE_DELAY));
        }
      }
      if (!cancelled) {
        setBooting(false);
        setShowPrompt(true);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [typewriterLine]);

  useEffect(() => {
    if (showPrompt) inputRef.current?.focus();
  }, [showPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || !input.trim()) return;

    setLocked(true);
    const attempt = input;
    setInput("");

    setLines((prev) => [
      ...prev,
      { text: `> ${"*".repeat(attempt.length)}`, type: "input" },
    ]);

    const valid = checkPassword(attempt);

    if (valid) {
      setLines((prev) => [
        ...prev,
        { text: "", type: "system" },
        { text: "ACCESS GRANTED", type: "success" },
        { text: "REDIRECTING...", type: "success" },
      ]);
      sessionStorage.setItem("gate1", "open");
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } else {
      setLines((prev) => [
        ...prev,
        { text: "ACCESS DENIED", type: "error" },
        { text: "", type: "system" },
      ]);
      setLocked(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function lineColor(type: Line["type"]) {
    switch (type) {
      case "error":
        return "text-red-500 font-bold";
      case "success":
        return "text-green-400 font-bold";
      case "input":
        return "text-red-400";
      default:
        return "text-red-500/80";
    }
  }

  return (
    <div
      className="relative z-10 flex items-center justify-center min-h-screen p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-2xl bg-black/70 border border-red-900/50 rounded-lg p-6 font-mono text-sm backdrop-blur-sm shadow-[0_0_40px_rgba(255,0,0,0.15)]">
        <div className="space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className={`${lineColor(line.type)} leading-relaxed`}>
              {line.text || " "}
            </div>
          ))}
        </div>

        {showPrompt && !locked && (
          <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
            <span className="text-red-500/80">ENTER PASSWORD {"▶"}</span>
            <input
              ref={inputRef}
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-red-400 outline-none caret-red-500 font-mono text-sm tracking-widest"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        )}

        {!booting && locked && (
          <div className="mt-2 text-red-500/60 animate-pulse">
            PROCESSING...
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
