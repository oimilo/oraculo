import { MockSTTService } from './mock';

export interface STTService {
  transcribe(audioBlob: Blob): Promise<string>;
}

export function createSTTService(): STTService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    // TODO(Phase 5): return new WhisperSTTService()
    // Real service will call /api/stt route
    console.warn('[STT] Real service not yet implemented, using mock');
  }
  return new MockSTTService();
}
