'use client';

import { useMachine } from '@xstate/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { oracleMachine } from '@/machines/oracleMachine';
import { SCRIPT } from '@/data/script';
import type { NarrativePhase, SpeechSegment } from '@/types';
import { initAudioContext } from '@/lib/audio/audioContext';
import { createTTSService, PHASE_VOICE_SETTINGS, type TTSService } from '@/services/tts';
import { useVoiceChoice, type ChoiceConfig } from '@/hooks/useVoiceChoice';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import PermissionScreen from './PermissionScreen';
import StartButton from './StartButton';
import PhaseBackground from './PhaseBackground';
import ChoiceButtons from './ChoiceButtons';
import EndFade from './EndFade';
import WaveformVisualizer from '../audio/WaveformVisualizer';
import ListeningIndicator from '../audio/ListeningIndicator';

// Choice configurations for each AGUARDANDO state
const INFERNO_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Inferno, escolhendo entre a porta das vozes ou a porta do silencio',
  options: { A: 'Vozes', B: 'Silencio' },
  eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  defaultEvent: 'CHOICE_B', // Silence is default on timeout (FLOW-11)
};

const PURGATORIO_A_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Purgatorio caminho A, escolhendo se a memoria fica ou vai embora',
  options: { A: 'Deixa ficar', B: 'Manda embora' },
  eventMap: { A: 'CHOICE_FICAR', B: 'CHOICE_EMBORA' },
  defaultEvent: 'CHOICE_FICAR', // Default on timeout
};

const PURGATORIO_B_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Purgatorio caminho B, escolhendo se pisa na tela ou contorna',
  options: { A: 'Pisa', B: 'Contorna' },
  eventMap: { A: 'CHOICE_PISAR', B: 'CHOICE_CONTORNAR' },
  defaultEvent: 'CHOICE_CONTORNAR', // Default on timeout
};

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
 * Get fallback script based on current state
 */
function getFallbackScript(machineState: any): SpeechSegment[] | null {
  if (machineState.matches({ INFERNO: 'AGUARDANDO' })) return SCRIPT.FALLBACK_INFERNO;
  if (machineState.matches({ PURGATORIO_A: 'AGUARDANDO' })) return SCRIPT.FALLBACK_PURGATORIO_A;
  if (machineState.matches({ PURGATORIO_B: 'AGUARDANDO' })) return SCRIPT.FALLBACK_PURGATORIO_B;
  return null;
}

/**
 * Main orchestrator component for the Oracle experience.
 * Wires together state machine, TTS service, voice choice pipeline, ambient audio, and UI components.
 */
