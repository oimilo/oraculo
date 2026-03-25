import { useReducer, useCallback, useRef, useEffect } from 'react';
import { useMicrophone } from './useMicrophone';
import { createSTTService, type STTService } from '@/services/stt';
import { createNLUService, type NLUService, type ClassificationResult } from '@/services/nlu';

export interface ChoiceConfig {
  /** Context of the question being asked (for NLU) */
  questionContext: string;
  /** The two options for binary classification */
  options: { A: string; B: string };
  /** Map classification result to XState event type */
  eventMap: { A: string; B: string };
  /** Confidence threshold for accepting classification. Default: 0.7 */
  confidenceThreshold?: number;
  /** Maximum fallback attempts before defaulting. Default: 2 */
  maxAttempts?: number;
  /** Default event type on timeout/max attempts. Default: eventMap.B */
  defaultEvent?: string;
  /** How long to record before auto-stopping (ms). Default: 6000 */
  listeningDurationMs?: number;
}

export interface VoiceChoiceResult {
  eventType: string;
  confidence: number;
  transcript: string;
  wasDefault: boolean;
}

export type VoiceLifecyclePhase = 'idle' | 'listening' | 'processing' | 'decided' | 'fallback';

export type VoiceLifecycle =
  | { phase: 'idle' }
  | { phase: 'listening'; startedAt: number; previousAttempt?: number }
  | { phase: 'processing'; blob: Blob; attempt: number }
  | { phase: 'decided'; result: VoiceChoiceResult }
  | { phase: 'fallback'; attempt: number };

export type VoiceEvent =
  | { type: 'START_LISTENING' }
  | { type: 'AUDIO_READY'; blob: Blob }
  | { type: 'CLASSIFICATION_COMPLETE'; result: VoiceChoiceResult }
  | { type: 'NEED_FALLBACK'; attempt: number }
  | { type: 'RESET' };

export interface UseVoiceChoiceReturn {
  // Backward compatible
  isListening: boolean;
  isProcessing: boolean;
  choiceResult: VoiceChoiceResult | null;
  needsFallback: boolean;
  attemptCount: number;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  reset: () => void;
  // New: explicit lifecycle
  lifecycle: VoiceLifecycle;
  dispatch: React.Dispatch<VoiceEvent>;
}

const MAX_ATTEMPTS_DEFAULT = 2;
const CONFIDENCE_THRESHOLD_DEFAULT = 0.7;
const LISTENING_DURATION_DEFAULT = 6000;

/**
 * Voice lifecycle reducer - explicit finite state machine
 */
export function voiceLifecycleReducer(state: VoiceLifecycle, event: VoiceEvent): VoiceLifecycle {
  switch (state.phase) {
    case 'idle':
      if (event.type === 'START_LISTENING') {
        return { phase: 'listening', startedAt: Date.now() };
      }
      return state;

    case 'listening':
      if (event.type === 'AUDIO_READY') {
        // Use previous attempt count + 1, or start at 1
        const attempt = (state.previousAttempt ?? 0) + 1;
        return { phase: 'processing', blob: event.blob, attempt };
      }
      return state;

    case 'processing':
      if (event.type === 'CLASSIFICATION_COMPLETE') {
        return { phase: 'decided', result: event.result };
      }
      if (event.type === 'NEED_FALLBACK') {
        return { phase: 'fallback', attempt: event.attempt };
      }
      return state;

    case 'fallback':
      if (event.type === 'START_LISTENING') {
        // Preserve the attempt count when retrying from fallback
        return { phase: 'listening', startedAt: Date.now(), previousAttempt: state.attempt };
      }
      return state;

    case 'decided':
      if (event.type === 'RESET') {
        return { phase: 'idle' };
      }
      return state;

    default:
      return state;
  }
}

/**
 * Voice choice hook with lifecycle managed by `active` flag.
 * When active=true, starts recording → auto-stop → STT → NLU → choiceResult.
 * When active=false, stops everything and resets.
 */
