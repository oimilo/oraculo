import { describe, it, expect } from 'vitest';
import { createChoiceGuard, createCompoundGuard, PATH_GUARDS } from '../createChoiceGuard';
import type { OracleContext } from '../../oracleMachine.types';
import type { NarrativePhase } from '@/types';

/**
 * Helper to create mock OracleContext with defaults
 */
const makeContext = (overrides: Partial<OracleContext> = {}): OracleContext => ({
  sessionId: 'test-session',
  choice1: null,
  choice2: null,
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO' as NarrativePhase,
  ...overrides,
});

describe('createChoiceGuard', () => {
  describe('single field matching', () => {
    it('should return true when choice1 matches expected value A', () => {
      const guard = createChoiceGuard('choice1', 'A');
      const context = makeContext({ choice1: 'A' });
      expect(guard({ context })).toBe(true);
    });

    it('should return false when choice1 does not match expected value', () => {
      const guard = createChoiceGuard('choice1', 'A');
      const context = makeContext({ choice1: 'B' });
      expect(guard({ context })).toBe(false);
    });

    it('should return false when choice1 is null', () => {
      const guard = createChoiceGuard('choice1', 'A');
      const context = makeContext({ choice1: null });
      expect(guard({ context })).toBe(false);
    });

    it('should return true when choice2 matches expected value FICAR', () => {
      const guard = createChoiceGuard('choice2', 'FICAR');
      const context = makeContext({ choice2: 'FICAR' });
      expect(guard({ context })).toBe(true);
    });

    it('should return false when choice2 does not match expected value', () => {
      const guard = createChoiceGuard('choice2', 'FICAR');
      const context = makeContext({ choice2: 'EMBORA' });
      expect(guard({ context })).toBe(false);
    });
  });
});

describe('createCompoundGuard', () => {
  describe('AND logic with multiple fields', () => {
    it('should return true only when all conditions match (A + FICAR)', () => {
      const guard = createCompoundGuard([
        { field: 'choice1', value: 'A' },
        { field: 'choice2', value: 'FICAR' },
      ]);
      const context = makeContext({ choice1: 'A', choice2: 'FICAR' });
      expect(guard({ context })).toBe(true);
    });

    it('should return false when first condition matches but second does not', () => {
      const guard = createCompoundGuard([
        { field: 'choice1', value: 'A' },
        { field: 'choice2', value: 'FICAR' },
      ]);
      const context = makeContext({ choice1: 'A', choice2: 'EMBORA' });
      expect(guard({ context })).toBe(false);
    });

    it('should return true only when all conditions match (B + PISAR)', () => {
      const guard = createCompoundGuard([
        { field: 'choice1', value: 'B' },
        { field: 'choice2', value: 'PISAR' },
      ]);
      const context = makeContext({ choice1: 'B', choice2: 'PISAR' });
      expect(guard({ context })).toBe(true);
    });

    it('should return false when choices do not match compound condition', () => {
      const guard = createCompoundGuard([
        { field: 'choice1', value: 'B' },
        { field: 'choice2', value: 'PISAR' },
      ]);
      const context = makeContext({ choice1: 'B', choice2: 'CONTORNAR' });
      expect(guard({ context })).toBe(false);
    });
  });
});

describe('PATH_GUARDS', () => {
  describe('pre-built path guards', () => {
    it('should have isPathAFicar guard that returns true for A + FICAR', () => {
      const context = makeContext({ choice1: 'A', choice2: 'FICAR' });
      expect(PATH_GUARDS.isPathAFicar({ context })).toBe(true);
    });

    it('should have isPathAEmbora guard that returns true for A + EMBORA', () => {
      const context = makeContext({ choice1: 'A', choice2: 'EMBORA' });
      expect(PATH_GUARDS.isPathAEmbora({ context })).toBe(true);
    });

    it('should have isPathBPisar guard that returns true for B + PISAR', () => {
      const context = makeContext({ choice1: 'B', choice2: 'PISAR' });
      expect(PATH_GUARDS.isPathBPisar({ context })).toBe(true);
    });

    it('should have isPathBContornar guard that returns true for B + CONTORNAR', () => {
      const context = makeContext({ choice1: 'B', choice2: 'CONTORNAR' });
      expect(PATH_GUARDS.isPathBContornar({ context })).toBe(true);
    });
  });

  describe('mutual exclusivity', () => {
    it('should ensure exactly one PATH_GUARD returns true for each valid choice combination', () => {
      const validCombinations: Array<{ choice1: 'A' | 'B'; choice2: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' }> = [
        { choice1: 'A', choice2: 'FICAR' },
        { choice1: 'A', choice2: 'EMBORA' },
        { choice1: 'B', choice2: 'PISAR' },
        { choice1: 'B', choice2: 'CONTORNAR' },
      ];

      validCombinations.forEach(({ choice1, choice2 }) => {
        const context = makeContext({ choice1, choice2 });
        const results = [
          PATH_GUARDS.isPathAFicar({ context }),
          PATH_GUARDS.isPathAEmbora({ context }),
          PATH_GUARDS.isPathBPisar({ context }),
          PATH_GUARDS.isPathBContornar({ context }),
        ];

        const trueCount = results.filter(Boolean).length;
        expect(trueCount).toBe(1); // Exactly one guard should return true
      });
    });

    it('should ensure no PATH_GUARD returns true when choices are null', () => {
      const context = makeContext({ choice1: null, choice2: null });
      expect(PATH_GUARDS.isPathAFicar({ context })).toBe(false);
      expect(PATH_GUARDS.isPathAEmbora({ context })).toBe(false);
      expect(PATH_GUARDS.isPathBPisar({ context })).toBe(false);
      expect(PATH_GUARDS.isPathBContornar({ context })).toBe(false);
    });

    it('should ensure no PATH_GUARD returns true for invalid combinations (A + PISAR)', () => {
      const context = makeContext({ choice1: 'A', choice2: 'PISAR' });
      const results = [
        PATH_GUARDS.isPathAFicar({ context }),
        PATH_GUARDS.isPathAEmbora({ context }),
        PATH_GUARDS.isPathBPisar({ context }),
        PATH_GUARDS.isPathBContornar({ context }),
      ];

      const trueCount = results.filter(Boolean).length;
      expect(trueCount).toBe(0); // No guard should return true for invalid combo
    });
  });
});
