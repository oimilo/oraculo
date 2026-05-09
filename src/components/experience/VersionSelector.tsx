'use client';

import { useState, useEffect } from 'react';
import { useVersion } from '@/contexts/VersionContext';
import type { ExperienceVersion } from '@/types';

interface VersionSelectorProps {
  onContinue: () => void;
}

const VERSION_OPTIONS: { version: ExperienceVersion; label: string; subtitle: string }[] = [
  { version: 'V1', label: 'V1', subtitle: 'Voz unica' },
  { version: 'V2', label: 'V2', subtitle: 'Duas vozes' },
];

export default function VersionSelector({ onContinue }: VersionSelectorProps) {
  const { version, setVersion } = useVersion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      data-testid="version-selector"
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)',
      }}
    >
      <div
        className="max-w-md text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
        }}
      >
        {/* Top ornamental line */}
        <div className="mx-auto mb-8 w-12 h-px bg-white/20" />

        <h2
          className="text-2xl text-white/80 mb-2 font-light tracking-wide"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          Escolha a versao
        </h2>

        <p
          className="text-white/30 text-sm mb-10 tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          selecione antes de iniciar
        </p>

        {/* Version option buttons */}
        <div className="flex justify-center gap-4 mb-10">
          {VERSION_OPTIONS.map((opt) => {
            const isSelected = version === opt.version;
            return (
              <button
                key={opt.version}
                data-testid={`version-${opt.version.toLowerCase()}`}
                onClick={() => setVersion(opt.version)}
                className="relative px-8 py-5 rounded-full transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  background: isSelected
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '1px solid rgba(255, 255, 255, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected
                    ? 'rgba(255, 255, 255, 0.80)'
                    : 'rgba(255, 255, 255, 0.40)',
                }}
                aria-pressed={isSelected}
              >
                <span className="block text-lg font-light tracking-wider">
                  {opt.label}
                </span>
                <span
                  className="block text-xs mt-1 tracking-wide"
                  style={{
                    color: isSelected
                      ? 'rgba(255, 255, 255, 0.50)'
                      : 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  {opt.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          data-testid="version-continue"
          onClick={onContinue}
          className="group relative px-14 py-5 rounded-full text-white/70 tracking-widest transition-all duration-500"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '1.1rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'oracle-glow 4s ease-in-out infinite',
          }}
        >
          <span className="relative z-10 group-hover:text-white/90 transition-colors duration-500">
            Continuar
          </span>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          />
        </button>

        {/* Bottom ornamental line */}
        <div className="mx-auto mt-12 w-8 h-px bg-white/10" />
      </div>
    </div>
  );
}
