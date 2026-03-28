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
        transcript: 'something ambiguous',
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
        transcript: 'something ambiguous',
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

  describe('direct keyword matching', () => {
    it('should return choice A with confidence 1.0 when transcript matches option A exactly', async () => {
      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'Vozes',
          questionContext: 'Escolha entre vozes ou silêncio',
          options: { A: 'Vozes', B: 'Silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.choice).toBe('A');
      expect(data.confidence).toBe(1.0);
      expect(global.fetch).not.toHaveBeenCalled(); // No LLM call needed
    });

    it('should return choice B with confidence 1.0 when transcript matches option B exactly', async () => {
      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'Silêncio',
          questionContext: 'Escolha entre vozes ou silêncio',
          options: { A: 'Vozes', B: 'Silencio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.choice).toBe('B');
      expect(data.confidence).toBe(1.0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should match case-insensitively and ignore accents', async () => {
      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'VOZES',
          questionContext: 'test',
          options: { A: 'vozes', B: 'silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.choice).toBe('A');
      expect(data.confidence).toBe(1.0);
    });

    it('should match when transcript contains option as substring', async () => {
      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'eu quero vozes',
          questionContext: 'test',
          options: { A: 'Vozes', B: 'Silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.choice).toBe('A');
      expect(data.confidence).toBe(1.0);
    });
  });

  describe('LLM classification (no direct match)', () => {
    // Use transcripts that don't directly match options
    it('should call Anthropic Messages API at correct URL with claude-haiku-4-5-20251001', async () => {
      const mockAnthropicResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ text: '{"choice": "A", "confidence": 0.95, "reasoning": "User wants noise"}' }]
        }),
      } as Response;

      (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'quero barulho',
          questionContext: 'Choose a path',
          options: { A: 'Vozes', B: 'Silêncio' }
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
      expect(body.model).toBe('claude-haiku-4-5-20251001');
    });

    it('should return ClassificationResult JSON on success', async () => {
      const mockAnthropicResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ text: '{"choice": "A", "confidence": 0.95, "reasoning": "User wants noise"}' }]
        }),
      } as Response;

      (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'quero barulho',
          questionContext: 'Choose a path',
          options: { A: 'Vozes', B: 'Silêncio' }
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

    it('should extract JSON from markdown code blocks', async () => {
      const mockAnthropicResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ text: '```json\n{"choice": "B", "confidence": 0.88, "reasoning": "quiet"}\n```' }]
        }),
      } as Response;

      (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'quero paz',
          questionContext: 'Choose',
          options: { A: 'Vozes', B: 'Silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.choice).toBe('B');
      expect(data.confidence).toBe(0.88);
    });

    it('should return fallback classification when JSON parsing fails', async () => {
      const mockAnthropicResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ text: 'The answer is clearly "B" based on the context' }]
        }),
      } as Response;

      (global.fetch as any).mockResolvedValueOnce(mockAnthropicResponse);

      const request = new Request('http://localhost/api/nlu', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'quero barulho',
          questionContext: 'Choose a path',
          options: { A: 'Vozes', B: 'Silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.choice).toBe('B'); // Extracted from text mentioning "B"
      expect(data.confidence).toBe(0.7);
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
          transcript: 'quero barulho',
          questionContext: 'Choose a path',
          options: { A: 'Vozes', B: 'Silêncio' }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBeDefined();
    });
  });
});
