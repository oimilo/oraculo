import { MockSTTService } from './mock';
import { WhisperSTTService } from './whisper';

export interface STTService {
  transcribe(audioBlob: Blob): Promise<string>;
}

export function createSTTService(): STTService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    return new WhisperSTTService();
  }
  return new MockSTTService();
}
