import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../route';

describe('POST /api/nlu', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-anthropic-key' };
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('should return 400 with JSON error when transcript is missing', async () => {
    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error).toContain('transcript');
  });

  it('should return 400 with JSON error when options are missing', async () => {
    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error).toContain('options');
  });

  it('should return 500 with JSON error when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should call Anthropic Messages API at correct URL with claude-3-5-haiku-20241022', async () => {
    const mockAnthropicResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ text: '{"choice": "A", "confidence": 0.95, "reasoning": "User clearly chose left"}' }]
      }),
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-anthropic-key',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        }),
      })
    );

    // Verify model in body
    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.model).toBe('claude-3-5-haiku-20241022');
  });

  it('should return ClassificationResult JSON on success', async () => {
    const mockAnthropicResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ text: '{"choice": "A", "confidence": 0.95, "reasoning": "User clearly chose left"}' }]
      }),
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.choice).toBe('A');
    expect(data.confidence).toBe(0.95);
    expect(data.reasoning).toBeDefined();
  });

  it('should return fallback classification when JSON parsing fails', async () => {
    const mockAnthropicResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        content: [{ text: 'This is not valid JSON' }]
      }),
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.choice).toBe('A');
    expect(data.confidence).toBe(0.5);
    expect(data.reasoning).toContain('Failed to parse');
  });

  it('should return 502 when Anthropic API returns error', async () => {
    const mockAnthropicResponse = {
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response;

    (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

    const request = new Request('http://localhost/api/nlu', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I want to go left',
        questionContext: 'Choose a path',
        options: { A: 'Left', B: 'Right' }
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBeDefined();
  });
});
