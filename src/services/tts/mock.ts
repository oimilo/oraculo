import type { TTSService, VoiceSettings } from './index';
import type { SpeechSegment } from '@/types';
import { VOICE_DIRECTIONS } from '@/types';
import { speakSegments, cancelSpeech } from '@/lib/audio/speechSynthesis';

export class MockTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    try {
      const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];
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
