import type { STTService } from './index';

export class WhisperSTTService implements STTService {
  async transcribe(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type — browser sets it with multipart boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'STT request failed' }));
      throw new Error(errorData.error || `STT API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  }
}
