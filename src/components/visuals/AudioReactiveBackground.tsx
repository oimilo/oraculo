'use client';

import type { NarrativePhase } from '@/types';
import EqualizerVisualizer from './EqualizerVisualizer';
import IdleAnimation from './IdleAnimation';

interface AudioReactiveBackgroundProps {
  phase: NarrativePhase;
  isPlaying: boolean;
  children?: React.ReactNode;
}

/**
 * Atmospheric gradient backgrounds per phase.
 * Each has a main radial gradient (lighter center, dark edges),
 * an off-center ambient glow for depth, and a vignette overlay.
 */
const PHASE_ATMOSPHERES: Record<NarrativePhase, {
  base: string;
  glow: string;
  glowPosition: string;
  vignette: string;
}> = {
  APRESENTACAO: {
    base: 'radial-gradient(ellipse at 50% 45%, #0d0d14 0%, #050508 40%, #000000 100%)',
    glow: 'radial-gradient(ellipse at 30% 60%, rgba(20, 15, 40, 0.4) 0%, transparent 60%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
  },
  INFERNO: {
    base: 'radial-gradient(ellipse at 50% 45%, #5c1818 0%, #4a0e0e 35%, #1f0505 80%, #0a0000 100%)',
    glow: 'radial-gradient(ellipse at 35% 55%, rgba(100, 30, 10, 0.35) 0%, transparent 55%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(10, 0, 0, 0.7) 100%)',
  },
  PURGATORIO: {
    base: 'radial-gradient(ellipse at 50% 45%, #4d6070 0%, #3d4f5c 35%, #242f38 80%, #0f1518 100%)',
    glow: 'radial-gradient(ellipse at 60% 40%, rgba(60, 90, 120, 0.3) 0%, transparent 55%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(8, 12, 16, 0.7) 100%)',
  },
  PARAISO: {
    base: 'radial-gradient(ellipse at 50% 45%, #6d5835 0%, #5c4a2a 35%, #352a14 80%, #140f05 100%)',
    glow: 'radial-gradient(ellipse at 40% 50%, rgba(120, 90, 40, 0.3) 0%, transparent 55%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(10, 6, 0, 0.7) 100%)',
  },
  DEVOLUCAO: {
    base: 'radial-gradient(ellipse at 50% 45%, #6d5835 0%, #5c4a2a 35%, #352a14 80%, #140f05 100%)',
    glow: 'radial-gradient(ellipse at 40% 50%, rgba(120, 90, 40, 0.3) 0%, transparent 55%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(10, 6, 0, 0.7) 100%)',
  },
  ENCERRAMENTO: {
    base: 'radial-gradient(ellipse at 50% 45%, #0d0d14 0%, #050508 40%, #000000 100%)',
    glow: 'radial-gradient(ellipse at 30% 60%, rgba(20, 15, 40, 0.4) 0%, transparent 60%)',
    glowPosition: '0 0',
    vignette: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
  },
};

export default function AudioReactiveBackground({
  phase,
  isPlaying,
  children,
}: AudioReactiveBackgroundProps) {
  const atm = PHASE_ATMOSPHERES[phase];

  return (
    <div
      data-testid="audio-reactive-background"
      className="fixed inset-0"
    >
      {/* Base gradient layer */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{ background: atm.base }}
      />

      {/* Off-center ambient glow for depth */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{ background: atm.glow }}
      />

      {/* Vignette — darkens edges for focus on center orb */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{ background: atm.vignette }}
      />

      {/* Idle particles — always visible as ambient background */}
      <IdleAnimation phase={phase} />

      {/* 3D orb — always mounted, reacts to audio when playing, idle animation otherwise */}
      <EqualizerVisualizer phase={phase} isPlaying={isPlaying} />

      {/* Content layer — on top of visuals */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
