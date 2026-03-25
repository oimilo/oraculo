import { MockSTTService } from './mock';

export interface STTService {
  transcribe(audioBlob: Blob): Promise<string>;
}

export function createSTTService(): STTService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    throw new Error('Real STT not implemented yet');
  }
  return new MockSTTService();
}
