import type { STTService } from './index';

export class MockSTTService implements STTService {
  private nextTranscript: string = 'vozes';

  setNextTranscript(transcript: string): void {
    this.nextTranscript = transcript;
  }

  async transcribe(_audioBlob: Blob): Promise<string> {
    // Simulate API latency (~500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.nextTranscript;
  }
}
