'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * End screen: fades to black, then shows institutional thank-you,
 * then fades everything out before the machine resets to IDLE.
 *
 * Timeline (18s total, synced with FIM.after in oracleMachine):
 *   0-3s    — black overlay fades in
 *   3-4.5s  — text + logo fade in
 *   4.5-15s — content visible (~12s reading time)
 *   15-18s  — everything fades out, machine transitions to IDLE
 */
export default function EndFade() {
  const [blackOpacity, setBlackOpacity] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Phase 1: fade to black
    const t1 = setTimeout(() => setBlackOpacity(1), 100);
    // Phase 2: show content after black settles
    const t2 = setTimeout(() => setContentVisible(true), 3500);
    // Phase 3: fade out before machine resets
    const t3 = setTimeout(() => setFadeOut(true), 15000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'black',
        opacity: blackOpacity,
        transition: 'opacity 3s ease-in',
      }}
    >
      {/* Content: thank-you text + logo */}
      <div
        className="flex flex-col items-center gap-8 text-center px-8"
        style={{
          opacity: contentVisible ? (fadeOut ? 0 : 1) : 0,
          transform: contentVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: fadeOut
            ? 'opacity 2.5s ease-out'
            : 'opacity 1.5s ease-out, transform 1.5s ease-out',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1.4rem',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Agradecemos sua presen&#231;a
        </p>

        <div
          className="w-16 mx-auto"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />

        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/sbprp-logo.png"
            alt="SBPRP"
            width={80}
            height={80}
            className="opacity-50"
          />
          <p
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: '0.85rem',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: 'rgba(255, 255, 255, 0.35)',
            }}
          >
            VII Bienal de Psican&#225;lise e Cultura &mdash; SBPRP 2026
          </p>
        </div>
      </div>
    </div>
  );
}
