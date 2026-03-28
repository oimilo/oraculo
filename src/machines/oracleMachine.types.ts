import type { ChoiceAB, ChoicePattern, NarrativePhase } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// v3 Types — Linear 6-Choice Flow
// ═══════════════════════════════════════════════════════════════════════════

/** XState context for v3 Oracle state machine — 6 linear choices */
export interface OracleContextV3 {
  sessionId: string;
  choices: ChoicePattern; // [ChoiceAB x6] — replaces choice1/choice2
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

/**
 * All events the v3 Oracle state machine can receive.
 * Simplified to use generic CHOICE_A/CHOICE_B for all 6 questions.
 */
export type OracleEventV3 =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'TIMEOUT' }
  | { type: 'FALLBACK_USED' };

/** Initial context values for v3 */
export const INITIAL_CONTEXT_V3: OracleContextV3 = {
  sessionId: '',
  choices: [null, null, null, null, null, null],
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO',
};

/**
 * Helper to update a specific choice index immutably.
 * Returns an object suitable for XState assign().
 *
 * Usage in XState machine:
 * ```typescript
 * on: {
 *   CHOICE_A: {
 *     actions: assign(updateChoice(0, 'A'))
 *   }
 * }
 * ```
 *
 * @param index - Choice index (0-5)
 * @param value - Choice value ('A' or 'B')
 * @returns Updater function for XState assign()
 */
export function updateChoice(index: number, value: 'A' | 'B') {
  return ({ context }: { context: OracleContextV3 }) => {
    const newChoices = [...context.choices] as ChoicePattern;
    newChoices[index] = value;
    return { choices: newChoices };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// v2 Backward Compatibility (deprecated — removed in Plan 02)
// ═══════════════════════════════════════════════════════════════════════════

/** @deprecated Use OracleContextV3 */
export type OracleContext = OracleContextV3 & {
  // Satisfy v2 machine expectations while using v3 structure
  choice1?: 'A' | 'B' | null;
  choice2?: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;
};

/**
 * @deprecated Use OracleEventV3
 * Extended to include v2-specific events for backward compatibility
 */
export type OracleEvent =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'CHOICE_FICAR' }
  | { type: 'CHOICE_EMBORA' }
  | { type: 'CHOICE_PISAR' }
  | { type: 'CHOICE_CONTORNAR' }
  | { type: 'TIMEOUT' }
  | { type: 'FALLBACK_USED' };

/**
 * @deprecated Use INITIAL_CONTEXT_V3
 * Cast to satisfy v2 machine type expectations
 */
export const INITIAL_CONTEXT: OracleContext = {
  ...INITIAL_CONTEXT_V3,
  choice1: null,
  choice2: null,
};
