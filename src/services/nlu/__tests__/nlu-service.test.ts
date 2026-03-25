import { describe, it, expect, beforeEach } from 'vitest';
import type { NLUService, ClassificationResult } from '../index';
import { createNLUService } from '../index';

describe('NLU Service Interface', () => {
  let nluService: NLUService;

  beforeEach(() => {
    nluService = createNLUService();
  });

  it('should create an NLUService with classify method', () => {
    expect(nluService).toBeDefined();
    expect(typeof nluService.classify).toBe('function');
  });

  it('should accept classify(transcript, questionContext, options) and return Promise<ClassificationResult>', async () => {
    const result = nluService.classify(
      'vozes',
      'Escolha entre vozes ou silêncio',
      { A: 'Vozes', B: 'Silêncio' }
    );

    expect(result).toBeInstanceOf(Promise);
    const classification = await result;
    expect(classification).toBeDefined();
  });

  it('should return ClassificationResult with choice, confidence, reasoning', async () => {
    const result = await nluService.classify(
      'quero vozes',
      'Escolha entre vozes ou silêncio',
      { A: 'Vozes', B: 'Silêncio' }
    );

    expect(result).toHaveProperty('choice');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('reasoning');
    expect(['A', 'B']).toContain(result.choice);
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(typeof result.reasoning).toBe('string');
  });

  it('should return mock implementation when NEXT_PUBLIC_USE_REAL_APIS is not true', () => {
    const service = createNLUService();
    expect(service).toBeDefined();
    expect(service.constructor.name).toBe('MockNLUService');
  });
});
