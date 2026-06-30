"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

const TOTAL_PAGES = 64;
const DRAG_THRESHOLD = 80;

function ZinePage({ pageNum }: { pageNum: number }) {
  return (
    <div className="absolute inset-0 bg-black select-none overflow-hidden">
      <img
        src={`/images/zine/page-${pageNum}.png`}
        alt={`Page ${pageNum}`}
        className="w-full h-full object-contain"
        draggable={false}
        style={{
          filter: "contrast(1.1) brightness(0.95) saturate(0.85)",
        }}
      />
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
        }}
      />
      {/* Noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}

export default function ZineViewer() {
  const { hex } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(
    null
  );
  const [animating, setAnimating] = useState(false);
  const dragRef = useRef<{ startX: number; active: boolean; width: number }>({
    startX: 0,
    active: false,
    width: 0,
  });
  const spreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function check() {
      setIsWide(window.innerWidth >= 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const pagesPerSpread = isWide ? 2 : 1;
  const maxPage = TOTAL_PAGES - pagesPerSpread;
  const atStart = currentPage === 0;
  const atEnd = currentPage >= maxPage;

  const animateFlip = useCallback(
    (direction: "next" | "prev") => {
      if (animating) return;
      if (direction === "next" && atEnd) return;
      if (direction === "prev" && atStart) return;

      setAnimating(true);
      setFlipDirection(direction);
      setIsFlipping(true);

      let start: number | null = null;
      const duration = 500;

      function tick(ts: number) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        setFlipProgress(eased);

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          setCurrentPage((p) =>
            direction === "next"
              ? Math.min(p + (isWide ? 2 : 1), maxPage)
              : Math.max(p - (isWide ? 2 : 1), 0)
          );
          setFlipProgress(0);
          setIsFlipping(false);
          setFlipDirection(null);
          setAnimating(false);
        }
      }

      requestAnimationFrame(tick);
    },
    [animating, atEnd, atStart, isWide, maxPage]
  );

  const goNext = useCallback(() => animateFlip("next"), [animateFlip]);
  const goPrev = useCallback(() => animateFlip("prev"), [animateFlip]);

  const rapidFlip = useCallback(
    (target: number) => {
      if (animating) return;
      const step = isWide ? 2 : 1;
      const flipsNeeded = Math.abs(target - currentPage) / step;
      if (flipsNeeded === 0) return;

      const perFlip = Math.max(60, Math.min(300, 1500 / flipsNeeded));
      const direction: "next" | "prev" = target > currentPage ? "next" : "prev";

      setAnimating(true);

      let page = currentPage;

      function doOneFlip() {
        if ((direction === "next" && page >= target) ||
            (direction === "prev" && page <= target)) {
          setFlipProgress(0);
          setIsFlipping(false);
          setFlipDirection(null);
          setAnimating(false);
          return;
        }

        setFlipDirection(direction);
        setIsFlipping(true);

        let start: number | null = null;

        function tick(ts: number) {
          if (!start) start = ts;
          const t = Math.min((ts - start) / perFlip, 1);
          const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
          setFlipProgress(eased);

          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            page = direction === "next"
              ? Math.min(page + step, target)
              : Math.max(page - step, target);
            setCurrentPage(page);
            setFlipProgress(0);
            requestAnimationFrame(doOneFlip);
          }
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(doOneFlip);
    },
    [animating, currentPage, isWide]
  );

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Pointer drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (animating) return;
      const rect = spreadRef.current?.getBoundingClientRect();
      dragRef.current = {
        startX: e.clientX,
        active: true,
        width: rect?.width ?? 600,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [animating]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active || animating) return;
      const dx = e.clientX - dragRef.current.startX;
      const halfWidth = dragRef.current.width / 2;
      const raw = Math.abs(dx) / halfWidth;
      const progress = Math.min(raw, 1);

      if (Math.abs(dx) > 10) {
        const dir = dx < 0 ? "next" : "prev";
        if ((dir === "next" && atEnd) || (dir === "prev" && atStart)) {
          setFlipProgress(progress * 0.15);
          setFlipDirection(dir);
          setIsFlipping(true);
          return;
        }
        setFlipDirection(dir);
        setIsFlipping(true);
        setFlipProgress(progress);
      }
    },
    [animating, atEnd, atStart]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;

    if (!isFlipping || !flipDirection) {
      setFlipProgress(0);
      setIsFlipping(false);
      setFlipDirection(null);
      return;
    }

    const shouldCommit =
      flipProgress > 0.3 &&
      !(flipDirection === "next" && atEnd) &&
      !(flipDirection === "prev" && atStart);

    if (shouldCommit) {
      // Animate to completion
      setAnimating(true);
      const startProgress = flipProgress;
      let start: number | null = null;
      const duration = 300 * (1 - startProgress);

      function tick(ts: number) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / Math.max(duration, 50), 1);
        setFlipProgress(startProgress + (1 - startProgress) * t);

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          setCurrentPage((p) =>
            flipDirection === "next"
              ? Math.min(p + (isWide ? 2 : 1), maxPage)
              : Math.max(p - (isWide ? 2 : 1), 0)
          );
          setFlipProgress(0);
          setIsFlipping(false);
          setFlipDirection(null);
          setAnimating(false);
        }
      }

      requestAnimationFrame(tick);
    } else {
      // Snap back
      setAnimating(true);
      const startProgress = flipProgress;
      let start: number | null = null;
      const duration = 250 * startProgress;

      function tick(ts: number) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / Math.max(duration, 50), 1);
        setFlipProgress(startProgress * (1 - t));

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          setFlipProgress(0);
          setIsFlipping(false);
          setFlipDirection(null);
          setAnimating(false);
        }
      }

      requestAnimationFrame(tick);
    }
  }, [
    isFlipping,
    flipDirection,
    flipProgress,
    atEnd,
    atStart,
    isWide,
    maxPage,
  ]);

  const leftPage = currentPage + 1;
  const rightPage = currentPage + 2;
  const nextLeftPage = Math.min(currentPage + pagesPerSpread, maxPage) + 1;
  const nextRightPage = nextLeftPage + 1;
  const prevLeftPage = Math.max(currentPage - pagesPerSpread, 0) + 1;
  const prevRightPage = prevLeftPage + 1;

  const angle = flipProgress * 180;

  return (
    <div className="flex flex-col items-center gap-6 w-full flex-1 px-4 pb-6">
      {/* Magazine spread */}
      <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center">
        <div
          ref={spreadRef}
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: isWide ? "1.5 / 1" : "0.75 / 1",
            maxHeight: "75vh",
            perspective: "1800px",
            cursor: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* ========== BASE LAYER: current spread ========== */}
          <div
            className={`absolute inset-0 grid ${isWide ? "grid-cols-2" : "grid-cols-1"} gap-0`}
          >
            <div className="relative overflow-hidden bg-black border border-zinc-800">
              <ZinePage pageNum={leftPage} />
            </div>
            {isWide && rightPage <= TOTAL_PAGES && (
              <div className="relative overflow-hidden bg-black border border-zinc-800">
                <ZinePage pageNum={rightPage} />
              </div>
            )}
          </div>

          {/* ========== REVEAL LAYER: what's underneath the flipping page ========== */}
          {isFlipping && flipDirection && (
            <div
              className={`absolute inset-0 grid ${isWide ? "grid-cols-2" : "grid-cols-1"} gap-0`}
            >
              {flipDirection === "next" ? (
                <>
                  {/* Left side stays as current left page during next-flip */}
                  <div className="relative overflow-hidden bg-black border border-zinc-800">
                    <ZinePage pageNum={leftPage} />
                  </div>
                  {isWide && nextRightPage <= TOTAL_PAGES && (
                    <div className="relative overflow-hidden bg-black border border-zinc-800">
                      <ZinePage pageNum={nextRightPage} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isWide ? (
                    <>
                      <div className="relative overflow-hidden bg-black border border-zinc-800">
                        <ZinePage pageNum={prevLeftPage} />
                      </div>
                      {/* Right side stays as current right page during prev-flip */}
                      <div className="relative overflow-hidden bg-black border border-zinc-800">
                        <ZinePage pageNum={rightPage} />
                      </div>
                    </>
                  ) : (
                    <div className="relative overflow-hidden bg-black border border-zinc-800">
                      <ZinePage pageNum={prevLeftPage} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========== FLIPPING PAGE ========== */}
          {isFlipping && flipDirection === "next" && (
            <div
              className="absolute top-0 bottom-0 bg-zinc-900 border border-zinc-800"
              style={{
                right: isWide ? 0 : undefined,
                left: isWide ? "50%" : 0,
                width: isWide ? "50%" : "100%",
                transformOrigin: isWide ? "left center" : "left center",
                transform: `rotateY(${-angle}deg)`,
                transformStyle: "preserve-3d",
                zIndex: 20,
              }}
            >
              {/* Front face: current right page (or single page) */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
              >
                <ZinePage
                  pageNum={isWide ? rightPage : leftPage}
                />
              </div>
              {/* Back face: next left page */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <ZinePage pageNum={nextLeftPage} />
              </div>
              {/* Shadow on the flipping page */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `rgba(0,0,0,${0.3 * Math.sin((angle * Math.PI) / 180)})`,
                  backfaceVisibility: "hidden",
                  zIndex: 5,
                }}
              />
            </div>
          )}

          {isFlipping && flipDirection === "prev" && (
            <div
              className="absolute top-0 bottom-0 bg-zinc-900 border border-zinc-800"
              style={{
                left: 0,
                width: isWide ? "50%" : "100%",
                transformOrigin: isWide ? "right center" : "right center",
                transform: `rotateY(${angle}deg)`,
                transformStyle: "preserve-3d",
                zIndex: 20,
              }}
            >
              {/* Front face: current left page */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
              >
                <ZinePage pageNum={leftPage} />
              </div>
              {/* Back face: prev right page */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(-180deg)",
                }}
              >
                <ZinePage
                  pageNum={isWide ? prevRightPage : prevLeftPage}
                />
              </div>
              {/* Shadow on the flipping page */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `rgba(0,0,0,${0.3 * Math.sin((angle * Math.PI) / 180)})`,
                  backfaceVisibility: "hidden",
                  zIndex: 5,
                }}
              />
            </div>
          )}

          {/* ========== Spine crease — fades in during flip ========== */}
          {isWide && (
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none z-25 transition-opacity duration-300"
              style={{
                width: "40px",
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.45) 100%)",
                opacity: isFlipping ? 1 : 0,
              }}
            />
          )}

          {/* ========== VHS scanline overlay ========== */}
          <div
            className="absolute inset-0 pointer-events-none z-30 opacity-[0.07]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => rapidFlip(0)}
          disabled={atStart || animating}
          data-hover
          className="px-3 py-2.5 border text-sm font-mono uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ color: hex, borderColor: `${hex}40` }}
        >
          ««
        </button>

        <button
          onClick={goPrev}
          disabled={atStart || animating}
          data-hover
          className="px-4 py-2.5 border text-sm font-mono uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ color: hex, borderColor: `${hex}40` }}
        >
          Prev
        </button>

        <span className="text-zinc-500 text-xs font-mono tabular-nums tracking-wider">
          {isWide
            ? `${leftPage}–${Math.min(rightPage, TOTAL_PAGES)} / ${TOTAL_PAGES}`
            : `${leftPage} / ${TOTAL_PAGES}`}
        </span>

        <button
          onClick={goNext}
          disabled={atEnd || animating}
          data-hover
          className="px-4 py-2.5 border text-sm font-mono uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ color: hex, borderColor: `${hex}40` }}
        >
          Next
        </button>

        <button
          onClick={() => rapidFlip(maxPage)}
          disabled={atEnd || animating}
          data-hover
          className="px-3 py-2.5 border text-sm font-mono uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ color: hex, borderColor: `${hex}40` }}
        >
          »»
        </button>
      </div>
    </div>
  );
}
