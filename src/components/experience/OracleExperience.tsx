'use client';

import { useMachine } from '@xstate/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { oracleMachine } from '@/machines/oracleMachine';
import { SCRIPT } from '@/data/script';
import type { SpeechSegment } from '@/types';
import { QUESTION_META } from '@/types';
import { initAudioContext } from '@/lib/audio/audioContext';
import { useVoiceChoice, type ChoiceConfig } from '@/hooks/useVoiceChoice';
import { useTTSOrchestrator } from '@/hooks/useTTSOrchestrator';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { StationRegistry } from '@/services/station';
import PermissionScreen from './PermissionScreen';
import StartButton from './StartButton';
import PhaseBackground from './PhaseBackground';
import ChoiceButtons from './ChoiceButtons';
import EndFade from './EndFade';
import WaveformVisualizer from '../audio/WaveformVisualizer';
import ListeningIndicator from '../audio/ListeningIndicator';
import DebugPanel from '@/components/debug/DebugPanel';
import { createLogger } from '@/lib/debug/logger';

const logger = createLogger('TTS');
const activationLogger = createLogger('Activation');

// Choice configurations for each AGUARDANDO state — v3 (6 questions)
function buildChoiceConfig(q: number): ChoiceConfig {
  const meta = QUESTION_META[q];
  return {
    questionContext: meta.questionContext,
    options: { A: meta.optionA, B: meta.optionB },
    keywords: { A: meta.keywordsA, B: meta.keywordsB },
    eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
    defaultEvent: `CHOICE_${meta.defaultOnTimeout}`,
  };
}

const Q1_CHOICE = buildChoiceConfig(1);
const Q2_CHOICE = buildChoiceConfig(2);
const Q3_CHOICE = buildChoiceConfig(3);
const Q4_CHOICE = buildChoiceConfig(4);
const Q5_CHOICE = buildChoiceConfig(5);
const Q6_CHOICE = buildChoiceConfig(6);

/**
 * Breathing delay (ms) before sending NARRATIVA_DONE after TTS completes.
 * Prevents the experience from feeling rushed between narrative segments.
 *
 * Tiers:
 *   Long  (2500ms) — Major phase transitions (e.g. APRESENTACAO→INFERNO)
 *   Medium(1500ms) — NARRATIVA→PERGUNTA, within-phase narrative beats
 *   Short  (800ms) — PERGUNTA→AGUARDANDO (question ends, waiting for input)
 *   None     (0ms) — TIMEOUT / FALLBACK functional prompts
 */
