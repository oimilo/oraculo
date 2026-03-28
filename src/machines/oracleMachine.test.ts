import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import { oracleMachine } from './oracleMachine';
import type { OracleContextV3 } from './oracleMachine.types';

/**
 * Oracle State Machine v3 Tests
 *
 * Tests the complete v3 machine with 6 linear choices and 8 devolucao archetypes.
 * Covers:
 * - Linear flow (SMV3-01): All visitors go through Q1-Q6 in sequence
 * - Choice array tracking (SMV3-02): Choices stored at correct indices
 * - Devolucao routing (SMV3-03): Pattern matching to 8 archetypes
 * - Timeouts with correct defaults
 * - Context reset behavior
 * - currentPhase tracking
 */

// Helper to advance to Q1 AGUARDANDO state
function advanceToQ1Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  actor.send({ type: 'START' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_AGUARDANDO
}

// Helper to advance to Q2 AGUARDANDO state
function advanceToQ2Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  advanceToQ1Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Make Q1 choice
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_AGUARDANDO
}

// Helper to advance to Q3 AGUARDANDO state
function advanceToQ3Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  advanceToQ2Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Make Q2 choice
  actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
}

// Helper to advance to Q4 AGUARDANDO state
function advanceToQ4Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  advanceToQ3Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Make Q3 choice
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
}

// Helper to advance to Q5 AGUARDANDO state
function advanceToQ5Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  advanceToQ4Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Make Q4 choice
  actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_AGUARDANDO
}

// Helper to advance to Q6 AGUARDANDO state
function advanceToQ6Aguardando(actor: ReturnType<typeof createActor<typeof oracleMachine>>) {
  advanceToQ5Aguardando(actor);
  actor.send({ type: 'CHOICE_A' }); // Make Q5 choice
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_AGUARDANDO
}

