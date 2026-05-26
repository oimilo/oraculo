'use client';
import { useState, useEffect } from 'react';

interface ChoiceButtonsProps {
  options: Array<{ label: string; event: string }>;
  onChoice: (eventType: string) => void;
  timeoutSeconds: number;
  minimal?: boolean;
}

/**
 * Choice buttons that remain as fallback/development input alongside voice.
 * Voice is the primary input method, but buttons allow manual testing and provide
 * a backup when voice recognition fails or is unavailable.
 */
export default function ChoiceButtons({ options, onChoice, timeoutSeconds, minimal = false }: ChoiceButtonsProps) {
  const [remaining, setRemaining] = useState(timeoutSeconds);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Slight delay for smooth entrance after question finishes
    const mountTimer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = remaining / timeoutSeconds;

  // Listening bars config — 5 bars with staggered height/timing
  const bars = [
    { height: 10, delay: '0ms', duration: '1.2s' },
    { height: 16, delay: '150ms', duration: '1.0s' },
    { height: 22, delay: '50ms', duration: '1.1s' },
    { height: 16, delay: '250ms', duration: '0.9s' },
    { height: 10, delay: '100ms', duration: '1.3s' },
  ];

  if (minimal) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease-out',
        }}
      >
        {/* Centered row: [Option A]  |bars|  [Option B] */}
        <div className="flex items-center gap-8 pointer-events-auto">
          {/* Option A — ghostly text, glow on hover */}
          <button
            onClick={() => onChoice(options[0].event)}
            className="px-2 py-1 transition-all duration-500 cursor-pointer"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '1.05rem',
              fontStyle: 'italic',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: 'rgba(255, 255, 255, 0.35)',
              background: 'none',
              border: 'none',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)';
              e.currentTarget.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.05)';
            }}
          >
            {options[0].label}
          </button>

          {/* Listening bars */}
          <div
            className="flex items-center justify-center gap-[3px]"
            aria-label="Ouvindo"
            role="status"
          >
            {bars.map((bar, i) => (
              <span
                key={i}
                className="inline-block rounded-full"
                style={{
                  width: 2,
                  height: bar.height,
                  background: 'rgba(255, 255, 255, 0.35)',
                  animation: `listening-bar ${bar.duration} ease-in-out ${bar.delay} infinite`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>

          {/* Option B — ghostly text, glow on hover */}
          <button
            onClick={() => onChoice(options[1].event)}
            className="px-2 py-1 transition-all duration-500 cursor-pointer"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '1.05rem',
              fontStyle: 'italic',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: 'rgba(255, 255, 255, 0.35)',
              background: 'none',
              border: 'none',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)';
              e.currentTarget.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.05)';
            }}
          >
            {options[1].label}
          </button>
        </div>

        {/* Timer arc — bottom center, subtle */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center pointer-events-none">
          <div className="relative w-3 h-3">
            <svg viewBox="0 0 20 20" className="w-full h-full -rotate-90">
              <circle
                cx="10" cy="10" r="8"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1.5"
              />
              <circle
                cx="10" cy="10" r="8"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={`${progress * 50.27} 50.27`}
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 flex flex-col items-center z-40 pb-16 pointer-events-none"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Choice buttons container */}
      <div className="flex gap-5 pointer-events-auto">
        {options.map((option) => (
          <button
            key={option.event}
            onClick={() => onChoice(option.event)}
            className="group relative px-8 py-4 rounded-full text-white/75 transition-all duration-400 hover:text-white"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '1.05rem',
              fontWeight: 400,
              letterSpacing: '0.05em',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="relative z-10">{option.label}</span>
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.06)',
              }}
            />
          </button>
        ))}
      </div>

      {/* Timer - subtle arc progress */}
      <div className="mt-5 flex items-center gap-2">
        <div className="relative w-4 h-4">
          <svg viewBox="0 0 20 20" className="w-full h-full -rotate-90">
            <circle
              cx="10" cy="10" r="8"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
            <circle
              cx="10" cy="10" r="8"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 50.27} 50.27`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
        </div>
        <span
          className="text-white/25 text-xs tabular-nums"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {remaining}s
        </span>
      </div>
    </div>
  );
}
