/**
 * V4.0 TIMING VALIDATION SCRIPT
 *
 * Validates that the max-path experience duration falls within the 5-7 minute target.
 *
 * Methodology:
 * - Speech rate: ~13 chars/sec for PT-BR conversational speech
 * - Pauses: calculated from pauseAfter values (ms → sec)
 * - Listener response time: 4 seconds per question (6 questions = 24s total)
 * - Max-path: takes the longer RESPOSTA option for each question pair
 *
 * Exit codes:
 * - 0: max-path within 300-420 seconds (PASS)
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
 * Calculate max-path experience duration
 */
function calculateMaxPath() {
  const sections: Array<{ name: string, segments: SpeechSegment[] }> = [];

  // Bookends
  sections.push({ name: 'APRESENTACAO', segments: SCRIPT.APRESENTACAO });

  // INFERNO
  sections.push({ name: 'INFERNO_INTRO', segments: SCRIPT.INFERNO_INTRO });
  sections.push({ name: 'INFERNO_Q1_SETUP', segments: SCRIPT.INFERNO_Q1_SETUP });
  sections.push({ name: 'INFERNO_Q1_PERGUNTA', segments: SCRIPT.INFERNO_Q1_PERGUNTA });
  const q1Resposta = pickLongerResposta(SCRIPT.INFERNO_Q1_RESPOSTA_A, SCRIPT.INFERNO_Q1_RESPOSTA_B);
  sections.push({ name: `INFERNO_Q1_RESPOSTA_${q1Resposta.choice}`, segments: q1Resposta.segments });

  sections.push({ name: 'INFERNO_Q2_SETUP', segments: SCRIPT.INFERNO_Q2_SETUP });
  sections.push({ name: 'INFERNO_Q2_PERGUNTA', segments: SCRIPT.INFERNO_Q2_PERGUNTA });
  const q2Resposta = pickLongerResposta(SCRIPT.INFERNO_Q2_RESPOSTA_A, SCRIPT.INFERNO_Q2_RESPOSTA_B);
  sections.push({ name: `INFERNO_Q2_RESPOSTA_${q2Resposta.choice}`, segments: q2Resposta.segments });

  // PURGATORIO
  sections.push({ name: 'PURGATORIO_INTRO', segments: SCRIPT.PURGATORIO_INTRO });
  sections.push({ name: 'PURGATORIO_Q3_SETUP', segments: SCRIPT.PURGATORIO_Q3_SETUP });
  sections.push({ name: 'PURGATORIO_Q3_PERGUNTA', segments: SCRIPT.PURGATORIO_Q3_PERGUNTA });
  const q3Resposta = pickLongerResposta(SCRIPT.PURGATORIO_Q3_RESPOSTA_A, SCRIPT.PURGATORIO_Q3_RESPOSTA_B);
  sections.push({ name: `PURGATORIO_Q3_RESPOSTA_${q3Resposta.choice}`, segments: q3Resposta.segments });

  sections.push({ name: 'PURGATORIO_Q4_SETUP', segments: SCRIPT.PURGATORIO_Q4_SETUP });
  sections.push({ name: 'PURGATORIO_Q4_PERGUNTA', segments: SCRIPT.PURGATORIO_Q4_PERGUNTA });
  const q4Resposta = pickLongerResposta(SCRIPT.PURGATORIO_Q4_RESPOSTA_A, SCRIPT.PURGATORIO_Q4_RESPOSTA_B);
  sections.push({ name: `PURGATORIO_Q4_RESPOSTA_${q4Resposta.choice}`, segments: q4Resposta.segments });

  // PARAISO
  sections.push({ name: 'PARAISO_INTRO', segments: SCRIPT.PARAISO_INTRO });
  sections.push({ name: 'PARAISO_Q5_SETUP', segments: SCRIPT.PARAISO_Q5_SETUP });
  sections.push({ name: 'PARAISO_Q5_PERGUNTA', segments: SCRIPT.PARAISO_Q5_PERGUNTA });
  const q5Resposta = pickLongerResposta(SCRIPT.PARAISO_Q5_RESPOSTA_A, SCRIPT.PARAISO_Q5_RESPOSTA_B);
  sections.push({ name: `PARAISO_Q5_RESPOSTA_${q5Resposta.choice}`, segments: q5Resposta.segments });

  sections.push({ name: 'PARAISO_Q6_SETUP', segments: SCRIPT.PARAISO_Q6_SETUP });
  sections.push({ name: 'PARAISO_Q6_PERGUNTA', segments: SCRIPT.PARAISO_Q6_PERGUNTA });
  const q6Resposta = pickLongerResposta(SCRIPT.PARAISO_Q6_RESPOSTA_A, SCRIPT.PARAISO_Q6_RESPOSTA_B);
  sections.push({ name: `PARAISO_Q6_RESPOSTA_${q6Resposta.choice}`, segments: q6Resposta.segments });

  // Longest devolucao
  const longestDevolucao = pickLongestDevolucao();
  sections.push({ name: longestDevolucao.key, segments: longestDevolucao.segments });

  // Encerramento
  sections.push({ name: 'ENCERRAMENTO', segments: SCRIPT.ENCERRAMENTO });

  return sections;
}

