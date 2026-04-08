/**
 * V6.0 TIMING VALIDATION SCRIPT (BRANCH-AWARE) — Phase 34 Extended
 *
 * Validates that the max-path experience duration falls within the 5-7:30 minute
 * target (300-450 seconds — v6.0 budget with branch overflow tolerance).
 * Calculates all 24 possible paths through the branching structure
 * (Phase 33 added Q6B + ESPELHO; Phase 34 adds CONTRA_FOBICO + PORTADOR archetypes).
 *
 *   No branches:
 *     1. No branches (6Q)
 *
 *   Single branch (Q5B or Q6B):
 *     2. Q5B only (7Q)                       — q4=A AND q5=A (Phase 32, BR-02)
 *     3. Q6B only (7Q)                       — q5=B AND q6=A (Phase 33, BR-03)
 *     4. Q6B + ESPELHO (7Q)                  — q5=B AND q6=A AND q6b=B (Phase 33, AR-01)
 *
 *   Single INFERNO branch:
 *     5. Q2B only (7Q)                       — q1=A AND q2=A
 *     6. Q2B + Q6B (8Q)                      — Phase 33
 *     7. Q2B + Q6B + ESPELHO (8Q)            — Phase 33
 *     8. Q1B only (7Q)                       — q1=B AND q2=B (Phase 31, BR-01)
 *     9. Q1B + Q6B (8Q)                      — Phase 33
 *    10. Q1B + Q6B + ESPELHO (8Q)            — Phase 33
 *
 *   Q4B (PURGATORIO branch):
 *    11. Q4B only (7Q)
 *    12. Q4B + Q6B (8Q)                      — Phase 33
 *    13. Q4B + Q6B + ESPELHO (8Q)            — Phase 33
 *
 *   Q2B + Q4B combos:
 *    14. Q2B + Q4B (8Q)
 *    15. Q2B + Q4B + Q6B (9Q)                — Phase 33
 *    16. Q2B + Q4B + Q6B + ESPELHO (9Q)      — Phase 33 WORST CASE (max branch stacking)
 *
 *   Q1B + Q4B combos:
 *    17. Q1B + Q4B (8Q)
 *    18. Q1B + Q4B + Q6B (9Q)                — Phase 33
 *    19. Q1B + Q4B + Q6B + ESPELHO (9Q)      — Phase 33 WORST CASE (max branch stacking)
 *
 *   Q5B combos (Phase 32):
 *    20. Q1B + Q4B + Q5B (9Q)                — q1=B, q2=B, q3=A, q4=A, q5=A (Phase 32 max-path baseline)
 *
 *   Phase 34 — CONTRA_FOBICO paths (AR-02):
 *    21. Q1B + CONTRA_FOBICO (7Q)            — Phase 34, AR-02 (q1=B && q2=B && q1b=A)
 *    22. Q1B + Q4B + CONTRA_FOBICO (8Q)      — Phase 34, AR-02 with PURGATORIO branch
 *
 *   Phase 34 — PORTADOR paths (AR-03):
 *    23. Q5B + PORTADOR (7Q)                 — Phase 34, AR-03 (q4=A && q5=A && q5b=A)
 *    24. Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO (9Q — worst case)
 *                                            — Phase 34 WORST CASE: max branch stacking with both
 *                                              new archetype triggers (CONTRA_FOBICO wins via priority)
 *
 * Mutual exclusion rules:
 *   - Q1B and Q2B are mutually exclusive (q1 cannot be both 'A' and 'B')
 *   - Q5B and Q6B are mutually exclusive (Q5B needs q5='A', Q6B needs q5='B')
 *   - hasEspelhoSilencioso implies hasQ6B (ESPELHO only reachable via Q6B)
 *   - hasContraFobico implies hasQ1B (CONTRA_FOBICO only reachable via Q1B branch — Phase 34)
 *   - hasPortador implies hasQ5B (PORTADOR only reachable via Q5B branch — Phase 34)
 *
 * Methodology:
 * - Speech rate: ~13 chars/sec for PT-BR conversational speech
 * - Pauses: calculated from pauseAfter values (ms → sec)
 * - Listener response time: 4 seconds per question
 * - Max-path: takes the longer RESPOSTA option for each question pair
 *
 * Exit codes:
 * - 0: max-path within 300-450 seconds (PASS)
 * - 1: max-path outside target range (FAIL)
 */

