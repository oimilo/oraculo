'use client';

import { useMachine } from '@xstate/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { oracleMachine } from '@/machines/oracleMachine';
import { SCRIPT } from '@/data/script';
import { VOICE_DIRECTIONS } from '@/types';
import { initAudioContext } from '@/lib/audio/audioContext';
import { speakSegments, cancelSpeech } from '@/lib/audio/speechSynthesis';
import PermissionScreen from './PermissionScreen';
import StartButton from './StartButton';
import PhaseBackground from './PhaseBackground';
import ChoiceButtons from './ChoiceButtons';
import EndFade from './EndFade';

/**
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

/**
 * Main orchestrator component for the Oracle experience.
 * Wires together state machine, speech synthesis, and UI components.
 */
export default function OracleExperience() {
  const [state, send] = useMachine(oracleMachine);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const isSpeakingRef = useRef(false);

  /**
   * Auto-speak on state change
   */
  useEffect(() => {
    const scriptKey = getScriptKey(state);
    if (!scriptKey || isSpeakingRef.current) return;

    const phase = state.context.currentPhase;
    isSpeakingRef.current = true;

    speakSegments(SCRIPT[scriptKey], VOICE_DIRECTIONS[phase])
      .then(() => {
        isSpeakingRef.current = false;
        send({ type: 'NARRATIVA_DONE' });
      })
      .catch((err) => {
        isSpeakingRef.current = false;
        if (err.message !== 'Speech cancelled') {
          console.error('Speech error:', err);
        }
      });

    return () => {
      cancelSpeech();
      isSpeakingRef.current = false;
    };
  }, [state.value, send, state]);

  /**
   * Start handler - unlocks AudioContext (MUST be inside user click)
   */
  const handleStart = useCallback(async () => {
    await initAudioContext();
    send({ type: 'START' });
  }, [send]);

  return (
    <PhaseBackground phase={state.context.currentPhase}>
      {!micPermissionGranted && (
        <PermissionScreen onGranted={() => setMicPermissionGranted(true)} />
      )}
      {micPermissionGranted && state.matches('IDLE') && (
        <StartButton onClick={handleStart} />
      )}
      {state.matches({ INFERNO: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[{ label: 'Vozes', event: 'CHOICE_A' }, { label: 'Silêncio', event: 'CHOICE_B' }]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}
      {state.matches({ PURGATORIO_A: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[{ label: 'Deixa ficar', event: 'CHOICE_FICAR' }, { label: 'Manda embora', event: 'CHOICE_EMBORA' }]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}
      {state.matches({ PURGATORIO_B: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[{ label: 'Pisa', event: 'CHOICE_PISAR' }, { label: 'Contorna', event: 'CHOICE_CONTORNAR' }]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}
      {state.matches('FIM') && <EndFade />}
    </PhaseBackground>
  );
}
