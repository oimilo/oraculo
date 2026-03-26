import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/api/validateEnv';

interface TTSRequestBody {
  text: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed?: number;
  };
}

// Concurrency limiter — ElevenLabs allows max 3 parallel, we use 2 to leave headroom
const MAX_CONCURRENT = 2;
let activeCalls = 0;
const queue: Array<{ resolve: () => void }> = [];

function acquireSlot(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT) {
    activeCalls++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push({ resolve });
  });
}

function releaseSlot(): void {
  activeCalls--;
  const next = queue.shift();
  if (next) {
    activeCalls++;
    next.resolve();
  }
}

async function callElevenLabsWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < maxRetries) {
      const backoffMs = 1000 * (attempt + 1); // 1s, 2s
      console.warn(`[TTS] Rate limited, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }

    return response;
  }

  // Should not reach here, but TypeScript needs it
  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    // Parse body — handle empty/aborted requests gracefully
    let body: Partial<TTSRequestBody>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or empty request body' },
        { status: 400 }
      );
    }

    if (!body.text || body.text.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    if (!body.voice_settings) {
      return NextResponse.json(
        { error: 'Missing required field: voice_settings' },
        { status: 400 }
      );
    }

    // Get API key and voice ID
    let apiKey: string;
    try {
      apiKey = requireEnv('ELEVENLABS_API_KEY');
    } catch {
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 500 }
      );
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const useV3 = process.env.USE_V3_MODEL === 'true';

    // Wait for a concurrency slot
    await acquireSlot();

    try {
      // Build request body conditionally for v2/v3 model
      // v3: eleven_v3, language_code pt-BR, NO speed, NO use_speaker_boost
      // v2: eleven_multilingual_v2, use_speaker_boost:true, speed if provided
      const apiBody: Record<string, unknown> = {
        text: body.text,
        model_id: useV3 ? 'eleven_v3' : 'eleven_multilingual_v2',
        voice_settings: {
          stability: body.voice_settings.stability,
          similarity_boost: body.voice_settings.similarity_boost,
          style: body.voice_settings.style,
          ...(useV3 ? {} : {
            use_speaker_boost: true,
            ...(body.voice_settings.speed != null ? { speed: body.voice_settings.speed } : {}),
          }),
        },
        ...(useV3 ? { language_code: 'pt-BR' } : {}),
      };

      const elevenLabsResponse = await callElevenLabsWithRetry(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify(apiBody),
        }
      );

      // Handle ElevenLabs error response
      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        console.error(`[TTS] ElevenLabs ${elevenLabsResponse.status}: ${errorText}`);
        return NextResponse.json(
          { error: `ElevenLabs API error: ${elevenLabsResponse.status}`, detail: errorText },
          { status: 502 }
        );
      }

      // Return audio stream
      return new NextResponse(elevenLabsResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache',
        },
      });
    } finally {
      releaseSlot();
    }
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