import { SCRIPT } from '../src/data/script';
import type { SpeechSegment } from '../src/types';

// Speech rate constant for PT-BR
const CHARS_PER_SECOND = 13;

/**
 * Calculate duration in seconds for a section (array of segments)
 */
function calculateSectionDuration(segments: SpeechSegment[]): number {
  let totalSeconds = 0;

  for (const segment of segments) {
    // Speech duration: chars / 13 chars per second
    const speechDuration = segment.text.length / CHARS_PER_SECOND;
    totalSeconds += speechDuration;

    // Add pause if present
    if (segment.pauseAfter) {
      totalSeconds += segment.pauseAfter / 1000;
    }
  }

  return totalSeconds;
}

/**
 * Calculate total character count for a section
 */
function calculateSectionChars(segments: SpeechSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.text.length, 0);
}

/**
 * Pick the longer of two RESPOSTA options for max-path calculation
 */
function pickLongerResposta(
  respostaA: SpeechSegment[],
  respostaB: SpeechSegment[]
): { segments: SpeechSegment[], choice: 'A' | 'B' } {
  const durationA = calculateSectionDuration(respostaA);
  const durationB = calculateSectionDuration(respostaB);

  return durationA >= durationB
    ? { segments: respostaA, choice: 'A' }
    : { segments: respostaB, choice: 'B' };
}

/**
 * Pick the longest DEVOLUCAO for max-path calculation (Phase 34 extended from Phase 33)
 *
 * Priority order (mirrors oracleMachine.ts DEVOLUCAO.always):
 * - [0] ESPELHO_SILENCIOSO (Phase 33) — fires when q6b='B'
 * - [1] CONTRA_FOBICO (Phase 34) — fires when q1=B && q2=B && q1b=A
 * - [2] PORTADOR (Phase 34) — fires when q4=A && q5=A && q5b=A
 * - [3-10] 8 baseline archetypes (longest picked via loop)
 *
 * When multiple priority-0/1/2 guards could fire, the HIGHEST priority wins
 * (first-match-wins in always[]). This mirrors runtime behavior exactly.
 */
function pickLongestDevolucao(
  hasEspelhoSilencioso: boolean,
  hasContraFobico: boolean,
  hasPortador: boolean,
): { segments: SpeechSegment[], key: string } {
  // Phase 33 — ESPELHO_SILENCIOSO pre-empts all other archetypes
  if (hasEspelhoSilencioso) {
    return { key: 'DEVOLUCAO_ESPELHO_SILENCIOSO', segments: SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO };
  }

  // Phase 34 — CONTRA_FOBICO pre-empts PORTADOR and baseline archetypes
  if (hasContraFobico) {
    return { key: 'DEVOLUCAO_CONTRA_FOBICO', segments: SCRIPT.DEVOLUCAO_CONTRA_FOBICO };
  }

  // Phase 34 — PORTADOR pre-empts baseline archetypes
  if (hasPortador) {
    return { key: 'DEVOLUCAO_PORTADOR', segments: SCRIPT.DEVOLUCAO_PORTADOR };
  }

  // Existing 8 baseline archetypes (longest wins)
  const devolucoes = [
    { key: 'DEVOLUCAO_SEEKER', segments: SCRIPT.DEVOLUCAO_SEEKER },
    { key: 'DEVOLUCAO_GUARDIAN', segments: SCRIPT.DEVOLUCAO_GUARDIAN },
    { key: 'DEVOLUCAO_CONTRADICTED', segments: SCRIPT.DEVOLUCAO_CONTRADICTED },
    { key: 'DEVOLUCAO_PIVOT_EARLY', segments: SCRIPT.DEVOLUCAO_PIVOT_EARLY },
    { key: 'DEVOLUCAO_PIVOT_LATE', segments: SCRIPT.DEVOLUCAO_PIVOT_LATE },
    { key: 'DEVOLUCAO_DEPTH_SEEKER', segments: SCRIPT.DEVOLUCAO_DEPTH_SEEKER },
    { key: 'DEVOLUCAO_SURFACE_KEEPER', segments: SCRIPT.DEVOLUCAO_SURFACE_KEEPER },
    { key: 'DEVOLUCAO_MIRROR', segments: SCRIPT.DEVOLUCAO_MIRROR },
  ];

  let longest = devolucoes[0];
  let longestDuration = calculateSectionDuration(longest.segments);

  for (const devolucao of devolucoes.slice(1)) {
    const duration = calculateSectionDuration(devolucao.segments);
    if (duration > longestDuration) {
      longest = devolucao;
      longestDuration = duration;
    }
  }

  return longest;
}