export default function OracleExperience() {
  const [state, send] = useMachine(oracleMachine);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsRef = useRef<TTSService | null>(null);

  // Determine which choice config is active based on current state
  const activeChoiceConfig = useMemo(() => {
    if (state.matches({ INFERNO: 'AGUARDANDO' })) return INFERNO_CHOICE;
    if (state.matches({ PURGATORIO_A: 'AGUARDANDO' })) return PURGATORIO_A_CHOICE;
    if (state.matches({ PURGATORIO_B: 'AGUARDANDO' })) return PURGATORIO_B_CHOICE;
    return null;
  }, [state.value]);

  // Voice choice hook (only active when at an AGUARDANDO state)
  const voiceChoice = useVoiceChoice(
    activeChoiceConfig || {
      questionContext: '',
      options: { A: '', B: '' },
      eventMap: { A: '', B: '' },
    }
  );

  // Ambient audio hook
  useAmbientAudio(state.context.currentPhase, experienceStarted);

  /**
   * Auto-speak on state change using TTSService
   */
  useEffect(() => {
    const scriptKey = getScriptKey(state);
    if (!scriptKey || isSpeaking || !ttsRef.current) return;

    const phase = state.context.currentPhase;
    setIsSpeaking(true);

    ttsRef.current
      .speak(SCRIPT[scriptKey], PHASE_VOICE_SETTINGS[phase])
      .then(() => {
        setIsSpeaking(false);
        send({ type: 'NARRATIVA_DONE' });
      })
      .catch((err) => {
        setIsSpeaking(false);
        if (err.message !== 'Speech cancelled') {
          console.error('Speech error:', err);
        }
      });

    return () => {
      ttsRef.current?.cancel();
      setIsSpeaking(false);
    };
  }, [state.value, send, state, isSpeaking]);

  /**
   * Handle fallback: play fallback script when needsFallback is true
   */
  useEffect(() => {
    if (!voiceChoice.needsFallback || !ttsRef.current) return;

    const fallbackScript = getFallbackScript(state);
    if (!fallbackScript) return;

    const phase = state.context.currentPhase;
    ttsRef.current
      .speak(fallbackScript, PHASE_VOICE_SETTINGS[phase])
      .then(() => {
        // After fallback TTS completes, restart listening
        voiceChoice.startListening();
      })
      .catch((err) => {
        console.error('Fallback TTS error:', err);
      });
  }, [voiceChoice.needsFallback, state]);

  /**
   * Handle choice result from voice pipeline
   */
  useEffect(() => {
    if (!voiceChoice.choiceResult) return;

    // Send the event to state machine
    send({ type: voiceChoice.choiceResult.eventType as any });

    // Reset voice choice for next AGUARDANDO state
    voiceChoice.reset();
  }, [voiceChoice.choiceResult, send]);

  /**
   * Start voice choice when entering AGUARDANDO state
   */
  useEffect(() => {
    if (activeChoiceConfig && !voiceChoice.isListening && !voiceChoice.choiceResult) {
      voiceChoice.startListening().catch((err) => {
        console.error('Failed to start listening:', err);
      });
    }
  }, [activeChoiceConfig]);

  /**
   * Start handler - unlocks AudioContext and initializes TTS service (MUST be inside user click)
   */
  const handleStart = useCallback(async () => {
    await initAudioContext();

    // Initialize TTS service
    if (!ttsRef.current) {
      ttsRef.current = createTTSService();
    }

    setExperienceStarted(true);
    send({ type: 'START' });
  }, [send]);

  // Determine if we're in an AGUARDANDO state
  const isAguardando =
    state.matches({ INFERNO: 'AGUARDANDO' }) ||
    state.matches({ PURGATORIO_A: 'AGUARDANDO' }) ||
    state.matches({ PURGATORIO_B: 'AGUARDANDO' });

  // Experience is active (not IDLE, not FIM)
  const experienceActive = experienceStarted && !state.matches('IDLE') && !state.matches('FIM');

  return (
    <PhaseBackground phase={state.context.currentPhase}>
      {!micPermissionGranted && (
        <PermissionScreen onGranted={() => setMicPermissionGranted(true)} />
      )}
      {micPermissionGranted && state.matches('IDLE') && (
        <StartButton onClick={handleStart} />
      )}

      {/* Central visual area -- no text (UI-05) */}
      {experienceActive && (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 pointer-events-none">
          <WaveformVisualizer visible={isSpeaking} />
          <ListeningIndicator isListening={voiceChoice.isListening} />
        </div>
      )}

      {/* Choice UI -- buttons remain as fallback alongside voice */}
      {state.matches({ INFERNO: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[
            { label: 'Vozes', event: 'CHOICE_A' },
            { label: 'Silêncio', event: 'CHOICE_B' },
          ]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}
      {state.matches({ PURGATORIO_A: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[
            { label: 'Deixa ficar', event: 'CHOICE_FICAR' },
            { label: 'Manda embora', event: 'CHOICE_EMBORA' },
          ]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}
      {state.matches({ PURGATORIO_B: 'AGUARDANDO' }) && (
        <ChoiceButtons
          options={[
            { label: 'Pisa', event: 'CHOICE_PISAR' },
            { label: 'Contorna', event: 'CHOICE_CONTORNAR' },
          ]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}

      {state.matches('FIM') && <EndFade />}
    </PhaseBackground>
  );
}
