import { MockNLUService } from './mock';

export interface ClassificationResult {
  choice: 'A' | 'B';
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}

export interface NLUService {
  classify(
    transcript: string,
    questionContext: string,
    options: { A: string; B: string }
  ): Promise<ClassificationResult>;
}

export function createNLUService(): NLUService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    // TODO(Phase 5): return new ClaudeNLUService()
    // Real service will call /api/nlu route
    console.warn('[NLU] Real service not yet implemented, using mock');
  }
  return new MockNLUService();
}
