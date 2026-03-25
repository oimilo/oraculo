import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/lib/api/validateEnv';

export async function POST(request: NextRequest) {
  try {
    // Get API key
    let apiKey: string;
    try {
      apiKey = requireEnv('OPENAI_API_KEY');
    } catch (error) {
      return NextResponse.json(
        { error: 'STT service not configured' },
        { status: 500 }
      );
    }

    // Parse FormData from request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing required field: audio' },
        { status: 400 }
      );
    }

    // Build FormData for Whisper API
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, audioFile.name || 'audio.webm');
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'pt');
    whisperForm.append('response_format', 'json');

    // Call OpenAI Whisper API
    const whisperResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: whisperForm,
      }
    );

    // Handle Whisper error response
    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      return NextResponse.json(
        { error: `Whisper API error: ${whisperResponse.status}` },
        { status: 502 }
      );
    }

    // Parse and return transcription
    const result = await whisperResponse.json();
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('STT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
