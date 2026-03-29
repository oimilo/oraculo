'use client';
import { useState, useEffect } from 'react';

interface StartButtonProps {
  onClick: () => void;
}

export default function StartButton({ onClick }: StartButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)',
      }}
    >
      <div
        className="text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 1.5s ease-out, transform 1.5s ease-out',
        }}
      >
        <button
          onClick={onClick}
          className="group relative px-16 py-7 rounded-full text-white/70 tracking-widest transition-all duration-500"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1.25rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'oracle-breathe 5s ease-in-out infinite, oracle-glow 4s ease-in-out infinite',
          }}
        >
          <span className="relative z-10 group-hover:text-white/90 transition-colors duration-500">
            Toque para comecar
          </span>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          />
        </button>
      </div>
    </div>
  );
}
