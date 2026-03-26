import type { TTSService, VoiceSettings } from './index';
import type { SpeechSegment } from '@/types';
import { getAudioContext, initAudioContext } from '@/lib/audio/audioContext';
import { SCRIPT } from '@/data/script';

/**
 * Pre-recorded audio URLs for offline fallback.
 * Maps script keys to their corresponding audio files.
 */
const PRERECORDED_URLS: Record<string, string> = {
  APRESENTACAO: '/audio/prerecorded/apresentacao.mp3',
  INFERNO_NARRATIVA: '/audio/prerecorded/inferno_narrativa.mp3',
  INFERNO_PERGUNTA: '/audio/prerecorded/inferno_pergunta.mp3',
  INFERNO_RESPOSTA_A: '/audio/prerecorded/inferno_resposta_a.mp3',
  INFERNO_RESPOSTA_B: '/audio/prerecorded/inferno_resposta_b.mp3',
  PURGATORIO_NARRATIVA_A: '/audio/prerecorded/purgatorio_narrativa_a.mp3',
  PURGATORIO_PERGUNTA_A: '/audio/prerecorded/purgatorio_pergunta_a.mp3',
  PURGATORIO_RESPOSTA_A_FICAR: '/audio/prerecorded/purgatorio_resposta_a_ficar.mp3',
  PURGATORIO_RESPOSTA_A_EMBORA: '/audio/prerecorded/purgatorio_resposta_a_embora.mp3',
  PURGATORIO_NARRATIVA_B: '/audio/prerecorded/purgatorio_narrativa_b.mp3',
  PURGATORIO_PERGUNTA_B: '/audio/prerecorded/purgatorio_pergunta_b.mp3',
  PURGATORIO_RESPOSTA_B_PISAR: '/audio/prerecorded/purgatorio_resposta_b_pisar.mp3',
  PURGATORIO_RESPOSTA_B_CONTORNAR: '/audio/prerecorded/purgatorio_resposta_b_contornar.mp3',
  PARAISO: '/audio/prerecorded/paraiso.mp3',
  DEVOLUCAO_A_FICAR: '/audio/prerecorded/devolucao_a_ficar.mp3',
  DEVOLUCAO_A_EMBORA: '/audio/prerecorded/devolucao_a_embora.mp3',
  DEVOLUCAO_B_PISAR: '/audio/prerecorded/devolucao_b_pisar.mp3',
  DEVOLUCAO_B_CONTORNAR: '/audio/prerecorded/devolucao_b_contornar.mp3',
  ENCERRAMENTO: '/audio/prerecorded/encerramento.mp3',
  FALLBACK_INFERNO: '/audio/prerecorded/fallback_inferno.mp3',
  FALLBACK_PURGATORIO_A: '/audio/prerecorded/fallback_purgatorio_a.mp3',
  FALLBACK_PURGATORIO_B: '/audio/prerecorded/fallback_purgatorio_b.mp3',
  TIMEOUT_INFERNO: '/audio/prerecorded/timeout_inferno.mp3',
  TIMEOUT_PURGATORIO_A: '/audio/prerecorded/timeout_purgatorio_a.mp3',
  TIMEOUT_PURGATORIO_B: '/audio/prerecorded/timeout_purgatorio_b.mp3',
};

/**
 * Returns the browser's online status.
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Fallback TTS service that plays pre-recorded audio files.
 * Used when offline or when primary TTS service fails.
 */
export class FallbackTTSService implements TTSService {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private cancelled = false;
  private audioBufferCache = new Map<string, AudioBuffer>();

  constructor(context?: AudioContext) {
    this.audioContext = context || getAudioContext();
  }

  /**
   * Speaks the given segments using pre-recorded audio.
   * Matches segment text against SCRIPT entries to find the correct audio file.
   */
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    this.cancelled = false;

    // Find matching script key by comparing first segment text
    const scriptKey = this.findScriptKey(segments);

