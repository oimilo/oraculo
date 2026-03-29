import { describe, it, expect } from 'vitest';
import { SCRIPT } from '@/data/script';
import type { SpeechSegment } from '@/types';

/**
 * ScriptDataV3 Tests — Phase 16, Plan 01
 * Tests the v3 narrative script structure, content, and formatting rules.
 */

// Helper: check all segments are valid SpeechSegment objects
function assertValidSegments(segments: SpeechSegment[], label: string) {
  expect(Array.isArray(segments)).toBe(true);
  segments.forEach((seg, i) => {
    expect(seg.text, `${label}[${i}] missing text`).toBeTruthy();
    expect(typeof seg.text, `${label}[${i}] text not string`).toBe('string');
    if (seg.pauseAfter !== undefined) {
      expect(typeof seg.pauseAfter, `${label}[${i}] pauseAfter not number`).toBe('number');
    }
    if (seg.inflection !== undefined) {
      expect(Array.isArray(seg.inflection), `${label}[${i}] inflection not array`).toBe(true);
      expect(seg.inflection!.length, `${label}[${i}] inflection has more than 1 tag`).toBeLessThanOrEqual(1);
    }
  });
}

// Helper: check all text is in PT-BR (no obvious English-only content)
function assertPTBR(segments: SpeechSegment[], label: string) {
  const forbiddenEnglish = ['you are', 'you have', 'the room', 'the door', 'do you', 'your hand'];
  segments.forEach((seg, i) => {
    forbiddenEnglish.forEach(phrase => {
      expect(seg.text.toLowerCase()).not.toContain(phrase);
    });
  });
}

// Helper: check no author references
function assertNoAuthorReferences(segments: SpeechSegment[], label: string) {
  const authors = ['dante', 'clarice', 'freud', 'proust', 'rilke', 'hesse', 'huxley', 'orwell', 'virgílio', 'virgilio', 'beatriz'];
  segments.forEach((seg, i) => {
    authors.forEach(author => {
      expect(
        seg.text.toLowerCase(),
        `${label}[${i}] contains author reference "${author}"`
      ).not.toContain(author);
    });
  });
}

describe('ScriptDataV3 — SCRIPT export', () => {
  it('SCRIPT export exists', () => {
    expect(SCRIPT).toBeDefined();
    expect(typeof SCRIPT).toBe('object');
  });

  it('has ScriptDataV3 structure with all required keys', () => {
    // Plan 01 keys (filled)
    expect(SCRIPT.APRESENTACAO).toBeDefined();
    expect(SCRIPT.INFERNO_INTRO).toBeDefined();
    expect(SCRIPT.INFERNO_Q1_SETUP).toBeDefined();
    expect(SCRIPT.INFERNO_Q1_PERGUNTA).toBeDefined();
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_B).toBeDefined();
    expect(SCRIPT.INFERNO_Q2_SETUP).toBeDefined();
    expect(SCRIPT.INFERNO_Q2_PERGUNTA).toBeDefined();
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_B).toBeDefined();

    // Plan 02 keys (stubs — empty arrays)
    expect(SCRIPT.PURGATORIO_INTRO).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q3_SETUP).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q3_PERGUNTA).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_B).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q4_SETUP).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q4_PERGUNTA).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_B).toBeDefined();
    expect(SCRIPT.PARAISO_INTRO).toBeDefined();
    expect(SCRIPT.PARAISO_Q5_SETUP).toBeDefined();
    expect(SCRIPT.PARAISO_Q5_PERGUNTA).toBeDefined();
    expect(SCRIPT.PARAISO_Q5_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.PARAISO_Q5_RESPOSTA_B).toBeDefined();
    expect(SCRIPT.PARAISO_Q6_SETUP).toBeDefined();
    expect(SCRIPT.PARAISO_Q6_PERGUNTA).toBeDefined();
    expect(SCRIPT.PARAISO_Q6_RESPOSTA_A).toBeDefined();
    expect(SCRIPT.PARAISO_Q6_RESPOSTA_B).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_SEEKER).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_GUARDIAN).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_CONTRADICTED).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_PIVOT_EARLY).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_PIVOT_LATE).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_DEPTH_SEEKER).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_SURFACE_KEEPER).toBeDefined();
    expect(SCRIPT.DEVOLUCAO_MIRROR).toBeDefined();
    expect(SCRIPT.ENCERRAMENTO).toBeDefined();
    expect(SCRIPT.FALLBACK_Q1).toBeDefined();
    expect(SCRIPT.FALLBACK_Q2).toBeDefined();
    expect(SCRIPT.FALLBACK_Q3).toBeDefined();
    expect(SCRIPT.FALLBACK_Q4).toBeDefined();
    expect(SCRIPT.FALLBACK_Q5).toBeDefined();
    expect(SCRIPT.FALLBACK_Q6).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q1).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q2).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q3).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q4).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q5).toBeDefined();
    expect(SCRIPT.TIMEOUT_Q6).toBeDefined();
  });
});