// Helper to run full path with specified choices to DEVOLUCAO
function runFullPath(
  actor: ReturnType<typeof createActor<typeof oracleMachine>>,
  choices: ('A' | 'B')[]
) {
  if (choices.length !== 6) {
    throw new Error('runFullPath requires exactly 6 choices');
  }

  actor.send({ type: 'START' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO

  // Q1
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_AGUARDANDO
  actor.send({ type: choices[0] === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q1_RESPOSTA

  // Q2
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_AGUARDANDO
  actor.send({ type: choices[1] === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q2_RESPOSTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO

  // Q3
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_AGUARDANDO
  actor.send({ type: choices[2] === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q3_RESPOSTA

  // Q4
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_AGUARDANDO
  actor.send({ type: choices[3] === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q4_RESPOSTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO.INTRO

  // Q5
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_AGUARDANDO
  actor.send({ type: choices[4] === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q5_RESPOSTA

  // Q6
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // -> Q6_AGUARDANDO
  actor.send({ type: choices[5] === 'A' ? 'CHOICE_A' : 'CHOICE_B' }); // -> Q6_RESPOSTA_A or Q6_RESPOSTA_B
  actor.send({ type: 'NARRATIVA_DONE' }); // Q6_RESPOSTA -> DEVOLUCAO, which immediately routes via always to DEVOLUCAO_*
  // Now at a DEVOLUCAO_* state (e.g., DEVOLUCAO_DEPTH_SEEKER) - do NOT send another NARRATIVA_DONE
}

describe('oracleMachine v3', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('linear flow (SMV3-01)', () => {
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

    it('Q2 resposta transitions to PURGATORIO (cross-phase)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_A -> PURGATORIO.INTRO
      // PURGATORIO hierarchical state will be at INTRO initially
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PURGATORIO');
      actor.stop();
    });

    it('Q4 resposta transitions to PARAISO (cross-phase)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ4Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // Q4_RESPOSTA_A -> PARAISO.INTRO
      // PARAISO hierarchical state will be at INTRO initially
      const state = actor.getSnapshot().value;
      expect(state).toHaveProperty('PARAISO');
      actor.stop();
    });

    it('Q6 resposta transitions to DEVOLUCAO (routing)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ6Aguardando(actor);
      // Note: advanceToQ6Aguardando makes 5 choices (Q1-Q5), so choices array has 5 values already

      actor.send({ type: 'CHOICE_A' }); // Q6_AGUARDANDO -> Q6_RESPOSTA_A
      actor.send({ type: 'NARRATIVA_DONE' }); // Q6_RESPOSTA_A -> DEVOLUCAO (auto-routed to archetype)

      const state = actor.getSnapshot().value;
      const ctx = actor.getSnapshot().context;

      // Should be one of the 8 devolucao states (string value)
      expect(typeof state).toBe('string');
      if (typeof state === 'string') {
        expect(state.startsWith('DEVOLUCAO_')).toBe(true);
      }
      // All 6 choices should be recorded now
      expect(ctx.choices.filter(c => c !== null)).toHaveLength(6);
      actor.stop();
    });

    it('all visitors experience all 6 questions regardless of choices', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'B', 'A', 'B', 'A', 'B']);
      // If we're at a DEVOLUCAO state, we went through all 6 questions
      const state = actor.getSnapshot().value;
      expect(typeof state === 'string' && state.startsWith('DEVOLUCAO_')).toBe(true);
      actor.stop();
    });
  });

  describe('choice array tracking (SMV3-02)', () => {
    it('starts with choices=[null x6]', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toEqual([null, null, null, null, null, null]);
      actor.stop();
    });

    it('Q1 CHOICE_A sets choices[0]=A, rest still null', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices[0]).toBe('A');
      expect(ctx.choices[1]).toBeNull();
      expect(ctx.choices[2]).toBeNull();
      expect(ctx.choices[3]).toBeNull();
      expect(ctx.choices[4]).toBeNull();
      expect(ctx.choices[5]).toBeNull();
      actor.stop();
    });

    it('Q3 CHOICE_B sets choices[2]=B', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ3Aguardando(actor);
      actor.send({ type: 'CHOICE_B' });
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices[2]).toBe('B');
      actor.stop();
    });

    it('after full path, choices matches expected array', () => {
      const actor = createActor(oracleMachine).start();
      const expectedChoices: ('A' | 'B')[] = ['A', 'B', 'A', 'B', 'A', 'B'];
      runFullPath(actor, expectedChoices);
      const ctx = actor.getSnapshot().context;
      expect(ctx.choices).toEqual(expectedChoices);
      actor.stop();
    });

    it('updateChoice is immutable (previous indices unchanged)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      const ctx1 = actor.getSnapshot().context;
      expect(ctx1.choices[0]).toBe('A');

      // Advance to Q2 and make choice
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });

      const ctx2 = actor.getSnapshot().context;
      expect(ctx2.choices[0]).toBe('A'); // Q1 choice unchanged
      expect(ctx2.choices[1]).toBe('B'); // Q2 choice set
      actor.stop();
    });
  });

  describe('devolucao routing (SMV3-03)', () => {
    it('all A -> DEVOLUCAO_DEPTH_SEEKER', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'A', 'A', 'A']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_DEPTH_SEEKER');
      actor.stop();
    });

    it('all B -> DEVOLUCAO_SURFACE_KEEPER', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['B', 'B', 'B', 'B', 'B', 'B']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SURFACE_KEEPER');
      actor.stop();
    });

    it('alternating ABABAB -> DEVOLUCAO_MIRROR', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'B', 'A', 'B', 'A', 'B']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_MIRROR');
      actor.stop();
    });

    it('AAABBB -> DEVOLUCAO_PIVOT_LATE', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'B', 'B', 'B']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_PIVOT_LATE');
      actor.stop();
    });

    it('BBBAAA -> DEVOLUCAO_PIVOT_EARLY', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['B', 'B', 'B', 'A', 'A', 'A']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_PIVOT_EARLY');
      actor.stop();
    });

    it('AAABBA -> DEVOLUCAO_SEEKER (5A, 1B)', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'B', 'B', 'A']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SEEKER');
      actor.stop();
    });

    it('BBBABA -> DEVOLUCAO_GUARDIAN (4B, 2A)', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['B', 'B', 'B', 'A', 'B', 'A']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_GUARDIAN');
      actor.stop();
    });

    it('mixed 3A/3B no pattern -> DEVOLUCAO_CONTRADICTED', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'B', 'B', 'A', 'B']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_CONTRADICTED');
      actor.stop();
    });
  });

  describe('timeouts', () => {
    it('Q1 25s timeout -> Q1_TIMEOUT -> NARRATIVA_DONE -> Q1_RESPOSTA_A (default A)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ1Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_TIMEOUT' });
      expect(actor.getSnapshot().context.choices[0]).toBe('A');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_RESPOSTA_A' });
      actor.stop();
    });

    it('Q6 25s timeout -> Q6_TIMEOUT -> NARRATIVA_DONE -> Q6_RESPOSTA_B (default B)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ6Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().value).toEqual({ PARAISO: 'Q6_TIMEOUT' });
      expect(actor.getSnapshot().context.choices[5]).toBe('B');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PARAISO: 'Q6_RESPOSTA_B' });
      actor.stop();
    });

    it('timeout assigns correct choice index (Q2 at index 1)', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ2Aguardando(actor);

      vi.advanceTimersByTime(25000);
      expect(actor.getSnapshot().context.choices[1]).toBe('A');
      actor.stop();
    });
  });

  describe('context reset', () => {
    it('FIM 5s -> IDLE, choices=[null x6], sessionId="", fallbackCount=0', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'A', 'A', 'A']);
      actor.send({ type: 'NARRATIVA_DONE' }); // DEVOLUCAO -> ENCERRAMENTO
      actor.send({ type: 'NARRATIVA_DONE' }); // ENCERRAMENTO -> FIM

      expect(actor.getSnapshot().value).toBe('FIM');
      expect(actor.getSnapshot().context.choices.some(c => c !== null)).toBe(true); // Has choices before reset

      vi.advanceTimersByTime(5000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([null, null, null, null, null, null]);
      expect(actor.getSnapshot().context.sessionId).toBe('');
      expect(actor.getSnapshot().context.fallbackCount).toBe(0);
      actor.stop();
    });

    it('APRESENTACAO 120s inactivity -> IDLE', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      expect(actor.getSnapshot().value).toBe('APRESENTACAO');

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([null, null, null, null, null, null]);
      actor.stop();
    });

    it('INFERNO 120s inactivity -> IDLE', () => {
      const actor = createActor(oracleMachine).start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.INTRO

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      actor.stop();
    });
  });

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
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO.INTRO
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');
      actor.stop();
    });

    it('PARAISO entry sets "PARAISO"', () => {
      const actor = createActor(oracleMachine).start();
      advanceToQ4Aguardando(actor);
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO.INTRO
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');
      actor.stop();
    });

    it('DEVOLUCAO entry sets "DEVOLUCAO"', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'A', 'A', 'A']);
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');
      actor.stop();
    });

    it('ENCERRAMENTO entry sets "ENCERRAMENTO"', () => {
      const actor = createActor(oracleMachine).start();
      runFullPath(actor, ['A', 'A', 'A', 'A', 'A', 'A']);
      actor.send({ type: 'NARRATIVA_DONE' }); // DEVOLUCAO -> ENCERRAMENTO
      expect(actor.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');
      actor.stop();
    });
  });

  describe('full paths', () => {
    it('full DEPTH_SEEKER path (all A) end-to-end', () => {
      const actor = createActor(oracleMachine).start();

      expect(actor.getSnapshot().value).toBe('IDLE');

      actor.send({ type: 'START' });
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');

      runFullPath(actor, ['A', 'A', 'A', 'A', 'A', 'A']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_DEPTH_SEEKER');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choices).toEqual([null, null, null, null, null, null]);
      actor.stop();
    });

    it('full SURFACE_KEEPER path (all B) end-to-end', () => {
      const actor = createActor(oracleMachine).start();

      expect(actor.getSnapshot().value).toBe('IDLE');

      actor.send({ type: 'START' });
      runFullPath(actor, ['B', 'B', 'B', 'B', 'B', 'B']);
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_SURFACE_KEEPER');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      actor.stop();
    });
  });
});
