import type { Choice1, Choice2, NarrativePhase } from '@/types';

/** XState context for the Oracle state machine (per PRD Section 6) */
export interface OracleContext {
  sessionId: string;
  choice1: Choice1;
  choice2: Choice2;
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

/** All events the Oracle state machine can receive */
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

/** Initial context values */
export const INITIAL_CONTEXT: OracleContext = {
  sessionId: '',
  choice1: null,
  choice2: null,
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO',
};
