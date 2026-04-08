import { describe, it, expect } from 'vitest';
import {
  determineArchetype,
  createArchetypeGuard,
  ARCHETYPE_GUARDS,
  isContraFobico,
  isPortador,
} from '../patternMatching';
import type { ChoiceAB, ChoicePattern, DevolucaoArchetype } from '@/types';

/**
 * Helper to create mock context with choices pattern.
 * Matches OracleContextV3 shape but only includes fields needed for pattern matching.
 */
interface MockContext {
  choices: ChoicePattern;
}

const makeContext = (choices: ChoicePattern): MockContext => ({
  choices,
});

/**
 * Helper to create mock context with both choices array and choiceMap (Phase 34).
 * isContraFobico and isPortador read context.choiceMap (named lookup), not context.choices.
 */
type MockChoiceMap = Partial<Record<'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q1b' | 'q5b' | 'q6b', 'A' | 'B'>>;

interface MockContextWithMap {
  choices: ChoicePattern;
  choiceMap?: MockChoiceMap;
}

const makeContextWithMap = (choiceMap: MockChoiceMap | undefined): MockContextWithMap => ({
  choices: [],
  choiceMap,
});

describe('determineArchetype', () => {
  describe('MIRROR archetype - perfect alternation', () => {
    it('should return MIRROR for ABABAB pattern', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('MIRROR');
    });

    it('should return MIRROR for BABABA pattern (reverse alternation)', () => {
      const pattern: ChoicePattern = ['B', 'A', 'B', 'A', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('MIRROR');
    });
  });

  describe('DEPTH_SEEKER archetype - all A', () => {
    it('should return DEPTH_SEEKER for all A choices', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('DEPTH_SEEKER');
    });
  });

  describe('SURFACE_KEEPER archetype - all B', () => {
    it('should return SURFACE_KEEPER for all B choices', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('SURFACE_KEEPER');
    });
  });

  describe('PIVOT_LATE archetype - direction change from A to B', () => {
    it('should return PIVOT_LATE for first half A, second half B (AAABBB)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('PIVOT_LATE');
    });

    it('should return PIVOT_LATE for 2A then 4B (AABBBB)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('PIVOT_LATE');
    });
  });

  describe('PIVOT_EARLY archetype - direction change from B to A', () => {
    it('should return PIVOT_EARLY for first half B, second half A (BBBAAA)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('PIVOT_EARLY');
    });

    it('should return PIVOT_EARLY for 2B then 4A (BBAAAA)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('PIVOT_EARLY');
    });
  });

  describe('SEEKER archetype - mostly A (5A, 1B)', () => {
    it('should return SEEKER for 5A and 1B at end (AAAAAB)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });

    it('should return SEEKER for 5A and 1B at position 4 (AAAABA)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });

    it('should return SEEKER for 4A and 2B non-alternating (AAABBA)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'B', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });
  });

  describe('GUARDIAN archetype - mostly B (5B, 1A)', () => {
    it('should return GUARDIAN for 5B and 1A at position 4 (BBBBAB)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('GUARDIAN');
    });

    it('should return GUARDIAN for 5B and 1A at start (ABBBBB)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('GUARDIAN');
    });

    it('should return GUARDIAN for 4B and 2A non-alternating (BBBAAB)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'A', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('GUARDIAN');
    });
  });

  describe('CONTRADICTED archetype - mixed patterns', () => {
    it('should return CONTRADICTED for 3A, 3B with no alternation or pivot (ABBABA)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'B', 'A', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should return CONTRADICTED for balanced but non-alternating pattern (AABBAB)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'B', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });
  });

  describe('Edge cases - nulls and incomplete patterns', () => {
    it('should return CONTRADICTED for all nulls', () => {
      const pattern: ChoicePattern = [null, null, null, null, null, null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should return CONTRADICTED for incomplete pattern (2 choices made)', () => {
      const pattern: ChoicePattern = ['A', 'A', null, null, null, null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should return CONTRADICTED for partially complete pattern (4 choices made)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'B', null, null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should return CONTRADICTED for 5 complete choices (missing 1)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });
  });
});

describe('createArchetypeGuard', () => {
  it('should create a guard function that checks context.choices via determineArchetype', () => {
    const seekerGuard = createArchetypeGuard('SEEKER');
    const context = makeContext(['A', 'A', 'A', 'A', 'A', 'B']);
    expect(seekerGuard({ context })).toBe(true);
  });

  it('should return false when archetype does not match', () => {
    const seekerGuard = createArchetypeGuard('SEEKER');
    const context = makeContext(['B', 'B', 'B', 'B', 'B', 'B']); // SURFACE_KEEPER
    expect(seekerGuard({ context })).toBe(false);
  });

  it('should work for MIRROR archetype', () => {
    const mirrorGuard = createArchetypeGuard('MIRROR');
    const context = makeContext(['A', 'B', 'A', 'B', 'A', 'B']);
    expect(mirrorGuard({ context })).toBe(true);
  });

  it('should work for CONTRADICTED archetype', () => {
    const contradictedGuard = createArchetypeGuard('CONTRADICTED');
    const context = makeContext(['A', 'B', 'B', 'A', 'B', 'A']);
    expect(contradictedGuard({ context })).toBe(true);
  });
});

describe('ARCHETYPE_GUARDS', () => {
  describe('guard object exports', () => {
    it('should export isSeeker guard', () => {
      expect(ARCHETYPE_GUARDS.isSeeker).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isSeeker).toBe('function');
    });

    it('should export isGuardian guard', () => {
      expect(ARCHETYPE_GUARDS.isGuardian).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isGuardian).toBe('function');
    });

    it('should export isContradicted guard', () => {
      expect(ARCHETYPE_GUARDS.isContradicted).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isContradicted).toBe('function');
    });

    it('should export isPivotEarly guard', () => {
      expect(ARCHETYPE_GUARDS.isPivotEarly).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isPivotEarly).toBe('function');
    });

    it('should export isPivotLate guard', () => {
      expect(ARCHETYPE_GUARDS.isPivotLate).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isPivotLate).toBe('function');
    });

    it('should export isDepthSeeker guard', () => {
      expect(ARCHETYPE_GUARDS.isDepthSeeker).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isDepthSeeker).toBe('function');
    });

    it('should export isSurfaceKeeper guard', () => {
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isSurfaceKeeper).toBe('function');
    });

    it('should export isMirror guard', () => {
      expect(ARCHETYPE_GUARDS.isMirror).toBeDefined();
      expect(typeof ARCHETYPE_GUARDS.isMirror).toBe('function');
    });
  });

  describe('mutual exclusivity - each pattern matches exactly one archetype', () => {
    it('should match SEEKER pattern only with isSeeker', () => {
      const context = makeContext(['A', 'A', 'A', 'A', 'A', 'B']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match GUARDIAN pattern only with isGuardian', () => {
      const context = makeContext(['B', 'B', 'B', 'B', 'A', 'B']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match MIRROR pattern only with isMirror', () => {
      const context = makeContext(['A', 'B', 'A', 'B', 'A', 'B']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(true);
    });

    it('should match DEPTH_SEEKER pattern only with isDepthSeeker', () => {
      const context = makeContext(['A', 'A', 'A', 'A', 'A', 'A']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match SURFACE_KEEPER pattern only with isSurfaceKeeper', () => {
      const context = makeContext(['B', 'B', 'B', 'B', 'B', 'B']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match PIVOT_EARLY pattern only with isPivotEarly', () => {
      const context = makeContext(['B', 'B', 'B', 'A', 'A', 'A']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match PIVOT_LATE pattern only with isPivotLate', () => {
      const context = makeContext(['A', 'A', 'A', 'B', 'B', 'B']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });

    it('should match CONTRADICTED pattern only with isContradicted', () => {
      const context = makeContext(['A', 'B', 'B', 'A', 'B', 'A']);
      expect(ARCHETYPE_GUARDS.isSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isGuardian({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isContradicted({ context })).toBe(true);
      expect(ARCHETYPE_GUARDS.isPivotEarly({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isPivotLate({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isDepthSeeker({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isSurfaceKeeper({ context })).toBe(false);
      expect(ARCHETYPE_GUARDS.isMirror({ context })).toBe(false);
    });
  });
});

describe('variable-length choice arrays (v4.0 branching)', () => {
  describe('8-choice arrays', () => {
    it('should return DEPTH_SEEKER for all A (8 choices)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('DEPTH_SEEKER');
    });

    it('should return SURFACE_KEEPER for all B (8 choices)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('SURFACE_KEEPER');
    });

    it('should return MIRROR for perfect alternation (8 choices)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('MIRROR');
    });

    it('should return SEEKER for 75% A (6A/2B in 8 choices)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });

    it('should return GUARDIAN for 75% B (6B/2A in 8 choices)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'B', 'B', 'A', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('GUARDIAN');
    });

    it('should return PIVOT_LATE for A-heavy start, B-heavy end (8 choices)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'B', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('PIVOT_LATE');
    });

    it('should return PIVOT_EARLY for B-heavy start, A-heavy end (8 choices)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'A', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('PIVOT_EARLY');
    });

    it('should return CONTRADICTED for balanced mix (8 choices)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'A', 'B', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });
  });

  describe('7-choice arrays (single branch taken)', () => {
    it('should return DEPTH_SEEKER for all A (7 choices)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('DEPTH_SEEKER');
    });

    it('should return SURFACE_KEEPER for all B (7 choices)', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'B', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('SURFACE_KEEPER');
    });

    it('should return MIRROR for alternation (7 choices)', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'B', 'A', 'B', 'A'];
      expect(determineArchetype(pattern)).toBe('MIRROR');
    });

    it('should return SEEKER for 71% A (5A/2B in 7 choices)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });
  });

  describe('backward compatibility (6-choice arrays)', () => {
    it('should still return SEEKER for 5A/1B (83%)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('SEEKER');
    });

    it('should still return MIRROR for ABABAB', () => {
      const pattern: ChoicePattern = ['A', 'B', 'A', 'B', 'A', 'B'];
      expect(determineArchetype(pattern)).toBe('MIRROR');
    });

    it('should still return PIVOT_LATE for AAABBB', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'B', 'B', 'B'];
      expect(determineArchetype(pattern)).toBe('PIVOT_LATE');
    });

    it('should still return PIVOT_EARLY for BBBAAA', () => {
      const pattern: ChoicePattern = ['B', 'B', 'B', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('PIVOT_EARLY');
    });
  });

  describe('edge cases with variable length', () => {
    it('should return CONTRADICTED for fewer than 6 valid choices', () => {
      const pattern: ChoicePattern = ['A', 'A', null, null, null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should return CONTRADICTED for 5 valid choices (one null)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', null];
      expect(determineArchetype(pattern)).toBe('CONTRADICTED');
    });

    it('should handle 10 choices (theoretical max)', () => {
      const pattern: ChoicePattern = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'];
      expect(determineArchetype(pattern)).toBe('DEPTH_SEEKER');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Phase 34 — AR-02: isContraFobico guard tests
// Trigger: q1='B' && q2='B' && q1b='A' (visitor stayed, looked, crossed void)
// ═══════════════════════════════════════════════════════════════
describe('isContraFobico (Phase 34 — AR-02)', () => {
  it('returns true when q1=B && q2=B && q1b=A (full trigger)', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'B', q1b: 'A' });
    expect(isContraFobico({ context })).toBe(true);
  });

  it('returns true when full trigger plus extra fields (extra fields ignored)', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'B', q1b: 'A', q3: 'A', q4: 'B', q5: 'A', q6: 'B' });
    expect(isContraFobico({ context })).toBe(true);
  });

  it('returns false when q1b is missing (visitor never entered Q1B branch)', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'B' });
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when q1=A (wrong q1)', () => {
    const context = makeContextWithMap({ q1: 'A', q2: 'B', q1b: 'A' });
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when q2=A (wrong q2)', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'A', q1b: 'A' });
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when q1b=B (visitor turned back at the void)', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'B', q1b: 'B' });
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when choiceMap is empty', () => {
    const context = makeContextWithMap({});
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when choiceMap is undefined', () => {
    const context = makeContextWithMap(undefined);
    expect(isContraFobico({ context })).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Phase 34 — AR-03: isPortador guard tests
// Trigger: q4='A' && q5='A' && q5b='A' (visitor remembered, carries, fused them)
// ═══════════════════════════════════════════════════════════════
describe('isPortador (Phase 34 — AR-03)', () => {
  it('returns true when q4=A && q5=A && q5b=A (full trigger)', () => {
    const context = makeContextWithMap({ q4: 'A', q5: 'A', q5b: 'A' });
    expect(isPortador({ context })).toBe(true);
  });

  it('returns true when full trigger plus extra fields', () => {
    const context = makeContextWithMap({ q1: 'B', q2: 'B', q3: 'A', q4: 'A', q5: 'A', q5b: 'A', q6: 'B' });
    expect(isPortador({ context })).toBe(true);
  });

  it('returns false when q5b is missing', () => {
    const context = makeContextWithMap({ q4: 'A', q5: 'A' });
    expect(isPortador({ context })).toBe(false);
  });

  it('returns false when q4=B (wrong q4)', () => {
    const context = makeContextWithMap({ q4: 'B', q5: 'A', q5b: 'A' });
    expect(isPortador({ context })).toBe(false);
  });

  it('returns false when q5=B (wrong q5)', () => {
    const context = makeContextWithMap({ q4: 'A', q5: 'B', q5b: 'A' });
    expect(isPortador({ context })).toBe(false);
  });

  it('returns false when q5b=B (visitor chose to dissolve, not carry)', () => {
    const context = makeContextWithMap({ q4: 'A', q5: 'A', q5b: 'B' });
    expect(isPortador({ context })).toBe(false);
  });

  it('returns false when choiceMap is empty', () => {
    const context = makeContextWithMap({});
    expect(isPortador({ context })).toBe(false);
  });

  it('returns false when choiceMap is undefined', () => {
    const context = makeContextWithMap(undefined);
    expect(isPortador({ context })).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Phase 34 — ARCHETYPE_GUARDS export contains new guards
// ═══════════════════════════════════════════════════════════════
describe('ARCHETYPE_GUARDS includes Phase 34 guards', () => {
  it('exports isContraFobico in ARCHETYPE_GUARDS', () => {
    expect(ARCHETYPE_GUARDS.isContraFobico).toBeDefined();
    expect(typeof ARCHETYPE_GUARDS.isContraFobico).toBe('function');
  });

  it('exports isPortador in ARCHETYPE_GUARDS', () => {
    expect(ARCHETYPE_GUARDS.isPortador).toBeDefined();
    expect(typeof ARCHETYPE_GUARDS.isPortador).toBe('function');
  });

  it('ARCHETYPE_GUARDS has 10 keys (8 baseline + isContraFobico + isPortador)', () => {
    expect(Object.keys(ARCHETYPE_GUARDS).length).toBe(10);
  });
});
