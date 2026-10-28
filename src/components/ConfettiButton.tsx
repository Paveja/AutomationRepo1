'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfettiPiece {
  id: number;
  color: string;
  shape: 'circle' | 'square' | 'rect';
  /** Fixed viewport left in px (piece starts here) */
  left: number;
  /** Fixed viewport top in px (piece starts here) */
  top: number;
  /** CSS animation translation X in px (var --dx) */
  dx: number;
  /** CSS animation translation Y in px (var --dy) */
  dy: number;
  /** CSS animation rotation in degrees (var --rotate) */
  rotate: number;
  /** Width for circles/squares in px; height for rects */
  size: number;
  /** Staggered animation delay in ms */
  delay: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  '#ff4d6d', // coral
  '#3d5af1', // cobalt
  '#ffd23f', // gold
  '#00c2a8', // teal
  '#ff8c42', // orange
  '#c77dff', // purple
  '#06d6a0', // mint
  '#ef233c', // red
];

const SHAPES: ConfettiPiece['shape'][] = ['circle', 'square', 'rect'];

const BURST_COUNT = 52;
const ANIMATION_DURATION_MS = 900;
const COOLDOWN_BUFFER_MS = 200;

const CELEBRATION_MESSAGES = [
  'Woohoo! 🎊',
  'Amazing! ✨',
  "Let's gooo! 🚀",
  'Spectacular! 🌟',
  'Pure joy! 💛',
  'Yes! Yes! Yes! 🙌',
  'Incredible! 🎉',
  'You legend! 👑',
  'Absolutely wild! 🔥',
  'Nailed it! 💥',
];

// ─── Hook: reduced motion ─────────────────────────────────────────────────────

/** Safe random picker — satisfies noUncheckedIndexedAccess without littering `!` everywhere */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function useReducedMotion(): boolean {
  // Initialise directly from the media query so no synchronous setState inside effect
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// ─── Piece ID counter (module-level, avoids key collisions across renders) ───

let _pieceCounter = 0;
const nextId = () => ++_pieceCounter;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfettiButton() {
  const [count, setCount] = useState(0);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isCooling, setIsCooling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCelebrate = useCallback(() => {
    if (isCooling) return;

    // Pick a random celebration message
    const nextMessage = pick(CELEBRATION_MESSAGES);

    setCount((prev) => prev + 1);
    setMessage(nextMessage);

    // Only generate particles when motion is allowed and we can measure the button
    if (!reducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const newPieces: ConfettiPiece[] = Array.from({ length: BURST_COUNT }, (): ConfettiPiece => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 240;
        const shape = pick(SHAPES);
        const baseSize = 6 + Math.floor(Math.random() * 9);

        // Spread origin within button bounds so pieces appear to come from all over it
        const spreadX = (Math.random() - 0.5) * rect.width * 0.5;
        const spreadY = (Math.random() - 0.5) * rect.height * 0.5;

        return {
          id: nextId(),
          color: pick(COLORS),
          shape,
          left: originX + spreadX,
          top: originY + spreadY,
          dx: Math.cos(angle) * speed,
          // Bias slightly upward (subtract 60–90px) so burst feels like an explosion, not a fall
          dy: Math.sin(angle) * speed - 75,
          rotate: (Math.random() - 0.5) * 800,
          size: baseSize,
          delay: Math.floor(Math.random() * 110),
        };
      });

      setIsCooling(true);
      setPieces(newPieces);

      timerRef.current = setTimeout(() => {
        setPieces([]);
        setIsCooling(false);
        timerRef.current = null;
      }, ANIMATION_DURATION_MS + COOLDOWN_BUFFER_MS);
    }
  }, [isCooling, reducedMotion]);

  // ─── Derived UI ─────────────────────────────────────────────────────────────

  const buttonLabel = count === 0 ? 'Celebrate! 🎉' : 'Celebrate again! 🎉';

  const ariaLabel =
    count === 0
      ? 'Click to celebrate with confetti'
      : `Celebrate again — you have celebrated ${count} ${count === 1 ? 'time' : 'times'} this session`;

  return (
    <>
      {/* ── Fixed confetti canvas (pointer-events-none so it never blocks UI) ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {pieces.map((piece) => {
          const isRect = piece.shape === 'rect';
          const width = isRect ? piece.size * 2.5 : piece.size;
          const height = piece.size;
          const borderRadius =
            piece.shape === 'circle' ? '50%' : piece.shape === 'square' ? '2px' : '2px';

          return (
            <div
              key={piece.id}
              className="confetti-piece"
              style={
                {
                  left: piece.left,
                  top: piece.top,
                  width,
                  height,
                  backgroundColor: piece.color,
                  borderRadius,
                  '--dx': `${piece.dx}px`,
                  '--dy': `${piece.dy}px`,
                  '--rotate': `${piece.rotate}deg`,
                  animationDuration: `${ANIMATION_DURATION_MS}ms`,
                  animationDelay: `${piece.delay}ms`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* ── Main interaction area ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-8 sm:gap-10">
        <button
          ref={buttonRef}
          onClick={handleCelebrate}
          disabled={isCooling}
          aria-label={ariaLabel}
          className="celebrate-btn relative rounded-3xl px-10 py-5 text-2xl font-black tracking-wide text-white outline-none select-none sm:px-14 sm:py-6 sm:text-3xl"
        >
          {buttonLabel}
        </button>

        {/* ── Live region — screen readers announce this on every update ─────── */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex min-h-[5rem] flex-col items-center gap-2 text-center"
        >
          {count > 0 && (
            <>
              {/* Visual message — screen-reader sees the sr-only text below instead */}
              <p className="celebration-message text-3xl sm:text-4xl" aria-hidden="true">
                {message}
              </p>
              <p className="text-base font-semibold text-[#1a1a2e]/55 sm:text-lg">
                {count === 1
                  ? '1 celebration this session 🎊'
                  : `${count} celebrations this session 🎊`}
              </p>
            </>
          )}

          {/* SR-only live text */}
          <span className="sr-only">
            {count > 0
              ? `${message} You have celebrated ${count} ${count === 1 ? 'time' : 'times'} this session.`
              : ''}
          </span>
        </div>
      </div>
    </>
  );
}
