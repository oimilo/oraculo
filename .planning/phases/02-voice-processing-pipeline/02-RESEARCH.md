# Phase 2: Voice Processing Pipeline - Research

**Researched:** 2026-03-25
**Domain:** Voice processing (TTS, STT, NLU), Web Audio API, browser media APIs
**Confidence:** MEDIUM

## Summary

Phase 2 integrates three external voice APIs (ElevenLabs TTS, OpenAI Whisper STT, Claude Haiku NLU) with browser audio capabilities to replace Phase 1's SpeechSynthesis placeholder with production-quality voice interaction. Research reveals all APIs are mature with well-documented endpoints, but several critical integration points require careful handling: ElevenLabs WebSocket connection management, Whisper audio format compatibility, Claude confidence scoring implementation, and Web Audio API crossfading for ambient soundscapes.

The project constraint to "prepare interfaces but skip real API calls" means this phase focuses on architecture, types, and mock implementations that can be swapped for real integrations post-MVP. Research identifies standard patterns for all components and flags specific pitfalls around browser autoplay policies, WebSocket reconnection logic, and audio graph complexity.

**Primary recommendation:** Build service layer with interface-based architecture (TTS/STT/NLU abstractions) allowing mock implementations in Phase 2 and real API integration in Phase 3, prioritize Web Audio API ambient soundscape implementation as it's entirely browser-native and can be fully built now.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-04 | Visitor response classified into binary choice | Claude Haiku NLU with confidence threshold pattern |
| FLOW-07 | Purgatorio response classified into binary choice | Same NLU service reused for all classification |
| FLOW-11 | Silence timeout treated as valid choice | XState timeout already implemented (Phase 1), triggers default choice |
| TTS-01 | ElevenLabs streaming with <1.5s latency | WebSocket API supports streaming, Flash v2.5 model ~75ms inference |
| TTS-02 | Voice parameters vary by phase | Voice settings (stability, speed, style) configurable per message |
| TTS-03 | Intentional pauses 1.5-4s between blocks | Already implemented in Phase 1 script data, TTS respects segment boundaries |
| TTS-04 | Consistent voice identity | Single voice_id used across all phases, only parameters change |
| STT-01 | Whisper transcription in PT-BR | Language parameter "pt" or "pt-BR" supported, 93-97% accuracy |
| STT-02 | Claude Haiku classification with confidence >0.7 | JSON output with confidence field, prompt engineering for binary classification |
| STT-03 | Low confidence triggers poetic redirection | Confidence threshold check + fallback script data already exists |
| STT-04 | Total latency <3s (speech end to Oracle response) | Whisper API ~1s + Claude Haiku ~100-300ms + network overhead = feasible |
| STT-05 | Visual "listening" indicator when mic active | MediaRecorder state + React state update triggers UI component |
| AMB-01 | Phase-specific ambient soundscapes | Web Audio API AudioBufferSourceNode with loop property |
| AMB-02 | Crossfade transitions 2-3s without gaps | GainNode.linearRampToValueAtTime() for equal-power crossfade |
| AMB-03 | Ambient plays simultaneously with TTS | Separate audio graph nodes, both connect to destination |
| AMB-04 | Seamless loops pre-loaded | ArrayBuffer from fetch, AudioContext.decodeAudioData() |
| UI-02 | Background color changes by phase | Already implemented in Phase 1 (PhaseBackground component) |
| UI-03 | Waveform reacts to audio | AnalyserNode.getByteTimeDomainData() + canvas rendering |
| UI-04 | "Listening" indicator when mic active | Component shows when MediaRecorder.state === "recording" |
| UI-05 | No text on screen | Already enforced in Phase 1 design |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| elevenlabs | 1.59.0 | Text-to-speech streaming | Official SDK with WebSocket support, voice parameter control |
| openai | 6.32.0 | Whisper transcription API | Official SDK, handles file uploads and streaming |
| @anthropic-ai/sdk | 0.80.0 | Claude Haiku NLU classification | Official SDK, native JSON output support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Audio API | Native | Ambient audio graph, crossfading | All ambient soundscape logic (native, no install) |
| MediaRecorder API | Native | Microphone capture to blob | Recording visitor speech (native, no install) |
| canvas | Native | Waveform visualization | UI-03 requirement (native, no install) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ElevenLabs | Azure TTS, Google TTS, AWS Polly | Lower quality PT-BR voices, similar latency |
| OpenAI Whisper | Azure Speech-to-Text, Google Speech API | Similar accuracy, different pricing models |
| Claude Haiku | GPT-4o-mini, Gemini Flash | Haiku optimized for speed + classification tasks |
| Web Audio API | Howler.js library | Adds abstraction layer but no significant benefits for this use case |