function getBreathingDelay(machineState: any): number {
  const LONG = 2500;   // Cross-phase transitions
  const MEDIUM = 1500; // Intros and setups (within-phase narrative beats)
  const SHORT = 800;   // Perguntas (question ends, waiting for input)
  const NONE = 0;      // Timeouts, fallbacks, unmapped

  // --- LONG: Cross-phase boundaries ---
  if (machineState.matches('APRESENTACAO')) return LONG;
  if (machineState.matches('ENCERRAMENTO')) return LONG;
  // INFERNO last responses → PURGATORIO
  if (machineState.matches({ INFERNO: 'Q2_RESPOSTA_A' })) return LONG;
  if (machineState.matches({ INFERNO: 'Q2_RESPOSTA_B' })) return LONG;
  // PURGATORIO last responses → PARAISO
  if (machineState.matches({ PURGATORIO: 'Q4_RESPOSTA_A' })) return LONG;
  if (machineState.matches({ PURGATORIO: 'Q4_RESPOSTA_B' })) return LONG;
  // PARAISO last responses → DEVOLUCAO
  if (machineState.matches({ PARAISO: 'Q6_RESPOSTA_A' })) return LONG;
  if (machineState.matches({ PARAISO: 'Q6_RESPOSTA_B' })) return LONG;
  // All 8 DEVOLUCAO archetypes → ENCERRAMENTO
  if (machineState.matches('DEVOLUCAO_SEEKER')) return LONG;
  if (machineState.matches('DEVOLUCAO_GUARDIAN')) return LONG;
  if (machineState.matches('DEVOLUCAO_CONTRADICTED')) return LONG;
  if (machineState.matches('DEVOLUCAO_PIVOT_EARLY')) return LONG;
  if (machineState.matches('DEVOLUCAO_PIVOT_LATE')) return LONG;
  if (machineState.matches('DEVOLUCAO_DEPTH_SEEKER')) return LONG;
  if (machineState.matches('DEVOLUCAO_SURFACE_KEEPER')) return LONG;
  if (machineState.matches('DEVOLUCAO_MIRROR')) return LONG;

  // --- MEDIUM: Realm intros, setups, within-realm responses ---
  if (machineState.matches({ INFERNO: 'INTRO' })) return MEDIUM;
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return MEDIUM;
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_A' })) return MEDIUM;
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_B' })) return MEDIUM;
  if (machineState.matches({ INFERNO: 'Q2_SETUP' })) return MEDIUM;
  if (machineState.matches({ PURGATORIO: 'INTRO' })) return MEDIUM;
  if (machineState.matches({ PURGATORIO: 'Q3_SETUP' })) return MEDIUM;
  if (machineState.matches({ PURGATORIO: 'Q3_RESPOSTA_A' })) return MEDIUM;
  if (machineState.matches({ PURGATORIO: 'Q3_RESPOSTA_B' })) return MEDIUM;
  if (machineState.matches({ PURGATORIO: 'Q4_SETUP' })) return MEDIUM;
  if (machineState.matches({ PARAISO: 'INTRO' })) return MEDIUM;
  if (machineState.matches({ PARAISO: 'Q5_SETUP' })) return MEDIUM;
  if (machineState.matches({ PARAISO: 'Q5_RESPOSTA_A' })) return MEDIUM;
  if (machineState.matches({ PARAISO: 'Q5_RESPOSTA_B' })) return MEDIUM;
  if (machineState.matches({ PARAISO: 'Q6_SETUP' })) return MEDIUM;

  // --- SHORT: Perguntas (question → AGUARDANDO) ---
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return SHORT;
  if (machineState.matches({ INFERNO: 'Q2_PERGUNTA' })) return SHORT;
  if (machineState.matches({ PURGATORIO: 'Q3_PERGUNTA' })) return SHORT;
  if (machineState.matches({ PURGATORIO: 'Q4_PERGUNTA' })) return SHORT;
  if (machineState.matches({ PARAISO: 'Q5_PERGUNTA' })) return SHORT;
  if (machineState.matches({ PARAISO: 'Q6_PERGUNTA' })) return SHORT;

  // --- NONE: TIMEOUT, FALLBACK, AGUARDANDO, or unmapped ---
  return NONE;
}

