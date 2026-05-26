'use client';

import type { NarrativePhase } from '@/types';
import type { VoiceLifecyclePhase } from '@/hooks/useVoiceChoice';

interface OracleListeningRingProps {
  isAguardando: boolean;
  lifecyclePhase: VoiceLifecyclePhase;
  phase: NarrativePhase;
}

const PHASE_GLOW: Record<string, { color: string; shadow: string }> = {
  INFERNO: {
    color: 'rgba(220, 70, 50, 0.6)',
    shadow: 'rgba(220, 70, 50, 0.25)',
  },
  PURGATORIO: {
    color: 'rgba(80, 140, 220, 0.6)',
    shadow: 'rgba(80, 140, 220, 0.25)',
  },
  PARAISO: {
    color: 'rgba(220, 180, 60, 0.6)',
    shadow: 'rgba(220, 180, 60, 0.25)',
  },
};

function getGlow(phase: NarrativePhase) {
  return PHASE_GLOW[phase] ?? { color: 'rgba(255,255,255,0.4)', shadow: 'rgba(255,255,255,0.15)' };
}

export default function OracleListeningRing({ isAguardando, lifecyclePhase, phase }: OracleListeningRingProps) {
  if (!isAguardando) return null;

  const glow = getGlow(phase);
  const showMotes = lifecyclePhase === 'listening' || lifecyclePhase === 'fallback';

  // Pick animation based on lifecycle
  let ringAnimation: string;
  let ringOpacity: number;

  switch (lifecyclePhase) {
    case 'listening':
    case 'fallback':
      ringAnimation = 'oracle-ring-listen 3.5s ease-in-out infinite';
      ringOpacity = 0.9;
      break;
    case 'processing':
      ringAnimation = 'oracle-ring-process 2s ease-in-out infinite';
      ringOpacity = 0.7;
      break;
    default: // idle, decided
      ringAnimation = 'oracle-ring-breathe 5s ease-in-out infinite';
      ringOpacity = 0.5;
      break;
  }

  const moteOffsets = [0, 120, 240]; // degrees apart

  return (
    <div
      data-testid="oracle-listening-ring"
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-30"
      aria-label="Ouvindo"
      role="status"
    >
      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          border: `1.5px solid ${glow.color}`,
          boxShadow: `0 0 40px ${glow.shadow}, inset 0 0 20px ${glow.shadow}`,
          opacity: ringOpacity * 0.6,
          animation: ringAnimation,
        }}
      />

      {/* Inner ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          border: `1px solid ${glow.color}`,
          boxShadow: `0 0 25px ${glow.shadow}, inset 0 0 15px ${glow.shadow}`,
          opacity: ringOpacity,
          animation: ringAnimation,
          animationDelay: '0.4s',
        }}
      />

      {/* Orbital motes — visible only when listening */}
      {showMotes && moteOffsets.map((offset) => (
        <div
          key={offset}
          className="absolute"
          style={{
            width: 115,
            height: 115,
            animation: `oracle-mote-orbit 4s linear infinite`,
            animationDelay: `${offset / 360 * 4}s`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              top: 0,
              left: '50%',
              marginLeft: -2,
              backgroundColor: glow.color,
              boxShadow: `0 0 8px ${glow.shadow}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