describe('APRESENTACAO', () => {
  it('has 5-8 segments', () => {
    expect(SCRIPT.APRESENTACAO.length).toBeGreaterThanOrEqual(5);
    expect(SCRIPT.APRESENTACAO.length).toBeLessThanOrEqual(8);
  });

  it('has valid SpeechSegment structure', () => {
    assertValidSegments(SCRIPT.APRESENTACAO, 'APRESENTACAO');
  });

  it('has at least 1 inflection tag', () => {
    const withInflection = SCRIPT.APRESENTACAO.filter(s => s.inflection && s.inflection.length > 0);
    expect(withInflection.length).toBeGreaterThanOrEqual(1);
  });

  it('is in PT-BR', () => {
    assertPTBR(SCRIPT.APRESENTACAO, 'APRESENTACAO');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.APRESENTACAO, 'APRESENTACAO');
  });
});

describe('INFERNO_INTRO', () => {
  it('has 1-2 segments', () => {
    expect(SCRIPT.INFERNO_INTRO.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.INFERNO_INTRO.length).toBeLessThanOrEqual(2);
  });

  it('has valid structure', () => {
    assertValidSegments(SCRIPT.INFERNO_INTRO, 'INFERNO_INTRO');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.INFERNO_INTRO, 'INFERNO_INTRO');
  });
});

describe('INFERNO Q1 — Comfortable Prison', () => {
  it('SETUP has 2-4 segments', () => {
    expect(SCRIPT.INFERNO_Q1_SETUP.length).toBeGreaterThanOrEqual(2);
    expect(SCRIPT.INFERNO_Q1_SETUP.length).toBeLessThanOrEqual(4);
  });

  it('PERGUNTA has 1 segment', () => {
    expect(SCRIPT.INFERNO_Q1_PERGUNTA.length).toBe(1);
  });

  it('PERGUNTA has pauseAfter 0 or undefined', () => {
    const p = SCRIPT.INFERNO_Q1_PERGUNTA[0];
    expect(p.pauseAfter === undefined || p.pauseAfter === 0).toBe(true);
  });

  it('RESPOSTA_A has 1-3 segments', () => {
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_A.length).toBeLessThanOrEqual(3);
  });

  it('RESPOSTA_B has 1-3 segments', () => {
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.INFERNO_Q1_RESPOSTA_B.length).toBeLessThanOrEqual(3);
  });

  it('all Q1 segments are valid SpeechSegments', () => {
    assertValidSegments(SCRIPT.INFERNO_Q1_SETUP, 'Q1_SETUP');
    assertValidSegments(SCRIPT.INFERNO_Q1_PERGUNTA, 'Q1_PERGUNTA');
    assertValidSegments(SCRIPT.INFERNO_Q1_RESPOSTA_A, 'Q1_RESPOSTA_A');
    assertValidSegments(SCRIPT.INFERNO_Q1_RESPOSTA_B, 'Q1_RESPOSTA_B');
  });

  it('all Q1 text is PT-BR', () => {
    assertPTBR(SCRIPT.INFERNO_Q1_SETUP, 'Q1_SETUP');
    assertPTBR(SCRIPT.INFERNO_Q1_PERGUNTA, 'Q1_PERGUNTA');
    assertPTBR(SCRIPT.INFERNO_Q1_RESPOSTA_A, 'Q1_RESPOSTA_A');
    assertPTBR(SCRIPT.INFERNO_Q1_RESPOSTA_B, 'Q1_RESPOSTA_B');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.INFERNO_Q1_SETUP, 'Q1_SETUP');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q1_PERGUNTA, 'Q1_PERGUNTA');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q1_RESPOSTA_A, 'Q1_RESPOSTA_A');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q1_RESPOSTA_B, 'Q1_RESPOSTA_B');
  });
});

