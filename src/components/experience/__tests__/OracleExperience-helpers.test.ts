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

/**
 * OracleExperience Q6B Helper Smoke Tests — Phase 33 (BR-03)
 */
describe('OracleExperience Q6B helper contracts (Phase 33)', () => {
  it('SCRIPT.PARAISO_Q6B_SETUP exists (getScriptKey contract)', () => {
    expect(SCRIPT.PARAISO_Q6B_SETUP).toBeDefined();
    expect(Array.isArray(SCRIPT.PARAISO_Q6B_SETUP)).toBe(true);
    expect(SCRIPT.PARAISO_Q6B_SETUP.length).toBeGreaterThan(0);
  });

  it('SCRIPT.PARAISO_Q6B_PERGUNTA exists', () => {
    expect(SCRIPT.PARAISO_Q6B_PERGUNTA).toBeDefined();
  });

  it('SCRIPT.PARAISO_Q6B_RESPOSTA_A exists', () => {
    expect(SCRIPT.PARAISO_Q6B_RESPOSTA_A).toBeDefined();
  });

  it('SCRIPT.PARAISO_Q6B_RESPOSTA_B exists', () => {
    expect(SCRIPT.PARAISO_Q6B_RESPOSTA_B).toBeDefined();
  });

  it('SCRIPT.FALLBACK_Q6B exists (getFallbackScript contract)', () => {
    expect(SCRIPT.FALLBACK_Q6B).toBeDefined();
    expect(SCRIPT.FALLBACK_Q6B.length).toBeGreaterThan(0);
  });

  it('SCRIPT.TIMEOUT_Q6B exists (getScriptKey timeout contract)', () => {
    expect(SCRIPT.TIMEOUT_Q6B).toBeDefined();
  });

  it('QUESTION_META[11] is well-formed (buildChoiceConfig(11) contract)', () => {
    const meta = QUESTION_META[11];
    expect(meta).toBeDefined();
    expect(meta.optionA).toBe('Resposta');
    expect(meta.optionB).toBe('Pergunta');
    expect(Array.isArray(meta.keywordsA)).toBe(true);
    expect(meta.keywordsA.length).toBeGreaterThan(0);
    expect(Array.isArray(meta.keywordsB)).toBe(true);
    expect(meta.keywordsB.length).toBeGreaterThan(0);
    expect(meta.defaultOnTimeout).toBe('A');
  });
});

/**
 * OracleExperience ESPELHO_SILENCIOSO Helper Smoke Tests — Phase 33 (AR-01)
 */
describe('OracleExperience ESPELHO_SILENCIOSO helper contracts (Phase 33)', () => {
  it('SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO exists (getScriptKey top-level contract)', () => {
    expect(SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO).toBeDefined();
    expect(Array.isArray(SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO)).toBe(true);
    expect(SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO.length).toBeGreaterThan(0);
  });

  it('DEVOLUCAO_ESPELHO_SILENCIOSO has expected structure (6 segments)', () => {
    expect(SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO.length).toBe(6);
    // Verify each segment has text
    SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO.forEach((segment, i) => {
      expect(segment.text).toBeDefined();
      expect(typeof segment.text).toBe('string');
      expect(segment.text.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Phase 34 — AR-02 + AR-03: CONTRA_FOBICO + PORTADOR helper contracts
// ═══════════════════════════════════════════════════════════════
describe('OracleExperience Phase 34 helper contracts (CONTRA_FOBICO + PORTADOR)', () => {
  it('SCRIPT.DEVOLUCAO_CONTRA_FOBICO exists (getScriptKey contract for top-level state)', () => {
    expect(SCRIPT.DEVOLUCAO_CONTRA_FOBICO).toBeDefined();
    expect(Array.isArray(SCRIPT.DEVOLUCAO_CONTRA_FOBICO)).toBe(true);
    expect(SCRIPT.DEVOLUCAO_CONTRA_FOBICO.length).toBeGreaterThanOrEqual(5);
    expect(SCRIPT.DEVOLUCAO_CONTRA_FOBICO.length).toBeLessThanOrEqual(7);
  });

  it('SCRIPT.DEVOLUCAO_CONTRA_FOBICO segments have valid SpeechSegment shape', () => {
    for (const segment of SCRIPT.DEVOLUCAO_CONTRA_FOBICO) {
      expect(typeof segment.text).toBe('string');
      expect(segment.text.length).toBeGreaterThan(0);
      // pauseAfter and inflection are optional
      if (segment.pauseAfter !== undefined) {
        expect(typeof segment.pauseAfter).toBe('number');
      }
      if (segment.inflection !== undefined) {
        expect(Array.isArray(segment.inflection)).toBe(true);
      }
    }
  });

  it('SCRIPT.DEVOLUCAO_PORTADOR exists (getScriptKey contract for top-level state)', () => {
    expect(SCRIPT.DEVOLUCAO_PORTADOR).toBeDefined();
    expect(Array.isArray(SCRIPT.DEVOLUCAO_PORTADOR)).toBe(true);
    expect(SCRIPT.DEVOLUCAO_PORTADOR.length).toBeGreaterThanOrEqual(5);
    expect(SCRIPT.DEVOLUCAO_PORTADOR.length).toBeLessThanOrEqual(7);
  });

  it('SCRIPT.DEVOLUCAO_PORTADOR segments have valid SpeechSegment shape', () => {
    for (const segment of SCRIPT.DEVOLUCAO_PORTADOR) {
      expect(typeof segment.text).toBe('string');
      expect(segment.text.length).toBeGreaterThan(0);
      if (segment.pauseAfter !== undefined) {
        expect(typeof segment.pauseAfter).toBe('number');
      }
      if (segment.inflection !== undefined) {
        expect(Array.isArray(segment.inflection)).toBe(true);
      }
    }
  });

  it('OracleExperience.tsx source matches DEVOLUCAO_CONTRA_FOBICO state (string-form state.matches contract)', () => {
    const fs = require('fs');
    const source = fs.readFileSync('C:\\Users\\USER\\Oraculo\\src\\components\\experience\\OracleExperience.tsx', 'utf8');
    // Verify the new getScriptKey if-block exists
    expect(source).toMatch(/machineState\.matches\(['"]DEVOLUCAO_CONTRA_FOBICO['"]\)/);
    expect(source).toMatch(/return ['"]DEVOLUCAO_CONTRA_FOBICO['"]/);
  });

  it('OracleExperience.tsx source matches DEVOLUCAO_PORTADOR state (string-form state.matches contract)', () => {
    const fs = require('fs');
    const source = fs.readFileSync('C:\\Users\\USER\\Oraculo\\src\\components\\experience\\OracleExperience.tsx', 'utf8');
    expect(source).toMatch(/machineState\.matches\(['"]DEVOLUCAO_PORTADOR['"]\)/);
    expect(source).toMatch(/return ['"]DEVOLUCAO_PORTADOR['"]/);
  });
});
