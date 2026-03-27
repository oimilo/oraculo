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
    console.log('[STT] Request received');
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    console.log('[STT] Audio file:', audioFile ? `${audioFile.size} bytes, type=${audioFile.type}` : 'MISSING');

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing required field: audio' },
        { status: 400 }
      );
    }

    // Empty blob — skip Whisper call, return empty transcript
    if (audioFile.size === 0) {
      return NextResponse.json({ text: '' });
    }

    // Build FormData for Whisper API
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, audioFile.name || 'audio.webm');
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'pt');
    whisperForm.append('response_format', 'json');

    // Set up 10-second timeout to prevent stuck states
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Call OpenAI Whisper API
      const whisperResponse = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: whisperForm,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Handle Whisper error response
      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        console.error('[STT] Whisper API error:', whisperResponse.status, errorText);
        return NextResponse.json(
          { error: `Whisper API error: ${whisperResponse.status}` },
          { status: 502 }
        );
      }

      // Parse and return transcription
      const result = await whisperResponse.json();
      console.log('[STT] Whisper raw:', JSON.stringify(result));

      // Filter known Whisper hallucinations (produced when audio is silence/noise)
      const HALLUCINATION_PATTERNS = [
        'amara.org', 'legendas', 'subtítulos', 'transcrição por',
        'obrigado por assistir', 'inscreva-se', 'subscribe',
      ];
      const lower = (result.text || '').toLowerCase();
      const isHallucination = HALLUCINATION_PATTERNS.some(p => lower.includes(p));
      const text = isHallucination ? '' : result.text;
      if (isHallucination) console.log('[STT] Filtered hallucination:', result.text);

      return NextResponse.json({ text });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'STT request timeout' },
          { status: 504 }
        );
      }

      throw fetchError; // Re-throw other errors
    }
  } catch (error) {
    console.error('STT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