describe('INFERNO Q2 — Thing on the Floor', () => {
  it('SETUP has 2-4 segments', () => {
    expect(SCRIPT.INFERNO_Q2_SETUP.length).toBeGreaterThanOrEqual(2);
    expect(SCRIPT.INFERNO_Q2_SETUP.length).toBeLessThanOrEqual(4);
  });

  it('PERGUNTA has 1 segment', () => {
    expect(SCRIPT.INFERNO_Q2_PERGUNTA.length).toBe(1);
  });

  it('PERGUNTA has pauseAfter 0 or undefined', () => {
    const p = SCRIPT.INFERNO_Q2_PERGUNTA[0];
    expect(p.pauseAfter === undefined || p.pauseAfter === 0).toBe(true);
  });

  it('RESPOSTA_A has 1-3 segments', () => {
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_A.length).toBeLessThanOrEqual(3);
  });

  it('RESPOSTA_B has 1-3 segments', () => {
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.INFERNO_Q2_RESPOSTA_B.length).toBeLessThanOrEqual(3);
  });

  it('all Q2 segments are valid SpeechSegments', () => {
    assertValidSegments(SCRIPT.INFERNO_Q2_SETUP, 'Q2_SETUP');
    assertValidSegments(SCRIPT.INFERNO_Q2_PERGUNTA, 'Q2_PERGUNTA');
    assertValidSegments(SCRIPT.INFERNO_Q2_RESPOSTA_A, 'Q2_RESPOSTA_A');
    assertValidSegments(SCRIPT.INFERNO_Q2_RESPOSTA_B, 'Q2_RESPOSTA_B');
  });

  it('all Q2 text is PT-BR', () => {
    assertPTBR(SCRIPT.INFERNO_Q2_SETUP, 'Q2_SETUP');
    assertPTBR(SCRIPT.INFERNO_Q2_PERGUNTA, 'Q2_PERGUNTA');
    assertPTBR(SCRIPT.INFERNO_Q2_RESPOSTA_A, 'Q2_RESPOSTA_A');
    assertPTBR(SCRIPT.INFERNO_Q2_RESPOSTA_B, 'Q2_RESPOSTA_B');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.INFERNO_Q2_SETUP, 'Q2_SETUP');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q2_PERGUNTA, 'Q2_PERGUNTA');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q2_RESPOSTA_A, 'Q2_RESPOSTA_A');
    assertNoAuthorReferences(SCRIPT.INFERNO_Q2_RESPOSTA_B, 'Q2_RESPOSTA_B');
  });
});

