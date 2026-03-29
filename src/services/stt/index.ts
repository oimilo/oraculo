import { MockSTTService } from './mock';
import { WhisperSTTService } from './whisper';

export interface STTService {
  transcribe(audioBlob: Blob, promptHint?: string): Promise<string>;
}

export function createSTTService(): STTService {
  // STT must always be real — user voice input requires actual transcription
  if (typeof window !== 'undefined') {
    return new WhisperSTTService();
  }
  return new MockSTTService();
}
