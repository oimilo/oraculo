import { describe, it, expect } from 'vitest';
import type { OracleContextV4, QuestionId } from '../oracleMachine.types';
import { INITIAL_CONTEXT_V4 } from '../oracleMachine.types';

/**
 * Type extension tests — Phase 31 (POL-02)
 * Verifies that ChoiceMap accepts new q1b, q5b, q6b fields without breaking existing keys.
 */
describe('QuestionId union (POL-02)', () => {
  it('includes all v4.0 base + branch keys (regression)', () => {
    // Type-level: this object compiles → union includes all 8 v4.0 keys
    const v4Map: OracleContextV4['choiceMap'] = {
      q1: 'A', q2: 'B', q2b: 'A',
      q3: 'A', q4: 'B', q4b: 'A',
      q5: 'A', q6: 'B',
    };
    expect(v4Map.q1).toBe('A');
  });

  it('accepts q1b field (Phase 31 — Q1B branch)', () => {
    const map: OracleContextV4['choiceMap'] = { q1: 'B', q2: 'B', q1b: 'A' };
    expect(map.q1b).toBe('A');
  });

  it('accepts q5b field (Phase 32 — Q5B branch forward compat)', () => {
    const map: OracleContextV4['choiceMap'] = { q4: 'A', q5: 'A', q5b: 'B' };
    expect(map.q5b).toBe('B');
  });

  it('accepts q6b field (Phase 33 — Q6B branch forward compat)', () => {
    const map: OracleContextV4['choiceMap'] = { q5: 'B', q6: 'A', q6b: 'A' };
    expect(map.q6b).toBe('A');
  });

  it('INITIAL_CONTEXT_V4 still has empty choiceMap (backward compat)', () => {
    expect(INITIAL_CONTEXT_V4.choiceMap).toEqual({});
  });
});
