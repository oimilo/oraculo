import { MockNLUService } from './mock';
import { ClaudeNLUService } from './claude';

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
  // NLU must always be real — user response classification requires LLM
  if (typeof window !== 'undefined') {
    return new ClaudeNLUService();
  }
  return new MockNLUService();
}