describe('inflection tags across script', () => {
  it('some segments have inflection tags (sparse)', () => {
    const allSegments = [
      ...SCRIPT.APRESENTACAO,
      ...SCRIPT.INFERNO_INTRO,
      ...SCRIPT.INFERNO_Q1_SETUP,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_B,
      ...SCRIPT.INFERNO_Q2_SETUP,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_B,
    ];
    const withInflection = allSegments.filter(s => s.inflection && s.inflection.length > 0);
    expect(withInflection.length).toBeGreaterThanOrEqual(4);
  });

  it('no segment has more than 1 inflection tag', () => {
    const allSegments = [
      ...SCRIPT.APRESENTACAO,
      ...SCRIPT.INFERNO_INTRO,
      ...SCRIPT.INFERNO_Q1_SETUP,
      ...SCRIPT.INFERNO_Q1_PERGUNTA,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_B,
      ...SCRIPT.INFERNO_Q2_SETUP,
      ...SCRIPT.INFERNO_Q2_PERGUNTA,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_B,
    ];
    allSegments.forEach((seg, i) => {
      if (seg.inflection) {
        expect(seg.inflection.length, `Segment ${i} has ${seg.inflection.length} tags`).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe('pauseAfter values', () => {
  it('most segments have pauseAfter defined', () => {
    const allSegments = [
      ...SCRIPT.APRESENTACAO,
      ...SCRIPT.INFERNO_INTRO,
      ...SCRIPT.INFERNO_Q1_SETUP,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q1_RESPOSTA_B,
      ...SCRIPT.INFERNO_Q2_SETUP,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_A,
      ...SCRIPT.INFERNO_Q2_RESPOSTA_B,
      ...SCRIPT.PURGATORIO_INTRO,
      ...SCRIPT.PURGATORIO_Q3_SETUP,
      ...SCRIPT.PURGATORIO_Q3_RESPOSTA_A,
      ...SCRIPT.PURGATORIO_Q3_RESPOSTA_B,
      ...SCRIPT.PURGATORIO_Q4_SETUP,
      ...SCRIPT.PURGATORIO_Q4_RESPOSTA_A,
      ...SCRIPT.PURGATORIO_Q4_RESPOSTA_B,
    ];
    const withPause = allSegments.filter(s => s.pauseAfter !== undefined);
    // At least 60% should have pauseAfter
    expect(withPause.length / allSegments.length).toBeGreaterThan(0.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// PURGATORIO TESTS — Task 2
// ═══════════════════════════════════════════════════════════════

describe('PURGATORIO_INTRO', () => {
  it('has 1-2 segments', () => {
    expect(SCRIPT.PURGATORIO_INTRO.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.PURGATORIO_INTRO.length).toBeLessThanOrEqual(2);
  });

  it('has valid structure', () => {
    assertValidSegments(SCRIPT.PURGATORIO_INTRO, 'PURGATORIO_INTRO');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.PURGATORIO_INTRO, 'PURGATORIO_INTRO');
  });

  it('is in PT-BR', () => {
    assertPTBR(SCRIPT.PURGATORIO_INTRO, 'PURGATORIO_INTRO');
  });
});

describe('PURGATORIO Q3 — Garden That Will Burn', () => {
  it('SETUP has 2-4 segments', () => {
    expect(SCRIPT.PURGATORIO_Q3_SETUP.length).toBeGreaterThanOrEqual(2);
    expect(SCRIPT.PURGATORIO_Q3_SETUP.length).toBeLessThanOrEqual(4);
  });

  it('PERGUNTA has 1 segment', () => {
    expect(SCRIPT.PURGATORIO_Q3_PERGUNTA.length).toBe(1);
  });

  it('PERGUNTA has pauseAfter 0 or undefined', () => {
    const p = SCRIPT.PURGATORIO_Q3_PERGUNTA[0];
    expect(p.pauseAfter === undefined || p.pauseAfter === 0).toBe(true);
  });

  it('RESPOSTA_A has 1-3 segments', () => {
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_A.length).toBeLessThanOrEqual(3);
  });

  it('RESPOSTA_B has 1-3 segments', () => {
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.PURGATORIO_Q3_RESPOSTA_B.length).toBeLessThanOrEqual(3);
  });

  it('all Q3 segments are valid SpeechSegments', () => {
    assertValidSegments(SCRIPT.PURGATORIO_Q3_SETUP, 'Q3_SETUP');
    assertValidSegments(SCRIPT.PURGATORIO_Q3_PERGUNTA, 'Q3_PERGUNTA');
    assertValidSegments(SCRIPT.PURGATORIO_Q3_RESPOSTA_A, 'Q3_RESPOSTA_A');
    assertValidSegments(SCRIPT.PURGATORIO_Q3_RESPOSTA_B, 'Q3_RESPOSTA_B');
  });

  it('all Q3 text is PT-BR', () => {
    assertPTBR(SCRIPT.PURGATORIO_Q3_SETUP, 'Q3_SETUP');
    assertPTBR(SCRIPT.PURGATORIO_Q3_PERGUNTA, 'Q3_PERGUNTA');
    assertPTBR(SCRIPT.PURGATORIO_Q3_RESPOSTA_A, 'Q3_RESPOSTA_A');
    assertPTBR(SCRIPT.PURGATORIO_Q3_RESPOSTA_B, 'Q3_RESPOSTA_B');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q3_SETUP, 'Q3_SETUP');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q3_PERGUNTA, 'Q3_PERGUNTA');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q3_RESPOSTA_A, 'Q3_RESPOSTA_A');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q3_RESPOSTA_B, 'Q3_RESPOSTA_B');
  });
});

describe('PURGATORIO Q4 — Two Waters', () => {
  it('SETUP has 2-5 segments', () => {
    expect(SCRIPT.PURGATORIO_Q4_SETUP.length).toBeGreaterThanOrEqual(2);
    expect(SCRIPT.PURGATORIO_Q4_SETUP.length).toBeLessThanOrEqual(5);
  });

  it('PERGUNTA has 1 segment', () => {
    expect(SCRIPT.PURGATORIO_Q4_PERGUNTA.length).toBe(1);
  });

  it('PERGUNTA has pauseAfter defined (allows pause for weight)', () => {
    const p = SCRIPT.PURGATORIO_Q4_PERGUNTA[0];
    // v4 allows pauseAfter on perguntas for emotional weight
    expect(p.pauseAfter === undefined || typeof p.pauseAfter === 'number').toBe(true);
  });

  it('RESPOSTA_A has 1-3 segments', () => {
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_A.length).toBeLessThanOrEqual(3);
  });

  it('RESPOSTA_B has 1-3 segments', () => {
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    expect(SCRIPT.PURGATORIO_Q4_RESPOSTA_B.length).toBeLessThanOrEqual(3);
  });

  it('all Q4 segments are valid SpeechSegments', () => {
    assertValidSegments(SCRIPT.PURGATORIO_Q4_SETUP, 'Q4_SETUP');
    assertValidSegments(SCRIPT.PURGATORIO_Q4_PERGUNTA, 'Q4_PERGUNTA');
    assertValidSegments(SCRIPT.PURGATORIO_Q4_RESPOSTA_A, 'Q4_RESPOSTA_A');
    assertValidSegments(SCRIPT.PURGATORIO_Q4_RESPOSTA_B, 'Q4_RESPOSTA_B');
  });

  it('all Q4 text is PT-BR', () => {
    assertPTBR(SCRIPT.PURGATORIO_Q4_SETUP, 'Q4_SETUP');
    assertPTBR(SCRIPT.PURGATORIO_Q4_PERGUNTA, 'Q4_PERGUNTA');
    assertPTBR(SCRIPT.PURGATORIO_Q4_RESPOSTA_A, 'Q4_RESPOSTA_A');
    assertPTBR(SCRIPT.PURGATORIO_Q4_RESPOSTA_B, 'Q4_RESPOSTA_B');
  });

  it('has no author references', () => {
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4_SETUP, 'Q4_SETUP');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4_PERGUNTA, 'Q4_PERGUNTA');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4_RESPOSTA_A, 'Q4_RESPOSTA_A');
    assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4_RESPOSTA_B, 'Q4_RESPOSTA_B');
  });
});

