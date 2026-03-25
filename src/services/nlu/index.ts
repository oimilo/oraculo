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
    throw new Error('Real NLU not implemented yet');
  }
  return new MockNLUService();
}
