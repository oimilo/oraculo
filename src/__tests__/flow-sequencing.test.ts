import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import { oracleMachine } from '@/machines/oracleMachine';
import { SCRIPT } from '@/data/script';

/**
 * Integration tests verifying TTS-gated flow sequencing for FLOW-01 through FLOW-05.
 *
 * Purpose: Ensure narration/question TTS completes fully before state machine advances.
 * These tests validate the contract between OracleExperience's TTS orchestration
 * and the state machine's NARRATIVA_DONE event handling.
 */

/**
 * Pure function replica of getScriptKey from OracleExperience.tsx
 * Maps current machine state to the corresponding script key
 */
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';
  if (machineState.matches({ INFERNO: 'NARRATIVA' })) return 'INFERNO_NARRATIVA';
  if (machineState.matches({ INFERNO: 'PERGUNTA' })) return 'INFERNO_PERGUNTA';
  if (machineState.matches({ INFERNO: 'RESPOSTA_A' })) return 'INFERNO_RESPOSTA_A';
  if (machineState.matches({ INFERNO: 'RESPOSTA_B' })) return 'INFERNO_RESPOSTA_B';
  if (machineState.matches({ INFERNO: 'TIMEOUT_REDIRECT' })) return 'TIMEOUT_INFERNO';
  if (machineState.matches({ PURGATORIO_A: 'NARRATIVA' })) return 'PURGATORIO_NARRATIVA_A';
  if (machineState.matches({ PURGATORIO_A: 'PERGUNTA' })) return 'PURGATORIO_PERGUNTA_A';
  if (machineState.matches({ PURGATORIO_A: 'RESPOSTA_FICAR' })) return 'PURGATORIO_RESPOSTA_A_FICAR';
  if (machineState.matches({ PURGATORIO_A: 'RESPOSTA_EMBORA' })) return 'PURGATORIO_RESPOSTA_A_EMBORA';
  if (machineState.matches({ PURGATORIO_B: 'NARRATIVA' })) return 'PURGATORIO_NARRATIVA_B';
  if (machineState.matches({ PURGATORIO_B: 'PERGUNTA' })) return 'PURGATORIO_PERGUNTA_B';
  if (machineState.matches({ PURGATORIO_B: 'RESPOSTA_PISAR' })) return 'PURGATORIO_RESPOSTA_B_PISAR';
  if (machineState.matches({ PURGATORIO_B: 'RESPOSTA_CONTORNAR' })) return 'PURGATORIO_RESPOSTA_B_CONTORNAR';
  if (machineState.matches('PARAISO')) return 'PARAISO';
  if (machineState.matches('DEVOLUCAO_A_FICAR')) return 'DEVOLUCAO_A_FICAR';
  if (machineState.matches('DEVOLUCAO_A_EMBORA')) return 'DEVOLUCAO_A_EMBORA';
  if (machineState.matches('DEVOLUCAO_B_PISAR')) return 'DEVOLUCAO_B_PISAR';
  if (machineState.matches('DEVOLUCAO_B_CONTORNAR')) return 'DEVOLUCAO_B_CONTORNAR';
  if (machineState.matches('ENCERRAMENTO')) return 'ENCERRAMENTO';
  return null; // IDLE, AGUARDANDO, FIM, DEVOLUCAO routing -- no speech
}

