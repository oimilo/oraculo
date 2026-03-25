import type { TTSService, VoiceSettings } from './index';
import type { SpeechSegment } from '@/types';
import { VOICE_DIRECTIONS } from '@/types';
import { speakSegments, cancelSpeech } from '@/lib/audio/speechSynthesis';

export class MockTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];
    return speakSegments(segments, voiceDirection);
  }

  cancel(): void {
    cancelSpeech();
  }
}
