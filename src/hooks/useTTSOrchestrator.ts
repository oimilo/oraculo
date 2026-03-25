import { useState, useRef, useCallback } from 'react';
import { createTTSService, PHASE_VOICE_SETTINGS, type TTSService } from '@/services/tts';
import type { SpeechSegment, NarrativePhase } from '@/types';

export interface UseTTSOrchestratorReturn {
  isSpeaking: boolean;
  speak: (segments: SpeechSegment[], phase: NarrativePhase) => Promise<void>;
  cancel: () => void;
  initTTS: () => void;
}

/**
 * TTS orchestration hook - manages TTS service lifecycle and speaking state.
 * Decoupled from voice choice hook to eliminate shared mutable refs.
 */
export function useTTSOrchestrator(): UseTTSOrchestratorReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsRef = useRef<TTSService | null>(null);
  const isSpeakingRef = useRef(false);

  const initTTS = useCallback(() => {
    if (!ttsRef.current) {
      ttsRef.current = createTTSService();
    }
  }, []);

  const cancel = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.cancel();
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (segments: SpeechSegment[], phase: NarrativePhase): Promise<void> => {
    if (!ttsRef.current) {
      throw new Error('TTS service not initialized. Call initTTS() first.');
    }

    // Cancel any in-progress speech
    if (isSpeakingRef.current) {
      cancel();
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    try {
      await ttsRef.current.speak(segments, PHASE_VOICE_SETTINGS[phase]);
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