export function useVoiceChoice(config: ChoiceConfig, active: boolean): UseVoiceChoiceReturn {
  const { isRecording, audioBlob, error: micError, startRecording, stopRecording } = useMicrophone();

  const [lifecycle, dispatch] = useReducer(voiceLifecycleReducer, { phase: 'idle' });
  const [error, setError] = useReducer((_: string | null, newError: string | null) => newError, null);

  const sttRef = useRef<STTService | null>(null);
  const nluRef = useRef<NLUService | null>(null);

  // Freeze config in a ref while active — prevents stale closure in processAudio
  const configRef = useRef(config);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    if (active) {
      configRef.current = config;
    }
  }, [config, active]);

  // Lazy-init services
  const getSTT = useCallback((): STTService => {
    if (!sttRef.current) {
      sttRef.current = createSTTService();
    }
    return sttRef.current;
  }, []);

  const getNLU = useCallback((): NLUService => {
    if (!nluRef.current) {
      nluRef.current = createNLUService();
    }
    return nluRef.current;
  }, []);

  const threshold = config.confidenceThreshold ?? CONFIDENCE_THRESHOLD_DEFAULT;
  const maxAttempts = config.maxAttempts ?? MAX_ATTEMPTS_DEFAULT;
  const defaultEvent = config.defaultEvent ?? config.eventMap.B;
  const listeningDuration = config.listeningDurationMs ?? LISTENING_DURATION_DEFAULT;

  const startListening = useCallback(async () => {
    setError(null);
    dispatch({ type: 'START_LISTENING' });
    console.log('[VoiceChoice] startListening, duration:', listeningDuration);
    await startRecording(listeningDuration);
  }, [startRecording, listeningDuration]);

  const stopListening = useCallback(() => {
    console.log('[VoiceChoice] stopListening');
    stopRecording();
  }, [stopRecording]);

  const reset = useCallback(() => {
    console.log('[VoiceChoice] reset');
    dispatch({ type: 'RESET' });
    setError(null);
  }, []);

  /**
   * Lifecycle: start recording when active, stop when inactive.
   * The auto-stop timer lives inside useMicrophone — immune to React re-renders.
   */
  const activationHandledRef = useRef(false);
  useEffect(() => {
    if (!active) {
      // Deactivating: stop recording and reset state
      stopRecording();
      if (lifecycle.phase !== 'idle') {
        dispatch({ type: 'RESET' });
      }
      activationHandledRef.current = false;
      return;
    }

    // Activating: start capture only once per activation
    if (!activationHandledRef.current) {
      activationHandledRef.current = true;
      console.log('[VoiceChoice] Active — starting capture');
      startListening().catch((err) => {
        console.error('[VoiceChoice] Failed to start listening:', err);
      });
    }

    return () => {
      // Cleanup on deactivation or unmount
      console.log('[VoiceChoice] Cleanup — stopping recording');
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Dispatch AUDIO_READY when audioBlob arrives during listening phase
  useEffect(() => {
    if (!audioBlob || lifecycle.phase !== 'listening') return;

    dispatch({ type: 'AUDIO_READY', blob: audioBlob });
  }, [audioBlob, lifecycle.phase]);

  // Process audio when in processing phase
  useEffect(() => {
    if (lifecycle.phase !== 'processing') return;

    const { blob, attempt: currentAttempt } = lifecycle;

    // Snapshot config from ref (frozen while active)
    const snap = configRef.current;

    // Guard: don't process with invalid/dummy config
    if (!snap.options.A || !snap.options.B) {
      console.log('[VoiceChoice] Ignoring audioBlob — config has empty options');
      return;
    }

    let cancelled = false;

    async function processAudio() {
      console.log('[VoiceChoice] Processing audio blob, size:', blob.size);

      try {
        // Step 1: Transcribe
        const stt = getSTT();
        const transcript = await stt.transcribe(blob);

        if (cancelled) return;

        console.log('[VoiceChoice] STT result:', JSON.stringify(transcript));

        if (!transcript || transcript.trim() === '') {
          // Empty transcript -- treat as silence
          if (currentAttempt >= maxAttempts) {
            console.log('[VoiceChoice] Max attempts reached, using default');
            dispatch({
              type: 'CLASSIFICATION_COMPLETE',
              result: {
                eventType: defaultEvent,
                confidence: 0,
                transcript: '',
                wasDefault: true,
              },
            });
          } else {
            console.log('[VoiceChoice] Empty transcript, requesting fallback');
            dispatch({ type: 'NEED_FALLBACK', attempt: currentAttempt });
          }
          return;
        }

        // Step 2: Classify (using frozen config snapshot)
        const nlu = getNLU();
        const classification: ClassificationResult = await nlu.classify(
          transcript,
          snap.questionContext,
          snap.options
        );

        if (cancelled) return;

        console.log('[VoiceChoice] NLU result:', JSON.stringify(classification));

        // Step 3: Check confidence
        if (classification.confidence >= threshold) {
          const eventType = classification.choice === 'A'
            ? snap.eventMap.A
            : snap.eventMap.B;

          console.log('[VoiceChoice] Choice accepted:', eventType, 'confidence:', classification.confidence);
          dispatch({
            type: 'CLASSIFICATION_COMPLETE',
            result: {
              eventType,
              confidence: classification.confidence,
              transcript,
              wasDefault: false,
            },
          });
        } else if (currentAttempt >= maxAttempts) {
          // Max attempts reached -- use default
          console.log('[VoiceChoice] Low confidence + max attempts, using default');
          dispatch({
            type: 'CLASSIFICATION_COMPLETE',
            result: {
              eventType: defaultEvent,
              confidence: classification.confidence,
              transcript,
              wasDefault: true,
            },
          });
        } else {
          // Low confidence, can retry
          console.log('[VoiceChoice] Low confidence, requesting fallback');
          dispatch({ type: 'NEED_FALLBACK', attempt: currentAttempt });
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Voice processing failed';
          console.error('[VoiceChoice] Processing error:', message);
          setError(message);

          // On error after max attempts, default
          if (currentAttempt >= maxAttempts) {
            dispatch({
              type: 'CLASSIFICATION_COMPLETE',
              result: {
                eventType: defaultEvent,
                confidence: 0,
                transcript: '',
                wasDefault: true,
              },
            });
          } else {
            dispatch({ type: 'NEED_FALLBACK', attempt: currentAttempt });
          }
        }
      }
    }

    processAudio();

    return () => {
      cancelled = true;
    };
  }, [lifecycle, getSTT, getNLU, threshold, maxAttempts, defaultEvent]);

  // Derive backward-compatible return values from lifecycle
  const isListening = isRecording;
  const isProcessing = lifecycle.phase === 'processing';
  const needsFallback = lifecycle.phase === 'fallback';
  const choiceResult = lifecycle.phase === 'decided' ? lifecycle.result : null;
  const attemptCount =
    lifecycle.phase === 'processing' ? lifecycle.attempt :
    lifecycle.phase === 'fallback' ? lifecycle.attempt :
    0;

  return {
    isListening,
    isProcessing,
    choiceResult,
    needsFallback,
    attemptCount,
    error: error || micError,
    startListening,
    stopListening,
    reset,
    lifecycle,
    dispatch,
  };
}
