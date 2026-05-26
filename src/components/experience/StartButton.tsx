'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface StartButtonProps {
  onClick: () => void;
}

/** Floating ambient particles for depth */
function AmbientParticles() {
  // 8 particles with staggered timing and positions
  const particles = [
    { left: '12%', size: 2, duration: 18, delay: 0, alt: false },
    { left: '28%', size: 1.5, duration: 22, delay: 3, alt: true },
    { left: '45%', size: 1, duration: 25, delay: 7, alt: false },
    { left: '62%', size: 2, duration: 20, delay: 1, alt: true },
    { left: '78%', size: 1.5, duration: 23, delay: 5, alt: false },
    { left: '88%', size: 1, duration: 19, delay: 9, alt: true },
    { left: '35%', size: 1, duration: 26, delay: 12, alt: false },
    { left: '72%', size: 1.5, duration: 21, delay: 8, alt: true },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-5%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(200, 80, 60, ${0.2 + (i % 3) * 0.1})`,
            animation: `${p.alt ? 'particle-drift-alt' : 'particle-drift'} ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function StartButton({ onClick }: StartButtonProps) {
  const [phase, setPhase] = useState<'hidden' | 'logo' | 'ready'>('hidden');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 300);
    const t2 = setTimeout(() => setPhase('ready'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleClick = useCallback(() => {
    setExiting(true);
    setTimeout(onClick, 1000);
  }, [onClick]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: '#000000',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.9s ease-in',
      }}
    >
      {/* Ambient radial warmth — very subtle red/warm center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 38%, rgba(120, 40, 30, 0.06) 0%, transparent 55%)',
          transition: 'opacity 2s ease',
          opacity: phase !== 'hidden' ? 1 : 0,
        }}
      />

      {/* Floating particles */}
      {phase !== 'hidden' && <AmbientParticles />}

      <div className="relative flex flex-col items-center gap-0 px-8">
        {/* Logo with slow pulse after load */}
        <div
          style={{
            opacity: phase === 'hidden' ? 0 : 1,
            transform: phase === 'hidden' ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 1.8s ease-out, transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: phase === 'ready' ? 'logo-pulse 6s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/oraculogo.png"
            alt="Oraculo"
            width={420}
            height={160}
            priority
            style={{
              userSelect: 'none',
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          />
        </div>

        {/* Subtitle — fades in with slight upward drift */}
        <p
          className="mt-2 tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '0.7rem',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '0.3em',
            opacity: phase === 'ready' ? 1 : 0,
            transform: phase === 'ready' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
          }}
        >
          experiencia interativa de voz
        </p>

        {/* Animated separator line */}
        <div
          className="mx-auto mt-10 mb-10"
          style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.12)',
            opacity: phase === 'ready' ? 1 : 0,
            transition: 'opacity 1.5s ease-out',
            animation: phase === 'ready' ? 'line-expand 6s ease-in-out infinite' : 'none',
            width: '32px',
          }}
        />

        {/* Start button with glow + breathe */}
        <button
          onClick={handleClick}
          disabled={exiting}
          className="group relative px-14 py-5 rounded-full transition-all duration-500"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1.15rem',
            fontWeight: 400,
            letterSpacing: '0.18em',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            opacity: phase === 'ready' ? 1 : 0,
            transform: phase === 'ready' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1.2s ease-out, transform 1.2s ease-out, background 0.5s ease, border-color 0.5s ease, color 0.5s ease',
            animation: phase === 'ready' ? 'start-breathe 5s ease-in-out infinite, start-glow 6s ease-in-out infinite' : 'none',
          }}
        >
          <span className="relative z-10 group-hover:text-white/80 group-hover:tracking-[0.22em] transition-all duration-700">
            Entrar
          </span>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          />
        </button>

        {/* Event context */}
        <p
          className="mt-14"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.65rem',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.15)',
            letterSpacing: '0.08em',
            opacity: phase === 'ready' ? 1 : 0,
            transition: 'opacity 2s ease-out 0.5s',
          }}
        >
          VII Bienal de Psicanalise e Cultura &middot; SBPRP 2026
        </p>
      </div>
    </div>
  );
}
