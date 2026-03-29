import { useState, useRef, useCallback } from 'react';
import { createTTSService, PHASE_VOICE_SETTINGS, type TTSService } from '@/services/tts';
import type { SpeechSegment, NarrativePhase } from '@/types';
import { createLogger } from '@/lib/debug/logger';

export interface UseTTSOrchestratorReturn {
  isSpeaking: boolean;
  speak: (segments: SpeechSegment[], phase: NarrativePhase, scriptKey?: string) => Promise<void>;
  cancel: () => void;
  initTTS: () => void;
}

const logger = createLogger('TTS');

/**
 * TTS orchestration hook - manages TTS service lifecycle and speaking state.
 * Decoupled from voice choice hook to eliminate shared mutable refs.
 */
export function useTTSOrchestrator(): UseTTSOrchestratorReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsRef = useRef<TTSService | null>(null);
  const isSpeakingRef = useRef(false);

  const initTTS = useCallback(() => {
    logger.log('initTTS called');
    if (!ttsRef.current) {
      ttsRef.current = createTTSService();
    }
  }, []);

  const cancel = useCallback(() => {
    logger.log('cancel called');
    if (ttsRef.current) {
      ttsRef.current.cancel();
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (segments: SpeechSegment[], phase: NarrativePhase, scriptKey?: string): Promise<void> => {
    if (!ttsRef.current) {
      throw new Error('TTS service not initialized. Call initTTS() first.');
    }

    // Cancel any in-progress speech
    if (isSpeakingRef.current) {
      cancel();
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    logger.log('speak START', { segmentCount: segments.length, phase, scriptKey });
    try {
      logger.log('speak — calling service');
      await ttsRef.current.speak(segments, PHASE_VOICE_SETTINGS[phase], scriptKey);
      logger.log('speak END — success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'Speech cancelled') {
        logger.log('speak END — cancelled');
      } else {
        logger.error('speak END — error', msg);
      }
      throw err;
    } finally {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  }, [cancel]);

  return {
    isSpeaking,
    speak,
    cancel,
    initTTS,
  };
}
