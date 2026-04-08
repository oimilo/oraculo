import type { ChoiceAB, ChoicePattern, DevolucaoArchetype } from '@/types';

/**
 * Phase 34 — local ChoiceMap shape mirroring oracleMachine.types.ts.
 * Defined locally (not imported) to avoid a cross-package coupling that
 * would force patternMatching.ts to depend on the full machine types module.
 */
type ChoiceMap = Partial<Record<'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q1b' | 'q5b' | 'q6b', ChoiceAB>>;

/**
 * Interface for context shape used in pattern matching guards.
 * - choices: positional array (used by 8 baseline guards via determineArchetype)
 * - choiceMap: named lookup (used by Phase 34 guards isContraFobico + isPortador)
 *
 * choiceMap is OPTIONAL — baseline guards never read it, and Phase 34 guards
 * return false safely when undefined.
 */
interface PatternContext {
  choices: ChoicePattern;
  choiceMap?: ChoiceMap;
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
 * Phase 34 — AR-02: CONTRA_FOBICO archetype guard.
 *
 * Triggers when visitor procurou a porta (q1='B'), ficou olhando o que repugna (q2='B'),
 * E atravessou o vazio na ramificação Q1B (q1b='A'). The contra-phobic gesture: courage
 * walking toward what threatens it.
 *
 * Reads context.choiceMap (named lookup), NOT context.choices (positional). This is
 * intentional — the 8 baseline archetypes use positional logic via determineArchetype()
 * which cannot distinguish q1b from q2b from q4b. Phase 34 guards live alongside the
 * baseline guards but read from a different field (choiceMap), so they cannot interfere
 * with positional logic (POL-02 deeper invariant preserved).
 *
 * Returns false safely when choiceMap is undefined or any required field is missing.
 */
export function isContraFobico({ context }: { context: PatternContext }): boolean {
  if (!context.choiceMap) return false;
  return (
    context.choiceMap.q1 === 'B' &&
    context.choiceMap.q2 === 'B' &&
    context.choiceMap.q1b === 'A'
  );
}

/**
 * Phase 34 — AR-03: PORTADOR archetype guard.
 *
 * Triggers when visitor lembrou tudo (q4='A'), carrega a pergunta (q5='A'), E fundiu
 * memória e pergunta numa só carga na ramificação Q5B (q5b='A'). The carrier gesture:
 * the question as treasure, not problem.
 *
 * Same field-isolation rationale as isContraFobico — reads choiceMap (named lookup)
 * not choices (positional). Cannot interfere with the 8 baseline archetypes.
 */
export function isPortador({ context }: { context: PatternContext }): boolean {
  if (!context.choiceMap) return false;
  return (
    context.choiceMap.q4 === 'A' &&
    context.choiceMap.q5 === 'A' &&
    context.choiceMap.q5b === 'A'
  );
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
  isContraFobico,    // Phase 34, AR-02 — reads choiceMap.q1b (NOT positional)
  isPortador,        // Phase 34, AR-03 — reads choiceMap.q5b (NOT positional)
} as const;
