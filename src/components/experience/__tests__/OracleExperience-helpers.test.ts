import { describe, it, expect } from 'vitest';
import { SCRIPT } from '@/data/script';
import { QUESTION_META } from '@/types';

/**
 * OracleExperience Q1B Helper Smoke Tests — Phase 31 (BR-01)
 *
 * The 6 helper functions in OracleExperience.tsx are not exported (private),
 * so we cannot test them directly. Instead, this test verifies the contracts
 * those helpers depend on are intact:
 *   - SCRIPT keys referenced in getScriptKey/getFallbackScript exist at runtime
 *   - QUESTION_META[9] referenced by buildChoiceConfig(9) is well-formed
 * This catches the "helper references non-existent SCRIPT key" failure mode
 * (Pitfall 1 in 31-RESEARCH.md).
 */
describe('OracleExperience Q1B helper contracts (Phase 31)', () => {
  it('SCRIPT.INFERNO_Q1B_SETUP exists (getScriptKey contract)', () => {
    expect(SCRIPT.INFERNO_Q1B_SETUP).toBeDefined();
    expect(Array.isArray(SCRIPT.INFERNO_Q1B_SETUP)).toBe(true);
    expect(SCRIPT.INFERNO_Q1B_SETUP.length).toBeGreaterThan(0);
  });

  it('SCRIPT.INFERNO_Q1B_PERGUNTA exists', () => {
    expect(SCRIPT.INFERNO_Q1B_PERGUNTA).toBeDefined();
  });

  it('SCRIPT.INFERNO_Q1B_RESPOSTA_A exists', () => {
    expect(SCRIPT.INFERNO_Q1B_RESPOSTA_A).toBeDefined();
  });

  it('SCRIPT.INFERNO_Q1B_RESPOSTA_B exists', () => {
    expect(SCRIPT.INFERNO_Q1B_RESPOSTA_B).toBeDefined();
  });

  it('SCRIPT.FALLBACK_Q1B exists (getFallbackScript contract)', () => {
    expect(SCRIPT.FALLBACK_Q1B).toBeDefined();
    expect(SCRIPT.FALLBACK_Q1B.length).toBeGreaterThan(0);
  });

  it('SCRIPT.TIMEOUT_Q1B exists (getScriptKey timeout contract)', () => {
    expect(SCRIPT.TIMEOUT_Q1B).toBeDefined();
  });

  it('QUESTION_META[9] is well-formed (buildChoiceConfig(9) contract)', () => {
    const meta = QUESTION_META[9];
    expect(meta).toBeDefined();
    expect(meta.optionA).toBe('Atravessar');
    expect(meta.optionB).toBe('Voltar');
    expect(Array.isArray(meta.keywordsA)).toBe(true);
    expect(meta.keywordsA.length).toBeGreaterThan(0);
    expect(Array.isArray(meta.keywordsB)).toBe(true);
    expect(meta.keywordsB.length).toBeGreaterThan(0);
  });
});

/**
 * OracleExperience Q5B Helper Smoke Tests — Phase 32 (BR-02)
 *
 * The 6 helper functions in OracleExperience.tsx are not exported (private),
 * so we cannot test them directly. Instead, this test verifies the contracts
 * those helpers depend on are intact:
 *   - SCRIPT keys referenced in getScriptKey/getFallbackScript exist at runtime
 *   - QUESTION_META[10] referenced by buildChoiceConfig(10) is well-formed
 * This catches the "helper references non-existent SCRIPT key" failure mode
 * (Pitfall 1 in 32-RESEARCH.md).
 */
describe('OracleExperience Q5B helper contracts (Phase 32)', () => {
  it('SCRIPT.PARAISO_Q5B_SETUP exists (getScriptKey contract)', () => {
    expect(SCRIPT.PARAISO_Q5B_SETUP).toBeDefined();
    expect(Array.isArray(SCRIPT.PARAISO_Q5B_SETUP)).toBe(true);
    expect(SCRIPT.PARAISO_Q5B_SETUP.length).toBeGreaterThan(0);
  });

  it('SCRIPT.PARAISO_Q5B_PERGUNTA exists', () => {
    expect(SCRIPT.PARAISO_Q5B_PERGUNTA).toBeDefined();
  });

  it('SCRIPT.PARAISO_Q5B_RESPOSTA_A exists', () => {
    expect(SCRIPT.PARAISO_Q5B_RESPOSTA_A).toBeDefined();
  });

  it('SCRIPT.PARAISO_Q5B_RESPOSTA_B exists', () => {
    expect(SCRIPT.PARAISO_Q5B_RESPOSTA_B).toBeDefined();
  });

  it('SCRIPT.FALLBACK_Q5B exists (getFallbackScript contract)', () => {
    expect(SCRIPT.FALLBACK_Q5B).toBeDefined();
    expect(SCRIPT.FALLBACK_Q5B.length).toBeGreaterThan(0);
  });

  it('SCRIPT.TIMEOUT_Q5B exists (getScriptKey timeout contract)', () => {
    expect(SCRIPT.TIMEOUT_Q5B).toBeDefined();
  });

  it('QUESTION_META[10] is well-formed (buildChoiceConfig(10) contract)', () => {
    const meta = QUESTION_META[10];
    expect(meta).toBeDefined();
    expect(meta.optionA).toBe('Fundir');
    expect(meta.optionB).toBe('Ordenar');
    expect(Array.isArray(meta.keywordsA)).toBe(true);
    expect(meta.keywordsA.length).toBeGreaterThan(0);
    expect(Array.isArray(meta.keywordsB)).toBe(true);
    expect(meta.keywordsB.length).toBeGreaterThan(0);
  });
});
