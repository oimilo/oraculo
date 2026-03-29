import { describe, it, expect } from 'vitest';
import { VISUAL_THEMES, type VisualTheme } from '../visualConfig';
import { PHASE_COLORS, type NarrativePhase } from '@/types';

const ALL_PHASES: NarrativePhase[] = [
  'APRESENTACAO', 'INFERNO', 'PURGATORIO', 'PARAISO', 'DEVOLUCAO', 'ENCERRAMENTO'
];

describe('VISUAL_THEMES', () => {
  it('has an entry for every NarrativePhase', () => {
    ALL_PHASES.forEach(phase => {
      expect(VISUAL_THEMES[phase]).toBeDefined();
    });
  });

  it('background colors match PHASE_COLORS exactly', () => {
    ALL_PHASES.forEach(phase => {
      expect(VISUAL_THEMES[phase].background).toBe(PHASE_COLORS[phase]);
    });
  });

  it('every theme has required fields with valid types', () => {
    ALL_PHASES.forEach(phase => {
      const theme = VISUAL_THEMES[phase];
      expect(typeof theme.background).toBe('string');
      expect(typeof theme.primaryColor).toBe('string');
      expect(typeof theme.secondaryColor).toBe('string');
      expect(typeof theme.particleCount).toBe('number');
      expect(typeof theme.motionIntensity).toBe('number');
      expect(typeof theme.blurAmount).toBe('number');
    });
  });

  it('motionIntensity is between 0 and 1 for all phases', () => {
    ALL_PHASES.forEach(phase => {
      expect(VISUAL_THEMES[phase].motionIntensity).toBeGreaterThanOrEqual(0);
      expect(VISUAL_THEMES[phase].motionIntensity).toBeLessThanOrEqual(1);
    });
  });

  it('particleCount is positive for all phases', () => {
    ALL_PHASES.forEach(phase => {
      expect(VISUAL_THEMES[phase].particleCount).toBeGreaterThan(0);
    });
  });

  it('INFERNO has red-toned primary color', () => {
    expect(VISUAL_THEMES.INFERNO.primaryColor).toContain('255');
    expect(VISUAL_THEMES.INFERNO.primaryColor).toContain('rgba');
  });

  it('PURGATORIO has blue-toned primary color', () => {
    expect(VISUAL_THEMES.PURGATORIO.primaryColor).toContain('100, 150, 200');
  });

  it('PARAISO has gold-toned primary color', () => {
    expect(VISUAL_THEMES.PARAISO.primaryColor).toContain('255, 215, 100');
  });

  it('DEVOLUCAO continues PARAISO visual theme', () => {
    expect(VISUAL_THEMES.DEVOLUCAO.background).toBe(VISUAL_THEMES.PARAISO.background);
    expect(VISUAL_THEMES.DEVOLUCAO.primaryColor).toBe(VISUAL_THEMES.PARAISO.primaryColor);
  });
});
