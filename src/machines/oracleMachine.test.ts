import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import { oracleMachine } from './oracleMachine';
import type { OracleContextV4, QuestionId } from './oracleMachine.types';

/**
 * Oracle State Machine v4 Tests
 *
 * Tests the complete v4 machine with 6-8 branching choices and 8 devolucao archetypes.
 * Covers:
 * - Linear flow (no branches): All visitors go through Q1-Q6 in sequence
 * - Q2B branch (MACH-01): Conditional branch when Q1=A AND Q2=A
 * - Q4B branch (MACH-01): Conditional branch when Q3=A AND Q4=A
 * - Choice tracking (MACH-02): choices[] array + choiceMap for named lookups
 * - Devolucao routing (MACH-03): Pattern matching to 8 archetypes across all path lengths
 * - Timeouts with correct defaults (including Q2B/Q4B)
 * - Context reset behavior with V4 context shape
 * - 4 full path permutations: 6Q, 7Q+Q2B, 7Q+Q4B, 8Q
 */

type ActorType = ReturnType<typeof createActor<typeof oracleMachine>>;

// ═══════════════════════════════════════════════════════════════════════════
// Test Helpers — Non-branching (use CHOICE_B to avoid triggering Q2B/Q4B)
// ═══════════════════════════════════════════════════════════════════════════

/** Advance to Q1_AGUARDANDO */
function advanceToQ1Aguardando(actor: ActorType) {
  actor.send({ type: 'START' });
  actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q1_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_SETUP -> Q1_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_PERGUNTA -> Q1_AGUARDANDO
}

/** Advance to Q2_AGUARDANDO (Q1=A, no branch triggered yet) */
function advanceToQ2Aguardando(actor: ActorType) {
  advanceToQ1Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Q1=A
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_A -> Q2_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP -> Q2_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA -> Q2_AGUARDANDO
}

/**
 * Advance to Q3_AGUARDANDO (non-branching path).
 * Uses CHOICE_B for Q2 to avoid triggering Q2B branch.
 */
function advanceToQ3Aguardando(actor: ActorType) {
  advanceToQ2Aguardando(actor);
  actor.send({ type: 'CHOICE_B' }); // Q2=B -> no Q2B branch
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B -> PURGATORIO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q3_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_SETUP -> Q3_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_PERGUNTA -> Q3_AGUARDANDO
}

/**
 * Advance to Q4_AGUARDANDO (non-branching path).
 * Uses CHOICE_B for Q3 to avoid triggering Q4B branch later.
 */
function advanceToQ4Aguardando(actor: ActorType) {
  advanceToQ3Aguardando(actor);
  actor.send({ type: 'CHOICE_B' }); // Q3=B
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_RESPOSTA_B -> Q4_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_SETUP -> Q4_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_PERGUNTA -> Q4_AGUARDANDO
}

/**
 * Advance to Q5_AGUARDANDO (non-branching path).
 * Uses CHOICE_B for Q4 to avoid triggering Q4B branch.
 */
function advanceToQ5Aguardando(actor: ActorType) {
  advanceToQ4Aguardando(actor);
  actor.send({ type: 'CHOICE_B' }); // Q4=B -> no Q4B branch
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_B -> PARAISO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q5_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_SETUP -> Q5_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_PERGUNTA -> Q5_AGUARDANDO
}

/** Advance to Q6_AGUARDANDO (non-branching path) */
function advanceToQ6Aguardando(actor: ActorType) {
  advanceToQ5Aguardando(actor);
  actor.send({ type: 'CHOICE_B' }); // Q5=B
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_RESPOSTA_B -> Q6_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_SETUP -> Q6_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_PERGUNTA -> Q6_AGUARDANDO
}

// ═══════════════════════════════════════════════════════════════════════════
// runFullPathV4 — Branching-aware full path runner
// ═══════════════════════════════════════════════════════════════════════════

interface PathConfig {
  q1: 'A' | 'B';
  q2: 'A' | 'B';
  q2b?: 'A' | 'B';  // Only used if Q1=A AND Q2=A
  q3: 'A' | 'B';
  q4: 'A' | 'B';
  q4b?: 'A' | 'B';  // Only used if Q3=A AND Q4=A
  q5: 'A' | 'B';
  q6: 'A' | 'B';
}

/**
 * Runs a full path through the branching machine with specified choices.
 * Handles Q2B and Q4B branches automatically based on guard conditions.
 * Actor ends at a DEVOLUCAO_* state.
 */