describe('Flow Sequencing', () => {
  describe('FLOW-01: TTS narration completes before mic opens', () => {
    it('state machine stays in NARRATIVA until NARRATIVA_DONE is sent', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA

      // After reaching INFERNO.NARRATIVA, we stay there until NARRATIVA_DONE
      const state = actor.getSnapshot();
      expect(state.matches({ INFERNO: 'NARRATIVA' })).toBe(true);

      // Without sending NARRATIVA_DONE, we stay in NARRATIVA (TTS must complete before transition)
      expect(state.matches({ INFERNO: 'NARRATIVA' })).toBe(true);
      expect(state.matches({ INFERNO: 'PERGUNTA' })).toBe(false);
    });

    it('NARRATIVA_DONE advances from NARRATIVA to PERGUNTA', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA

      const beforeState = actor.getSnapshot();
      expect(beforeState.matches({ INFERNO: 'NARRATIVA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA

      const afterState = actor.getSnapshot();
      expect(afterState.matches({ INFERNO: 'PERGUNTA' })).toBe(true);
    });
  });

  describe('FLOW-02: Question TTS plays in PERGUNTA before AGUARDANDO', () => {
    it('PERGUNTA state has corresponding script key', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA

      const state = actor.getSnapshot();
      expect(state.matches({ INFERNO: 'PERGUNTA' })).toBe(true);

      // getScriptKey should return 'INFERNO_PERGUNTA'
      expect(getScriptKey(state)).toBe('INFERNO_PERGUNTA');
    });

    it('AGUARDANDO state has NO script key (no TTS plays)', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.PERGUNTA -> INFERNO.AGUARDANDO

      const state = actor.getSnapshot();
      expect(state.matches({ INFERNO: 'AGUARDANDO' })).toBe(true);
      expect(getScriptKey(state)).toBeNull();
    });
  });

  describe('FLOW-03: TIMEOUT_REDIRECT text plays only after timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('TIMEOUT_REDIRECT maps to TIMEOUT_INFERNO script key, not INFERNO_PERGUNTA', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      // Navigate to AGUARDANDO
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.PERGUNTA -> INFERNO.AGUARDANDO

      // Trigger timeout
      vi.advanceTimersByTime(25000);

      const state = actor.getSnapshot();
      expect(state.matches({ INFERNO: 'TIMEOUT_REDIRECT' })).toBe(true);
      expect(getScriptKey(state)).toBe('TIMEOUT_INFERNO');
      expect(getScriptKey(state)).not.toBe('INFERNO_PERGUNTA');
    });
  });

  describe('FLOW-04: No TTS audio overlaps', () => {
    it('getScriptKey returns null for states with no speech (AGUARDANDO, IDLE, FIM)', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      // IDLE state
      const idleState = actor.getSnapshot();
      expect(idleState.matches('IDLE')).toBe(true);
      expect(getScriptKey(idleState)).toBeNull();

      // Navigate to AGUARDANDO
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'NARRATIVA_DONE' });

      const aguardandoState = actor.getSnapshot();
      expect(aguardandoState.matches({ INFERNO: 'AGUARDANDO' })).toBe(true);
      expect(getScriptKey(aguardandoState)).toBeNull();

      // Navigate to FIM
      actor.send({ type: 'CHOICE_A' });
      actor.send({ type: 'NARRATIVA_DONE' }); // RESPOSTA_A -> PURGATORIO_A.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_A.NARRATIVA -> PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_A.PERGUNTA -> AGUARDANDO
      actor.send({ type: 'CHOICE_FICAR' }); // AGUARDANDO -> RESPOSTA_FICAR
      actor.send({ type: 'NARRATIVA_DONE' }); // RESPOSTA_FICAR -> PARAISO
      actor.send({ type: 'NARRATIVA_DONE' }); // PARAISO -> DEVOLUCAO -> DEVOLUCAO_A_FICAR
      actor.send({ type: 'NARRATIVA_DONE' }); // DEVOLUCAO_A_FICAR -> ENCERRAMENTO
      actor.send({ type: 'NARRATIVA_DONE' }); // ENCERRAMENTO -> FIM

      const fimState = actor.getSnapshot();
      expect(fimState.matches('FIM')).toBe(true);
      expect(getScriptKey(fimState)).toBeNull();
    });

    it('each speaking state maps to exactly one script key', () => {
      // Verify no ambiguity in script key mappings
      const scriptKeys = new Set<string>();
      const stateScriptPairs: Array<[string, string]> = [];

      // Test all speaking states through the flow
      const actor = createActor(oracleMachine);
      actor.start();

      // APRESENTACAO
      actor.send({ type: 'START' });
      let state = actor.getSnapshot();
      let key = getScriptKey(state);
      expect(key).toBe('APRESENTACAO');
      stateScriptPairs.push(['APRESENTACAO', key!]);

      // INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' });
      state = actor.getSnapshot();
      key = getScriptKey(state);
      expect(key).toBe('INFERNO_NARRATIVA');
      stateScriptPairs.push(['INFERNO.NARRATIVA', key!]);

      // INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' });
      state = actor.getSnapshot();
      key = getScriptKey(state);
      expect(key).toBe('INFERNO_PERGUNTA');
      stateScriptPairs.push(['INFERNO.PERGUNTA', key!]);

      // INFERNO.RESPOSTA_A
      actor.send({ type: 'NARRATIVA_DONE' });
      actor.send({ type: 'CHOICE_A' });
      state = actor.getSnapshot();
      key = getScriptKey(state);
      expect(key).toBe('INFERNO_RESPOSTA_A');
      stateScriptPairs.push(['INFERNO.RESPOSTA_A', key!]);

      // Verify all script keys are unique (no two states map to same key)
      stateScriptPairs.forEach(([stateName, scriptKey]) => {
        scriptKeys.add(scriptKey);
      });

      expect(scriptKeys.size).toBe(stateScriptPairs.length);
    });
  });

  describe('FLOW-05: State transitions wait for TTS completion', () => {
    it('full INFERNO sequence requires 3 NARRATIVA_DONE events', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      actor.send({ type: 'START' });

      // Need 3 NARRATIVA_DONE to reach AGUARDANDO:
      // APRESENTACAO -> INFERNO.NARRATIVA -> INFERNO.PERGUNTA -> INFERNO.AGUARDANDO
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      expect(actor.getSnapshot().matches({ INFERNO: 'NARRATIVA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA
      expect(actor.getSnapshot().matches({ INFERNO: 'PERGUNTA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.PERGUNTA -> INFERNO.AGUARDANDO
      expect(actor.getSnapshot().matches({ INFERNO: 'AGUARDANDO' })).toBe(true);
    });

    it('PURGATORIO_A sequence requires 3 NARRATIVA_DONE after INFERNO choice', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      // Navigate through INFERNO
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.PERGUNTA -> INFERNO.AGUARDANDO
      actor.send({ type: 'CHOICE_A' }); // INFERNO.AGUARDANDO -> INFERNO.RESPOSTA_A

      // Now in INFERNO.RESPOSTA_A
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.RESPOSTA_A -> PURGATORIO_A.NARRATIVA
      expect(actor.getSnapshot().matches({ PURGATORIO_A: 'NARRATIVA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_A.NARRATIVA -> PURGATORIO_A.PERGUNTA
      expect(actor.getSnapshot().matches({ PURGATORIO_A: 'PERGUNTA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_A.PERGUNTA -> PURGATORIO_A.AGUARDANDO
      expect(actor.getSnapshot().matches({ PURGATORIO_A: 'AGUARDANDO' })).toBe(true);
    });

    it('PURGATORIO_B sequence requires 3 NARRATIVA_DONE after INFERNO choice', () => {
      const actor = createActor(oracleMachine);
      actor.start();

      // Navigate through INFERNO to path B
      actor.send({ type: 'START' });
      actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.NARRATIVA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.NARRATIVA -> INFERNO.PERGUNTA
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.PERGUNTA -> INFERNO.AGUARDANDO
      actor.send({ type: 'CHOICE_B' }); // INFERNO.AGUARDANDO -> INFERNO.RESPOSTA_B

      // Now in INFERNO.RESPOSTA_B
      actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.RESPOSTA_B -> PURGATORIO_B.NARRATIVA
      expect(actor.getSnapshot().matches({ PURGATORIO_B: 'NARRATIVA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_B.NARRATIVA -> PURGATORIO_B.PERGUNTA
      expect(actor.getSnapshot().matches({ PURGATORIO_B: 'PERGUNTA' })).toBe(true);

      actor.send({ type: 'NARRATIVA_DONE' }); // PURGATORIO_B.PERGUNTA -> PURGATORIO_B.AGUARDANDO
      expect(actor.getSnapshot().matches({ PURGATORIO_B: 'AGUARDANDO' })).toBe(true);
    });
  });
});