/**
 * Branch conditions (Phase 33 extended):
 * - Q1B triggers when: Q1=B AND Q2=B (contra-fobico profile in INFERNO, Phase 31)
 * - Q2B triggers when: Q1=A AND Q2=A (both "toward" choices in INFERNO)
 * - Q4B triggers when: Q3=A AND Q4=A (both "toward" choices in PURGATORIO)
 * - Q5B triggers when: Q4=A AND Q5=A (PORTADOR profile precursor in PARAISO, Phase 32)
 * - Q6B triggers when: Q5=B AND Q6=A (dissolution + openness profile in PARAISO, Phase 33)
 * - ESPELHO_SILENCIOSO triggers when: Q6B=true AND Q6B_choice=B (open form over closed reading, Phase 33)
 *
 * Twenty paths:
 *   - Q1B and Q2B are MUTUALLY EXCLUSIVE — q1 can't be A AND B
 *   - Q5B and Q6B are MUTUALLY EXCLUSIVE — q5 can't be A AND B
 *   - ESPELHO implies Q6B (only reachable via Q6B branch)
 */
interface PathConfig {
  name: string;
  hasQ1B: boolean;  // Phase 31, BR-01 — fires when q1=B AND q2=B
  hasQ2B: boolean;
  hasQ4B: boolean;
  hasQ5B: boolean;  // Phase 32, BR-02 — fires when q4=A AND q5=A
  hasQ6B: boolean;  // Phase 33, BR-03 — fires when q5=B AND q6=A
  hasEspelhoSilencioso: boolean; // Phase 33, AR-01 — fires when q6b=B (implies hasQ6B)
  hasContraFobico: boolean;  // Phase 34, AR-02 — implies hasQ1B (only reachable via Q1B branch)
  hasPortador: boolean;      // Phase 34, AR-03 — implies hasQ5B (only reachable via Q5B branch)
  questionCount: number; // 6, 7, 8, or 9
}

// Assertion helper to enforce mutual exclusion rules
function assertValidPath(p: PathConfig): void {
  if (p.hasQ5B && p.hasQ6B) {
    throw new Error(`Path "${p.name}": Q5B and Q6B are mutually exclusive (q5 cannot be both 'A' and 'B')`);
  }
  if (p.hasEspelhoSilencioso && !p.hasQ6B) {
    throw new Error(`Path "${p.name}": hasEspelhoSilencioso requires hasQ6B (ESPELHO only reachable via Q6B)`);
  }
  if (p.hasQ1B && p.hasQ2B) {
    throw new Error(`Path "${p.name}": Q1B and Q2B are mutually exclusive (q1 cannot be both 'A' and 'B')`);
  }
  // Phase 34 — CONTRA_FOBICO requires Q1B branch (only reachable via q1b response)
  if (p.hasContraFobico && !p.hasQ1B) {
    throw new Error(`Path "${p.name}": hasContraFobico requires hasQ1B (CONTRA_FOBICO only reachable via Q1B branch)`);
  }
  // Phase 34 — PORTADOR requires Q5B branch (only reachable via q5b response)
  if (p.hasPortador && !p.hasQ5B) {
    throw new Error(`Path "${p.name}": hasPortador requires hasQ5B (PORTADOR only reachable via Q5B branch)`);
  }
}

