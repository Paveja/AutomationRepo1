'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type ConfettiPiece = {
  id: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
  color: string;
};

const CONFETTI_COLORS = ['#e2503f', '#f2a65a', '#2f6b4f', '#f6ece1', '#8a5a44'];
const PIECE_COUNT = 56;
const BURST_LIFETIME_MS = 2800;

function createConfettiBurst(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    x: Math.random() * 100,
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 1.1,
    delay: Math.random() * 0.4,
    drift: Math.random() * 160 - 80,
    spin: 280 + Math.random() * 360,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] as string,
  }));
}

export function CelebrationStage() {
  const [celebrated, setCelebrated] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [motionEnabled, setMotionEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setMotionEnabled(!event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const handleCelebrate = useCallback(() => {
    setCelebrated(true);

    if (motionEnabled) {
      setConfetti(createConfettiBurst());

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      clearTimeoutRef.current = setTimeout(() => setConfetti([]), BURST_LIFETIME_MS);
    }
  }, [motionEnabled]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={
              {
                '--x': `${piece.x}%`,
                '--size': `${piece.size}px`,
                '--duration': `${piece.duration}s`,
                '--delay': `${piece.delay}s`,
                '--drift': `${piece.drift}px`,
                '--spin': `${piece.spin}deg`,
                '--piece-color': piece.color,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <section className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
          <span
            aria-hidden="true"
            className="bg-medallion ring-border absolute inset-0 rounded-full shadow-[0_18px_40px_-16px_rgba(36,26,19,0.45)] ring-1"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={`text-primary relative h-12 w-12 transition-transform duration-500 ${
              celebrated ? 'scale-100' : 'scale-90'
            }`}
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="font-display text-foreground text-4xl font-medium tracking-tight italic sm:text-5xl">
          You did it.
        </h1>

        <p className="text-muted-foreground mt-4 max-w-sm text-base sm:text-lg">
          {celebrated
            ? 'Celebration launched — this one is officially worth remembering.'
            : 'Every milestone deserves a moment. Go ahead and make this one count.'}
        </p>

        <button
          type="button"
          onClick={handleCelebrate}
          className="bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-8 py-3 text-base font-semibold shadow-[0_12px_24px_-10px_rgba(226,80,63,0.65)] transition-transform duration-150 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
        >
          {celebrated ? 'Celebrate again' : 'Celebrate this win'}
        </button>

        <span role="status" aria-live="polite" className="sr-only-live">
          {celebrated ? 'Celebration launched.' : ''}
        </span>
      </section>
    </main>
  );
}