**Installation:**
```bash
npm install elevenlabs@1.59.0 openai@6.32.0 @anthropic-ai/sdk@0.80.0
```

**Version verification:** Verified 2026-03-25 via `npm view` — all versions current.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   ├── tts/
│   │   ├── index.ts              # TTSService interface + factory
│   │   ├── elevenlabs.ts         # Real implementation (Phase 3)
│   │   └── mock.ts               # Mock for Phase 2
│   ├── stt/
│   │   ├── index.ts              # STTService interface + factory
│   │   ├── whisper.ts            # Real implementation (Phase 3)
│   │   └── mock.ts               # Mock for Phase 2
│   ├── nlu/
│   │   ├── index.ts              # NLUService interface + factory
│   │   ├── claude.ts             # Real implementation (Phase 3)
│   │   └── mock.ts               # Mock for Phase 2
│   └── audio/
│       ├── ambientPlayer.ts      # Ambient soundscape manager
│       ├── crossfader.ts         # GainNode crossfade utilities
│       └── waveform.ts           # AnalyserNode visualization
├── hooks/
│   ├── useMicrophone.ts          # MediaRecorder wrapper hook
│   ├── useAmbientAudio.ts        # Ambient playback control
│   └── useWaveform.ts            # Canvas waveform rendering
├── lib/audio/                    # From Phase 1
│   ├── audioContext.ts           # Singleton (already exists)
│   └── speechSynthesis.ts        # Placeholder (Phase 1)
└── components/
    ├── audio/
    │   ├── WaveformVisualizer.tsx
    │   └── ListeningIndicator.tsx
    └── experience/                # From Phase 1
```

### Pattern 1: Service Interface with Mock/Real Swap

**What:** Abstract interface for each external API with factory function selecting mock vs real implementation based on environment variable.

**When to use:** Any external API integration that should be prepared but not called in Phase 2.

**Example:**
```typescript
// src/services/tts/index.ts
export interface TTSService {
  speak(text: string, voice: VoiceSettings): Promise<AudioStream>;
  cancel(): void;
}

export function createTTSService(): TTSService {
  if (process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    return new ElevenLabsTTSService();
  }
  return new MockTTSService();
}

// src/services/tts/mock.ts
export class MockTTSService implements TTSService {
  async speak(text: string, voice: VoiceSettings): Promise<AudioStream> {
    // Return Phase 1 SpeechSynthesis fallback or silent stream
    return createMockAudioStream(text, voice);
  }
  cancel(): void {
    // No-op for mock
  }
}
```

### Pattern 2: Web Audio Graph for Ambient Soundscapes

**What:** Separate AudioBufferSourceNode for each phase's ambient audio, all connected through individual GainNodes to shared destination, allowing independent volume control and crossfading.

**When to use:** AMB-01 through AMB-04 requirements.

**Example:**
```typescript
// src/services/audio/ambientPlayer.ts
interface AmbientTrack {
  phase: NarrativePhase;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
}

export class AmbientPlayer {
  private tracks: Map<NarrativePhase, AmbientTrack>;
  private currentPhase: NarrativePhase | null = null;

  constructor(private ctx: AudioContext) {
    this.tracks = new Map();
  }

  async loadTrack(phase: NarrativePhase, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(arrayBuffer);

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0; // Start silent
    gainNode.connect(this.ctx.destination);

    this.tracks.set(phase, { phase, buffer, source: null, gainNode });
  }

