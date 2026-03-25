import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../route';
import { requireEnv } from '@/lib/api/validateEnv';

describe('requireEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw Error with message containing env var name when unset', () => {
    delete process.env.ELEVENLABS_API_KEY;

    expect(() => requireEnv('ELEVENLABS_API_KEY')).toThrow('ELEVENLABS_API_KEY');
  });

  it('should return the value string when env var is set', () => {
    process.env.ELEVENLABS_API_KEY = 'test-key-123';

    const result = requireEnv('ELEVENLABS_API_KEY');
    expect(result).toBe('test-key-123');
  });

  it('should throw when env var is empty string', () => {
    process.env.ELEVENLABS_API_KEY = '';

    expect(() => requireEnv('ELEVENLABS_API_KEY')).toThrow('Missing required environment variable');
  });
});

describe('POST /api/tts', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, ELEVENLABS_API_KEY: 'test-api-key' };
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('should return 400 with JSON error when text field is missing', async () => {
    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({ voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 0.9 } }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error).toContain('text');
  });

  it('should return 400 with JSON error when voice_settings field is missing', async () => {
    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello world' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error).toContain('voice_settings');
  });

  it('should return 500 with JSON error when ELEVENLABS_API_KEY is missing', async () => {
    delete process.env.ELEVENLABS_API_KEY;

    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Hello world',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 0.9 }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should call ElevenLabs API at correct URL with correct headers', async () => {
    const mockStream = new ReadableStream();
    const mockElevenLabsResponse = {
      ok: true,
      status: 200,
      body: mockStream,
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockElevenLabsResponse);

    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Hello world',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 0.9 }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.elevenlabs.io/v1/text-to-speech'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'xi-api-key': 'test-api-key',
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        }),
      })
    );
  });

  it('should return audio/mpeg content-type on success', async () => {
    const mockStream = new ReadableStream();
    const mockElevenLabsResponse = {
      ok: true,
      status: 200,
      body: mockStream,
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockElevenLabsResponse);

    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Hello world',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 0.9 }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
  });

  it('should return 502 when ElevenLabs API returns error', async () => {
    const mockElevenLabsResponse = {
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockElevenLabsResponse);

    const request = new Request('http://localhost/api/tts', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Hello world',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, speed: 0.9 }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBeDefined();
  });
});