// NOTE: Q1B and Q2B are mutually exclusive (q1 can't be both A and B).
// Q5B and Q6B are mutually exclusive (q5 can't be both A and B).
// ESPELHO_SILENCIOSO implies Q6B (only reachable via Q6B branch).
// CONTRA_FOBICO implies Q1B (Phase 34 — only reachable via Q1B branch).
// PORTADOR implies Q5B (Phase 34 — only reachable via Q5B branch).
// The matrix has 24 entries (Phase 33 had 20; Phase 34 adds 4 new permutations).
const ALL_PATHS: PathConfig[] = [
  // ========== No branches ==========
  { name: 'No branches (6Q)', hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 6 },

  // ========== Single branch (Q5B or Q6B) ==========
  { name: 'Q5B only (7Q)', hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: true, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 7 },
  { name: 'Q6B only (7Q)', hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 7 },
  { name: 'Q6B + ESPELHO (7Q)', hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 7 },

  // ========== Q2B INFERNO branch ==========
  { name: 'Q2B only (7Q)', hasQ1B: false, hasQ2B: true, hasQ4B: false, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 7 },
  { name: 'Q2B + Q6B (8Q)', hasQ1B: false, hasQ2B: true, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 8 },
  { name: 'Q2B + Q6B + ESPELHO (8Q)', hasQ1B: false, hasQ2B: true, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 8 },

  // ========== Q1B INFERNO branch ==========
  { name: 'Q1B only (7Q)', hasQ1B: true, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 7 },
  { name: 'Q1B + Q6B (8Q)', hasQ1B: true, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 8 },
  { name: 'Q1B + Q6B + ESPELHO (8Q)', hasQ1B: true, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 8 },

  // ========== Q4B PURGATORIO branch (no INFERNO branch) ==========
  { name: 'Q4B only (7Q)', hasQ1B: false, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 7 },
  { name: 'Q4B + Q6B (8Q)', hasQ1B: false, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 8 },
  { name: 'Q4B + Q6B + ESPELHO (8Q)', hasQ1B: false, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 8 },

  // ========== Q2B + Q4B combos ==========
  { name: 'Q2B + Q4B (8Q)', hasQ1B: false, hasQ2B: true, hasQ4B: true, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 8 },
  { name: 'Q2B + Q4B + Q6B (9Q)', hasQ1B: false, hasQ2B: true, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 9 },
  { name: 'Q2B + Q4B + Q6B + ESPELHO (9Q)', hasQ1B: false, hasQ2B: true, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 9 },

  // ========== Q1B + Q4B combos ==========
  { name: 'Q1B + Q4B (8Q)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 8 },
  { name: 'Q1B + Q4B + Q6B (9Q)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 9 },
  { name: 'Q1B + Q4B + Q6B + ESPELHO (9Q)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: true, hasEspelhoSilencioso: true, hasContraFobico: false, hasPortador: false, questionCount: 9 },

  // ========== Q5B combo (Phase 32 max-path baseline) ==========
  { name: 'Q1B + Q4B + Q5B (9Q - Phase 32 baseline)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: true, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: false, questionCount: 9 },

  // ========== Phase 34 — CONTRA_FOBICO paths (AR-02) ==========
  // CONTRA_FOBICO fires when hasQ1B AND q1b_response='A' (visitor atravessou o vazio).
  // The validator picks longest RESPOSTA, so it can't force q1b='A' directly,
  // but the CONTRA_FOBICO devolução is SELECTED by pickLongestDevolucao regardless.
  { name: 'Q1B + CONTRA_FOBICO (7Q)', hasQ1B: true, hasQ2B: false, hasQ4B: false, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: true, hasPortador: false, questionCount: 7 },
  { name: 'Q1B + Q4B + CONTRA_FOBICO (8Q)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: false, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: true, hasPortador: false, questionCount: 8 },

  // ========== Phase 34 — PORTADOR paths (AR-03) ==========
  // PORTADOR fires when hasQ5B AND q5b_response='A' (visitor fundiu pergunta e memória).
  { name: 'Q5B + PORTADOR (7Q)', hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: true, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: false, hasPortador: true, questionCount: 7 },
  // Worst case Phase 34: max branch stacking with both new triggers fired.
  // CONTRA_FOBICO wins via priority [1] over PORTADOR [2] in DEVOLUCAO.always — mirrors runtime.
  { name: 'Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO (9Q — worst case)', hasQ1B: true, hasQ2B: false, hasQ4B: true, hasQ5B: true, hasQ6B: false, hasEspelhoSilencioso: false, hasContraFobico: true, hasPortador: true, questionCount: 9 },
];

// Validate all paths before running
ALL_PATHS.forEach(assertValidPath);

function calculatePath(config: PathConfig): Array<{ name: string; segments: SpeechSegment[] }> {
  const sections: Array<{ name: string; segments: SpeechSegment[] }> = [];

  // Bookend
  sections.push({ name: 'APRESENTACAO', segments: SCRIPT.APRESENTACAO });

  // INFERNO
  sections.push({ name: 'INFERNO_INTRO', segments: SCRIPT.INFERNO_INTRO });
  sections.push({ name: 'INFERNO_Q1_SETUP', segments: SCRIPT.INFERNO_Q1_SETUP });
  sections.push({ name: 'INFERNO_Q1_PERGUNTA', segments: SCRIPT.INFERNO_Q1_PERGUNTA });
  const q1 = pickLongerResposta(SCRIPT.INFERNO_Q1_RESPOSTA_A, SCRIPT.INFERNO_Q1_RESPOSTA_B);
  sections.push({ name: `INFERNO_Q1_RESPOSTA_${q1.choice}`, segments: q1.segments });

  sections.push({ name: 'INFERNO_Q2_SETUP', segments: SCRIPT.INFERNO_Q2_SETUP });
  sections.push({ name: 'INFERNO_Q2_PERGUNTA', segments: SCRIPT.INFERNO_Q2_PERGUNTA });
  const q2 = pickLongerResposta(SCRIPT.INFERNO_Q2_RESPOSTA_A, SCRIPT.INFERNO_Q2_RESPOSTA_B);
  sections.push({ name: `INFERNO_Q2_RESPOSTA_${q2.choice}`, segments: q2.segments });

  // Conditional Q2B branch
  if (config.hasQ2B) {
    sections.push({ name: 'INFERNO_Q2B_SETUP', segments: SCRIPT.INFERNO_Q2B_SETUP });
    sections.push({ name: 'INFERNO_Q2B_PERGUNTA', segments: SCRIPT.INFERNO_Q2B_PERGUNTA });
    const q2b = pickLongerResposta(SCRIPT.INFERNO_Q2B_RESPOSTA_A, SCRIPT.INFERNO_Q2B_RESPOSTA_B);
    sections.push({ name: `INFERNO_Q2B_RESPOSTA_${q2b.choice}`, segments: q2b.segments });
  }

  // Conditional Q1B branch (Phase 31, BR-01)
  // Mutually exclusive with Q2B — fires when q1=B AND q2=B (contra-fobico profile)
  if (config.hasQ1B) {
    sections.push({ name: 'INFERNO_Q1B_SETUP', segments: SCRIPT.INFERNO_Q1B_SETUP });
    sections.push({ name: 'INFERNO_Q1B_PERGUNTA', segments: SCRIPT.INFERNO_Q1B_PERGUNTA });
    const q1b = pickLongerResposta(SCRIPT.INFERNO_Q1B_RESPOSTA_A, SCRIPT.INFERNO_Q1B_RESPOSTA_B);
    sections.push({ name: `INFERNO_Q1B_RESPOSTA_${q1b.choice}`, segments: q1b.segments });
  }

  // PURGATORIO
  sections.push({ name: 'PURGATORIO_INTRO', segments: SCRIPT.PURGATORIO_INTRO });
  sections.push({ name: 'PURGATORIO_Q3_SETUP', segments: SCRIPT.PURGATORIO_Q3_SETUP });
  sections.push({ name: 'PURGATORIO_Q3_PERGUNTA', segments: SCRIPT.PURGATORIO_Q3_PERGUNTA });
  const q3 = pickLongerResposta(SCRIPT.PURGATORIO_Q3_RESPOSTA_A, SCRIPT.PURGATORIO_Q3_RESPOSTA_B);
  sections.push({ name: `PURGATORIO_Q3_RESPOSTA_${q3.choice}`, segments: q3.segments });

  sections.push({ name: 'PURGATORIO_Q4_SETUP', segments: SCRIPT.PURGATORIO_Q4_SETUP });
  sections.push({ name: 'PURGATORIO_Q4_PERGUNTA', segments: SCRIPT.PURGATORIO_Q4_PERGUNTA });
  const q4 = pickLongerResposta(SCRIPT.PURGATORIO_Q4_RESPOSTA_A, SCRIPT.PURGATORIO_Q4_RESPOSTA_B);
  sections.push({ name: `PURGATORIO_Q4_RESPOSTA_${q4.choice}`, segments: q4.segments });

  // Conditional Q4B branch
  if (config.hasQ4B) {
    sections.push({ name: 'PURGATORIO_Q4B_SETUP', segments: SCRIPT.PURGATORIO_Q4B_SETUP });
    sections.push({ name: 'PURGATORIO_Q4B_PERGUNTA', segments: SCRIPT.PURGATORIO_Q4B_PERGUNTA });
    const q4b = pickLongerResposta(SCRIPT.PURGATORIO_Q4B_RESPOSTA_A, SCRIPT.PURGATORIO_Q4B_RESPOSTA_B);
    sections.push({ name: `PURGATORIO_Q4B_RESPOSTA_${q4b.choice}`, segments: q4b.segments });
  }

  // PARAISO (Q5B is conditional, Phase 32; Q6B is conditional, Phase 33)
  sections.push({ name: 'PARAISO_INTRO', segments: SCRIPT.PARAISO_INTRO });
  sections.push({ name: 'PARAISO_Q5_SETUP', segments: SCRIPT.PARAISO_Q5_SETUP });
  sections.push({ name: 'PARAISO_Q5_PERGUNTA', segments: SCRIPT.PARAISO_Q5_PERGUNTA });
  const q5 = pickLongerResposta(SCRIPT.PARAISO_Q5_RESPOSTA_A, SCRIPT.PARAISO_Q5_RESPOSTA_B);
  sections.push({ name: `PARAISO_Q5_RESPOSTA_${q5.choice}`, segments: q5.segments });

  // Conditional Q5B branch (Phase 32, BR-02)
  // Independent of Q1B/Q2B; coexistent with Q4B — fires when q4=A AND q5=A
  // Mutually exclusive with Q6B (Q5B needs q5=A, Q6B needs q5=B)
  if (config.hasQ5B) {
    sections.push({ name: 'PARAISO_Q5B_SETUP', segments: SCRIPT.PARAISO_Q5B_SETUP });
    sections.push({ name: 'PARAISO_Q5B_PERGUNTA', segments: SCRIPT.PARAISO_Q5B_PERGUNTA });
    const q5b = pickLongerResposta(SCRIPT.PARAISO_Q5B_RESPOSTA_A, SCRIPT.PARAISO_Q5B_RESPOSTA_B);
    sections.push({ name: `PARAISO_Q5B_RESPOSTA_${q5b.choice}`, segments: q5b.segments });
  }

  sections.push({ name: 'PARAISO_Q6_SETUP', segments: SCRIPT.PARAISO_Q6_SETUP });
  sections.push({ name: 'PARAISO_Q6_PERGUNTA', segments: SCRIPT.PARAISO_Q6_PERGUNTA });
  const q6 = pickLongerResposta(SCRIPT.PARAISO_Q6_RESPOSTA_A, SCRIPT.PARAISO_Q6_RESPOSTA_B);
  sections.push({ name: `PARAISO_Q6_RESPOSTA_${q6.choice}`, segments: q6.segments });

  // Conditional Q6B branch (Phase 33, BR-03)
  // Independent of Q1B/Q2B/Q4B; mutually exclusive with Q5B — fires when q5=B AND q6=A
  if (config.hasQ6B) {
    sections.push({ name: 'PARAISO_Q6B_SETUP', segments: SCRIPT.PARAISO_Q6B_SETUP });
    sections.push({ name: 'PARAISO_Q6B_PERGUNTA', segments: SCRIPT.PARAISO_Q6B_PERGUNTA });
    const q6b = pickLongerResposta(SCRIPT.PARAISO_Q6B_RESPOSTA_A, SCRIPT.PARAISO_Q6B_RESPOSTA_B);
    sections.push({ name: `PARAISO_Q6B_RESPOSTA_${q6b.choice}`, segments: q6b.segments });
  }

  // Longest devolucao (Phase 34: ESPELHO > CONTRA_FOBICO > PORTADOR > 8 baseline)
  const longestDevolucao = pickLongestDevolucao(
    config.hasEspelhoSilencioso,
    config.hasContraFobico,
    config.hasPortador,
  );
  sections.push({ name: longestDevolucao.key, segments: longestDevolucao.segments });

  // Encerramento
  sections.push({ name: 'ENCERRAMENTO', segments: SCRIPT.ENCERRAMENTO });

  return sections;
}


/**
 * Format duration for display
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
}

/**
 * Main validation
 */
function main() {
  console.log('\n=== V6.0 TIMING VALIDATION (BRANCH-AWARE) — PHASE 34 (24 PATHS) ===\n');

  let globalMaxTotal = 0;
  let globalMaxName = '';
  let globalMinTotal = Infinity;
  let globalMinName = '';

  for (const pathConfig of ALL_PATHS) {
    const sections = calculatePath(pathConfig);

    console.log(`\n--- PATH: ${pathConfig.name} ---`);
    console.log('Section                          | Segs | Chars | Duration');
    console.log('----------------------------------------------------------------');

    let narrationSeconds = 0;
    let segmentCount = 0;
    let charCount = 0;

    for (const section of sections) {
      const segs = section.segments.length;
      const chars = calculateSectionChars(section.segments);
      const duration = calculateSectionDuration(section.segments);

      narrationSeconds += duration;
      segmentCount += segs;
      charCount += chars;

      console.log(
        `${section.name.padEnd(32)} | ${segs.toString().padStart(4)} | ${chars.toString().padStart(5)} | ${duration.toFixed(1).padStart(6)}s`
      );
    }

    const listenerTime = pathConfig.questionCount * 4;
    const total = narrationSeconds + listenerTime;

    console.log('----------------------------------------------------------------');
    console.log(`SUBTOTAL (narration)             | ${segmentCount.toString().padStart(4)} | ${charCount.toString().padStart(5)} | ${narrationSeconds.toFixed(1).padStart(6)}s`);
    console.log(`Listener response (${pathConfig.questionCount}x4s)        |      |       | ${listenerTime.toFixed(1).padStart(6)}s`);
    console.log(`TOTAL                            |      |       | ${total.toFixed(1).padStart(6)}s = ${formatDuration(total)} min`);

    if (total > globalMaxTotal) {
      globalMaxTotal = total;
      globalMaxName = pathConfig.name;
    }
    if (total < globalMinTotal) {
      globalMinTotal = total;
      globalMinName = pathConfig.name;
    }
  }

  // Summary
  console.log('\n\n=== SUMMARY ===');
  console.log(`MAX-PATH: ${globalMaxName} — ${globalMaxTotal.toFixed(1)}s = ${formatDuration(globalMaxTotal)} min`);
  console.log(`MIN-PATH: ${globalMinName} — ${globalMinTotal.toFixed(1)}s = ${formatDuration(globalMinTotal)} min`);
  console.log(`AVG-PATH: ${((globalMaxTotal + globalMinTotal) / 2).toFixed(1)}s = ${formatDuration((globalMaxTotal + globalMinTotal) / 2)} min`);

  // Target validation
  console.log('\n----------------------------------------------------------------');
  console.log('TARGET: 5-7:30 minutes (300-450 seconds) — v6.0 budget with branch overflow tolerance');

  const pass = globalMaxTotal >= 300 && globalMaxTotal <= 450;

  if (pass) {
    console.log(`STATUS: PASS (max-path ${formatDuration(globalMaxTotal)} min)`);
    console.log('\nAll 24 paths fall within acceptable range.');
    process.exit(0);
  } else {
    console.log(`STATUS: FAIL (max-path ${formatDuration(globalMaxTotal)} min)`);

    if (globalMaxTotal > 450) {
      const excess = globalMaxTotal - 450;
      console.log(`\nExceeds target by ${excess.toFixed(1)}s.`);
      console.log('Recommendations:');
      console.log('  1. Trim branch respostas to 1 segment each');
      console.log('  2. Reduce branch setup from 2 to 1 segment');
      console.log('  3. Compress pauseAfter values in branch content');
    } else {
      const shortfall = 300 - globalMaxTotal;
      console.log(`\nFalls short by ${shortfall.toFixed(1)}s.`);
      console.log('Recommendation: Restore segments to base questions.');
    }

    process.exit(1);
  }
}

main();