/**
 * Maps current machine state to the corresponding script key
 */
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  // Top-level states
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';
  if (machineState.matches('ENCERRAMENTO')) return 'ENCERRAMENTO';

  // INFERNO substates (Q1, Q2)
  if (machineState.matches({ INFERNO: 'INTRO' })) return 'INFERNO_INTRO';
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return 'INFERNO_Q1_SETUP';
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return 'INFERNO_Q1_PERGUNTA';
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_A' })) return 'INFERNO_Q1_RESPOSTA_A';
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_B' })) return 'INFERNO_Q1_RESPOSTA_B';
  if (machineState.matches({ INFERNO: 'Q1_TIMEOUT' })) return 'TIMEOUT_Q1';
  if (machineState.matches({ INFERNO: 'Q2_SETUP' })) return 'INFERNO_Q2_SETUP';
  if (machineState.matches({ INFERNO: 'Q2_PERGUNTA' })) return 'INFERNO_Q2_PERGUNTA';
  if (machineState.matches({ INFERNO: 'Q2_RESPOSTA_A' })) return 'INFERNO_Q2_RESPOSTA_A';
  if (machineState.matches({ INFERNO: 'Q2_RESPOSTA_B' })) return 'INFERNO_Q2_RESPOSTA_B';
  if (machineState.matches({ INFERNO: 'Q2_TIMEOUT' })) return 'TIMEOUT_Q2';

  // PURGATORIO substates (Q3, Q4)
  if (machineState.matches({ PURGATORIO: 'INTRO' })) return 'PURGATORIO_INTRO';
  if (machineState.matches({ PURGATORIO: 'Q3_SETUP' })) return 'PURGATORIO_Q3_SETUP';
  if (machineState.matches({ PURGATORIO: 'Q3_PERGUNTA' })) return 'PURGATORIO_Q3_PERGUNTA';
  if (machineState.matches({ PURGATORIO: 'Q3_RESPOSTA_A' })) return 'PURGATORIO_Q3_RESPOSTA_A';
  if (machineState.matches({ PURGATORIO: 'Q3_RESPOSTA_B' })) return 'PURGATORIO_Q3_RESPOSTA_B';
  if (machineState.matches({ PURGATORIO: 'Q3_TIMEOUT' })) return 'TIMEOUT_Q3';
  if (machineState.matches({ PURGATORIO: 'Q4_SETUP' })) return 'PURGATORIO_Q4_SETUP';
  if (machineState.matches({ PURGATORIO: 'Q4_PERGUNTA' })) return 'PURGATORIO_Q4_PERGUNTA';
  if (machineState.matches({ PURGATORIO: 'Q4_RESPOSTA_A' })) return 'PURGATORIO_Q4_RESPOSTA_A';
  if (machineState.matches({ PURGATORIO: 'Q4_RESPOSTA_B' })) return 'PURGATORIO_Q4_RESPOSTA_B';
  if (machineState.matches({ PURGATORIO: 'Q4_TIMEOUT' })) return 'TIMEOUT_Q4';

  // PARAISO substates (Q5, Q6)
  if (machineState.matches({ PARAISO: 'INTRO' })) return 'PARAISO_INTRO';
  if (machineState.matches({ PARAISO: 'Q5_SETUP' })) return 'PARAISO_Q5_SETUP';
  if (machineState.matches({ PARAISO: 'Q5_PERGUNTA' })) return 'PARAISO_Q5_PERGUNTA';
  if (machineState.matches({ PARAISO: 'Q5_RESPOSTA_A' })) return 'PARAISO_Q5_RESPOSTA_A';
  if (machineState.matches({ PARAISO: 'Q5_RESPOSTA_B' })) return 'PARAISO_Q5_RESPOSTA_B';
  if (machineState.matches({ PARAISO: 'Q5_TIMEOUT' })) return 'TIMEOUT_Q5';
  if (machineState.matches({ PARAISO: 'Q6_SETUP' })) return 'PARAISO_Q6_SETUP';
  if (machineState.matches({ PARAISO: 'Q6_PERGUNTA' })) return 'PARAISO_Q6_PERGUNTA';
  if (machineState.matches({ PARAISO: 'Q6_RESPOSTA_A' })) return 'PARAISO_Q6_RESPOSTA_A';
  if (machineState.matches({ PARAISO: 'Q6_RESPOSTA_B' })) return 'PARAISO_Q6_RESPOSTA_B';
  if (machineState.matches({ PARAISO: 'Q6_TIMEOUT' })) return 'TIMEOUT_Q6';

  // 8 DEVOLUCAO archetypes (top-level states)
  if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
  if (machineState.matches('DEVOLUCAO_GUARDIAN')) return 'DEVOLUCAO_GUARDIAN';
  if (machineState.matches('DEVOLUCAO_CONTRADICTED')) return 'DEVOLUCAO_CONTRADICTED';
  if (machineState.matches('DEVOLUCAO_PIVOT_EARLY')) return 'DEVOLUCAO_PIVOT_EARLY';
  if (machineState.matches('DEVOLUCAO_PIVOT_LATE')) return 'DEVOLUCAO_PIVOT_LATE';
  if (machineState.matches('DEVOLUCAO_DEPTH_SEEKER')) return 'DEVOLUCAO_DEPTH_SEEKER';
  if (machineState.matches('DEVOLUCAO_SURFACE_KEEPER')) return 'DEVOLUCAO_SURFACE_KEEPER';
  if (machineState.matches('DEVOLUCAO_MIRROR')) return 'DEVOLUCAO_MIRROR';

  return null; // IDLE, AGUARDANDO, FIM, DEVOLUCAO routing — no speech
}

