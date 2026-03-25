import type { NLUService, ClassificationResult } from './index';

export class MockNLUService implements NLUService {
  private confidenceOverride: number | null = null;
  private choiceOverride: 'A' | 'B' | null = null;

  setConfidence(confidence: number): void {
    this.confidenceOverride = confidence;
  }

  setChoice(choice: 'A' | 'B'): void {
    this.choiceOverride = choice;
  }

  reset(): void {
    this.confidenceOverride = null;
    this.choiceOverride = null;
  }

  async classify(
    transcript: string,
    _questionContext: string,
    options: { A: string; B: string }
  ): Promise<ClassificationResult> {
    // Simulate API latency (~200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    if (this.confidenceOverride !== null && this.confidenceOverride < 0.7) {
      return {
        choice: 'A',
        confidence: this.confidenceOverride,
        reasoning: `Low confidence mock: transcript "${transcript}" ambiguous between "${options.A}" and "${options.B}"`,
      };
    }

    // Simple keyword matching for mock behavior
    const lower = transcript.toLowerCase();
    const choiceA = options.A.toLowerCase();
    const choiceB = options.B.toLowerCase();

    let choice: 'A' | 'B' = this.choiceOverride ?? 'A';
    if (!this.choiceOverride) {
      if (lower.includes(choiceB) || lower.includes('b') || lower.includes('silencio') || lower.includes('embora') || lower.includes('contorna')) {
        choice = 'B';
      }
    }

    return {
      choice,
      confidence: this.confidenceOverride ?? 0.85,
      reasoning: `Mock classification: "${transcript}" mapped to ${choice} (${choice === 'A' ? options.A : options.B})`,
    };
  }
}
