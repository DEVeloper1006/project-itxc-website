"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const TOTAL_PAGES = 44;
const DRAG_THRESHOLD = 80;

function PlaceholderPage({ pageNum }: { pageNum: number }) {
  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center select-none">
      <span className="text-red-600/40 text-6xl font-bold">{pageNum}</span>
      <span className="text-zinc-600 text-sm mt-2 tracking-widest uppercase">
        Page {pageNum} of {TOTAL_PAGES}
      </span>
    </div>
  );
}

export default function ZineViewer() {
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
            cursor: animating
              ? "default"
              : dragRef.current.active
                ? "grabbing"
                : "grab",
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
              <PlaceholderPage pageNum={leftPage} />
            </div>
            {isWide && rightPage <= TOTAL_PAGES && (
              <div className="relative overflow-hidden bg-black border border-zinc-800">
                <PlaceholderPage pageNum={rightPage} />
              </div>
            )}
          </div>

          {/* ========== REVEAL LAYER: next/prev spread underneath the flip ========== */}
          {isFlipping && flipDirection && (
            <div
              className={`absolute inset-0 grid ${isWide ? "grid-cols-2" : "grid-cols-1"} gap-0`}
            >
              {flipDirection === "next" ? (
                <>
                  <div className="relative overflow-hidden bg-black border border-zinc-800">
                    <PlaceholderPage pageNum={nextLeftPage} />
                  </div>
                  {isWide && nextRightPage <= TOTAL_PAGES && (
                    <div className="relative overflow-hidden bg-black border border-zinc-800">
                      <PlaceholderPage pageNum={nextRightPage} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="relative overflow-hidden bg-black border border-zinc-800">
                    <PlaceholderPage pageNum={prevLeftPage} />
                  </div>
                  {isWide && prevRightPage <= TOTAL_PAGES && (
                    <div className="relative overflow-hidden bg-black border border-zinc-800">
                      <PlaceholderPage pageNum={prevRightPage} />
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
                <PlaceholderPage
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
                <PlaceholderPage pageNum={nextLeftPage} />
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
                <PlaceholderPage pageNum={leftPage} />
              </div>
              {/* Back face: prev right page */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(-180deg)",
                }}
              >
                <PlaceholderPage
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

          {/* ========== Spine shadow cast during flip ========== */}
          {isFlipping && (
            <div
              className="absolute inset-y-0 pointer-events-none"
              style={{
                left: isWide ? "calc(50% - 20px)" : 0,
                width: "40px",
                background: `linear-gradient(90deg, rgba(0,0,0,${0.5 * Math.sin((angle * Math.PI) / 180)}) 0%, transparent 50%, rgba(0,0,0,${0.5 * Math.sin((angle * Math.PI) / 180)}) 100%)`,
                zIndex: 25,
              }}
            />
          )}

          {/* ========== Static spine shadow ========== */}
          {isWide && !isFlipping && (
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%)",
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
      <div className="flex items-center gap-6">
        <button
          onClick={goPrev}
          disabled={atStart || animating}
          className="px-5 py-2.5 border border-red-900/60 text-red-500 text-sm font-mono uppercase tracking-widest transition-all hover:bg-red-900/20 hover:border-red-700/60 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-red-900/60"
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
          className="px-5 py-2.5 border border-red-900/60 text-red-500 text-sm font-mono uppercase tracking-widest transition-all hover:bg-red-900/20 hover:border-red-700/60 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-red-900/60"
        >
          Next
        </button>
      </div>
    </div>
  );
}
