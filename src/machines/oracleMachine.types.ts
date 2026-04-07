import type { ChoiceAB, ChoicePattern, NarrativePhase } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// v4 Types — Branching 6-8 Choice Flow
// ═══════════════════════════════════════════════════════════════════════════

/** Question identifiers for named choice tracking (8 base/Q2B/Q4B + 3 v6.0 branches: q1b, q5b, q6b) */
export type QuestionId = 'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q1b' | 'q5b' | 'q6b';

/** XState context for v4 Oracle state machine — branching 6-8 choices */
export interface OracleContextV4 {
  sessionId: string;
  choices: ChoicePattern;                    // Variable-length array for pattern matching (6-8 elements)
  choiceMap: Partial<Record<QuestionId, ChoiceAB>>;  // Named lookup for branch guards
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

/** All events the v4 Oracle state machine can receive. */
export type OracleEventV4 =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'TIMEOUT' }
  | { type: 'FALLBACK_USED' };

/** Initial context values for v4 */
export const INITIAL_CONTEXT_V4: OracleContextV4 = {
  sessionId: '',
  choices: [],
  choiceMap: {},
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO',
};

/**
 * Records a choice by question name. Appends to choices array AND sets choiceMap entry.
 * Returns an object suitable for XState assign().
 *
 * @param questionId - Named question identifier (q1, q2, q2b, q3, q4, q4b, q5, q6)
 * @param value - Choice value ('A' or 'B')
 */
export function recordChoice(questionId: QuestionId, value: 'A' | 'B') {
  return ({ context }: { context: OracleContextV4 }) => ({
    choices: [...context.choices, value],
    choiceMap: { ...context.choiceMap, [questionId]: value },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// v3 Types — Linear 6-Choice Flow (deprecated — consumers updated in Phase 29)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use OracleContextV4 instead.
 * XState context for v3 Oracle state machine — 6 linear choices
 */
export interface OracleContextV3 {
  sessionId: string;
  choices: ChoicePattern; // [ChoiceAB x6] — replaces choice1/choice2
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

/**
 * @deprecated Use OracleEventV4 instead.
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

/**
 * @deprecated Use INITIAL_CONTEXT_V4 instead.
 * Initial context values for v3
 */
export const INITIAL_CONTEXT_V3: OracleContextV3 = {
  sessionId: '',
  choices: [null, null, null, null, null, null],
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO',
};

/**
 * @deprecated Use recordChoice instead.
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
