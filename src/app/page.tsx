import ConfettiButton from '@/components/ConfettiButton';

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* ── Decorative background blobs (aria-hidden) ───────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Top-left warm blob */}
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-40 sm:h-96 sm:w-96"
          style={{
            background: 'radial-gradient(circle, #ffd23f 0%, transparent 70%)',
          }}
        />
        {/* Top-right cobalt blob */}
        <div
          className="absolute top-10 -right-20 h-64 w-64 rounded-full opacity-30 sm:h-80 sm:w-80"
          style={{
            background: 'radial-gradient(circle, #3d5af1 0%, transparent 70%)',
          }}
        />
        {/* Bottom-center teal blob */}
        <div
          className="absolute -bottom-16 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full opacity-25 sm:h-80 sm:w-80"
          style={{
            background: 'radial-gradient(circle, #00c2a8 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex w-full max-w-xl flex-col items-center gap-10 text-center sm:gap-12">
        {/* Heading */}
        <header className="flex flex-col items-center gap-3">
          <h1
            className="text-5xl leading-tight tracking-tight text-[#1a1a2e] sm:text-6xl md:text-7xl"
            style={{ fontFamily: 'var(--font-paytone), var(--font-space-grotesk), sans-serif' }}
          >
            You deserve a
            <br />
            <span style={{ color: '#ff4d6d' }}>celebration.</span>
          </h1>
          <p className="max-w-sm text-base leading-relaxed font-medium text-[#1a1a2e]/60 sm:text-lg">
            No reason needed. Just click the button and let the joy loose.
          </p>
        </header>

        {/* Confetti button + counter — client component */}
        <ConfettiButton />

        {/* Footer hint */}
        <footer>
          <p className="text-xs font-medium text-[#1a1a2e]/35">
            Works best with sounds on 🔊 (kidding — we&apos;re a quiet celebration)
          </p>
        </footer>
      </div>
    </main>
  );
}
