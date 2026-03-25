import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClaudeNLUService } from '../claude';
import type { ClassificationResult } from '../index';

describe('ClaudeNLUService', () => {
  let service: ClaudeNLUService;
  let mockFetch: any;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choice: 'A',
          confidence: 0.85,
          reasoning: 'Mock reasoning',
        }),
      })
    );
    global.fetch = mockFetch as any;

    vi.clearAllMocks();
    service = new ClaudeNLUService();
  });

  it('should implement NLUService interface with classify method', () => {
    expect(service).toBeDefined();
    expect(typeof service.classify).toBe('function');
  });

  it('should call fetch with POST to /api/nlu with JSON body', async () => {
    const transcript = 'vozes';
    const questionContext = 'Escolha entre vozes ou silencio';
    const options = { A: 'Vozes', B: 'Silencio' };

    await service.classify(transcript, questionContext, options);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/nlu',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, questionContext, options }),
      }
    );
  });

  it('should return ClassificationResult with choice, confidence, and reasoning', async () => {
    const result = await service.classify(
      'vozes',
      'Escolha entre vozes ou silencio',
      { A: 'Vozes', B: 'Silencio' }
    );

    expect(result).toHaveProperty('choice');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('reasoning');
    expect(result.choice).toMatch(/^[AB]$/);
    expect(typeof result.confidence).toBe('number');
    expect(typeof result.reasoning).toBe('string');
  });

  it('should correctly parse choice B with high confidence', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choice: 'B',
        confidence: 0.92,
        reasoning: 'Visitor chose silence',
      }),
    });

    const result = await service.classify(
      'silencio',
      'Escolha entre vozes ou silencio',
      { A: 'Vozes', B: 'Silencio' }
    );

    expect(result.choice).toBe('B');
    expect(result.confidence).toBe(0.92);
    expect(result.reasoning).toBe('Visitor chose silence');
  });

  it('should throw error when fetch returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ error: 'Anthropic API error' }),
    });

    await expect(
      service.classify('test', 'context', { A: 'Option A', B: 'Option B' })
    ).rejects.toThrow();
  });

  it('should throw error when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      service.classify('test', 'context', { A: 'Option A', B: 'Option B' })
    ).rejects.toThrow('Network error');
  });
});