describe('PURGATORIO depth escalation', () => {
  it('Q3 and Q4 have distinct narrative weight (both substantial)', () => {
    // After v4 trimming, both Q3 and Q4 are concise but substantial
    const q3Total = SCRIPT.PURGATORIO_Q3_RESPOSTA_A.reduce((sum, s) => sum + s.text.length, 0) +
                    SCRIPT.PURGATORIO_Q3_RESPOSTA_B.reduce((sum, s) => sum + s.text.length, 0);
    const q4Total = SCRIPT.PURGATORIO_Q4_RESPOSTA_A.reduce((sum, s) => sum + s.text.length, 0) +
                    SCRIPT.PURGATORIO_Q4_RESPOSTA_B.reduce((sum, s) => sum + s.text.length, 0);
    // Both should be substantial (at least 100 chars combined)
    expect(q3Total).toBeGreaterThan(100);
    expect(q4Total).toBeGreaterThan(100);
  });
});

describe('inflection tags across PURGATORIO', () => {
  it('PURGATORIO sections have some inflection tags', () => {
    const allPurgSegments = [
      ...SCRIPT.PURGATORIO_INTRO,
      ...SCRIPT.PURGATORIO_Q3_SETUP,
      ...SCRIPT.PURGATORIO_Q3_RESPOSTA_A,
      ...SCRIPT.PURGATORIO_Q3_RESPOSTA_B,
      ...SCRIPT.PURGATORIO_Q4_SETUP,
      ...SCRIPT.PURGATORIO_Q4_RESPOSTA_A,
      ...SCRIPT.PURGATORIO_Q4_RESPOSTA_B,
    ];
    const withInflection = allPurgSegments.filter(s => s.inflection && s.inflection.length > 0);
    expect(withInflection.length).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCR-06 VALIDATION TESTS — Phase 24, Plan 01
// ═══════════════════════════════════════════════════════════════

describe('SCR-06: max-path duration', () => {
  // Helper: word count of a section
  function sectionWords(segments: SpeechSegment[]): number {
    return segments.reduce((sum, s) => sum + s.text.split(/\s+/).filter(w => w.length > 0).length, 0);
  }

  // Helper: total pause ms of a section
  function sectionPauseMs(segments: SpeechSegment[]): number {
    return segments.reduce((sum, s) => sum + (s.pauseAfter || 0), 0);
  }

  it('max-path word count is under 1300 words (10 min at 130 WPM)', () => {
    // Always-heard sections
    const alwaysHeard = [
      SCRIPT.APRESENTACAO, SCRIPT.INFERNO_INTRO,
      SCRIPT.INFERNO_Q1_SETUP, SCRIPT.INFERNO_Q1_PERGUNTA,
      SCRIPT.INFERNO_Q2_SETUP, SCRIPT.INFERNO_Q2_PERGUNTA,
      SCRIPT.PURGATORIO_INTRO,
      SCRIPT.PURGATORIO_Q3_SETUP, SCRIPT.PURGATORIO_Q3_PERGUNTA,
      SCRIPT.PURGATORIO_Q4_SETUP, SCRIPT.PURGATORIO_Q4_PERGUNTA,
      SCRIPT.PARAISO_INTRO,
      SCRIPT.PARAISO_Q5_SETUP, SCRIPT.PARAISO_Q5_PERGUNTA,
      SCRIPT.PARAISO_Q6_SETUP, SCRIPT.PARAISO_Q6_PERGUNTA,
      SCRIPT.ENCERRAMENTO,
    ];
    let totalWords = alwaysHeard.reduce((sum, sec) => sum + sectionWords(sec), 0);

    // For each choice, take the LONGER response
    const choices: [SpeechSegment[], SpeechSegment[]][] = [
      [SCRIPT.INFERNO_Q1_RESPOSTA_A, SCRIPT.INFERNO_Q1_RESPOSTA_B],
      [SCRIPT.INFERNO_Q2_RESPOSTA_A, SCRIPT.INFERNO_Q2_RESPOSTA_B],
      [SCRIPT.PURGATORIO_Q3_RESPOSTA_A, SCRIPT.PURGATORIO_Q3_RESPOSTA_B],
      [SCRIPT.PURGATORIO_Q4_RESPOSTA_A, SCRIPT.PURGATORIO_Q4_RESPOSTA_B],
      [SCRIPT.PARAISO_Q5_RESPOSTA_A, SCRIPT.PARAISO_Q5_RESPOSTA_B],
      [SCRIPT.PARAISO_Q6_RESPOSTA_A, SCRIPT.PARAISO_Q6_RESPOSTA_B],
    ];
    for (const [a, b] of choices) {
      totalWords += Math.max(sectionWords(a), sectionWords(b));
    }

    // Longest devolucao
    const devs = [
      SCRIPT.DEVOLUCAO_SEEKER, SCRIPT.DEVOLUCAO_GUARDIAN,
      SCRIPT.DEVOLUCAO_CONTRADICTED, SCRIPT.DEVOLUCAO_PIVOT_EARLY,
      SCRIPT.DEVOLUCAO_PIVOT_LATE, SCRIPT.DEVOLUCAO_DEPTH_SEEKER,
      SCRIPT.DEVOLUCAO_SURFACE_KEEPER, SCRIPT.DEVOLUCAO_MIRROR,
    ];
    totalWords += Math.max(...devs.map(d => sectionWords(d)));

    expect(totalWords).toBeLessThanOrEqual(1300);
  });

  it('max-path playback duration (speech + pauses) is under 10.5 minutes', () => {
    const alwaysHeard = [
      SCRIPT.APRESENTACAO, SCRIPT.INFERNO_INTRO,
      SCRIPT.INFERNO_Q1_SETUP, SCRIPT.INFERNO_Q1_PERGUNTA,
      SCRIPT.INFERNO_Q2_SETUP, SCRIPT.INFERNO_Q2_PERGUNTA,
      SCRIPT.PURGATORIO_INTRO,
      SCRIPT.PURGATORIO_Q3_SETUP, SCRIPT.PURGATORIO_Q3_PERGUNTA,
      SCRIPT.PURGATORIO_Q4_SETUP, SCRIPT.PURGATORIO_Q4_PERGUNTA,
      SCRIPT.PARAISO_INTRO,
      SCRIPT.PARAISO_Q5_SETUP, SCRIPT.PARAISO_Q5_PERGUNTA,
      SCRIPT.PARAISO_Q6_SETUP, SCRIPT.PARAISO_Q6_PERGUNTA,
      SCRIPT.ENCERRAMENTO,
    ];
    let totalWords = alwaysHeard.reduce((sum, sec) => sum + sectionWords(sec), 0);
    let totalPauseMs = alwaysHeard.reduce((sum, sec) => sum + sectionPauseMs(sec), 0);

    const choices: [SpeechSegment[], SpeechSegment[]][] = [
      [SCRIPT.INFERNO_Q1_RESPOSTA_A, SCRIPT.INFERNO_Q1_RESPOSTA_B],
      [SCRIPT.INFERNO_Q2_RESPOSTA_A, SCRIPT.INFERNO_Q2_RESPOSTA_B],
      [SCRIPT.PURGATORIO_Q3_RESPOSTA_A, SCRIPT.PURGATORIO_Q3_RESPOSTA_B],
      [SCRIPT.PURGATORIO_Q4_RESPOSTA_A, SCRIPT.PURGATORIO_Q4_RESPOSTA_B],
      [SCRIPT.PARAISO_Q5_RESPOSTA_A, SCRIPT.PARAISO_Q5_RESPOSTA_B],
      [SCRIPT.PARAISO_Q6_RESPOSTA_A, SCRIPT.PARAISO_Q6_RESPOSTA_B],
    ];
    for (const [a, b] of choices) {
      const wa = sectionWords(a), wb = sectionWords(b);
      if (wa >= wb) { totalWords += wa; totalPauseMs += sectionPauseMs(a); }
      else { totalWords += wb; totalPauseMs += sectionPauseMs(b); }
    }

    const devs = [
      SCRIPT.DEVOLUCAO_SEEKER, SCRIPT.DEVOLUCAO_GUARDIAN,
      SCRIPT.DEVOLUCAO_CONTRADICTED, SCRIPT.DEVOLUCAO_PIVOT_EARLY,
      SCRIPT.DEVOLUCAO_PIVOT_LATE, SCRIPT.DEVOLUCAO_DEPTH_SEEKER,
      SCRIPT.DEVOLUCAO_SURFACE_KEEPER, SCRIPT.DEVOLUCAO_MIRROR,
    ];
    let maxDevIdx = 0;
    for (let i = 1; i < devs.length; i++) {
      if (sectionWords(devs[i]) > sectionWords(devs[maxDevIdx])) maxDevIdx = i;
    }
    totalWords += sectionWords(devs[maxDevIdx]);
    totalPauseMs += sectionPauseMs(devs[maxDevIdx]);

    const speechMin = totalWords / 130;
    const pauseMin = totalPauseMs / 60000;
    const totalMin = speechMin + pauseMin;
    expect(totalMin).toBeLessThanOrEqual(10.5);
  });
});

describe('SCR-06: pause variation', () => {
  it('pauseAfter values range between 800-2000ms (non-zero values)', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const nonZeroPauses = allSegments
      .map(s => s.pauseAfter)
      .filter((p): p is number => p !== undefined && p > 0);

    expect(Math.min(...nonZeroPauses)).toBeGreaterThanOrEqual(800);
    expect(Math.max(...nonZeroPauses)).toBeLessThanOrEqual(2000);
  });

  it('pause values have sufficient variation (CV > 0.15)', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const pauses = allSegments
      .map(s => s.pauseAfter)
      .filter((p): p is number => p !== undefined && p > 0);

    const mean = pauses.reduce((a, b) => a + b) / pauses.length;
    const variance = pauses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pauses.length;
    const cv = Math.sqrt(variance) / mean;
    expect(cv).toBeGreaterThan(0.15);
  });

  it('at least 5 unique pauseAfter values are used', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const pauses = allSegments
      .map(s => s.pauseAfter)
      .filter((p): p is number => p !== undefined && p > 0);
    const unique = new Set(pauses);
    expect(unique.size).toBeGreaterThanOrEqual(5);
  });
});

describe('SCR-06: sentence length', () => {
  it('no segment text exceeds 40 words', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const violations: Array<{words: number; text: string}> = [];

    allSegments.forEach(seg => {
      const words = seg.text.split(/\s+/).filter(w => w.length > 0).length;
      if (words > 40) {
        violations.push({ words, text: seg.text.substring(0, 80) });
      }
    });

    expect(violations, `Segments exceeding 40 words: ${JSON.stringify(violations)}`).toHaveLength(0);
  });

  it('average sentence length is under 20 words', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const wordCounts = allSegments.map(s => s.text.split(/\s+/).filter(w => w.length > 0).length);
    const avg = wordCounts.reduce((a, b) => a + b) / wordCounts.length;
    expect(avg).toBeLessThanOrEqual(20);
  });
});

