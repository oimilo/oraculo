import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/api/validateEnv';

interface NLURequestBody {
  transcript: string;
  questionContext: string;
  options: { A: string; B: string };
  keywords?: { A: string[]; B: string[] };
}

interface ClassificationResult {
  choice: 'A' | 'B';
  confidence: number;
  reasoning: string;
}

/**
 * Normalize a string for comparison: lowercase, trim, strip accents.
 */
function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Try to extract JSON from a string that might be wrapped in markdown code blocks.
 */
function extractJSON(text: string): string {
  // Try raw text first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;

  // Extract from ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Extract first { ... } block
  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];

  return trimmed;
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
    console.log('[NLU] Request received');
    const body: Partial<NLURequestBody> = await request.json();
    console.log('[NLU] Input:', JSON.stringify({ transcript: body.transcript, options: body.options }));

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

    // Direct keyword match — skip LLM when transcript clearly matches an option
    const normalizedTranscript = normalize(body.transcript);
    const normalizedA = normalize(body.options.A);
    const normalizedB = normalize(body.options.B);

    if (normalizedTranscript === normalizedA || normalizedTranscript.includes(normalizedA)) {
      const result: ClassificationResult = {
        choice: 'A',
        confidence: 1.0,
        reasoning: `Correspondência direta: "${body.transcript}" = opção A "${body.options.A}"`,
      };
      console.log('[NLU] Direct match → A:', JSON.stringify(result));
      return NextResponse.json(result);
    }

    if (normalizedTranscript === normalizedB || normalizedTranscript.includes(normalizedB)) {
      const result: ClassificationResult = {
        choice: 'B',
        confidence: 1.0,
        reasoning: `Correspondência direta: "${body.transcript}" = opção B "${body.options.B}"`,
      };
      console.log('[NLU] Direct match → B:', JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Keyword matching — check if transcript contains any keyword for A or B
    if (body.keywords) {
      const matchesA = (body.keywords.A || []).filter(kw => normalizedTranscript.includes(normalize(kw)));
      const matchesB = (body.keywords.B || []).filter(kw => normalizedTranscript.includes(normalize(kw)));

      // Only use keyword match if one side matches and the other doesn't (unambiguous)
      if (matchesA.length > 0 && matchesB.length === 0) {
        const result: ClassificationResult = {
          choice: 'A',
          confidence: 0.95,
          reasoning: `Keyword match: "${body.transcript}" contém [${matchesA.join(', ')}] → opção A "${body.options.A}"`,
        };
        console.log('[NLU] Keyword match → A:', JSON.stringify(result));
        return NextResponse.json(result);
      }

      if (matchesB.length > 0 && matchesA.length === 0) {
        const result: ClassificationResult = {
          choice: 'B',
          confidence: 0.95,
          reasoning: `Keyword match: "${body.transcript}" contém [${matchesB.join(', ')}] → opção B "${body.options.B}"`,
        };
        console.log('[NLU] Keyword match → B:', JSON.stringify(result));
        return NextResponse.json(result);
      }

      // Both sides match or neither — fall through to LLM
      if (matchesA.length > 0 && matchesB.length > 0) {
        console.log('[NLU] Ambiguous keyword match, deferring to Claude', { matchesA, matchesB });
      }
    }

    console.log('[NLU] No direct/keyword match, calling Claude', { normalizedTranscript, normalizedA, normalizedB });

    // Build prompts
    const systemPrompt =
      'You are a binary classifier for an interactive art installation ("O Oráculo"). ' +
      'The oracle presents poetic/metaphorical scenarios and asks the visitor to choose between two symbolic actions. ' +
      'The visitor responds by voice in Brazilian Portuguese — their words may be indirect, metaphorical, or colloquial. ' +
      'Interpret their INTENT strictly in the context of the scenario and the two options provided. ' +
      'Do NOT apply general assumptions about word meanings — words like "sair", "ir embora" may mean different things depending on the scenario context. ' +
      'Return ONLY raw JSON (no markdown, no code blocks). ' +
      'Format: {"choice":"A","confidence":0.9,"reasoning":"..."}';

    const userMessage =
      `Scenario: ${body.questionContext || 'No context provided'}\n` +
      `Option A: ${body.options.A}\n` +
      `Option B: ${body.options.B}\n` +
      `Visitor said: "${body.transcript}"\n\n` +
      `Which option matches the visitor's intent? Return raw JSON only, no markdown.`;

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

      // Try to parse the JSON classification (handles markdown code blocks)
      let classification: ClassificationResult;
      try {
        const jsonStr = extractJSON(content);
        console.log('[NLU] Raw response:', content);
        console.log('[NLU] Extracted JSON:', jsonStr);
        classification = JSON.parse(jsonStr);

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
        console.log('[NLU] Parse failed, attempting text-based extraction from:', content);
        // Last resort: look for "A" or "B" in the raw text
        const mentionsA = content.includes('"A"') || content.includes("'A'");
        const mentionsB = content.includes('"B"') || content.includes("'B'");
        classification = {
          choice: mentionsA && !mentionsB ? 'A' : mentionsB && !mentionsA ? 'B' : 'A',
          confidence: 0.7,
          reasoning: 'Extracted from unparseable response',
        };
      }

      console.log('[NLU] Result:', JSON.stringify(classification));
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
