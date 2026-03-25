import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/api/validateEnv';

interface TTSRequestBody {
  text: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: Partial<TTSRequestBody> = await request.json();

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
    } catch (error) {
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 500 }
      );
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    // Call ElevenLabs API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: body.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: body.voice_settings.stability,
            similarity_boost: body.voice_settings.similarity_boost,
            style: body.voice_settings.style,
            use_speaker_boost: true,
          },
        }),
      }
    );

    // Handle ElevenLabs error response
    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      return NextResponse.json(
        { error: `ElevenLabs API error: ${elevenLabsResponse.status}` },
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
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
