import { useState, useCallback, useRef, useEffect } from 'react';
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
}

export interface VoiceChoiceResult {
  eventType: string;
  confidence: number;
  transcript: string;
  wasDefault: boolean;
}

export interface UseVoiceChoiceReturn {
  isListening: boolean;
  isProcessing: boolean;
  choiceResult: VoiceChoiceResult | null;
  needsFallback: boolean;
  attemptCount: number;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  reset: () => void;
}

const MAX_ATTEMPTS_DEFAULT = 2;
const CONFIDENCE_THRESHOLD_DEFAULT = 0.7;

export function useVoiceChoice(config: ChoiceConfig): UseVoiceChoiceReturn {
  const { isRecording, audioBlob, error: micError, startRecording, stopRecording } = useMicrophone();

  const [isProcessing, setIsProcessing] = useState(false);
  const [choiceResult, setChoiceResult] = useState<VoiceChoiceResult | null>(null);
  const [needsFallback, setNeedsFallback] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sttRef = useRef<STTService | null>(null);
  const nluRef = useRef<NLUService | null>(null);

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

  const startListening = useCallback(async () => {
    setError(null);
    setNeedsFallback(false);
    await startRecording();
  }, [startRecording]);

  const stopListening = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Process audioBlob when it becomes available after stopRecording
  useEffect(() => {
    if (!audioBlob || isProcessing) return;

    let cancelled = false;

    async function processAudio() {
      setIsProcessing(true);
      setNeedsFallback(false);
      const currentAttempt = attemptCount + 1;
      setAttemptCount(currentAttempt);

      try {
        // Step 1: Transcribe
        const stt = getSTT();
        const transcript = await stt.transcribe(audioBlob!);

        if (cancelled) return;

        if (!transcript || transcript.trim() === '') {
          // Empty transcript -- treat as silence
          if (currentAttempt >= maxAttempts) {
            setChoiceResult({
              eventType: defaultEvent,
              confidence: 0,
              transcript: '',
              wasDefault: true,
            });
          } else {
            setNeedsFallback(true);
          }
          setIsProcessing(false);
          return;
        }

        // Step 2: Classify
        const nlu = getNLU();
        const classification: ClassificationResult = await nlu.classify(
          transcript,
          config.questionContext,
          config.options
        );

        if (cancelled) return;

        // Step 3: Check confidence
        if (classification.confidence >= threshold) {
          const eventType = classification.choice === 'A'
            ? config.eventMap.A
            : config.eventMap.B;

          setChoiceResult({
            eventType,
            confidence: classification.confidence,
            transcript,
            wasDefault: false,
          });
        } else if (currentAttempt >= maxAttempts) {
          // Max attempts reached -- use default
          setChoiceResult({
            eventType: defaultEvent,
            confidence: classification.confidence,
            transcript,
            wasDefault: true,
          });
        } else {
          // Low confidence, can retry
          setNeedsFallback(true);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Voice processing failed';
          setError(message);

          // On error after max attempts, default
          if (currentAttempt >= maxAttempts) {
            setChoiceResult({
              eventType: defaultEvent,
              confidence: 0,
              transcript: '',
              wasDefault: true,
            });
          } else {
            setNeedsFallback(true);
          }
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    }

    processAudio();

    return () => {
      cancelled = true;
    };
  }, [audioBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setChoiceResult(null);
    setNeedsFallback(false);
    setAttemptCount(0);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isListening: isRecording,
    isProcessing,
    choiceResult,
    needsFallback,
    attemptCount,
    error: error || micError,
    startListening,
    stopListening,
    reset,
  };
}
