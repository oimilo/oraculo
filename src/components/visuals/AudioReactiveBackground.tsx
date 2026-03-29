'use client';

import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';
import EqualizerVisualizer from './EqualizerVisualizer';
import IdleAnimation from './IdleAnimation';

interface AudioReactiveBackgroundProps {
  phase: NarrativePhase;
  isPlaying: boolean;
  children?: React.ReactNode;
}

export default function AudioReactiveBackground({
  phase,
  isPlaying,
  children,
}: AudioReactiveBackgroundProps) {
  const theme = VISUAL_THEMES[phase];

  return (
    <div
      data-testid="audio-reactive-background"
      className="fixed inset-0 transition-colors duration-[3000ms] ease-in-out"
      style={{ backgroundColor: theme.background }}
    >
      {/* Visual layer — behind all content */}
      {isPlaying ? (
        <EqualizerVisualizer phase={phase} isPlaying={isPlaying} />
      ) : (
        <IdleAnimation phase={phase} />
      )}

      {/* Content layer — on top of visuals */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