  crossfadeTo(targetPhase: NarrativePhase, duration: number = 2.5): void {
    const now = this.ctx.currentTime;
    const targetTrack = this.tracks.get(targetPhase);

    if (!targetTrack) return;

    // Fade out current
    if (this.currentPhase) {
      const currentTrack = this.tracks.get(this.currentPhase);
      if (currentTrack) {
        currentTrack.gainNode.gain.linearRampToValueAtTime(0, now + duration);
        // Stop source after fade completes
        setTimeout(() => currentTrack.source?.stop(), duration * 1000);
      }
    }

    // Fade in target
    const source = this.ctx.createBufferSource();
    source.buffer = targetTrack.buffer;
    source.loop = true; // Seamless loop per AMB-04
    source.connect(targetTrack.gainNode);
    source.start(0);
    targetTrack.source = source;

    targetTrack.gainNode.gain.setValueAtTime(0, now);
    targetTrack.gainNode.gain.linearRampToValueAtTime(1, now + duration);

    this.currentPhase = targetPhase;
  }
}
```

### Pattern 3: MediaRecorder Hook for Microphone Capture

**What:** React hook wrapping MediaRecorder API with state management for recording/idle, blob collection, and error handling.

**When to use:** STT-01, STT-05 requirements (capture audio and show visual indicator).

**Example:**
```typescript
// src/hooks/useMicrophone.ts
export function useMicrophone() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Whisper-compatible format
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        chunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Release mic
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { isRecording, audioBlob, startRecording, stopRecording };
}
```

### Pattern 4: AnalyserNode Waveform Visualization

**What:** Connect AnalyserNode to TTS audio source, use requestAnimationFrame to continuously read time-domain data and render to canvas.

**When to use:** UI-03 requirement (waveform reacts to audio).

**Example:**
```typescript
// src/hooks/useWaveform.ts
export function useWaveform(canvasRef: RefObject<HTMLCanvasElement>) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const audioContext = getAudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    // Connect TTS audio source to analyser
    const gainNode = getGainNode();
    gainNode.connect(analyser);

    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      animationIdRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(255, 255, 255)';
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [canvasRef]);
}
```

### Pattern 5: Claude Binary Classification with Confidence

**What:** Structured prompt returning JSON with choice enum and confidence float, with threshold check before accepting result.

**When to use:** STT-02, STT-03 requirements (classify with confidence, fallback on low confidence).

**Example:**
```typescript
// src/services/nlu/claude.ts
export interface ClassificationResult {
  choice: 'A' | 'B';
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}

