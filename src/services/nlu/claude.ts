import type { NLUService, ClassificationResult } from './index';

export class ClaudeNLUService implements NLUService {
  async classify(
    transcript: string,
    questionContext: string,
    options: { A: string; B: string }
  ): Promise<ClassificationResult> {
    const response = await fetch('/api/nlu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, questionContext, options }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'NLU request failed' }));
      throw new Error(errorData.error || `NLU API error: ${response.status}`);
    }

    const result: ClassificationResult = await response.json();
    return result;
  }
}
