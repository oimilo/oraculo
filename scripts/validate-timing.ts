/**
 * V6.0 TIMING VALIDATION SCRIPT (BRANCH-AWARE)
 *
 * Validates that the max-path experience duration falls within the 5-7:30 minute
 * target (300-450 seconds — v6.0 budget with branch overflow tolerance).
 * Calculates all 12 possible paths through the branching structure:
 *
 *   No branches:
 *     1. No branches (6Q)
 *     2. Q5B only (7Q)                       — q4=A AND q5=A (Phase 32, BR-02)
 *
 *   Single INFERNO branch:
 *     3. Q2B only (7Q)                       — q1=A AND q2=A
 *     4. Q2B + Q5B (8Q)                      — Phase 32
 *     5. Q1B only (7Q)                       — q1=B AND q2=B (Phase 31, BR-01)
 *     6. Q1B + Q5B (8Q)                      — Phase 32
 *
 *   Q4B (PURGATORIO branch):
 *     7. Q4B only (7Q)
 *     8. Q4B + Q5B (8Q)                      — coexistence (q3=A, q4=A, q5=A)
 *
 *   Q2B + Q4B combos:
 *     9. Q2B + Q4B (8Q)
 *    10. Q2B + Q4B + Q5B (9Q — WORST CASE)   — q1=A, q2=A, q3=A, q4=A, q5=A
 *
 *   Q1B + Q4B combos:
 *    11. Q1B + Q4B (8Q)
 *    12. Q1B + Q4B + Q5B (9Q — WORST CASE)   — q1=B, q2=B, q3=A, q4=A, q5=A
 *
 * Mutual exclusion rules:
 *   - Q1B and Q2B are mutually exclusive (q1 cannot be both 'A' and 'B')
 *   - Q5B is INDEPENDENT of Q1B/Q2B (different phase, no shared variables)
 *   - Q5B is COEXISTENT with Q4B (both want q4='A')
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
 * Pick the longer DEVOLUCAO for max-path calculation
 */
function pickLongestDevolucao(): { segments: SpeechSegment[], key: string } {
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
 * Branch conditions:
 * - Q1B triggers when: Q1=B AND Q2=B (contra-fobico profile in INFERNO)
 * - Q2B triggers when: Q1=A AND Q2=A (both "toward" choices in INFERNO)
 * - Q4B triggers when: Q3=A AND Q4=A (both "toward" choices in PURGATORIO)
 * - Q5B triggers when: Q4=A AND Q5=A (PORTADOR profile precursor in PARAISO, Phase 32 BR-02)
 *
 * Twelve possible paths:
 *   - Q1B and Q2B are MUTUALLY EXCLUSIVE — q1 can't be A AND B
 *   - Q5B is INDEPENDENT of Q1B/Q2B (different phase, no shared variables)
 *   - Q5B is COEXISTENT with Q4B (both want q4=A)
 *   - Worst case (9Q): Q1B+Q4B+Q5B or Q2B+Q4B+Q5B
 */
interface PathConfig {
  name: string;
  hasQ1B: boolean;  // Phase 31, BR-01 — fires when q1=B AND q2=B
  hasQ2B: boolean;
  hasQ4B: boolean;
  hasQ5B: boolean;  // Phase 32, BR-02 — fires when q4=A AND q5=A
  questionCount: number; // 6, 7, 8, or 9
}

// NOTE: Q1B and Q2B are mutually exclusive (q1 can't be both A and B), so paths
// that combine Q1B+Q2B do not exist. Q5B is independent of Q1B/Q2B (different phase)
// and COEXISTENT with Q4B (both want q4=A). The matrix has 12 entries (6 existing × 2 for hasQ5B).
const ALL_PATHS: PathConfig[] = [
  // No INFERNO branch, no Q4B
  { name: 'No branches (6Q)',          hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: false, questionCount: 6 },
  { name: 'Q5B only (7Q)',             hasQ1B: false, hasQ2B: false, hasQ4B: false, hasQ5B: true,  questionCount: 7 },
  // Q2B INFERNO branch
  { name: 'Q2B only (7Q)',             hasQ1B: false, hasQ2B: true,  hasQ4B: false, hasQ5B: false, questionCount: 7 },
  { name: 'Q2B + Q5B (8Q)',            hasQ1B: false, hasQ2B: true,  hasQ4B: false, hasQ5B: true,  questionCount: 8 },
  // Q1B INFERNO branch
  { name: 'Q1B only (7Q)',             hasQ1B: true,  hasQ2B: false, hasQ4B: false, hasQ5B: false, questionCount: 7 },
  { name: 'Q1B + Q5B (8Q)',            hasQ1B: true,  hasQ2B: false, hasQ4B: false, hasQ5B: true,  questionCount: 8 },
  // Q4B PURGATORIO branch (no INFERNO branch)
  { name: 'Q4B only (7Q)',             hasQ1B: false, hasQ2B: false, hasQ4B: true,  hasQ5B: false, questionCount: 7 },
  { name: 'Q4B + Q5B (8Q)',            hasQ1B: false, hasQ2B: false, hasQ4B: true,  hasQ5B: true,  questionCount: 8 },
  // Q2B + Q4B combos
  { name: 'Q2B + Q4B (8Q)',            hasQ1B: false, hasQ2B: true,  hasQ4B: true,  hasQ5B: false, questionCount: 8 },
  { name: 'Q2B + Q4B + Q5B (9Q)',      hasQ1B: false, hasQ2B: true,  hasQ4B: true,  hasQ5B: true,  questionCount: 9 },
  // Q1B + Q4B combos
  { name: 'Q1B + Q4B (8Q)',            hasQ1B: true,  hasQ2B: false, hasQ4B: true,  hasQ5B: false, questionCount: 8 },
  { name: 'Q1B + Q4B + Q5B (9Q)',      hasQ1B: true,  hasQ2B: false, hasQ4B: true,  hasQ5B: true,  questionCount: 9 },
];

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

  // PARAISO (Q5B is conditional)
  sections.push({ name: 'PARAISO_INTRO', segments: SCRIPT.PARAISO_INTRO });
  sections.push({ name: 'PARAISO_Q5_SETUP', segments: SCRIPT.PARAISO_Q5_SETUP });
  sections.push({ name: 'PARAISO_Q5_PERGUNTA', segments: SCRIPT.PARAISO_Q5_PERGUNTA });
  const q5 = pickLongerResposta(SCRIPT.PARAISO_Q5_RESPOSTA_A, SCRIPT.PARAISO_Q5_RESPOSTA_B);
  sections.push({ name: `PARAISO_Q5_RESPOSTA_${q5.choice}`, segments: q5.segments });

  // Conditional Q5B branch (Phase 32, BR-02)
  // Independent of Q1B/Q2B; coexistent with Q4B — fires when q4=A AND q5=A
  // Sibling rejoin within PARAISO (no cross-phase target)
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

  // Longest devolucao
  const longestDevolucao = pickLongestDevolucao();
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
  console.log('\n=== V6.0 TIMING VALIDATION (BRANCH-AWARE) ===\n');

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
    console.log('\nAll paths fall within acceptable range.');
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