/**
 * Get fallback script based on current state
 */
function getFallbackScript(machineState: any): { segments: SpeechSegment[]; key: string } | null {
  if (machineState.matches({ INFERNO: 'Q1_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q1, key: 'FALLBACK_Q1' };
  if (machineState.matches({ INFERNO: 'Q2_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q2, key: 'FALLBACK_Q2' };
  if (machineState.matches({ PURGATORIO: 'Q3_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q3, key: 'FALLBACK_Q3' };
  if (machineState.matches({ PURGATORIO: 'Q4_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q4, key: 'FALLBACK_Q4' };
  if (machineState.matches({ PARAISO: 'Q5_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q5, key: 'FALLBACK_Q5' };
  if (machineState.matches({ PARAISO: 'Q6_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q6, key: 'FALLBACK_Q6' };
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
  const prevStateRef = useRef<any>(state.value);
  const [ttsComplete, setTtsComplete] = useState(false);
  const ttsForStateRef = useRef<string>('');
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TTS orchestrator hook
  const tts = useTTSOrchestrator();

  // Session analytics hook
  const analytics = useSessionAnalytics();

  // Station heartbeat for admin dashboard (ANA-04)
  useEffect(() => {
    const stationId = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('station') || 'station-1')
      : 'station-1';
    const registry = StationRegistry.getInstance();

    // Send initial heartbeat
    registry.heartbeat(stationId, state.context.sessionId || null);

    // Send heartbeat every 10 seconds
    const interval = setInterval(() => {
      registry.heartbeat(stationId, state.context.sessionId || null);
    }, 10000);

    return () => clearInterval(interval);
  }, [state.context.sessionId]);

  // Determine which choice config is active based on current state
  const activeChoiceConfig = useMemo(() => {
    if (state.matches({ INFERNO: 'Q1_AGUARDANDO' })) return Q1_CHOICE;
    if (state.matches({ INFERNO: 'Q2_AGUARDANDO' })) return Q2_CHOICE;
    if (state.matches({ PURGATORIO: 'Q3_AGUARDANDO' })) return Q3_CHOICE;
    if (state.matches({ PURGATORIO: 'Q4_AGUARDANDO' })) return Q4_CHOICE;
    if (state.matches({ PARAISO: 'Q5_AGUARDANDO' })) return Q5_CHOICE;
    if (state.matches({ PARAISO: 'Q6_AGUARDANDO' })) return Q6_CHOICE;
    return null;
  }, [state.value]);

  // Determine if we're in an AGUARDANDO state (used for voice choice activation)
  const isAguardando =
    state.matches({ INFERNO: 'Q1_AGUARDANDO' }) ||
    state.matches({ INFERNO: 'Q2_AGUARDANDO' }) ||
    state.matches({ PURGATORIO: 'Q3_AGUARDANDO' }) ||
    state.matches({ PURGATORIO: 'Q4_AGUARDANDO' }) ||
    state.matches({ PARAISO: 'Q5_AGUARDANDO' }) ||
    state.matches({ PARAISO: 'Q6_AGUARDANDO' });

  // Voice choice hook - active flag manages lifecycle automatically
  // MIC-02: Only activate voice choice when in AGUARDANDO AND TTS has finished
  const micShouldActivate = isAguardando && ttsComplete;

  // TTSR-03: Log activation decision for every change in activation preconditions
  useEffect(() => {
    activationLogger.log('Mic activation check', {
      state: JSON.stringify(state.value),
      isAguardando,
      ttsComplete,
      micShouldActivate,
    });

    if (isAguardando && !ttsComplete) {
      activationLogger.log('BLOCKED — waiting for ttsComplete', {
        state: JSON.stringify(state.value),
      });
    }

    if (micShouldActivate) {
      activationLogger.log('ACTIVATED — ttsComplete verified true before mic', {
        state: JSON.stringify(state.value),
      });
    }
  }, [isAguardando, ttsComplete, micShouldActivate, state.value]);

  const voiceChoice = useVoiceChoice(
    activeChoiceConfig || {
      questionContext: '',
      options: { A: '', B: '' },
      eventMap: { A: '', B: '' },
    },
    micShouldActivate
  );

  // Ambient audio hook
  useAmbientAudio(state.context.currentPhase, experienceStarted);

  /**
   * Track session start - fires when sessionId changes (new session)
   */
  useEffect(() => {
    if (state.context.sessionId && !state.matches('IDLE') && experienceStarted) {
      analytics.startSession(state.context.sessionId);
    }
  }, [state.context.sessionId, experienceStarted, analytics]);

  /**
   * Track session end on FIM
   */
  useEffect(() => {
    if (state.matches('FIM') && state.context.sessionId) {
      analytics.endSession(
        state.context.sessionId,
        state.context.choices[0],        // choice1 equivalent
        state.context.choices[1] as any, // choice2 equivalent (legacy compat)
        state.context.fallbackCount,
        true, // completed
      );
    }
    prevStateRef.current = state.value;
  }, [state.value, state.context, analytics]);

  /**
   * Track session timeout - when experience goes back to IDLE from non-FIM state
   */
  useEffect(() => {
    if (state.matches('IDLE') && experienceStarted && prevStateRef.current !== 'FIM') {
      if (state.context.sessionId) {
        analytics.endSession(
          state.context.sessionId,
          state.context.choices[0],        // choice1 equivalent
          state.context.choices[1] as any, // choice2 equivalent (legacy compat)
          state.context.fallbackCount,
          false, // not completed (timeout)
        );
      }
      setExperienceStarted(false);
    }
    prevStateRef.current = state.value;
  }, [state.value, state.context, experienceStarted, analytics]);

  /**
   * Effect A: Play TTS on state change, track completion (FLOW-04, FLOW-05)
   * Cancels previous audio on state exit to prevent overlaps.
   * Sets ttsComplete=true only when playback finishes.
   * Uses setTimeout(0) to prevent React Strict Mode double-play in dev.
   */
  useEffect(() => {
    const scriptKey = getScriptKey(state);
    const stateKey = JSON.stringify(state.value);

    logger.log('Effect A triggered', { scriptKey, stateKey });

    if (!scriptKey) {
      // Non-speech states (AGUARDANDO, IDLE, FIM): don't touch ttsComplete
      return;
    }

    // Cancel previous TTS to prevent overlaps (FLOW-04)
    tts.cancel();
    setTtsComplete(false);
    ttsForStateRef.current = '';

    let cancelled = false;

    // Defer speak to next tick so Strict Mode cleanup can cancel before audio starts
    speakTimeoutRef.current = setTimeout(() => {
      if (cancelled) return;

      logger.log('speak START', { phase: state.context.currentPhase });
      tts.speak(SCRIPT[scriptKey], state.context.currentPhase, scriptKey)
        .then(() => {
          if (!cancelled) {
            logger.log('speak END — success', { stateKey });
            ttsForStateRef.current = stateKey;
            setTtsComplete(true);
          }
        })
        .catch((err) => {
          if (err.message !== 'Speech cancelled') {
            logger.error('speak FAILED', { error: err.message });
          }
          if (!cancelled && err.message !== 'Speech cancelled') {
            ttsForStateRef.current = stateKey;
            setTtsComplete(true);
          }
        });
    }, 0);

    return () => {
      logger.log('Effect A CLEANUP');
      cancelled = true;
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
      tts.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value]);

  /**
   * Effect B: Send NARRATIVA_DONE only after TTS completes (FLOW-01, FLOW-02, FLOW-05)
   * Does NOT fire in AGUARDANDO states (those wait for voice choice, not TTS).
   * Does NOT fire in FIM state (auto-resets via XState timer).
   * Guards against stale ttsComplete from previous state via ttsForStateRef.
   *
   * Includes a configurable "breathing delay" between TTS end and state advance
   * so narrative phases don't feel rushed.
   */
  useEffect(() => {
    if (!ttsComplete) return;
    if (isAguardando) return;
    if (state.matches('FIM')) return;
    if (state.matches('IDLE')) return;
    // Only auto-advance states that have TTS and expect NARRATIVA_DONE
    const scriptKey = getScriptKey(state);
    if (!scriptKey) return;
    // Prevent stale ttsComplete from previous state causing premature advance
    const stateKey = JSON.stringify(state.value);
    if (ttsForStateRef.current !== stateKey) return;

    const delay = getBreathingDelay(state);
    logger.log(`Effect B — waiting ${delay}ms before NARRATIVA_DONE`, { state: stateKey });

    if (delay === 0) {
      send({ type: 'NARRATIVA_DONE' });
      return;
    }

    let cancelled = false;
    breathingTimeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        logger.log('Effect B — sending NARRATIVA_DONE after breathing delay', { state: stateKey, delay });
        send({ type: 'NARRATIVA_DONE' });
      }
    }, delay);

    return () => {
      cancelled = true;
      if (breathingTimeoutRef.current) {
        clearTimeout(breathingTimeoutRef.current);
        breathingTimeoutRef.current = null;
      }
    };
  }, [ttsComplete, isAguardando, state, send]);

  /**
   * Handle fallback: play fallback script when needsFallback is true
   */
  useEffect(() => {
    if (!voiceChoice.needsFallback) return;

    const fallback = getFallbackScript(state);
    if (!fallback) return;

    tts.speak(fallback.segments, state.context.currentPhase, fallback.key)
      .then(() => {
        // After fallback TTS completes, restart listening
        voiceChoice.startListening();
      })
      .catch((err) => {
        console.error('Fallback TTS error:', err);
      });
  }, [voiceChoice.needsFallback, state, tts, voiceChoice]);

  /**
   * Handle choice result from voice pipeline
   */
  useEffect(() => {
    if (!voiceChoice.choiceResult) return;

    logger.log('Choice result received', {
      eventType: voiceChoice.choiceResult.eventType,
      confidence: voiceChoice.choiceResult.confidence,
      wasDefault: voiceChoice.choiceResult.wasDefault,
    });

    // Send the event to state machine
    send({ type: voiceChoice.choiceResult.eventType as any });

    // Reset voice choice for next AGUARDANDO state
    voiceChoice.reset();
  }, [voiceChoice.choiceResult, send, voiceChoice]);

  // Voice choice lifecycle is now managed internally by the hook via `active` flag

  /**
   * Start handler - unlocks AudioContext and initializes TTS service (MUST be inside user click)
   */
  const handleStart = useCallback(async () => {
    await initAudioContext();
    tts.initTTS();
    setExperienceStarted(true);
    send({ type: 'START' });
  }, [send, tts]);

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
          <WaveformVisualizer visible={tts.isSpeaking} />
          <ListeningIndicator isListening={voiceChoice.isListening} />
        </div>
      )}

      {/* Choice UI — buttons alongside voice for all 6 AGUARDANDO states */}
      {isAguardando && activeChoiceConfig && (
        <ChoiceButtons
          options={[
            { label: activeChoiceConfig.options.A, event: 'CHOICE_A' },
            { label: activeChoiceConfig.options.B, event: 'CHOICE_B' },
          ]}
          onChoice={(eventType) => send({ type: eventType as any })}
          timeoutSeconds={15}
        />
      )}

      {state.matches('FIM') && <EndFade />}

      {/* Dev skip button — advances to next state by firing NARRATIVA_DONE */}
      {experienceActive && !isAguardando && !state.matches('FIM') && (
        <button
          onClick={() => {
            tts.cancel();
            setTtsComplete(true);
            send({ type: 'NARRATIVA_DONE' });
          }}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/60 text-sm rounded backdrop-blur transition-colors"
        >
          Skip &raquo;
        </button>
      )}

      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          ttsComplete={ttsComplete}
          micShouldActivate={micShouldActivate}
          voiceLifecyclePhase={voiceChoice.lifecycle.phase}
          isRecording={voiceChoice.isListening}
          currentState={JSON.stringify(state.value)}
          attemptCount={voiceChoice.attemptCount}
        />
      )}
    </PhaseBackground>
  );
}
