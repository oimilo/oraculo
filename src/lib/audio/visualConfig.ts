import type { NarrativePhase } from '@/types';

export interface VisualTheme {
  background: string;        // hex color matching PHASE_COLORS
  primaryColor: string;      // rgba string for equalizer bar fill
  secondaryColor: string;    // rgba string for gradient accent
  particleCount: number;     // idle state particle count
  motionIntensity: number;   // 0-1 multiplier for movement speed
  blurAmount: number;        // px for atmospheric blur
}

export const VISUAL_THEMES: Record<NarrativePhase, VisualTheme> = {
  APRESENTACAO: {
    background: '#000000',
    primaryColor: 'rgba(255, 255, 255, 0.4)',
    secondaryColor: 'rgba(255, 255, 255, 0.1)',
    particleCount: 50,
    motionIntensity: 0.3,
    blurAmount: 0,
  },
  INFERNO: {
    background: '#4a0e0e',
    primaryColor: 'rgba(255, 70, 50, 0.8)',
    secondaryColor: 'rgba(255, 200, 100, 0.4)',
    particleCount: 80,
    motionIntensity: 0.7,
    blurAmount: 2,
  },
  PURGATORIO: {
    background: '#3d4f5c',
    primaryColor: 'rgba(100, 150, 200, 0.6)',
    secondaryColor: 'rgba(200, 220, 240, 0.3)',
    particleCount: 60,
    motionIntensity: 0.4,
    blurAmount: 3,
  },
  PARAISO: {
    background: '#5c4a2a',
    primaryColor: 'rgba(255, 215, 100, 0.7)',
    secondaryColor: 'rgba(255, 245, 200, 0.4)',
    particleCount: 40,
    motionIntensity: 0.5,
    blurAmount: 1,
  },
  DEVOLUCAO: {
    background: '#5c4a2a',
    primaryColor: 'rgba(255, 215, 100, 0.7)',
    secondaryColor: 'rgba(255, 245, 200, 0.4)',
    particleCount: 40,
    motionIntensity: 0.5,
    blurAmount: 1,
  },
  ENCERRAMENTO: {
    background: '#000000',
    primaryColor: 'rgba(255, 255, 255, 0.4)',
    secondaryColor: 'rgba(255, 255, 255, 0.1)',
    particleCount: 50,
    motionIntensity: 0.3,
    blurAmount: 0,
  },
};
