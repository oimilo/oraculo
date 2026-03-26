import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/api/validateEnv';

interface NLURequestBody {
  transcript: string;
  questionContext: string;
  options: { A: string; B: string };
}

interface ClassificationResult {
  choice: 'A' | 'B';
  confidence: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get API key
    let apiKey: string;
    try {
      apiKey = requireEnv('ANTHROPIC_API_KEY');
    } catch (error) {
      return NextResponse.json(
        { error: 'NLU service not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body: Partial<NLURequestBody> = await request.json();

    if (!body.transcript || body.transcript.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required field: transcript' },
        { status: 400 }
      );
    }

    if (!body.options || !body.options.A || !body.options.B) {
      return NextResponse.json(
        { error: 'Missing required field: options' },
        { status: 400 }
      );
    }

    // Build prompts
    const systemPrompt =
      'You are a binary classifier for an interactive art installation called O Oraculo. ' +
      'Classify the visitor\'s response into one of two options. ' +
      'Return ONLY valid JSON with fields: choice ("A" or "B"), confidence (0.0 to 1.0), ' +
      'reasoning (brief explanation in Portuguese).';

    const userMessage =
      `Context: ${body.questionContext}\n\n` +
      `Option A: ${body.options.A}\n` +
      `Option B: ${body.options.B}\n\n` +
      `Visitor said: "${body.transcript}"\n\n` +
      `Classify this response as A or B. Return JSON only.`;

    // Set up 10-second timeout to prevent stuck states
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Call Anthropic Messages API
      const anthropicResponse = await fetch(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            messages: [{ role: 'user', content: userMessage }],
            system: systemPrompt,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Handle Anthropic error response
      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        return NextResponse.json(
          { error: `Anthropic API error: ${anthropicResponse.status}` },
          { status: 502 }
        );
      }

      // Parse response
      const result = await anthropicResponse.json();
      const content = result.content[0].text;

      // Try to parse the JSON classification
      let classification: ClassificationResult;
      try {
        classification = JSON.parse(content);

        // Validate classification structure
        if (
          !classification.choice ||
          (classification.choice !== 'A' && classification.choice !== 'B') ||
          typeof classification.confidence !== 'number' ||
          typeof classification.reasoning !== 'string'
        ) {
          throw new Error('Invalid classification structure');
        }
      } catch (parseError) {
        // Fallback classification if parsing fails
        classification = {
          choice: 'A',
          confidence: 0.5,
          reasoning: 'Failed to parse classification response',
        };
      }

      return NextResponse.json(classification);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'NLU request timeout' },
          { status: 504 }
        );
      }

      throw fetchError; // Re-throw other errors
    }
  } catch (error) {
    console.error('NLU API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