    if (!scriptKey) {
      // No match found - fall back to browser SpeechSynthesis
      return this.fallbackToSpeechSynthesis(segments, voiceSettings);
    }

    const url = PRERECORDED_URLS[scriptKey];
    if (!url) {
      return this.fallbackToSpeechSynthesis(segments, voiceSettings);
    }

    try {
      // Check for cancellation before starting
      if (this.cancelled) {
        throw new Error('Speech cancelled');
      }

      // Initialize audio context if needed
      if (!this.audioContext) {
        this.audioContext = await initAudioContext();
      }

      // Check cache first
      let buffer = this.audioBufferCache.get(scriptKey);

      if (!buffer) {
        // Fetch and decode audio
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.audioContext.decodeAudioData(arrayBuffer);

        // Cache for future use
        this.audioBufferCache.set(scriptKey, buffer);
      }

      // Check for cancellation before playback
      if (this.cancelled) {
        throw new Error('Speech cancelled');
      }

      // Play the audio
      await this.playBuffer(buffer);
    } catch (error) {
      if (this.cancelled || (error instanceof Error && error.message === 'Speech cancelled')) {
        throw new Error('Speech cancelled');
      }
      // If playback fails, fall back to SpeechSynthesis
      return this.fallbackToSpeechSynthesis(segments, voiceSettings);
    }
  }

  /**
   * Cancels current speech playback.
   */
  cancel(): void {
    this.cancelled = true;
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Already stopped or not started
      }
      this.currentSource = null;
    }
  }

  /**
   * Pre-loads all pre-recorded audio buffers into cache.
   */
  async preloadAll(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = await initAudioContext();
    }

    const promises = Object.entries(PRERECORDED_URLS).map(async ([key, url]) => {
      if (this.audioBufferCache.has(key)) {
        return; // Already cached
      }

      try {
        const response = await fetch(url);
        if (!response.ok) return;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(key, buffer);
      } catch {
        // Ignore preload failures
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Finds the script key matching the given segments.
   */
  private findScriptKey(segments: SpeechSegment[]): string | null {
    if (segments.length === 0) return null;

    const firstText = segments[0].text;

    // Search through SCRIPT entries for a match
    for (const [key, scriptSegments] of Object.entries(SCRIPT)) {
      if (scriptSegments.length > 0 && scriptSegments[0].text === firstText) {
        return key;
      }
    }

    return null;
  }

  /**
   * Plays an audio buffer using Web Audio API.
   */
  private async playBuffer(buffer: AudioBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    return new Promise((resolve, reject) => {
      if (this.cancelled) {
        reject(new Error('Speech cancelled'));
        return;
      }

      const source = this.audioContext!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext!.destination);

      this.currentSource = source;

      source.onended = () => {
        this.currentSource = null;
        if (this.cancelled) {
          reject(new Error('Speech cancelled'));
        } else {
          resolve();
        }
      };

      try {
        source.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Falls back to browser SpeechSynthesis when pre-recorded audio is unavailable.
   */
  private async fallbackToSpeechSynthesis(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // Server-side or headless — simulate delay
      const totalDuration = segments.reduce(
        (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
        0
      );
      await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
      return;
    }

    // Browser with SpeechSynthesis — use timeout-guarded waitForVoices (TTSR-01)
    const { speakSegments, waitForVoices } = await import('@/lib/audio/speechSynthesis');
    const { VOICE_DIRECTIONS } = await import('@/types');

    const voices = await waitForVoices(3000);

    if (voices.length === 0) {
      // No voices available — simulate duration
      const totalDuration = segments.reduce(
        (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
        0
      );
      await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
      return;
    }

    const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];
    return speakSegments(segments, voiceDirection);
  }

  /**
   * Helper for tests - gets pre-recorded URL for a script key.
   */
  private getPrerecordedUrl(key: string): string {
    return `/audio/prerecorded/${key.toLowerCase()}.mp3`;
  }
}
