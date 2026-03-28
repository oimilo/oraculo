import type { TTSService, VoiceSettings } from './index';
import type { SpeechSegment } from '@/types';
import { VOICE_DIRECTIONS } from '@/types';
import { waitForVoices, speakSegments, cancelSpeech } from '@/lib/audio/speechSynthesis';

export class MockTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings, _scriptKey?: string): Promise<void> {
    try {
      const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];

      // TTSR-01: Wait for voices with 3s timeout
      const voices = await waitForVoices(3000);

      if (voices.length === 0) {
        // TTSR-02: No voices — simulate bounded delay instead of hanging
        const totalDuration = segments.reduce(
          (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
          0
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
        return;
      }

      // Voices available — speak normally
      return await speakSegments(segments, voiceDirection);
    } catch {
      // Fallback: simulate speech duration when SpeechSynthesis unavailable
      const totalDuration = segments.reduce(
        (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
        0
      );
      await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
    }
  }

  cancel(): void {
    cancelSpeech();
  }
}
