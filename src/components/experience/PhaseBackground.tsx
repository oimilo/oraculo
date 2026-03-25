'use client';
import type { NarrativePhase } from '@/types';
import { PHASE_COLORS } from '@/types';

interface PhaseBackgroundProps {
  phase: NarrativePhase;
  children?: React.ReactNode;
}

export default function PhaseBackground({ phase, children }: PhaseBackgroundProps) {
  return (
    <div
      className="fixed inset-0 transition-colors duration-[3000ms] ease-in-out"
      style={{ backgroundColor: PHASE_COLORS[phase] }}
    >
      {children}
    </div>
  );
}