/**
 * Calculate min-path experience duration (shortest respostas)
 */
function calculateMinPath() {
  const sections: Array<{ name: string, segments: SpeechSegment[] }> = [];

  // Bookends
  sections.push({ name: 'APRESENTACAO', segments: SCRIPT.APRESENTACAO });

  // INFERNO
  sections.push({ name: 'INFERNO_INTRO', segments: SCRIPT.INFERNO_INTRO });
  sections.push({ name: 'INFERNO_Q1_SETUP', segments: SCRIPT.INFERNO_Q1_SETUP });
  sections.push({ name: 'INFERNO_Q1_PERGUNTA', segments: SCRIPT.INFERNO_Q1_PERGUNTA });
  const q1Resposta = pickLongerResposta(SCRIPT.INFERNO_Q1_RESPOSTA_B, SCRIPT.INFERNO_Q1_RESPOSTA_A); // Reversed to get shorter
  sections.push({ name: `INFERNO_Q1_RESPOSTA_${q1Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q1Resposta.choice === 'A' ? SCRIPT.INFERNO_Q1_RESPOSTA_B : SCRIPT.INFERNO_Q1_RESPOSTA_A });

  sections.push({ name: 'INFERNO_Q2_SETUP', segments: SCRIPT.INFERNO_Q2_SETUP });
  sections.push({ name: 'INFERNO_Q2_PERGUNTA', segments: SCRIPT.INFERNO_Q2_PERGUNTA });
  const q2Resposta = pickLongerResposta(SCRIPT.INFERNO_Q2_RESPOSTA_B, SCRIPT.INFERNO_Q2_RESPOSTA_A);
  sections.push({ name: `INFERNO_Q2_RESPOSTA_${q2Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q2Resposta.choice === 'A' ? SCRIPT.INFERNO_Q2_RESPOSTA_B : SCRIPT.INFERNO_Q2_RESPOSTA_A });

  // PURGATORIO
  sections.push({ name: 'PURGATORIO_INTRO', segments: SCRIPT.PURGATORIO_INTRO });
  sections.push({ name: 'PURGATORIO_Q3_SETUP', segments: SCRIPT.PURGATORIO_Q3_SETUP });
  sections.push({ name: 'PURGATORIO_Q3_PERGUNTA', segments: SCRIPT.PURGATORIO_Q3_PERGUNTA });
  const q3Resposta = pickLongerResposta(SCRIPT.PURGATORIO_Q3_RESPOSTA_B, SCRIPT.PURGATORIO_Q3_RESPOSTA_A);
  sections.push({ name: `PURGATORIO_Q3_RESPOSTA_${q3Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q3Resposta.choice === 'A' ? SCRIPT.PURGATORIO_Q3_RESPOSTA_B : SCRIPT.PURGATORIO_Q3_RESPOSTA_A });

  sections.push({ name: 'PURGATORIO_Q4_SETUP', segments: SCRIPT.PURGATORIO_Q4_SETUP });
  sections.push({ name: 'PURGATORIO_Q4_PERGUNTA', segments: SCRIPT.PURGATORIO_Q4_PERGUNTA });
  const q4Resposta = pickLongerResposta(SCRIPT.PURGATORIO_Q4_RESPOSTA_B, SCRIPT.PURGATORIO_Q4_RESPOSTA_A);
  sections.push({ name: `PURGATORIO_Q4_RESPOSTA_${q4Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q4Resposta.choice === 'A' ? SCRIPT.PURGATORIO_Q4_RESPOSTA_B : SCRIPT.PURGATORIO_Q4_RESPOSTA_A });

  // PARAISO
  sections.push({ name: 'PARAISO_INTRO', segments: SCRIPT.PARAISO_INTRO });
  sections.push({ name: 'PARAISO_Q5_SETUP', segments: SCRIPT.PARAISO_Q5_SETUP });
  sections.push({ name: 'PARAISO_Q5_PERGUNTA', segments: SCRIPT.PARAISO_Q5_PERGUNTA });
  const q5Resposta = pickLongerResposta(SCRIPT.PARAISO_Q5_RESPOSTA_B, SCRIPT.PARAISO_Q5_RESPOSTA_A);
  sections.push({ name: `PARAISO_Q5_RESPOSTA_${q5Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q5Resposta.choice === 'A' ? SCRIPT.PARAISO_Q5_RESPOSTA_B : SCRIPT.PARAISO_Q5_RESPOSTA_A });

  sections.push({ name: 'PARAISO_Q6_SETUP', segments: SCRIPT.PARAISO_Q6_SETUP });
  sections.push({ name: 'PARAISO_Q6_PERGUNTA', segments: SCRIPT.PARAISO_Q6_PERGUNTA });
  const q6Resposta = pickLongerResposta(SCRIPT.PARAISO_Q6_RESPOSTA_B, SCRIPT.PARAISO_Q6_RESPOSTA_A);
  sections.push({ name: `PARAISO_Q6_RESPOSTA_${q6Resposta.choice === 'A' ? 'B' : 'A'}`, segments: q6Resposta.choice === 'A' ? SCRIPT.PARAISO_Q6_RESPOSTA_B : SCRIPT.PARAISO_Q6_RESPOSTA_A });

  // Shortest devolucao
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

  let shortest = devolucoes[0];
  let shortestDuration = calculateSectionDuration(shortest.segments);

  for (const devolucao of devolucoes.slice(1)) {
    const duration = calculateSectionDuration(devolucao.segments);
    if (duration < shortestDuration) {
      shortest = devolucao;
      shortestDuration = duration;
    }
  }

  sections.push({ name: shortest.key, segments: shortest.segments });

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
  console.log('\n=== V4.0 TIMING VALIDATION ===\n');

  // Calculate max-path
  const maxPathSections = calculateMaxPath();

  console.log('MAX-PATH BREAKDOWN:');
  console.log('Section                          | Segs | Chars | Duration');
  console.log('----------------------------------------------------------------');

  let maxPathNarrationSeconds = 0;
  let maxPathSegmentCount = 0;
  let maxPathCharCount = 0;

  for (const section of maxPathSections) {
    const segCount = section.segments.length;
    const charCount = calculateSectionChars(section.segments);
    const duration = calculateSectionDuration(section.segments);

    maxPathNarrationSeconds += duration;
    maxPathSegmentCount += segCount;
    maxPathCharCount += charCount;

    console.log(
      `${section.name.padEnd(32)} | ${segCount.toString().padStart(4)} | ${charCount.toString().padStart(5)} | ${duration.toFixed(1).padStart(6)}s`
    );
  }

  const listenerResponseTime = 6 * 4; // 6 questions * 4 seconds each
  const maxPathTotal = maxPathNarrationSeconds + listenerResponseTime;

  console.log('----------------------------------------------------------------');
  console.log(`SUBTOTAL (narration)             | ${maxPathSegmentCount.toString().padStart(4)} | ${maxPathCharCount.toString().padStart(5)} | ${maxPathNarrationSeconds.toFixed(1).padStart(6)}s`);
  console.log(`Listener response time (6x4s)    |      |       |   24.0s`);
  console.log(`TOTAL MAX-PATH                   |      |       | ${maxPathTotal.toFixed(1).padStart(6)}s = ${formatDuration(maxPathTotal)} min`);

  // Calculate min-path
  console.log('\n\nMIN-PATH BREAKDOWN:');
  console.log('----------------------------------------------------------------');

  const minPathSections = calculateMinPath();
  let minPathNarrationSeconds = 0;

  for (const section of minPathSections) {
    const duration = calculateSectionDuration(section.segments);
    minPathNarrationSeconds += duration;
  }

  const minPathTotal = minPathNarrationSeconds + listenerResponseTime;
  console.log(`Narration                        |      |       | ${minPathNarrationSeconds.toFixed(1).padStart(6)}s`);
  console.log(`Listener response time           |      |       |   24.0s`);
  console.log(`TOTAL MIN-PATH                   |      |       | ${minPathTotal.toFixed(1).padStart(6)}s = ${formatDuration(minPathTotal)} min`);

  // Average path
  const avgPathTotal = (maxPathTotal + minPathTotal) / 2;
  console.log(`\nAVERAGE-PATH                     |      |       | ${avgPathTotal.toFixed(1).padStart(6)}s = ${formatDuration(avgPathTotal)} min`);

  // Target validation
  console.log('\n----------------------------------------------------------------');
  console.log('\nTARGET: 5-7 minutes (300-420 seconds)');

  const pass = maxPathTotal >= 300 && maxPathTotal <= 420;

  if (pass) {
    console.log(`STATUS: PASS (${formatDuration(maxPathTotal)} min)`);
    console.log('\nMax-path experience falls within target range.');
    process.exit(0);
  } else {
    console.log(`STATUS: FAIL (${formatDuration(maxPathTotal)} min)`);

    if (maxPathTotal > 420) {
      const excessSeconds = maxPathTotal - 420;
      console.log(`\nExceeds target by ${excessSeconds.toFixed(1)}s (${formatDuration(excessSeconds)} min).`);
      console.log('Recommendations:');
      console.log('  1. Trim devoluções from 3→2 segments');
      console.log('  2. Trim APRESENTACAO from 4→3 segments');
      console.log('  3. Compress pauseAfter values (>1000→1000, >800→800)');
      console.log('  4. Merge setups from 2→1 segment per question');
    } else {
      const shortfallSeconds = 300 - maxPathTotal;
      console.log(`\nFalls short by ${shortfallSeconds.toFixed(1)}s (${formatDuration(shortfallSeconds)} min).`);
      console.log('Recommendation: Restore segments from devoluções (add back insight segments).');
    }

    process.exit(1);
  }
}

main();
