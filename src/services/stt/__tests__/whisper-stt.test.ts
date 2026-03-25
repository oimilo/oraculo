import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhisperSTTService } from '../whisper';

describe('WhisperSTTService', () => {
  let service: WhisperSTTService;
  let mockFetch: any;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: 'texto transcrito' }),
      })
    );
    global.fetch = mockFetch as any;

    vi.clearAllMocks();
    service = new WhisperSTTService();
  });

  it('should implement STTService interface with transcribe method', () => {
    expect(service).toBeDefined();
    expect(typeof service.transcribe).toBe('function');
  });

  it('should create FormData with audio field and call /api/stt', async () => {
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await service.transcribe(audioBlob);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/stt',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );

    // Verify FormData was created correctly
    const callArgs = mockFetch.mock.calls[0];
    const formData = callArgs[1].body as FormData;
    const audioField = formData.get('audio');
    expect(audioField).toBeInstanceOf(Blob); // FormData converts to File (extends Blob)
  });

  it('should NOT set Content-Type header (browser sets it with boundary)', async () => {
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await service.transcribe(audioBlob);

    const callArgs = mockFetch.mock.calls[0];
    const options = callArgs[1];
    expect(options.headers).toBeUndefined();
  });

  it('should return transcript text from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'olá mundo' }),
    });

    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    const result = await service.transcribe(audioBlob);

    expect(result).toBe('olá mundo');
  });

  it('should throw error when fetch returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ error: 'Whisper API error' }),
    });

    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await expect(service.transcribe(audioBlob)).rejects.toThrow();
  });

  it('should throw error when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await expect(service.transcribe(audioBlob)).rejects.toThrow('Network error');
  });
});
