import type { ChoiceAB, ChoicePattern, DevolucaoArchetype } from '@/types';

/**
 * Interface for context shape used in pattern matching guards.
 * This allows guards to work before OracleContextV3 is fully imported.
 */
interface PatternContext {
  choices: ChoicePattern;
}

/**
 * Determines the devolução archetype based on a variable-length choice pattern (6-10 choices).
 * Uses percentage-based thresholds to classify the visitor's decision pattern.
 * Supports v4.0 branching (6 base questions + 0-4 conditional branch questions).
 *
 * Algorithm:
 * 1. Filter nulls — must have 6+ complete choices
 * 2. Check MIRROR (perfect alternation)
 * 3. Check DEPTH_SEEKER (100% A)
 * 4. Check SURFACE_KEEPER (100% B)
 * 5. Check PIVOT (direction change between thirds)
 * 6. Check SEEKER (66%+ A)
 * 7. Check GUARDIAN (66%+ B)
 * 8. Default: CONTRADICTED
 *
 * @param choices - Variable-length array of choices (6-10 elements)
 * @returns Archetype classification
 */
export function determineArchetype(choices: ChoicePattern): DevolucaoArchetype {
  // Filter out nulls
  const validChoices = choices.filter((c): c is 'A' | 'B' => c !== null);

  // Must have at least 6 choices for any archetype except CONTRADICTED
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
  const total = validChoices.length;

  // Calculate percentages
  const aPercent = aCount / total;
  const bPercent = bCount / total;

  // Check DEPTH_SEEKER: all A (100%)
  if (aPercent === 1) {
    return 'DEPTH_SEEKER';
  }

  // Check SURFACE_KEEPER: all B (100%)
  if (bPercent === 1) {
    return 'SURFACE_KEEPER';
  }

  // Check PIVOT patterns: split into thirds for variable-length arrays
  // PIVOT requires both a clear directional change AND enough representation of both choices
  // to distinguish from lopsided SEEKER/GUARDIAN patterns with trailing opposites
  const oneThird = Math.floor(total / 3);
  const firstThird = validChoices.slice(0, oneThird);
  const lastThird = validChoices.slice(-oneThird);
  const firstThirdA = firstThird.filter(c => c === 'A').length;
  const lastThirdA = lastThird.filter(c => c === 'A').length;
  const firstThirdPercent = firstThirdA / firstThird.length;
  const lastThirdPercent = lastThirdA / lastThird.length;

  // PIVOT_LATE: starts A-heavy (>=66%), ends B-heavy (<=33%)
  // Requires enough B choices overall (>=40%) to be a true pivot, not just trailing Bs
  if (firstThirdPercent >= 0.66 && lastThirdPercent <= 0.33 && bPercent >= 0.4) {
    return 'PIVOT_LATE';
  }

  // PIVOT_EARLY: starts B-heavy (<=33%), ends A-heavy (>=66%)
  // Requires enough A choices overall (>=40%) to be a true pivot, not just trailing As
  if (firstThirdPercent <= 0.33 && lastThirdPercent >= 0.66 && aPercent >= 0.4) {
    return 'PIVOT_EARLY';
  }

  // Check SEEKER: 66%+ A choices (no pivot detected)
  if (aPercent >= 0.66) {
    return 'SEEKER';
  }

  // Check GUARDIAN: 66%+ B choices (no pivot detected)
  if (bPercent >= 0.66) {
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
