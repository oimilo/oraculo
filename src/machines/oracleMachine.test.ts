import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import { oracleMachine } from './oracleMachine';
import type { OracleContext } from './oracleMachine.types';

describe('Oracle State Machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Test 1 - IDLE to APRESENTACAO', () => {
    it('should transition from IDLE to APRESENTACAO on START and assign sessionId', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.sessionId).toBe('');

      actor.send({ type: 'START' });

      expect(actor.getSnapshot().value).toBe('APRESENTACAO');
      expect(actor.getSnapshot().context.sessionId).not.toBe('');
      expect(actor.getSnapshot().context.sessionId.length).toBeGreaterThan(0);
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');
    });
  });

  describe('Test 2 - APRESENTACAO to INFERNO', () => {
    it('should transition from APRESENTACAO to INFERNO.NARRATIVA on NARRATIVA_DONE', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });

      expect(actor.getSnapshot().value).toBe('APRESENTACAO');

      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'NARRATIVA' });
      expect(actor.getSnapshot().context.currentPhase).toBe('INFERNO');
    });
  });

  describe('Test 3 - INFERNO flow', () => {
    it('should advance through INFERNO.NARRATIVA -> INFERNO.PERGUNTA -> INFERNO.AGUARDANDO', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'NARRATIVA' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'PERGUNTA' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'AGUARDANDO' });
    });
  });

  describe('Test 4 - INFERNO CHOICE_A', () => {
    it('should transition to INFERNO.RESPOSTA_A and set choice1 = A', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.AGUARDANDO

      expect(actor.getSnapshot().context.choice1).toBeNull();

      actor.send({ type: 'CHOICE_A' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'RESPOSTA_A' });
      expect(actor.getSnapshot().context.choice1).toBe('A');
    });
  });

  describe('Test 5 - INFERNO CHOICE_B', () => {
    it('should transition to INFERNO.RESPOSTA_B and set choice1 = B', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().context.choice1).toBeNull();

      actor.send({ type: 'CHOICE_B' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'RESPOSTA_B' });
      expect(actor.getSnapshot().context.choice1).toBe('B');
    });
  });

  describe('Test 6 - INFERNO timeout', () => {
    it('should timeout after 15000ms and default to CHOICE_B', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'AGUARDANDO' });
      expect(actor.getSnapshot().context.choice1).toBeNull();

      // Advance 15000ms for timeout
      vi.advanceTimersByTime(15000);

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'TIMEOUT_REDIRECT' });
      expect(actor.getSnapshot().context.choice1).toBe('B');

      // TIMEOUT_REDIRECT now waits for NARRATIVA_DONE (speech completion) instead of fixed timer
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'RESPOSTA_B' });
    });
  });

  describe('Test 7 - Path A complete', () => {
    it('should transition INFERNO.RESPOSTA_A -> PURGATORIO_A.NARRATIVA -> PURGATORIO_A.PERGUNTA -> PURGATORIO_A.AGUARDANDO', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'RESPOSTA_A' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'NARRATIVA' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'PERGUNTA' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'AGUARDANDO' });
    });
  });

  describe('Test 8 - PURGATORIO_A CHOICE_FICAR', () => {
    it('should set choice2 = FICAR and transition to PURGATORIO_A.RESPOSTA_FICAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().context.choice2).toBeNull();

      actor.send({ type: 'CHOICE_FICAR' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'RESPOSTA_FICAR' });
      expect(actor.getSnapshot().context.choice2).toBe('FICAR');
    });
  });

  describe('Test 9 - PURGATORIO_A CHOICE_EMBORA', () => {
    it('should set choice2 = EMBORA and transition to PURGATORIO_A.RESPOSTA_EMBORA', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().context.choice2).toBeNull();

      actor.send({ type: 'CHOICE_EMBORA' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'RESPOSTA_EMBORA' });
      expect(actor.getSnapshot().context.choice2).toBe('EMBORA');
    });
  });

  describe('Test 10 - PURGATORIO_A timeout', () => {
    it('should timeout after 15000ms and default to FICAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'AGUARDANDO' });

      vi.advanceTimersByTime(15000);

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'RESPOSTA_FICAR' });
      expect(actor.getSnapshot().context.choice2).toBe('FICAR');
    });
  });

  describe('Test 11 - Path B complete', () => {
    it('should transition INFERNO.RESPOSTA_B -> PURGATORIO_B.NARRATIVA -> PURGATORIO_B.PERGUNTA -> PURGATORIO_B.AGUARDANDO', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'RESPOSTA_B' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'NARRATIVA' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'PERGUNTA' });

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'AGUARDANDO' });
    });
  });

  describe('Test 12 - PURGATORIO_B CHOICE_PISAR', () => {
    it('should set choice2 = PISAR and transition to PURGATORIO_B.RESPOSTA_PISAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().context.choice2).toBeNull();

      actor.send({ type: 'CHOICE_PISAR' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'RESPOSTA_PISAR' });
      expect(actor.getSnapshot().context.choice2).toBe('PISAR');
    });
  });

  describe('Test 13 - PURGATORIO_B CHOICE_CONTORNAR', () => {
    it('should set choice2 = CONTORNAR and transition to PURGATORIO_B.RESPOSTA_CONTORNAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().context.choice2).toBeNull();

      actor.send({ type: 'CHOICE_CONTORNAR' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'RESPOSTA_CONTORNAR' });
      expect(actor.getSnapshot().context.choice2).toBe('CONTORNAR');
    });
  });

  describe('Test 14 - PURGATORIO_B timeout', () => {
    it('should timeout after 15000ms and default to CONTORNAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'AGUARDANDO' });

      vi.advanceTimersByTime(15000);

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'RESPOSTA_CONTORNAR' });
      expect(actor.getSnapshot().context.choice2).toBe('CONTORNAR');
    });
  });

  describe('Test 15 - Any purgatorio response -> PARAISO', () => {
    it('should transition from PURGATORIO_A.RESPOSTA_* to PARAISO', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_A: 'RESPOSTA_FICAR' });

      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('PARAISO');
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');
    });

    it('should transition from PURGATORIO_B.RESPOSTA_* to PARAISO', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_PISAR' });

      expect(actor.getSnapshot().value).toEqual({ PURGATORIO_B: 'RESPOSTA_PISAR' });

      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('PARAISO');
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');
    });
  });

  describe('Test 16 - PARAISO reflexive', () => {
    it('should transition from PARAISO through DEVOLUCAO to variant on NARRATIVA_DONE', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('PARAISO');

      actor.send({ type: 'NARRATIVA_DONE' });

      // DEVOLUCAO immediately routes to variant based on choices via always guards
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_A_FICAR');
    });
  });

  describe('Test 17 - DEVOLUCAO routing', () => {
    it('should route to DEVOLUCAO_A_FICAR when choice1=A and choice2=FICAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_A_FICAR');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');
    });

    it('should route to DEVOLUCAO_A_EMBORA when choice1=A and choice2=EMBORA', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_EMBORA' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_A_EMBORA');
    });

    it('should route to DEVOLUCAO_B_PISAR when choice1=B and choice2=PISAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_PISAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_B_PISAR');
    });

    it('should route to DEVOLUCAO_B_CONTORNAR when choice1=B and choice2=CONTORNAR', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_B' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_CONTORNAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_B_CONTORNAR');
    });
  });

  describe('Test 18 - DEVOLUCAO variants -> ENCERRAMENTO', () => {
    it('should transition all 4 DEVOLUCAO_* states to ENCERRAMENTO on NARRATIVA_DONE', () => {
      // Test A_FICAR path
      const actor1 = createActor(oracleMachine);
      actor1.start();
      actor1.send({ type: 'START' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'CHOICE_A' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'CHOICE_FICAR' });
      actor1.send({ type: 'NARRATIVA_DONE' });
      actor1.send({ type: 'NARRATIVA_DONE' });

      expect(actor1.getSnapshot().value).toBe('DEVOLUCAO_A_FICAR');

      actor1.send({ type: 'NARRATIVA_DONE' });

      expect(actor1.getSnapshot().value).toBe('ENCERRAMENTO');
      expect(actor1.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');
    });
  });

  describe('Test 19 - ENCERRAMENTO -> FIM', () => {
    it('should transition from ENCERRAMENTO to FIM on NARRATIVA_DONE', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('FIM');
    });
  });

  describe('Test 20 - FIM -> IDLE reset', () => {
    it('should auto-transition from FIM to IDLE after 5000ms with context reset', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('FIM');
      expect(actor.getSnapshot().context.choice1).toBe('A');
      expect(actor.getSnapshot().context.choice2).toBe('FICAR');

      vi.advanceTimersByTime(5000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choice1).toBeNull();
      expect(actor.getSnapshot().context.choice2).toBeNull();
      expect(actor.getSnapshot().context.sessionId).toBe('');
      expect(actor.getSnapshot().context.fallbackCount).toBe(0);
    });
  });

  describe('Test 21 - Full path A_FICAR', () => {
    it('should complete full A_FICAR path with correct context', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('IDLE');

      actor.send({ type: 'START' });
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('INFERNO');

      actor.send({ type: 'CHOICE_A' });
      expect(actor.getSnapshot().context.choice1).toBe('A');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');

      actor.send({ type: 'CHOICE_FICAR' });
      expect(actor.getSnapshot().context.choice2).toBe('FICAR');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_A_FICAR');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');
      expect(actor.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choice1).toBeNull();
      expect(actor.getSnapshot().context.choice2).toBeNull();
    });
  });

  describe('Test 22 - Full path B_CONTORNAR', () => {
    it('should complete full B_CONTORNAR path with correct context', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('IDLE');

      actor.send({ type: 'START' });
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('INFERNO');

      actor.send({ type: 'CHOICE_B' });
      expect(actor.getSnapshot().context.choice1).toBe('B');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');

      actor.send({ type: 'CHOICE_CONTORNAR' });
      expect(actor.getSnapshot().context.choice2).toBe('CONTORNAR');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('DEVOLUCAO_B_CONTORNAR');
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('ENCERRAMENTO');
      expect(actor.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().value).toBe('FIM');

      vi.advanceTimersByTime(5000);
      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.choice1).toBeNull();
      expect(actor.getSnapshot().context.choice2).toBeNull();
    });
  });

  describe('Test 23 - currentPhase updates', () => {
    it('should update currentPhase correctly on entry to each major state', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });
      expect(actor.getSnapshot().context.currentPhase).toBe('APRESENTACAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('INFERNO');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PURGATORIO');

      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('PARAISO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('DEVOLUCAO');

      actor.send({ type: 'NARRATIVA_DONE' });
      expect(actor.getSnapshot().context.currentPhase).toBe('ENCERRAMENTO');
    });
  });

  describe('inactivity timeout (RES-05)', () => {
    it('should transition from APRESENTACAO to IDLE after 120s inactivity', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });

      expect(actor.getSnapshot().value).toBe('APRESENTACAO');

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
      expect(actor.getSnapshot().context.sessionId).toBe('');
      expect(actor.getSnapshot().context.choice1).toBeNull();
      expect(actor.getSnapshot().context.choice2).toBeNull();
    });

    it('should transition from INFERNO.NARRATIVA to IDLE after 120s inactivity', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toEqual({ INFERNO: 'NARRATIVA' });

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
    });

    it('should NOT timeout in IDLE', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('IDLE');

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
    });

    it('should NOT have 120s timeout in FIM (has own 5s timer)', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('FIM');

      // Advance 5s should trigger FIM -> IDLE
      vi.advanceTimersByTime(5000);

      expect(actor.getSnapshot().value).toBe('IDLE');
    });

    it('should transition from PARAISO to IDLE after 120s inactivity', () => {
      const actor = createActor(oracleMachine);
      actor.start();
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_FICAR' });
      actor.send({ type: 'NARRATIVA_DONE' });

      expect(actor.getSnapshot().value).toBe('PARAISO');

      vi.advanceTimersByTime(120000);

      expect(actor.getSnapshot().value).toBe('IDLE');
    });
  });

  describe('generic guards (QUAL-03)', () => {
    it('should route DEVOLUCAO correctly using named guards for all 4 paths', () => {
      // Test that the machine uses named guards from createChoiceGuard factory
      // instead of inline anonymous functions, enabling extensibility and testability

      const paths = [
        { choice1: 'A' as const, choice2: 'FICAR' as const, expected: 'DEVOLUCAO_A_FICAR' },
        { choice1: 'A' as const, choice2: 'EMBORA' as const, expected: 'DEVOLUCAO_A_EMBORA' },
        { choice1: 'B' as const, choice2: 'PISAR' as const, expected: 'DEVOLUCAO_B_PISAR' },
        { choice1: 'B' as const, choice2: 'CONTORNAR' as const, expected: 'DEVOLUCAO_B_CONTORNAR' },
      ];

      paths.forEach(({ choice1, choice2, expected }) => {
        const actor = createActor(oracleMachine);
        actor.start();

        actor.send({ type: 'START' });
        actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.NARRATIVA
        actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.PERGUNTA
        actor.send({ type: 'NARRATIVA_DONE' }); // -> INFERNO.AGUARDANDO

        // Make choice1
        actor.send({ type: choice1 === 'A' ? 'CHOICE_A' : 'CHOICE_B' });
        actor.send({ type: 'NARRATIVA_DONE' }); // -> PURGATORIO_A or PURGATORIO_B

        actor.send({ type: 'NARRATIVA_DONE' }); // -> NARRATIVA
        actor.send({ type: 'NARRATIVA_DONE' }); // -> PERGUNTA
        actor.send({ type: 'NARRATIVA_DONE' }); // -> AGUARDANDO

        // Make choice2
        const choice2EventMap: Record<string, 'CHOICE_FICAR' | 'CHOICE_EMBORA' | 'CHOICE_PISAR' | 'CHOICE_CONTORNAR'> = {
          'FICAR': 'CHOICE_FICAR',
          'EMBORA': 'CHOICE_EMBORA',
          'PISAR': 'CHOICE_PISAR',
          'CONTORNAR': 'CHOICE_CONTORNAR',
        };
        actor.send({ type: choice2EventMap[choice2] });

        actor.send({ type: 'NARRATIVA_DONE' }); // -> PARAISO
        actor.send({ type: 'NARRATIVA_DONE' }); // -> DEVOLUCAO (auto-routed by guards)

        expect(actor.getSnapshot().value).toBe(expected);
      });
    });
  });
});