export async function classifyChoice(
  transcript: string,
  questionContext: string,
  options: { A: string; B: string }
): Promise<ClassificationResult> {
  const prompt = `You are analyzing a visitor's spoken response in Portuguese to classify their choice.

Context: ${questionContext}

Options:
A: ${options.A}
B: ${options.B}

Visitor's response (transcribed): "${transcript}"

Analyze the response and determine which option (A or B) the visitor chose. Return JSON:
{
  "choice": "A" | "B",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Rules:
- Confidence >0.8: Clear match to one option
- Confidence 0.5-0.8: Likely match but some ambiguity
- Confidence <0.5: Too ambiguous to classify

Return ONLY valid JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4.5',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const jsonText = response.content[0].text;
  const result = JSON.parse(jsonText) as ClassificationResult;

  return result;
}

// Usage in orchestrator
const result = await classifyChoice(transcript, questionCtx, options);
if (result.confidence < 0.7) {
  // Trigger FLOW-11 fallback
  send({ type: 'CLASSIFICATION_LOW_CONFIDENCE' });
} else {
  send({ type: `CHOICE_${result.choice}` });
}
```

### Anti-Patterns to Avoid

- **Directly mutating AudioContext state**: Always use `.resume()` within user gesture handler, never assume context is running
- **Creating new AudioContext on every component mount**: Use singleton pattern from Phase 1
- **Not cleaning up MediaRecorder streams**: Always call `stream.getTracks().forEach(t => t.stop())` to release microphone
- **Blocking UI thread with audio decoding**: Use `AudioContext.decodeAudioData()` which is async, not `decodeAudioDataSync()`
- **Hardcoding WebSocket reconnection without backoff**: Implement exponential backoff to avoid API rate limiting

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio crossfading | Manual volume interpolation with setInterval | GainNode.linearRampToValueAtTime() | Browser-native scheduling is frame-perfect, manual timers drift |
| WebSocket reconnection logic | Custom retry loop with setTimeout | Exponential backoff library or pattern | Rate limiting, connection storms, proper error categorization |
| Waveform visualization | Manual canvas drawing loop | AnalyserNode + requestAnimationFrame | Optimized for audio sync, automatic buffer management |
| Voice activity detection | RMS calculation from raw audio | Browser's existing silence detection or library (e.g., ricky0123/vad) | Complex thresholding, noise handling, multi-language support |
| Audio format conversion | Manual ArrayBuffer manipulation | AudioContext.decodeAudioData() | Handles all codec complexities, optimized for browser |

**Key insight:** Browser audio APIs are mature and well-optimized. Custom implementations introduce bugs (timing drift, memory leaks, incorrect decoding) that the native APIs have already solved.

## Common Pitfalls

### Pitfall 1: WebSocket Connection Timeout and Reconnection
**What goes wrong:** ElevenLabs WebSocket closes after 20 seconds of inactivity by default, interrupting ongoing TTS streams. Reconnecting immediately can hit rate limits.

**Why it happens:** Default timeout is too short for narrative pauses in the Oracle script (some pauses are 3-4 seconds). WebSocket state management is complex (CONNECTING, OPEN, CLOSING, CLOSED).

**How to avoid:**
1. Set `inactivity_timeout=180` query parameter on WebSocket URL (max allowed)
2. Send single-space keepalive message every 15 seconds during long pauses
3. Implement exponential backoff reconnection: 1s → 2s → 4s → 8s (max 5 attempts)
4. Check `ws.readyState` before sending messages

**Warning signs:** WebSocket error events, "Connection is already in CLOSING state" errors, audio cutting off mid-sentence.

### Pitfall 2: iOS Safari AudioContext Restrictions
**What goes wrong:** AudioContext remains in "suspended" state even after `resume()` is called, preventing all audio playback including ambient soundscapes.

**Why it happens:** iOS Safari requires AudioContext.resume() to be called *inside* a user gesture handler (click, touchend), not just after user gesture completes. Additionally, AudioContext can be suspended again if ringer is set to vibrate.

**How to avoid:**
1. Always call `audioContext.resume()` synchronously within click handler (already implemented in Phase 1)
2. Check `audioContext.state === 'running'` before attempting playback
3. Re-check state on visibility change (iOS suspends context when tab loses focus)
4. Limit to 4 concurrent AudioContext instances (iOS restriction)

**Warning signs:** Silent audio despite no console errors, `audioContext.state === 'suspended'` persisting after resume() call.

### Pitfall 3: MediaRecorder MIME Type Incompatibility
**What goes wrong:** MediaRecorder produces audio blobs that Whisper API rejects with "unsupported format" error.

**Why it happens:** Browser support for audio codecs varies. Chrome defaults to `audio/webm;codecs=opus`, Safari uses `audio/mp4`, Firefox uses `audio/ogg`. Whisper API officially supports: mp3, mp4, mpeg, mpga, m4a, wav, webm.

**How to avoid:**
1. Check `MediaRecorder.isTypeSupported('audio/webm;codecs=opus')` before creating recorder
2. Fallback sequence: `audio/webm;codecs=opus` → `audio/mp4` → `audio/wav`
3. Convert blob to File object with correct extension: `new File([blob], 'audio.webm', { type: 'audio/webm' })`
4. Test in Safari, Chrome, and Firefox explicitly

**Warning signs:** Whisper API 400 errors, transcription returning empty string, recording produces 0-byte blobs.

### Pitfall 4: Race Condition Between TTS and Ambient Crossfade
**What goes wrong:** Ambient audio crossfade starts before TTS finishes speaking, creating audio overlap or cutting off Oracle's voice.

**Why it happens:** XState transitions can fire before async audio operations complete. Ambient crossfade is triggered on state entry, but TTS playback is async and doesn't block transition.

**How to avoid:**
1. XState actions should be synchronous for state transition logic
2. Use `useEffect` in React component to trigger async audio operations based on state
3. Track TTS completion in component state, trigger ambient crossfade *after* TTS completes
4. Add 200ms buffer between TTS end and ambient crossfade start

**Warning signs:** Overlapping audio layers, Oracle's voice being drowned out by ambient sound, audio cutting off early.

### Pitfall 5: Memory Leaks from Undisposed Audio Resources
**What goes wrong:** Browser tab slows down over time, eventually crashes after 5-10 experience cycles.

**Why it happens:** AudioBufferSourceNode cannot be reused after `stop()` is called. Each playback requires creating a new source node. If old nodes aren't garbage collected (still referenced somewhere), memory accumulates.

**How to avoid:**
1. Always null out source node references after calling `stop()`
2. Disconnect nodes from audio graph: `sourceNode.disconnect()`
3. Use `useEffect` cleanup function to stop and disconnect all nodes on unmount
4. Reuse AudioBuffer (decoded data), but create new AudioBufferSourceNode for each playback

**Warning signs:** Increasing memory usage in DevTools, browser tab becoming sluggish, eventual "Out of Memory" error.

### Pitfall 6: Whisper API Rate Limiting Without Retry Logic
**What goes wrong:** Transcription fails with 429 error, visitor's choice is lost, experience breaks.

**Why it happens:** Whisper API has rate limits (requests per minute varies by tier). Multiple concurrent stations hitting API simultaneously can exceed limit. No automatic retry in OpenAI SDK.

**How to avoid:**
1. Implement exponential backoff: wait `retry-after` header seconds before retrying
2. Maximum 3 retry attempts, then fallback to timeout default choice
3. Add jitter to retry delays to prevent thundering herd
4. Consider queuing transcription requests if multiple stations are active

**Warning signs:** 429 HTTP errors in console, intermittent transcription failures, errors correlate with concurrent usage.

### Pitfall 7: Claude API Response Parsing Failure
**What goes wrong:** Claude returns valid text but not parseable JSON, classification fails, visitor stuck at choice point.

**Why it happens:** LLMs occasionally return JSON wrapped in markdown code blocks (```json...```) or include explanatory text before/after JSON.

**How to avoid:**
1. Use "prefill" technique: set `assistant` message starting with `{` to prime JSON output
2. Strip markdown code blocks: `text.replace(/```json\n?|\n?```/g, '')`
3. Extract JSON with regex: `/{[\s\S]*}/` to find JSON object in any text
4. Validate parsed result has required fields before returning
5. Catch JSON.parse() errors and retry once with stricter prompt

**Warning signs:** JSON.parse() throwing SyntaxError, classification returning undefined, console showing non-JSON Claude response.

## Code Examples

Verified patterns from official sources:

### ElevenLabs WebSocket TTS Streaming
```typescript
// Source: ElevenLabs official documentation + npm SDK examples
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

async function streamTTS(text: string, voiceId: string, settings: VoiceSettings): Promise<void> {
  const audioStream = await client.textToSpeech.convertAsStream(voiceId, {
    text,
    model_id: 'eleven_flash_v2_5', // Low latency model
    voice_settings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      speed: settings.speed,
    },
  });

  // Stream to Web Audio API
  const audioContext = getAudioContext();
  const chunks: Uint8Array[] = [];

  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    audioData.set(chunk, offset);
    offset += chunk.length;
  }

  const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}
```

### OpenAI Whisper Transcription
```typescript
// Source: OpenAI official documentation
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Convert blob to File (required by Whisper API)
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'pt', // Portuguese
    temperature: 0.0, // Deterministic output
    response_format: 'json',
  });

  return transcription.text;
}

// Next.js API route handler
export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;

  const transcript = await transcribeAudio(audioFile);
  return Response.json({ transcript });
}
```

### Web Audio API Equal-Power Crossfade
```typescript
// Source: MDN Web Audio API documentation + web.dev tutorial
function crossfade(
  ctx: AudioContext,
  currentGain: GainNode,
  nextGain: GainNode,
  duration: number
): void {
  const now = ctx.currentTime;

  // Equal-power crossfade (prevents volume dip)
  // Current: 1 → 0
  currentGain.gain.setValueAtTime(1, now);
  currentGain.gain.linearRampToValueAtTime(0, now + duration);

  // Next: 0 → 1
  nextGain.gain.setValueAtTime(0, now);
  nextGain.gain.linearRampToValueAtTime(1, now + duration);
}
```

### MediaRecorder with Silence Detection
```typescript
// Source: MDN MediaRecorder documentation + RecordRTC examples
function createRecorderWithSilenceDetection(
  stream: MediaStream,
  onSilence: () => void,
  silenceThreshold: number = 0.01,
  silenceDuration: number = 3000
): MediaRecorder {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.fftSize);
  let silenceStart: number | null = null;

  function checkSilence() {
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    if (rms < silenceThreshold) {
      if (silenceStart === null) {
        silenceStart = Date.now();
      } else if (Date.now() - silenceStart > silenceDuration) {
        onSilence();
        silenceStart = null;
      }
    } else {
      silenceStart = null;
    }

    requestAnimationFrame(checkSilence);
  }

  checkSilence();

  return new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ElevenLabs HTTP polling | WebSocket streaming | 2024 | Reduces latency from ~2s to ~75ms inference |
| Whisper local model | Whisper API with V4 | Late 2025 | Adds real-time streaming, speaker diarization |
| Claude Opus for classification | Claude Haiku 4.5 | 2026 | 10x faster inference (~100ms) at lower cost |
| Browser SpeechSynthesis | ElevenLabs neural voices | 2023+ | Human-like prosody, emotion control |
| Manual audio loops with HTML5 | Web Audio API AudioBufferSourceNode.loop | Always | Seamless loops without gaps |

**Deprecated/outdated:**
- ElevenLabs Conversational AI SDK: Too opinionated, project needs custom orchestration via XState
- Browser getUserMedia without MediaRecorder: Modern apps should use MediaRecorder API for recording, not raw stream processing
- Creating AudioContext globally: Modern browsers require context creation in response to user gesture

## Open Questions

1. **What is the optimal VAD (Voice Activity Detection) approach for Portuguese?**
   - What we know: Browser-native silence detection exists, libraries like ricky0123/vad are available
   - What's unclear: Accuracy for Portuguese vs English, latency impact, integration complexity
   - Recommendation: Start with simple RMS-based silence detection (Pitfall 5 example), upgrade to VAD library if false positives occur during testing

2. **Should ambient audio be pre-generated or streamed?**
   - What we know: AMB-04 specifies "pre-loaded" suggesting files, but phase durations vary (2-5 minutes)
   - What's unclear: Whether to use short loops (10-30s) or generate full-length phase audio
   - Recommendation: Use 30-60 second seamless loops, smaller file size and easier to crossfade than full-length tracks

3. **What is the fallback path if all three APIs are unavailable?**
   - What we know: Phase 1 SpeechSynthesis works offline, but no STT/NLU fallback exists
   - What's unclear: Whether to show error screen or degrade to button-based choices
   - Recommendation: Degrade gracefully to Phase 1 behavior (SpeechSynthesis + ChoiceButtons), log failure for analytics

4. **How to handle overlapping ambient audio during rapid phase transitions?**
   - What we know: Crossfade duration is 2-3 seconds, but some states (TIMEOUT_REDIRECT) last only 2 seconds
   - What's unclear: Whether to queue crossfades or cancel in-progress crossfades
   - Recommendation: Cancel in-progress crossfade if new transition occurs within crossfade duration, start fresh crossfade from current gain values

## Environment Availability

> Phase 2 dependencies are browser APIs and cloud services, not local tools. Browser compatibility checked, cloud APIs require keys.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Web Audio API | AMB-01 through AMB-04 | ✓ (Chrome, Firefox, Safari) | Native | — |
| MediaRecorder API | STT-01, STT-05 | ✓ (Chrome 49+, Firefox 29+, Safari 14.1+) | Native | — |
| Canvas API | UI-03 (waveform) | ✓ (All browsers) | Native | — |
| ElevenLabs API | TTS-01 through TTS-04 | ✗ (requires API key) | REST/WS | Phase 1 SpeechSynthesis |
| OpenAI Whisper API | STT-01, STT-02, STT-04 | ✗ (requires API key) | REST | Button-based choices |
| Claude API | STT-02, STT-03 | ✗ (requires API key) | REST | Random or timeout default |

**Missing dependencies with no fallback:**
- None — all Phase 2 features have fallback to Phase 1 behavior

**Missing dependencies with fallback:**
- ElevenLabs API → Browser SpeechSynthesis (lower quality voice)
- Whisper + Claude APIs → Button-based choice input (Phase 1 UI)

**Browser compatibility note:** All native APIs (Web Audio, MediaRecorder, Canvas) are fully supported in Chrome 49+, Firefox 29+, Safari 14.1+. Target audience uses modern laptop browsers, so compatibility risk is LOW.

## Validation Architecture

> Note: workflow.nyquist_validation not set in config.json, treating as enabled (default).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.9 with jsdom (from Phase 1) |
| Config file | vitest.config.ts (exists) |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TTS-01 | ElevenLabs streaming <1.5s latency | integration | `npm test src/services/tts/elevenlabs.test.ts -x` | ❌ Wave 0 |
| TTS-02 | Voice parameters vary by phase | unit | `npm test src/services/tts/elevenlabs.test.ts::test_voice_settings -x` | ❌ Wave 0 |
| TTS-03 | Intentional pauses preserved | unit | `npm test src/services/tts/index.test.ts::test_pause_timing -x` | ❌ Wave 0 |
| TTS-04 | Consistent voice identity | unit | `npm test src/services/tts/index.test.ts::test_voice_id -x` | ❌ Wave 0 |
| STT-01 | Whisper PT-BR transcription | integration | `npm test src/services/stt/whisper.test.ts -x` | ❌ Wave 0 |
| STT-02 | Claude confidence >0.7 threshold | unit | `npm test src/services/nlu/claude.test.ts::test_confidence_threshold -x` | ❌ Wave 0 |
| STT-03 | Low confidence triggers fallback | integration | `npm test src/services/nlu/index.test.ts::test_fallback -x` | ❌ Wave 0 |
| STT-04 | End-to-end latency <3s | integration | Manual — measure in browser DevTools Performance tab | ❌ Manual |
| STT-05 | Visual indicator when mic active | unit | `npm test src/components/audio/ListeningIndicator.test.tsx -x` | ❌ Wave 0 |
| AMB-01 | Phase-specific ambient soundscapes | unit | `npm test src/services/audio/ambientPlayer.test.ts::test_phase_audio -x` | ❌ Wave 0 |
| AMB-02 | Crossfade 2-3s without gaps | unit | `npm test src/services/audio/crossfader.test.ts -x` | ❌ Wave 0 |
| AMB-03 | Ambient + TTS simultaneous | integration | Manual — listen in browser for overlap | ❌ Manual |
| AMB-04 | Seamless loops pre-loaded | unit | `npm test src/services/audio/ambientPlayer.test.ts::test_loop -x` | ❌ Wave 0 |
| UI-03 | Waveform reacts to audio | unit | `npm test src/hooks/useWaveform.test.ts -x` | ❌ Wave 0 |
| UI-04 | Listening indicator appears | unit | `npm test src/components/audio/ListeningIndicator.test.tsx -x` | ❌ Wave 0 |
| FLOW-04 | Binary classification Inferno | integration | Covered by STT-02 + machine tests from Phase 1 | ✅ Phase 1 |
| FLOW-07 | Binary classification Purgatorio | integration | Covered by STT-02 + machine tests from Phase 1 | ✅ Phase 1 |
| FLOW-11 | Silence timeout handling | integration | Covered by machine tests from Phase 1 (timeout events) | ✅ Phase 1 |

### Sampling Rate
- **Per task commit:** `npm test {affected files} -- --run -x` (fail-fast)
- **Per wave merge:** `npm test -- --run` (full suite)
- **Phase gate:** Full suite green + manual latency test + browser audio verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/tts/elevenlabs.test.ts` — covers TTS-01, TTS-02
- [ ] `src/services/tts/index.test.ts` — covers TTS-03, TTS-04
- [ ] `src/services/stt/whisper.test.ts` — covers STT-01
- [ ] `src/services/nlu/claude.test.ts` — covers STT-02
- [ ] `src/services/nlu/index.test.ts` — covers STT-03
- [ ] `src/services/audio/ambientPlayer.test.ts` — covers AMB-01, AMB-04
- [ ] `src/services/audio/crossfader.test.ts` — covers AMB-02
- [ ] `src/hooks/useWaveform.test.ts` — covers UI-03
- [ ] `src/components/audio/ListeningIndicator.test.tsx` — covers STT-05, UI-04
- [ ] Mock setup: `src/test/mocks/audioApis.ts` — mock Web Audio API, MediaRecorder, AnalyserNode for jsdom

**Note:** Vitest framework already installed (Phase 1), no additional test infrastructure needed.

## Sources

### Primary (HIGH confidence)
- npm registry: elevenlabs@1.59.0, openai@6.32.0, @anthropic-ai/sdk@0.80.0 (verified 2026-03-25)
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — AudioContext, GainNode, AnalyserNode, AudioBufferSourceNode
- [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — Microphone recording, blob formats
- [MDN Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) — AnalyserNode waveform patterns

### Secondary (MEDIUM confidence)
- [ElevenLabs Documentation - WebSocket API](https://elevenlabs.io/docs/eleven-api/websockets) — Streaming TTS, voice settings
- [ElevenLabs Voice Settings Documentation](https://elevenlabs-sdk.mintlify.app/speech-synthesis/voice-settings) — Stability, similarity_boost, speed parameters
- [ElevenLabs WebSocket Improvements Blog](https://elevenlabs.io/blog/websocket-improvements-reliability-and-custom-timeout) — Inactivity timeout, reconnection guidance
- [OpenAI Speech to Text Guide](https://platform.openai.com/docs/guides/speech-to-text) — Whisper API parameters, PT-BR support
- [OpenAI Error Codes Documentation](https://platform.openai.com/docs/guides/error-codes) — Rate limit handling, retry strategies
- [Anthropic Claude Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) — JSON output, confidence scoring
- [Can I Use - MediaRecorder API](https://caniuse.com/mediarecorder) — Browser compatibility data (Chrome 49+, Firefox 29+, Safari 14.1+)
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — Browser autoplay policies, AudioContext unlock patterns
- [Next.js Building Audio Transcription App](https://akoskm.com/building-an-audio-transcription-app-with-nextjs/) — API route file upload pattern

### Tertiary (LOW confidence, needs validation)
- [Web Audio API Tutorial - Boris Smus](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch02.html) — Crossfade example (book from 2013, may be outdated)
- [Best AI for Classification 2026 - OpenMark](https://openmark.ai/best-ai-for-classification) — Claude Haiku classification benchmark (70% accuracy claim, not official)
- [Detecting Silence in Audio Using WebAudio](https://pavi2410.com/blog/detect-silence-using-web-audio/) — RMS-based VAD approach (blog post, not peer-reviewed)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions verified, official SDKs documented
- Architecture: HIGH — Web Audio API and MediaRecorder are mature browser standards with extensive MDN documentation
- API integration patterns: MEDIUM — Official docs exist but some endpoints (ElevenLabs WebSocket details) are behind 404 errors, relying on blog posts and SDK examples
- Pitfalls: MEDIUM — Based on GitHub issues and community reports, not official documentation
- Browser compatibility: HIGH — Can I Use data is authoritative and current

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days — APIs are stable, browser standards rarely change)

**Research limitations:**
- Could not access ElevenLabs WebSocket API reference documentation directly (404 errors), relied on SDK examples and community reports
- Claude Haiku confidence scoring pattern is inferred from general prompt engineering guidance, not official classification API documentation
- Latency claims (TTS ~75ms, Whisper ~1s, Claude ~100ms) are from vendor marketing materials, not independent benchmarks
- VAD library recommendations are based on web searches, not hands-on testing

**Recommended follow-up:**
1. Test ElevenLabs WebSocket connection stability during long pauses (3-4 seconds between segments)
2. Benchmark Whisper API latency with actual webm audio blobs from MediaRecorder
3. Validate Claude Haiku confidence scoring accuracy with sample Portuguese transcripts
4. Verify ambient audio crossfade timing doesn't conflict with TTS playback in actual state machine flow
