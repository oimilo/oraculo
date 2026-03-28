import type { ChoiceAB, ChoicePattern, DevolucaoArchetype } from '@/types';

/**
 * Interface for context shape used in pattern matching guards.
 * This allows guards to work before OracleContextV3 is fully imported.
 */
interface PatternContext {
  choices: ChoicePattern;
}

/**
 * Determines the devolução archetype based on a 6-choice pattern.
 * Analyzes the shape of choices to classify the visitor's decision pattern.
 *
 * Algorithm:
 * 1. Filter nulls — must have 6 complete choices
 * 2. Check MIRROR (perfect alternation)
 * 3. Check DEPTH_SEEKER (all A)
 * 4. Check SURFACE_KEEPER (all B)
 * 5. Check PIVOT (direction change between halves)
 * 6. Check SEEKER (mostly A, 4+)
 * 7. Check GUARDIAN (mostly B, 4+)
 * 8. Default: CONTRADICTED
 *
 * @param choices - 6-element tuple of choices
 * @returns Archetype classification
 */
export function determineArchetype(choices: ChoicePattern): DevolucaoArchetype {
  // Filter out nulls
  const validChoices = choices.filter((c): c is 'A' | 'B' => c !== null);

  // Must have all 6 choices for any archetype except CONTRADICTED
  if (validChoices.length < 6) {
    return 'CONTRADICTED';
  }

  // Check MIRROR: perfect alternation (every choice differs from its predecessor)
  let isMirror = true;
  for (let i = 1; i < validChoices.length; i++) {
    if (validChoices[i] === validChoices[i - 1]) {
      isMirror = false;
      break;
    }
  }
  if (isMirror) {
    return 'MIRROR';
  }

  // Count A and B choices
  const aCount = validChoices.filter(c => c === 'A').length;
  const bCount = validChoices.filter(c => c === 'B').length;

  // Check DEPTH_SEEKER: all A
  if (aCount === 6) {
    return 'DEPTH_SEEKER';
  }

  // Check SURFACE_KEEPER: all B
  if (bCount === 6) {
    return 'SURFACE_KEEPER';
  }

  // Check PIVOT patterns: split into halves and detect clear direction change
  // PIVOT shows intentional direction shift between halves
  const firstHalf = validChoices.slice(0, 3);
  const secondHalf = validChoices.slice(3, 6);
  const firstHalfA = firstHalf.filter(c => c === 'A').length;
  const secondHalfA = secondHalf.filter(c => c === 'A').length;

  // PIVOT_LATE: starts with A, pivots to B
  // Requires: first half majority A (>=2), AND second half strong B (all B = 0A)
  // Examples: AAABBB (3A → 0A), AABBBB (2A → 0A)
  // Not AAABBA (3A → 1A with final A) - that's SEEKER with variation
  if (firstHalfA >= 2 && secondHalfA === 0) {
    return 'PIVOT_LATE';
  }

  // PIVOT_EARLY: starts with B, pivots to A
  // Requires: first half majority B (<=1 A), AND second half strong A (all A = 3A)
  // Examples: BBBAAA (0A → 3A), BBAAAA (0A → 3A at position 2)
  // Not BBBAAB (0A → 2A with final B) - that's GUARDIAN with variation
  if (firstHalfA <= 1 && secondHalfA === 3) {
    return 'PIVOT_EARLY';
  }

  // Check SEEKER: mostly A (4+ A choices), no pivot
  if (aCount >= 4) {
    return 'SEEKER';
  }

  // Check GUARDIAN: mostly B (4+ B choices), no pivot
  if (bCount >= 4) {
    return 'GUARDIAN';
  }

  // Default: CONTRADICTED (balanced but no clear pattern)
  return 'CONTRADICTED';
}

/**
 * Creates an XState guard function that checks if the context's choice pattern
 * matches a specific archetype.
 *
 * @param archetype - The archetype to check for
 * @returns XState-compatible guard function
 */
export function createArchetypeGuard(
  archetype: DevolucaoArchetype
): ({ context }: { context: PatternContext }) => boolean {
  return ({ context }) => determineArchetype(context.choices) === archetype;
}

/**
 * Pre-built archetype guards for XState machine setup.
 * Each guard checks if the visitor's choice pattern matches a specific archetype.
 *
 * Usage in XState machine:
 * ```typescript
 * import { ARCHETYPE_GUARDS } from './guards/patternMatching';
 *
 * setup({
 *   guards: ARCHETYPE_GUARDS
 * }).createMachine({
 *   // ...
 *   on: {
 *     NARRATIVA_DONE: [
 *       { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
 *       { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
 *       // ...
 *     ]
 *   }
 * });
 * ```
 */
export const ARCHETYPE_GUARDS = {
  isSeeker: createArchetypeGuard('SEEKER'),
  isGuardian: createArchetypeGuard('GUARDIAN'),
  isContradicted: createArchetypeGuard('CONTRADICTED'),
  isPivotEarly: createArchetypeGuard('PIVOT_EARLY'),
  isPivotLate: createArchetypeGuard('PIVOT_LATE'),
  isDepthSeeker: createArchetypeGuard('DEPTH_SEEKER'),
  isSurfaceKeeper: createArchetypeGuard('SURFACE_KEEPER'),
  isMirror: createArchetypeGuard('MIRROR'),
} as const;