function runFullPathV4(actor: ActorType, config: PathConfig) {
  actor.send({ type: 'START' });
  actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.INTRO

  // INFERNO: INTRO -> Q1
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q1_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_SETUP -> Q1_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_PERGUNTA -> Q1_AGUARDANDO
  actor.send({ type: config.q1 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA -> Q2_SETUP

  // Q2
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP -> Q2_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA -> Q2_AGUARDANDO
  actor.send({ type: config.q2 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA -> Q2B_SETUP (if branch) or PURGATORIO.INTRO

  // Q2B branch (if Q1=A AND Q2=A)
  const q2bTriggered = config.q1 === 'A' && config.q2 === 'A';
  if (q2bTriggered) {
    const q2bChoice = config.q2b ?? 'A';
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_SETUP -> Q2B_PERGUNTA
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_PERGUNTA -> Q2B_AGUARDANDO
    actor.send({ type: q2bChoice === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_RESPOSTA -> PURGATORIO.INTRO
  }

  // PURGATORIO: INTRO -> Q3
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q3_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_SETUP -> Q3_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_PERGUNTA -> Q3_AGUARDANDO
  actor.send({ type: config.q3 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q3_RESPOSTA -> Q4_SETUP

  // Q4
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_SETUP -> Q4_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_PERGUNTA -> Q4_AGUARDANDO
  actor.send({ type: config.q4 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA -> Q4B_SETUP (if branch) or PARAISO.INTRO

  // Q4B branch (if Q3=A AND Q4=A)
  const q4bTriggered = config.q3 === 'A' && config.q4 === 'A';
  if (q4bTriggered) {
    const q4bChoice = config.q4b ?? 'A';
    actor.send({ type: 'NARRATIVA_DONE' }); // Q4B_SETUP -> Q4B_PERGUNTA
    actor.send({ type: 'NARRATIVA_DONE' }); // Q4B_PERGUNTA -> Q4B_AGUARDANDO
    actor.send({ type: q4bChoice === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
    actor.send({ type: 'NARRATIVA_DONE' }); // Q4B_RESPOSTA -> PARAISO.INTRO
  }

  // PARAISO: INTRO -> Q5
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q5_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_SETUP -> Q5_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_PERGUNTA -> Q5_AGUARDANDO
  actor.send({ type: config.q5 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q5_RESPOSTA -> Q6_SETUP

  // Q6
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_SETUP -> Q6_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_PERGUNTA -> Q6_AGUARDANDO
  actor.send({ type: config.q6 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_RESPOSTA -> DEVOLUCAO -> DEVOLUCAO_*
}

describe('oracleMachine v4', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Linear flow (no branches)
  // ═════════════════════════════════════════════════════════════════════════

  describe('linear flow (no branches)', () => {
    it('transitions IDLE -> APRESENTACAO -> INFERNO.INTRO', () => {
      const actor = createActor(oracleMachine).start();
      expect(actor.getSnapshot().value).toBe('IDLE');

      actor.send({ type: 'START' });
      expect(actor.getSnapshot().value).toBe('APRESENTACAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'INTRO' });
      actor.stop();
    });

    it('completes INFERNO flow: INTRO -> Q1_SETUP -> Q1_PERGUNTA -> Q1_AGUARDANDO', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_AGUARDANDO' });
      actor.stop();
    });

    it('Q1 choice advances to Q2 (stays in INFERNO)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_A -> Q2_SETUP
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2_SETUP' });
      actor.stop();
    });

    it('Q2 CHOICE_B transitions to PURGATORIO (cross-phase, no branch)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B -> no branch
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B -> PURGATORIO.INTRO
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q4 CHOICE_B transitions to PARAISO (cross-phase, no branch)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ4Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q4=B -> no branch
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_B -> PARAISO.INTRO
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q6 resposta transitions to DEVOLUCAO (routing)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ6Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q6=B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q6_RESPOSTA_B -> DEVOLUCAO -> DEVOLUCAO_*

      const state = actor.getSnapshot().value;
      const ctx = actor.getSnapshot().context;

      expect(typeof state).toBe('string');
      if (typeof state === 'string') {
        expect(state.startsWith('DEVOLUCAO_')).toBe(true);
      }
      // 6 choices (all B, non-branching path)
      expect(ctx.choices).toHaveLength(6);
      actor.stop();
    });

    it('all visitors experience all 6 base questions with B choices (no branches)', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      const state = actor.getSnapshot().value;
      expect(typeof state === 'string' && state.startsWith('DEVOLUCAO_')).toBe(true);
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Q2B branch (MACH-01)
  // ═════════════════════════════════════════════════════════════════════════

  describe('Q2B branch (MACH-01)', () => {
    it('Q2B triggers when Q1=A AND Q2=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor); // Q1=A already
      actor.send({ type: 'CHOICE_A' }); // Q2=A
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_A -> Q2B_SETUP (guard passes)
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_SETUP' });
      actor.stop();
    });

    it('Q2B does NOT trigger when Q1=B', () => {
      const actor = createActor(oracleMachine).start();
      // Manually advance with Q1=B
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q1=B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_B -> Q2_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP -> Q2_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA -> Q2_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q2=A (but Q1=B, so no branch)
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_A -> PURGATORIO.INTRO (guard fails)
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q2B does NOT trigger when Q2=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor); // Q1=A
      actor.send({ type: 'CHOICE_B' }); // Q2=B -> no branch possible
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B -> PURGATORIO.INTRO directly
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q2B does NOT trigger when Q1=B and Q2=A (guard checks both)', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q1=B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q2=A, but Q1=B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_A -> PURGATORIO (not Q2B)
      expect(actor.getSnapshot().value).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q2B full flow: SETUP -> PERGUNTA -> AGUARDANDO -> CHOICE_A -> RESPOSTA -> PURGATORIO', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor); // Q1=A
      actor.send({ type: 'CHOICE_A' }); // Q2=A
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_A -> Q2B_SETUP
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_SETUP' });

      actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_SETUP -> Q2B_PERGUNTA
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_PERGUNTA' });

      actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_PERGUNTA -> Q2B_AGUARDANDO
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_AGUARDANDO' });

      actor.send({ type: 'CHOICE_A' }); // Q2B=A
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_RESPOSTA_A' });

      actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_RESPOSTA_A -> PURGATORIO.INTRO
      expect(actor.getSnapshot().value).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q2B CHOICE_B flows correctly to PURGATORIO', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor); // Q1=A
      actor.send({ type: 'CHOICE_A' }); // Q2=A -> triggers Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q2B=B
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_RESPOSTA_B' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      expect(actor.getSnapshot().value).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q2B timeout defaults to A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor); // Q1=A
      actor.send({ type: 'CHOICE_A' }); // Q2=A -> triggers Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_AGUARDANDO

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_TIMEOUT' });
      expect(actor.getSnapshot().context.choiceMap.q2b).toBe('A');

      actor.send({ type: 'NARRATIVA_DONE' }); // Q2B_TIMEOUT -> Q2B_RESPOSTA_A
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_RESPOSTA_A' });
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Q4B branch (MACH-01)
  // ═════════════════════════════════════════════════════════════════════════

  describe('Q4B branch (MACH-01)', () => {
    it('Q4B triggers when Q3=A AND Q4=A', () => {
      const actor = createActor(oracleMachine).start();
      // Use non-branching path to get to Q3
      advanceToQ2Aguardando(actor); // Q1=A
      actor.send({ type: 'CHOICE_B' }); // Q2=B -> no Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // Q3_RESPOSTA_A -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_A -> Q4B_SETUP (guard passes)
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_SETUP' });
      actor.stop();
    });

    it('Q4B does NOT trigger when Q3=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ3Aguardando(actor); // non-branching
      actor.send({ type: 'CHOICE_B' }); // Q3=B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q3_RESPOSTA_B -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A, but Q3=B so guard fails
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_A -> PARAISO (not Q4B)
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q4B does NOT trigger when Q4=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ3Aguardando(actor);
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q4=B -> Q4_RESPOSTA_B (no branch possible)
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_B -> PARAISO directly
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q4B does NOT trigger when Q3=B and Q4=A (guard checks both)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ3Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q3=B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A, but Q3=B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_A -> PARAISO (not Q4B)
      expect(actor.getSnapshot().value).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q4B full flow: SETUP -> PERGUNTA -> AGUARDANDO -> CHOICE_A -> RESPOSTA -> PARAISO', () => {
      const actor = createActor(oracleMachine).start();
      // Advance to Q4B using non-branching path for Q2
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B, no Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A -> triggers Q4B
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_A -> Q4B_SETUP
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_SETUP' });

      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_PERGUNTA
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_PERGUNTA' });

      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_AGUARDANDO
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_AGUARDANDO' });

      actor.send({ type: 'CHOICE_A' }); // Q4B=A
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_RESPOSTA_A' });

      actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO.INTRO
      expect(actor.getSnapshot().value).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q4B CHOICE_B flows correctly to PARAISO', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B, no Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A -> triggers Q4B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q4B=B
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_RESPOSTA_B' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO.INTRO
      expect(actor.getSnapshot().value).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q4B timeout defaults to A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B, no Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A -> triggers Q4B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_AGUARDANDO

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_TIMEOUT' });
      expect(actor.getSnapshot().context.choiceMap.q4b).toBe('A');

      actor.send({ type: 'NARRATIVA_DONE' }); // Q4B_TIMEOUT -> Q4B_RESPOSTA_A
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_RESPOSTA_A' });
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Choice tracking (MACH-02)
  // ═════════════════════════════════════════════════════════════════════════

  describe('choice tracking (MACH-02)', () => {
    it('starts with choices=[] and choiceMap={}', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toEqual([]);
      expect(ctx.choiceMap).toEqual({});
      actor.stop();
    });

    it('Q1 CHOICE_A sets choices[0]=A and choiceMap.q1=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toEqual(['A']);
      expect(ctx.choices).toHaveLength(1);
      expect(ctx.choiceMap.q1).toBe('A');
      actor.stop();
    });

    it('Q3 CHOICE_B sets choices[2]=B and choiceMap.q3=B (non-branching path)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ3Aguardando(actor); // Q1=A, Q2=B (no branch)
      actor.send({ type: 'CHOICE_B' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices[2]).toBe('B');
      expect(ctx.choiceMap.q3).toBe('B');
      actor.stop();
    });

    it('6-choice path (no branches): choices.length === 6', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toHaveLength(6);
      expect(ctx.choices).toEqual(['B', 'B', 'B', 'B', 'B', 'B']);
      actor.stop();
    });

    it('7-choice path (Q2B only): choices.length === 7, choiceMap has q2b', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toHaveLength(7);
      expect(ctx.choiceMap.q2b).toBe('A');
      expect(ctx.choiceMap.q4b).toBeUndefined();
      actor.stop();
    });

    it('7-choice path (Q4B only): choices.length === 7, choiceMap has q4b', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'A', q4: 'A', q4b: 'B', q5: 'B', q6: 'B' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toHaveLength(7);
      expect(ctx.choiceMap.q4b).toBe('B');
      expect(ctx.choiceMap.q2b).toBeUndefined();
      actor.stop();
    });

    it('8-choice path (both branches): choices.length === 8, choiceMap has q2b AND q4b', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toHaveLength(8);
      expect(ctx.choices).toEqual(['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']);
      expect(ctx.choiceMap.q2b).toBe('A');
      expect(ctx.choiceMap.q4b).toBe('A');
      actor.stop();
    });

    it('choiceMap has correct keys for 6-choice path', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'B', q3: 'A', q4: 'B', q5: 'A', q6: 'B' });
      const ctx = actor.getSnapshot().context;
      expect(Object.keys(ctx.choiceMap).sort()).toEqual(['q1', 'q2', 'q3', 'q4', 'q5', 'q6']);
      expect(ctx.choiceMap.q1).toBe('A');
      expect(ctx.choiceMap.q2).toBe('B');
      expect(ctx.choiceMap.q3).toBe('A');
      expect(ctx.choiceMap.q4).toBe('B');
      expect(ctx.choiceMap.q5).toBe('A');
      expect(ctx.choiceMap.q6).toBe('B');
      actor.stop();
    });

    it('choiceMap has correct keys for 8-choice path', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'B', q3: 'A', q4: 'A', q4b: 'B', q5: 'A', q6: 'A' });
      const ctx = actor.getSnapshot().context;
      expect(Object.keys(ctx.choiceMap).sort()).toEqual(['q1', 'q2', 'q2b', 'q3', 'q4', 'q4b', 'q5', 'q6']);
      expect(ctx.choiceMap.q2b).toBe('B');
      expect(ctx.choiceMap.q4b).toBe('B');
      actor.stop();
    });

    it('recordChoice is immutable (previous choices unchanged)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      actor.send({ type: 'CHOICE_A' }); // Q1=A
      const ctx1 = actor.getSnapshot().context;
      expect(ctx1.choices[0]).toBe('A');
      expect(ctx1.choices).toHaveLength(1);

      // Advance to Q2 and make choice
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_A -> Q2_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP -> Q2_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA -> Q2_AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // Q2=B

      const ctx2 = actor.getSnapshot().context;
      expect(ctx2.choices[0]).toBe('A'); // Q1 choice unchanged
      expect(ctx2.choices[1]).toBe('B'); // Q2 choice appended
      expect(ctx2.choices).toHaveLength(2);
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Devolucao routing (MACH-03)
  // ═════════════════════════════════════════════════════════════════════════

  describe('devolucao routing (MACH-03)', () => {
    it('all A (8 choices, both branches) -> DEVOLUCAO_DEPTH_SEEKER', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_DEPTH_SEEKER');
      expect(actor.getSnapshot().context.choices).toHaveLength(8);
      actor.stop();
    });

    it('all B (6 choices, no branches) -> DEVOLUCAO_SURFACE_KEEPER', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SURFACE_KEEPER');
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      actor.stop();
    });

    it('ABABAB (6 choices, no branches) -> DEVOLUCAO_MIRROR', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'B', q3: 'A', q4: 'B', q5: 'A', q6: 'B' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_MIRROR');
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      actor.stop();
    });

    it('SEEKER: 75% A (8 choices) -> DEVOLUCAO_SEEKER', () => {
      // q1=A, q2=A, q2b=A, q3=A, q4=A, q4b=B, q5=A, q6=A -> [A,A,A,A,A,B,A,A] = 7A/1B = 87.5%
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'B', q5: 'A', q6: 'A' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SEEKER');
      expect(actor.getSnapshot().context.choices).toHaveLength(8);
      actor.stop();
    });

    it('GUARDIAN: mostly B (6 choices) -> DEVOLUCAO_GUARDIAN', () => {
      // [B,B,B,B,B,A] = 5B/1A = 83.3% B (no branches: Q1=B, Q2=B)
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'A' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_GUARDIAN');
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      actor.stop();
    });

    it('PIVOT_LATE: A-heavy start, B-heavy end (7 choices with Q2B) -> DEVOLUCAO_PIVOT_LATE', () => {
      // q1=A, q2=A, q2b=A, q3=B, q4=B, q5=B, q6=B -> [A,A,A,B,B,B,B] = 3A/4B
      // firstThird(7//3=2): [A,A] 100% A >= 66%. lastThird(2): [B,B] 0% A <= 33%. bPercent=4/7=57% >= 40%
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_PIVOT_LATE');
      expect(actor.getSnapshot().context.choices).toHaveLength(7);
      actor.stop();
    });

    it('PIVOT_EARLY: B-heavy start, A-heavy end (6 choices) -> DEVOLUCAO_PIVOT_EARLY', () => {
      // [B,B,B,A,A,A] = 3B/3A, firstThird(2): [B,B] 0% A <= 33%. lastThird(2): [A,A] 100% A >= 66%. aPercent=50% >= 40%
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'A', q6: 'A' });
      // Wait - Q3=B, Q4=B, so no Q4B branch. Choices = [B,B,B,B,A,A]
      // firstThird(2): [B,B] 0% A. lastThird(2): [A,A] 100% A. aPercent=2/6=33% < 40%. Won't be PIVOT_EARLY!
      // Need more A's. Use BBBAAA: Q1=B, Q2=B(no branch), Q3=B, Q4=B(no branch), Q5=A, Q6=A
      // = [B,B,B,B,A,A] firstThird=[B,B] 0%, lastThird=[A,A] 100%, aPercent=2/6=33% < 40%. Nope.
      // Need BBBAAA with 6 choices where aPercent >= 40%:
      // [B,B,A,A,A,A] -> Q1=B, Q2=A(no branch bc Q1=B), Q3=A, Q4=A(triggers Q4B!)
      // Can't get [B,B,A,A,A,A] in 6 choices because Q3=A, Q4=A triggers Q4B.
      // Use 7 choices: Q1=B, Q2=B, Q3=A, Q4=A, Q4B=A, Q5=A, Q6=A -> [B,B,A,A,A,A,A] = 5A/2B
      // firstThird(7//3=2): [B,B] 0% A. lastThird(2): [A,A] 100% A. aPercent=5/7=71% >= 40%. PIVOT_EARLY!
      actor.stop();

      const actor2 = createActor(oracleMachine).start();
      runFullPathV4(actor2, { q1: 'B', q2: 'B', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      expect(actor2.getSnapshot().value).toBe('DEVOLUCAO_PIVOT_EARLY');
      expect(actor2.getSnapshot().context.choices).toHaveLength(7);
      actor2.stop();
    });

    it('CONTRADICTED: mixed 50/50 no clear pattern (6 choices) -> DEVOLUCAO_CONTRADICTED', () => {
      // [A,B,A,B,B,A] -> Q1=A, Q2=B(no branch), Q3=A, Q4=B(no branch), Q5=B, Q6=A
      // 3A/3B = 50/50. Not MIRROR (ABAB != alternation at pos 4-5: B,A after B). Check: A,B,A,B,B,A -> [A!=B, B!=A, A!=B, B==B] NOT alternating
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'B', q3: 'A', q4: 'B', q5: 'B', q6: 'A' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_CONTRADICTED');
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Timeouts
  // ═════════════════════════════════════════════════════════════════════════

  describe('timeouts', () => {
    it('Q1 25s timeout -> Q1_TIMEOUT, sets choices[0]=A and choiceMap.q1=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_TIMEOUT' });
      expect(actor.getSnapshot().context.choices[0]).toBe('A');
      expect(actor.getSnapshot().context.choiceMap.q1).toBe('A');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_RESPOSTA_A' });
      actor.stop();
    });

    it('Q6 25s timeout -> Q6_TIMEOUT, sets default B and choiceMap.q6=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ6Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ PARAISO: 'Q6_TIMEOUT' });
      // Q6 default is B. In non-branching path: choices[5]=B
      expect(actor.getSnapshot().context.choices[5]).toBe('B');
      expect(actor.getSnapshot().context.choiceMap.q6).toBe('B');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PARAISO: 'Q6_RESPOSTA_B' });
      actor.stop();
    });

    it('Q2 25s timeout assigns correct default A and choiceMap.q2=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().context.choices[1]).toBe('A');
      expect(actor.getSnapshot().context.choiceMap.q2).toBe('A');
      actor.stop();
    });

    it('Q2B timeout defaults to A and sets choiceMap.q2b=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_A' }); // Q2=A -> triggers Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2B_AGUARDANDO

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q2B_TIMEOUT' });
      expect(actor.getSnapshot().context.choiceMap.q2b).toBe('A');
      // choices array should have q2b at index 2 (after q1=A at 0, q2=A at 1)
      expect(actor.getSnapshot().context.choices[2]).toBe('A');
      actor.stop();
    });

    it('Q4B timeout defaults to A and sets choiceMap.q4b=A', () => {
      const actor = createActor(oracleMachine).start();
      // Navigate to Q4B
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B, no Q2B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q3=A
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // Q4=A -> triggers Q4B
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4B_AGUARDANDO

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO: 'Q4B_TIMEOUT' });
      expect(actor.getSnapshot().context.choiceMap.q4b).toBe('A');
      actor.stop();
    });

    it('timeout sets both choices array and choiceMap consistently', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);

      vi.advanceTimersByTime(25000); // Q1 timeout -> A
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toEqual(['A']);
      expect(ctx.choiceMap.q1).toBe('A');
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Context reset
  // ═════════════════════════════════════════════════════════════════════════

  describe('context reset', () => {
    it('FIM 5s -> IDLE, choices=[], choiceMap={}, sessionId="", fallbackCount=0', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // DEVOLUCAO -> ENCERRAMENTO
      actor.send({ type: 'NARRATIVA_DONE' }); // ENCERRAMENTO -> FIM

      expect(actor.getSnapshot().value).toBe('FIM');
      expect(actor.getSnapshot().context.choices.length).toBeGreaterThan(0); // Has choices before reset

      vi.advanceTimersByTime(5000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([]);
      expect(actor.getSnapshot().context.choiceMap).toEqual({});
      expect(actor.getSnapshot().context.sessionId).toBe('');
      expect(actor.getSnapshot().context.fallbackCount).toBe(0);
      actor.stop();
    });

    it('APRESENTACAO 300s inactivity -> IDLE with reset context', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      expect(actor.getSnapshot().value).toBe('APRESENTACAO');

      vi.advanceTimersByTime(300000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([]);
      expect(actor.getSnapshot().context.choiceMap).toEqual({});
      actor.stop();
    });

    it('INFERNO 300s inactivity -> IDLE with reset context', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO

      vi.advanceTimersByTime(300000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([]);
      expect(actor.getSnapshot().context.choiceMap).toEqual({});
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // currentPhase tracking
  // ═════════════════════════════════════════════════════════════════════════

  describe('currentPhase tracking', () => {
    it('APRESENTACAO entry sets "APRESENTACAO"', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');
      actor.stop();
    });

    it('INFERNO entry sets "INFERNO"', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('INFERNO');
      actor.stop();
    });

    it('PURGATORIO entry sets "PURGATORIO"', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B, no branch
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B -> PURGATORIO.INTRO
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');
      actor.stop();
    });

    it('PARAISO entry sets "PARAISO"', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ4Aguardando(actor);
      actor.send({ type: 'CHOICE_B' }); // Q4=B, no branch
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_B -> PARAISO.INTRO
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');
      actor.stop();
    });

    it('DEVOLUCAO entry sets "DEVOLUCAO"', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');
      actor.stop();
    });

    it('ENCERRAMENTO entry sets "ENCERRAMENTO"', () => {
      const actor = createActor(oracleMachine).start();
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // DEVOLUCAO -> ENCERRAMENTO
      expect(actor.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Full paths - all 4 permutations
  // ═════════════════════════════════════════════════════════════════════════

  describe('full paths', () => {
    it('Path 1: No branches (6Q) - all B end-to-end', () => {
      const actor = createActor(oracleMachine).start();
      expect(actor.getSnapshot().value).toBe('IDLE');

      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SURFACE_KEEPER');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');
      expect(actor.getSnapshot().context.choices).toHaveLength(6);
      expect(actor.getSnapshot().context.choices).toEqual(['B', 'B', 'B', 'B', 'B', 'B']);
      expect(Object.keys(actor.getSnapshot().context.choiceMap).sort()).toEqual(['q1', 'q2', 'q3', 'q4', 'q5', 'q6']);

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([]);
      expect(actor.getSnapshot().context.choiceMap).toEqual({});
      actor.stop();
    });

    it('Path 2: Q2B only (7Q) end-to-end', () => {
      const actor = createActor(oracleMachine).start();
      expect(actor.getSnapshot().value).toBe('IDLE');

      // Q1=A, Q2=A -> Q2B triggered, Q2B=A, Q3=B, Q4=B, Q5=B, Q6=B
      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });

      const state = actor.getSnapshot().value;
      expect(typeof state === 'string' && state.startsWith('DEVOLUCAO_')).toBe(true);
      expect(actor.getSnapshot().context.choices).toHaveLength(7);
      expect(actor.getSnapshot().context.choices).toEqual(['A', 'A', 'A', 'B', 'B', 'B', 'B']);
      expect(actor.getSnapshot().context.choiceMap.q2b).toBe('A');
      expect(actor.getSnapshot().context.choiceMap.q4b).toBeUndefined();

      actor.send({ type: 'NARRATIVA_DONE' }); // -> ENCERRAMENTO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> FIM
      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      actor.stop();
    });

    it('Path 3: Q4B only (7Q) end-to-end', () => {
      const actor = createActor(oracleMachine).start();
      expect(actor.getSnapshot().value).toBe('IDLE');

      // Q1=B, Q2=B -> no Q2B, Q3=A, Q4=A -> Q4B triggered, Q4B=B, Q5=A, Q6=A
      runFullPathV4(actor, { q1: 'B', q2: 'B', q3: 'A', q4: 'A', q4b: 'B', q5: 'A', q6: 'A' });

      const state = actor.getSnapshot().value;
      expect(typeof state === 'string' && state.startsWith('DEVOLUCAO_')).toBe(true);
      expect(actor.getSnapshot().context.choices).toHaveLength(7);
      expect(actor.getSnapshot().context.choices).toEqual(['B', 'B', 'A', 'A', 'B', 'A', 'A']);
      expect(actor.getSnapshot().context.choiceMap.q2b).toBeUndefined();
      expect(actor.getSnapshot().context.choiceMap.q4b).toBe('B');

      actor.send({ type: 'NARRATIVA_DONE' }); // -> ENCERRAMENTO
      actor.send({ type: 'NARRATIVA_DONE' }); // -> FIM
      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      actor.stop();
    });

    it('Path 4: Both branches (8Q) - all A end-to-end', () => {
      const actor = createActor(oracleMachine).start();
      expect(actor.getSnapshot().value).toBe('IDLE');

      runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'A', q4: 'A', q4b: 'A', q5: 'A', q6: 'A' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_DEPTH_SEEKER');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');
      expect(actor.getSnapshot().context.choices).toHaveLength(8);
      expect(actor.getSnapshot().context.choices).toEqual(['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']);
      expect(actor.getSnapshot().context.choiceMap.q2b).toBe('A');
      expect(actor.getSnapshot().context.choiceMap.q4b).toBe('A');
      expect(Object.keys(actor.getSnapshot().context.choiceMap).sort()).toEqual(['q1', 'q2', 'q2b', 'q3', 'q4', 'q4b', 'q5', 'q6']);

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([]);
      expect(actor.getSnapshot().context.choiceMap).toEqual({});
      actor.stop();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Q1B Branch (Phase 31, BR-01) — contra-fobico
  // Triggers when q1=B (procurou a porta) AND q2=B (ficou olhando a coisa)
  // Mirrors the Q2B pattern but branches FROM Q2_RESPOSTA_B with opposite guard
  // ═════════════════════════════════════════════════════════════════════════

  describe('Q1B Branch (Phase 31, BR-01)', () => {
    /**
     * Advance to Q2_AGUARDANDO with q1='B' (so Q1B can trigger when q2='B' is sent next).
     * This is the contra-fobico path setup — visitor procurou a porta then encontra a coisa.
     */
    function advanceToQ2AguardandoQ1B(actor: ActorType) {
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.INTRO
      actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q1_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_SETUP -> Q1_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_PERGUNTA -> Q1_AGUARDANDO
      actor.send({ type: 'CHOICE_B' });        // Q1=B (procurar a porta)
      actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_B -> Q2_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP -> Q2_PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA -> Q2_AGUARDANDO
    }

    it('triggers Q1B branch when q1=B AND q2=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' }); // Q2=B (ficar olhando)
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B → Q1B_SETUP (guard passes)
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_SETUP' })).toBe(true);
      expect(actor.getSnapshot().context.choiceMap.q1).toBe('B');
      expect(actor.getSnapshot().context.choiceMap.q2).toBe('B');
      actor.stop();
    });

    it('SKIPS Q1B when q1=A and q2=B (only one B — guard fails)', () => {
      const actor = createActor(oracleMachine).start();
      // Walk through with q1=A first
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });        // Q1=A
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });        // Q2=B
      actor.send({ type: 'NARRATIVA_DONE' });  // Q2_RESPOSTA_B → PURGATORIO (Q1B guard fails)
      expect(actor.getSnapshot().matches('PURGATORIO')).toBe(true);
      actor.stop();
    });

    it('SKIPS Q1B when q1=B and q2=A (only one B — guard fails, but Q2B also fails since q1!==A)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_A' });        // Q2=A
      actor.send({ type: 'NARRATIVA_DONE' });  // Q2_RESPOSTA_A → PURGATORIO (Q2B needs q1=A, fails)
      expect(actor.getSnapshot().matches('PURGATORIO')).toBe(true);
      actor.stop();
    });

    it('Q1B_SETUP → Q1B_PERGUNTA → Q1B_AGUARDANDO transition chain', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' }); // → Q1B_SETUP
      actor.send({ type: 'NARRATIVA_DONE' }); // → Q1B_PERGUNTA
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_PERGUNTA' })).toBe(true);
      actor.send({ type: 'NARRATIVA_DONE' }); // → Q1B_AGUARDANDO
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_AGUARDANDO' })).toBe(true);
      actor.stop();
    });

    it('Q1B_AGUARDANDO + CHOICE_A → Q1B_RESPOSTA_A and choiceMap.q1b=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_RESPOSTA_A' })).toBe(true);
      expect(actor.getSnapshot().context.choiceMap.q1b).toBe('A');
      expect(actor.getSnapshot().context.choices).toEqual(['B', 'B', 'A']);
      actor.stop();
    });

    it('Q1B_AGUARDANDO + CHOICE_B → Q1B_RESPOSTA_B and choiceMap.q1b=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_RESPOSTA_B' })).toBe(true);
      expect(actor.getSnapshot().context.choiceMap.q1b).toBe('B');
      expect(actor.getSnapshot().context.choices).toEqual(['B', 'B', 'B']);
      actor.stop();
    });

    it('Q1B_AGUARDANDO timeout → Q1B_TIMEOUT with default q1b=A', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_TIMEOUT' })).toBe(true);
      expect(actor.getSnapshot().context.choiceMap.q1b).toBe('A');
      actor.stop();
    });

    it('Q1B_TIMEOUT → Q1B_RESPOSTA_A on NARRATIVA_DONE', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      vi.advanceTimersByTime(25000);
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_RESPOSTA_A' })).toBe(true);
      actor.stop();
    });

    it('Q1B_RESPOSTA_A → PURGATORIO on NARRATIVA_DONE (rejoin main path)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().matches('PURGATORIO')).toBe(true);
      actor.stop();
    });

    it('Q1B_RESPOSTA_B → PURGATORIO on NARRATIVA_DONE (rejoin main path)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2AguardandoQ1B(actor);
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().matches('PURGATORIO')).toBe(true);
      actor.stop();
    });

    it('Q2B regression: q1=A AND q2=A still triggers Q2B (Q1B addition did not break Q2B)', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().matches({ INFERNO: 'Q2B_SETUP' })).toBe(true);
      actor.stop();
    });
  });
});
