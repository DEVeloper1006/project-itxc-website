"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";

const ANSWER_HASH =
  "4970631d26623a122f1a584518c929b1180e505bcc27369307a4aa0caa03d929";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Step = "email" | "riddle" | "sending" | "success" | "error";

export default function JacketModal({ onClose }: { onClose: () => void }) {
  const { hex } = useTheme();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [answer, setAnswer] = useState("");
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const answerRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === "riddle") {
      setTimeout(() => answerRef.current?.focus(), 50);
    }
  }, [step]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email address");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setStep("riddle");
  };

  const sendEntry = async (submittedAnswer: string) => {
    setStep("sending");
    try {
      const res = await fetch("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), answer: submittedAnswer }),
      });
      if (res.status === 403) {
        setShake(true);
        setStep("riddle");
        setTimeout(() => {
          setShake(false);
          setAnswer("");
          answerRef.current?.focus();
        }, 600);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsFirst(data.isFirst);
      setStep("success");
    } catch {
      setStep("error");
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = answer.trim().toUpperCase();
    const hash = await sha256(normalized);
    if (hash === ANSWER_HASH) {
      sendEntry(normalized);
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setAnswer("");
        answerRef.current?.focus();
      }, 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center cursor-none"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0)",
        transition: "background-color 300ms ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-[90%] sm:w-[80%] max-w-2xl border backdrop-blur-md flex flex-col items-center px-6 sm:px-10 py-8 sm:py-12"
        style={{
          borderColor: `${hex}33`,
          backgroundColor: `rgba(0,0,0,0.8)`,
          boxShadow: `0 0 60px ${hex}15, inset 0 0 60px ${hex}08`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
          transition: "opacity 300ms ease, transform 300ms ease",
        }}
      >
        <button
          onClick={handleClose}
          data-hover
          className="absolute top-3 right-4 sm:top-4 sm:right-5 font-gothic text-2xl sm:text-3xl transition-opacity hover:opacity-70 cursor-none"
          style={{ color: `${hex}99` }}
        >
          ✕
        </button>

        <h2
          className="font-gothic text-3xl sm:text-4xl md:text-5xl tracking-wide text-center"
          style={{
            color: hex,
            textShadow: `0 0 20px ${hex}66, 0 0 40px ${hex}33`,
          }}
        >
          Jacket Giveaway
        </h2>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col items-center w-full mt-6 sm:mt-8">
            <p
              className="font-mono text-xs sm:text-sm text-center max-w-md leading-relaxed tracking-wide uppercase"
              style={{ color: `${hex}99` }}
            >
              Enter your email to begin
            </p>

            <input
              ref={emailRef}
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleClose();
              }}
              placeholder="your@email.com"
              className="w-full max-w-sm mt-5 sm:mt-6 px-4 py-3 bg-transparent border outline-none font-mono text-sm sm:text-base tracking-wide cursor-none transition-all duration-200 focus:scale-[1.02] placeholder:opacity-30"
              style={{
                borderColor: emailError ? "#ef4444" : `${hex}40`,
                color: hex,
                caretColor: hex,
              }}
            />

            {emailError && (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2 border bg-black/50"
                style={{ borderColor: "#ef444466" }}
              >
                <span className="text-red-500 text-sm">✕</span>
                <span
                  className="font-mono text-xs sm:text-sm tracking-wide"
                  style={{ color: "#ef4444cc" }}
                >
                  {emailError}
                </span>
              </div>
            )}

            <button
              type="submit"
              data-hover
              className="mt-6 sm:mt-8 px-10 py-3 border font-gothic text-xl sm:text-2xl tracking-wide cursor-none transition-all duration-300 hover:scale-105 hover:bg-white/5"
              style={{
                borderColor: `${hex}40`,
                color: hex,
                textShadow: `0 0 12px ${hex}66`,
              }}
            >
              Continue
            </button>

            <span
              className="font-mono text-[10px] sm:text-xs mt-4 tracking-[0.2em] uppercase text-center"
              style={{ color: `${hex}44` }}
            >
              First correct entry wins the jacket
            </span>
          </form>
        )}

        {step === "riddle" && (
          <form onSubmit={handleAnswerSubmit} className="flex flex-col items-center w-full mt-4 sm:mt-6">
            <p
              className="font-mono text-xs sm:text-sm text-center max-w-md leading-relaxed tracking-wide uppercase"
              style={{ color: `${hex}99` }}
            >
              Solve the riddle to enter the giveaway
            </p>

            <div
              className="mt-3 sm:mt-4 max-w-md text-center leading-relaxed"
              style={{ color: `${hex}cc` }}
            >
              <p className="font-gothic text-base sm:text-lg md:text-xl italic leading-relaxed">
                TM told us many important lessons<br />
                Just like how it&apos;s in the zine<br />
                If you look closely<br />
                The truth could eventually be seen
              </p>
              <p className="font-gothic text-base sm:text-lg md:text-xl italic leading-relaxed mt-3">
                Heart can be made of gold<br />
                While cupids bow was left on scene<br />
                With the drinks giving you a cold buzz<br />
                With news that travels around<br />
                Like a job that&apos;s never done<br />
                Went from doing me into bittersweet<br />
                Knowing my worth and never forgetting the streets
              </p>
            </div>

            <div className={`w-full max-w-sm mt-6 sm:mt-8 ${shake ? "animate-shake" : ""}`}>
              <input
                ref={answerRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleClose();
                }}
                placeholder="Your answer..."
                className="w-full px-4 py-3 bg-transparent border outline-none font-mono text-sm sm:text-base tracking-wide cursor-none transition-all duration-200 focus:scale-[1.02] placeholder:opacity-30 text-center uppercase"
                style={{
                  borderColor: `${hex}40`,
                  color: hex,
                  caretColor: hex,
                }}
              />
            </div>

            <button
              type="submit"
              data-hover
              className="mt-6 sm:mt-8 px-10 py-3 border font-gothic text-xl sm:text-2xl tracking-wide cursor-none transition-all duration-300 hover:scale-105 hover:bg-white/5"
              style={{
                borderColor: `${hex}40`,
                color: hex,
                textShadow: `0 0 12px ${hex}66`,
              }}
            >
              Submit
            </button>

            <span
              className="font-mono text-[10px] sm:text-xs mt-4 tracking-[0.3em] uppercase"
              style={{ color: `${hex}55` }}
            >
              Enter your answer
            </span>
          </form>
        )}

        {step === "sending" && (
          <div className="flex flex-col items-center w-full mt-8 sm:mt-10">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${hex}66`, borderTopColor: "transparent" }}
            />
            <p
              className="font-mono text-xs sm:text-sm mt-4 tracking-wide uppercase"
              style={{ color: `${hex}99` }}
            >
              Submitting your entry...
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center w-full mt-6 sm:mt-8">
            <p
              className="font-gothic text-2xl sm:text-3xl text-center tracking-wide"
              style={{ color: hex, textShadow: `0 0 15px ${hex}66` }}
            >
              {isFirst ? "You Won The Jacket" : "Entry Submitted"}
            </p>

            <p
              className="font-mono text-xs sm:text-sm text-center mt-4 max-w-sm leading-relaxed tracking-wide"
              style={{ color: `${hex}99` }}
            >
              {isFirst
                ? "You're the first to solve it. The jacket is yours — show this screen to claim it."
                : "The jacket has already been claimed, but your entry has been recorded."}
            </p>

            <button
              onClick={handleClose}
              data-hover
              className="mt-6 sm:mt-8 px-10 py-3 border font-gothic text-xl sm:text-2xl tracking-wide cursor-none transition-all duration-300 hover:scale-105 hover:bg-white/5"
              style={{
                borderColor: `${hex}40`,
                color: hex,
                textShadow: `0 0 12px ${hex}66`,
              }}
            >
              Close
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center w-full mt-6 sm:mt-8">
            <p
              className="font-gothic text-2xl sm:text-3xl text-center tracking-wide"
              style={{ color: "#ef4444", textShadow: "0 0 15px #ef444466" }}
            >
              Something went wrong
            </p>

            <p
              className="font-mono text-xs sm:text-sm text-center mt-4 max-w-sm leading-relaxed tracking-wide"
              style={{ color: "#ef444499" }}
            >
              Could not submit your entry. Please try again.
            </p>

            <button
              onClick={() => sendEntry(answer.trim().toUpperCase())}
              data-hover
              className="mt-6 sm:mt-8 px-10 py-3 border font-gothic text-xl sm:text-2xl tracking-wide cursor-none transition-all duration-300 hover:scale-105 hover:bg-white/5"
              style={{
                borderColor: "#ef444440",
                color: "#ef4444",
                textShadow: "0 0 12px #ef444466",
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