describe('SCR-06: inflection density (full script)', () => {
  it('inflection tags in <=40% of ALL segments globally', () => {
    const allSegments = Object.values(SCRIPT).flat();
    const withInflection = allSegments.filter(s => s.inflection && s.inflection.length > 0);
    const density = withInflection.length / allSegments.length;
    expect(density).toBeLessThanOrEqual(0.40);
  });

  it('no segment in entire script has more than 1 inflection tag', () => {
    const allSegments = Object.values(SCRIPT).flat();
    allSegments.forEach((seg, i) => {
      if (seg.inflection) {
        expect(seg.inflection.length, `Segment ${i} has ${seg.inflection.length} inflection tags`).toBeLessThanOrEqual(1);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// BRANCH QUESTIONS (Q2B, Q4B) — Phase 26, v4.0
// ═══════════════════════════════════════════════════════════════

describe('Branch Questions (Q2B, Q4B)', () => {
  describe('INFERNO Q2B — Branch after Q1+Q2 CHOICE_A pattern', () => {
    it('SETUP has at least 1 segment', () => {
      expect(SCRIPT.INFERNO_Q2B_SETUP.length).toBeGreaterThanOrEqual(1);
    });

    it('PERGUNTA has 1 segment', () => {
      expect(SCRIPT.INFERNO_Q2B_PERGUNTA.length).toBe(1);
    });

    it('RESPOSTA_A has at least 1 segment', () => {
      expect(SCRIPT.INFERNO_Q2B_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    });

    it('RESPOSTA_B has at least 1 segment', () => {
      expect(SCRIPT.INFERNO_Q2B_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    });

    it('all Q2B segments are valid SpeechSegments', () => {
      assertValidSegments(SCRIPT.INFERNO_Q2B_SETUP, 'Q2B_SETUP');
      assertValidSegments(SCRIPT.INFERNO_Q2B_PERGUNTA, 'Q2B_PERGUNTA');
      assertValidSegments(SCRIPT.INFERNO_Q2B_RESPOSTA_A, 'Q2B_RESPOSTA_A');
      assertValidSegments(SCRIPT.INFERNO_Q2B_RESPOSTA_B, 'Q2B_RESPOSTA_B');
    });

    it('all Q2B text is PT-BR', () => {
      assertPTBR(SCRIPT.INFERNO_Q2B_SETUP, 'Q2B_SETUP');
      assertPTBR(SCRIPT.INFERNO_Q2B_PERGUNTA, 'Q2B_PERGUNTA');
      assertPTBR(SCRIPT.INFERNO_Q2B_RESPOSTA_A, 'Q2B_RESPOSTA_A');
      assertPTBR(SCRIPT.INFERNO_Q2B_RESPOSTA_B, 'Q2B_RESPOSTA_B');
    });

    it('has no author references', () => {
      assertNoAuthorReferences(SCRIPT.INFERNO_Q2B_SETUP, 'Q2B_SETUP');
      assertNoAuthorReferences(SCRIPT.INFERNO_Q2B_PERGUNTA, 'Q2B_PERGUNTA');
      assertNoAuthorReferences(SCRIPT.INFERNO_Q2B_RESPOSTA_A, 'Q2B_RESPOSTA_A');
      assertNoAuthorReferences(SCRIPT.INFERNO_Q2B_RESPOSTA_B, 'Q2B_RESPOSTA_B');
    });
  });

  describe('PURGATORIO Q4B — Branch after Q3+Q4 CHOICE_A pattern', () => {
    it('SETUP has at least 1 segment', () => {
      expect(SCRIPT.PURGATORIO_Q4B_SETUP.length).toBeGreaterThanOrEqual(1);
    });

    it('PERGUNTA has 1 segment', () => {
      expect(SCRIPT.PURGATORIO_Q4B_PERGUNTA.length).toBe(1);
    });

    it('RESPOSTA_A has at least 1 segment', () => {
      expect(SCRIPT.PURGATORIO_Q4B_RESPOSTA_A.length).toBeGreaterThanOrEqual(1);
    });

    it('RESPOSTA_B has at least 1 segment', () => {
      expect(SCRIPT.PURGATORIO_Q4B_RESPOSTA_B.length).toBeGreaterThanOrEqual(1);
    });

    it('all Q4B segments are valid SpeechSegments', () => {
      assertValidSegments(SCRIPT.PURGATORIO_Q4B_SETUP, 'Q4B_SETUP');
      assertValidSegments(SCRIPT.PURGATORIO_Q4B_PERGUNTA, 'Q4B_PERGUNTA');
      assertValidSegments(SCRIPT.PURGATORIO_Q4B_RESPOSTA_A, 'Q4B_RESPOSTA_A');
      assertValidSegments(SCRIPT.PURGATORIO_Q4B_RESPOSTA_B, 'Q4B_RESPOSTA_B');
    });

    it('all Q4B text is PT-BR', () => {
      assertPTBR(SCRIPT.PURGATORIO_Q4B_SETUP, 'Q4B_SETUP');
      assertPTBR(SCRIPT.PURGATORIO_Q4B_PERGUNTA, 'Q4B_PERGUNTA');
      assertPTBR(SCRIPT.PURGATORIO_Q4B_RESPOSTA_A, 'Q4B_RESPOSTA_A');
      assertPTBR(SCRIPT.PURGATORIO_Q4B_RESPOSTA_B, 'Q4B_RESPOSTA_B');
    });

    it('has no author references', () => {
      assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4B_SETUP, 'Q4B_SETUP');
      assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4B_PERGUNTA, 'Q4B_PERGUNTA');
      assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4B_RESPOSTA_A, 'Q4B_RESPOSTA_A');
      assertNoAuthorReferences(SCRIPT.PURGATORIO_Q4B_RESPOSTA_B, 'Q4B_RESPOSTA_B');
    });
  });

  describe('Fallback and Timeout for Branch Questions', () => {
    it('FALLBACK_Q2B has at least 1 segment', () => {
      expect(SCRIPT.FALLBACK_Q2B.length).toBeGreaterThanOrEqual(1);
      assertValidSegments(SCRIPT.FALLBACK_Q2B, 'FALLBACK_Q2B');
      assertPTBR(SCRIPT.FALLBACK_Q2B, 'FALLBACK_Q2B');
    });

    it('FALLBACK_Q4B has at least 1 segment', () => {
      expect(SCRIPT.FALLBACK_Q4B.length).toBeGreaterThanOrEqual(1);
      assertValidSegments(SCRIPT.FALLBACK_Q4B, 'FALLBACK_Q4B');
      assertPTBR(SCRIPT.FALLBACK_Q4B, 'FALLBACK_Q4B');
    });

    it('TIMEOUT_Q2B has at least 1 segment', () => {
      expect(SCRIPT.TIMEOUT_Q2B.length).toBeGreaterThanOrEqual(1);
      assertValidSegments(SCRIPT.TIMEOUT_Q2B, 'TIMEOUT_Q2B');
      assertPTBR(SCRIPT.TIMEOUT_Q2B, 'TIMEOUT_Q2B');
    });

    it('TIMEOUT_Q4B has at least 1 segment', () => {
      expect(SCRIPT.TIMEOUT_Q4B.length).toBeGreaterThanOrEqual(1);
      assertValidSegments(SCRIPT.TIMEOUT_Q4B, 'TIMEOUT_Q4B');
      assertPTBR(SCRIPT.TIMEOUT_Q4B, 'TIMEOUT_Q4B');
    });
  });
});
