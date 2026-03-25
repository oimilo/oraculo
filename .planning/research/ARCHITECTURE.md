# Architecture Research: Interactive Voice Agent

**Domain:** Real-time voice interaction with scripted flow orchestration
**Researched:** 2026-03-24
**Confidence:** MEDIUM (based on framework documentation knowledge and established patterns; web verification blocked)

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Component Layer                        │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │   UI View  │  │ Audio Player│  │ Mic Indicator│              │
│  └──────┬─────┘  └──────┬──────┘  └──────┬───────┘              │
│         │               │                │                       │
│         └───────────────┴────────────────┘                       │
│                         │                                        │
│                    useMachine()                                  │
├─────────────────────────┴────────────────────────────────────────┤
│                   XState Orchestration Layer                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              State Machine (OracleStateMachine)          │   │
│  │  States: idle → intro → question1 → listening1 →         │   │
│  │          processing1 → question2 → ... → ending          │   │
│  │                                                           │   │
│  │  Actors (spawned services):                              │   │
│  │    - TTSActor (ElevenLabs streaming)                     │   │
│  │    - STTActor (mic capture + Whisper)                    │   │
│  │    - NLUActor (Claude classification)                    │   │
│  │    - AmbientAudioActor (Howler.js manager)               │   │
│  │    - AnalyticsActor (Supabase logger)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  TTS     │  │  STT     │  │  NLU     │  │ Ambient  │        │
│  │ Service  │  │ Service  │  │ Service  │  │ Audio Mgr│        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
├───────┴──────────────┴─────────────┴──────────────┴──────────────┤
│                        API Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (/api/*)                             │   │
│  │    - /api/tts/stream (ElevenLabs proxy)                  │   │
│  │    - /api/stt/transcribe (Whisper)                       │   │
│  │    - /api/nlu/classify (Claude Haiku)                    │   │
│  │    - /api/analytics/log (Supabase)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    External Services                             │
│  ┌─────────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐        │
│  │ ElevenLabs  │  │ Whisper │  │ Claude │  │ Supabase │        │
│  │  Streaming  │  │   API   │  │  API   │  │ Postgres │        │
│  └─────────────┘  └─────────┘  └────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **OracleStateMachine** | Orchestrate entire interaction flow, manage state transitions, spawn/supervise actors | XState v5 machine with nested states, invoked actors, and transition guards |
| **TTSActor** | Stream TTS audio from ElevenLabs, manage playback lifecycle, signal completion | XState actor with promise-based logic, WebSocket handling, Web Audio API integration |
| **STTActor** | Capture microphone input, send to Whisper, return transcript | XState actor with MediaRecorder API, blob chunking, API route communication |
| **NLUActor** | Send transcript to Claude Haiku, classify response, return decision | XState actor calling Next.js API route, handles timeout/retry logic |
| **AmbientAudioActor** | Manage background soundscapes, crossfade between phases | Howler.js wrapper with fade curves, preloading, and volume management |
| **AnalyticsActor** | Buffer session events, batch write to Supabase at session end | Event collector with batched writes via API route |
| **API Routes** | Proxy external API calls, handle secrets, add retry logic | Next.js App Router route handlers (`/app/api/*/route.ts`) |

## Recommended Project Structure

```
app/
├── api/                        # Next.js API routes
│   ├── tts/
│   │   └── stream/route.ts     # ElevenLabs streaming proxy
│   ├── stt/
│   │   └── transcribe/route.ts # Whisper transcription
│   ├── nlu/
│   │   └── classify/route.ts   # Claude Haiku classification
│   └── analytics/
│       └── log/route.ts        # Supabase logging
├── oracle/
│   └── page.tsx                # Main oracle experience page
├── admin/
│   └── page.tsx                # Admin panel
└── layout.tsx                  # Root layout

lib/
├── machines/
│   ├── oracleMachine.ts        # Main state machine definition
│   └── types.ts                # Machine context and event types
├── actors/
│   ├── ttsActor.ts             # TTS streaming actor
│   ├── sttActor.ts             # Speech-to-text actor
│   ├── nluActor.ts             # NLU classification actor
│   ├── ambientAudioActor.ts    # Ambient audio manager actor
│   └── analyticsActor.ts       # Analytics logging actor
├── services/
│   ├── tts.ts                  # TTS service (WebSocket client)
│   ├── stt.ts                  # STT service (MediaRecorder wrapper)
│   ├── nlu.ts                  # NLU service (API client)
│   ├── ambientAudio.ts         # Howler.js wrapper
│   └── analytics.ts            # Analytics service
├── audio/
│   ├── audioContext.ts         # Shared Web Audio API context
│   ├── streamPlayer.ts         # Streaming audio player
│   └── microphoneCapture.ts    # Microphone capture utility
└── content/
    ├── script.ts               # Full Dante journey script
    └── audioAssets.ts          # Ambient sound file references

components/
├── OracleExperience.tsx        # Main experience component (uses machine)
├── PhaseVisualizer.tsx         # Visual feedback (Inferno/Purg/Paradise)
├── MicIndicator.tsx            # Listening state indicator
└── AdminDashboard.tsx          # Real-time monitoring

public/
└── audio/
    ├── inferno-ambient.mp3     # Ambient tracks
    ├── purgatorio-ambient.mp3
    └── paradiso-ambient.mp3
```

### Structure Rationale

- **`lib/machines/`**: State machine is the single source of truth for flow control. Isolated for testability.
- **`lib/actors/`**: Each async operation (TTS, STT, NLU, audio, analytics) is an XState actor. Actors are spawned by the machine and communicate via events.
- **`lib/services/`**: Pure functions/classes wrapping external APIs and browser APIs. No state management. Called by actors.
- **`lib/audio/`**: Low-level audio utilities shared across actors. Centralized AudioContext prevents multiple context issues.
- **`app/api/`**: All external API calls proxied through Next.js routes for security (API keys server-side only).
- **`components/`**: React components consume machine state via `useMachine()` hook. Purely presentational.

## Architectural Patterns

### Pattern 1: State Machine as Orchestrator (Actor Model)

**What:** XState v5 machine spawns and supervises all async operations as actors. Actors communicate with parent machine via events. Machine transitions based on actor outcomes.

**When to use:** Complex multi-step flows with async dependencies, timeouts, error handling, and precise state management.

**Trade-offs:**
- **Pros:** Deterministic flow, easy to visualize, testable in isolation, handles edge cases (timeout, error, retry) declaratively
- **Cons:** Learning curve, more boilerplate than ad-hoc promises, overkill for simple linear flows

**Example:**

```typescript
// lib/machines/oracleMachine.ts
import { setup, fromPromise, assign } from 'xstate';
import { ttsActor } from '../actors/ttsActor';
import { sttActor } from '../actors/sttActor';
import { nluActor } from '../actors/nluActor';

export const oracleMachine = setup({
  types: {
    context: {} as {
      currentPhase: 'inferno' | 'purgatorio' | 'paradiso';
      transcript: string;
      classification: 'option_a' | 'option_b' | 'silence';
      sessionId: string;
      choices: string[];
    },
    events: {} as
      | { type: 'START' }
      | { type: 'TTS_COMPLETE' }
      | { type: 'TRANSCRIPT_READY'; transcript: string }
      | { type: 'CLASSIFICATION_READY'; result: string }
      | { type: 'TIMEOUT' }
  },
  actors: {
    ttsActor,
    sttActor,
    nluActor,
  }
}).createMachine({
  id: 'oracle',
  initial: 'idle',
  context: {
    currentPhase: 'inferno',
    transcript: '',
    classification: 'silence',
    sessionId: crypto.randomUUID(),
    choices: [],
  },
  states: {
    idle: {
      on: { START: 'intro' }
    },
    intro: {
      invoke: {
        src: 'ttsActor',
        input: ({ context }) => ({
          text: "Bem-vindo à jornada...",
          voiceId: 'inferno-voice'
        }),
        onDone: 'question1',
        onError: 'error'
      }
    },
    question1: {
      invoke: {
        src: 'ttsActor',
        input: ({ context }) => ({
          text: "Primeira pergunta do Inferno...",
          voiceId: 'inferno-voice'
        }),
        onDone: 'listening1',
      }
    },
    listening1: {
      invoke: {
        src: 'sttActor',
        input: { timeout: 15000 },
        onDone: {
          target: 'processing1',
          actions: assign({
            transcript: ({ event }) => event.output.transcript
          })
        },
        onError: 'fallback1'
      }
    },
    processing1: {
      invoke: {
        src: 'nluActor',
        input: ({ context }) => ({
          transcript: context.transcript,
          question: 'question1'
        }),
        onDone: {
          target: 'question2',
          actions: assign({
            classification: ({ event }) => event.output.result,
            choices: ({ context, event }) => [
              ...context.choices,
              event.output.result
            ]
          })
        }
      }
    },
    fallback1: {
      // Handle timeout/error with poetic redirect
      invoke: {
        src: 'ttsActor',
        input: { text: "O silêncio também é uma escolha...", voiceId: 'inferno-voice' },
        onDone: {
          target: 'question2',
          actions: assign({
            classification: 'silence',
            choices: ({ context }) => [...context.choices, 'silence']
          })
        }
      }
    },
    question2: {
      // ... similar pattern
    },
    error: {
      // Error state
    }
  }
});
```

### Pattern 2: Streaming TTS with Web Audio API

**What:** ElevenLabs streams audio chunks via WebSocket. Chunks are decoded and queued in Web Audio API for gapless playback.

**When to use:** Low-latency TTS where waiting for full audio generation is too slow. Perception of instant response.

**Trade-offs:**
- **Pros:** Audio starts playing in ~300ms (vs 2-3s for full generation), feels more responsive
- **Cons:** More complex error handling, network interruption = audio cuts off, requires WebSocket management

**Example:**

```typescript
// lib/services/tts.ts
export class TTSStreamService {
  private audioContext: AudioContext;
  private audioQueue: AudioBufferSourceNode[] = [];
  private nextStartTime = 0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async streamSpeech(text: string, voiceId: string): Promise<void> {
    const ws = new WebSocket(`wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`);

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          output_format: "pcm_24000"
        }));
      };

      ws.onmessage = async (event) => {
        const chunk = await event.data.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(chunk);
        this.queueAudioBuffer(audioBuffer);
      };

      ws.onclose = () => resolve();
      ws.onerror = (err) => reject(err);
    });
  }

  private queueAudioBuffer(buffer: AudioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;

    this.audioQueue.push(source);
    source.onended = () => {
      const index = this.audioQueue.indexOf(source);
      if (index > -1) this.audioQueue.splice(index, 1);
    };
  }

  stop() {
    this.audioQueue.forEach(source => source.stop());
    this.audioQueue = [];
    this.nextStartTime = 0;
  }
}
```

### Pattern 3: MediaRecorder + Chunked Upload for STT

**What:** Use MediaRecorder API to capture microphone audio in small chunks (e.g., 1 second). When recording complete, concatenate chunks and send to Whisper via Next.js API route.

**When to use:** Browser-based audio capture for speech recognition. Allows real-time visualization (waveform) while minimizing latency.

**Trade-offs:**
- **Pros:** Native browser API, works across devices, can show live waveform, minimal setup
- **Cons:** Format inconsistencies across browsers (webm/ogg), requires server-side conversion for some STT APIs

**Example:**

```typescript
// lib/services/stt.ts
export class STTService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(1000); // Chunk every 1 second
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const transcript = await this.transcribe(audioBlob);
        resolve(transcript);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  private async transcribe(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/stt/transcribe', {
      method: 'POST',
      body: formData,
    });

    const { transcript } = await response.json();
    return transcript;
  }
}
```

### Pattern 4: Ambient Audio Crossfade with Howler.js

**What:** Preload ambient audio tracks for each phase. When phase transitions, crossfade from current track to next using volume tweening.

**When to use:** Background soundscapes that change with narrative context. Smoother than abrupt stops.

**Trade-offs:**
- **Pros:** Professional audio transitions, Howler.js handles format fallbacks and mobile quirks
- **Cons:** Requires preloading all tracks (bandwidth), careful volume curve tuning for natural feel

**Example:**

```typescript
// lib/services/ambientAudio.ts
import { Howl } from 'howler';

export class AmbientAudioManager {
  private tracks: Map<string, Howl> = new Map();
  private currentTrack: Howl | null = null;

  constructor() {
    this.preloadTracks();
  }

  private preloadTracks() {
    const phases = {
      inferno: '/audio/inferno-ambient.mp3',
      purgatorio: '/audio/purgatorio-ambient.mp3',
      paradiso: '/audio/paradiso-ambient.mp3',
    };

    Object.entries(phases).forEach(([phase, src]) => {
      const howl = new Howl({
        src: [src],
        loop: true,
        volume: 0,
        preload: true,
      });
      this.tracks.set(phase, howl);
    });
  }

  async transitionTo(phase: string, duration: number = 2000): Promise<void> {
    const nextTrack = this.tracks.get(phase);
    if (!nextTrack) return;

    // Start new track at volume 0
    nextTrack.play();
    nextTrack.fade(0, 0.7, duration);

    // Fade out current track
    if (this.currentTrack && this.currentTrack !== nextTrack) {
      this.currentTrack.fade(0.7, 0, duration);
      setTimeout(() => {
        this.currentTrack?.stop();
      }, duration);
    }

    this.currentTrack = nextTrack;
  }

  stop() {
    this.currentTrack?.fade(0.7, 0, 1000);
    setTimeout(() => {
      this.currentTrack?.stop();
    }, 1000);
  }
}
```

### Pattern 5: Actor-Based Async Coordination

**What:** Each async operation (TTS, STT, NLU) is an XState actor that can be invoked, stopped, or supervised. Actors send events to parent machine when complete/error.

**When to use:** Multiple concurrent async operations need coordination, cancellation, timeout handling.

**Trade-offs:**
- **Pros:** Declarative error handling, easy cancellation, timeout handling built-in, testable
- **Cons:** More abstraction than raw promises, requires XState knowledge

**Example:**

```typescript
// lib/actors/ttsActor.ts
import { fromPromise } from 'xstate';
import { TTSStreamService } from '../services/tts';

export const ttsActor = fromPromise(async ({ input }: {
  input: { text: string; voiceId: string }
}) => {
  const audioContext = new AudioContext();
  const ttsService = new TTSStreamService(audioContext);

  await ttsService.streamSpeech(input.text, input.voiceId);

  return { success: true };
});

// lib/actors/sttActor.ts
import { fromPromise } from 'xstate';
import { STTService } from '../services/stt';

export const sttActor = fromPromise(async ({ input }: {
  input: { timeout: number }
}) => {
  const sttService = new STTService();

  await sttService.startRecording();

  // Wait for timeout or manual stop
  const transcript = await Promise.race([
    sttService.stopRecording(),
    new Promise<string>((resolve) =>
      setTimeout(() => {
        sttService.stopRecording().then(resolve);
      }, input.timeout)
    )
  ]);

  return { transcript };
});

// lib/actors/nluActor.ts
import { fromPromise } from 'xstate';

export const nluActor = fromPromise(async ({ input }: {
  input: { transcript: string; question: string }
}) => {
  const response = await fetch('/api/nlu/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: input.transcript,
      question: input.question,
    }),
  });

  const { result } = await response.json();
  return { result };
});
```

## Data Flow

### Interaction Cycle (per question)

```
[State Machine: question state]
    ↓ invoke ttsActor
[TTS Actor] → [TTS Service] → [ElevenLabs WebSocket] → [Audio chunks]
    ↓                                                         ↓
[Web Audio API queue] → [Speaker playback]
    ↓ onDone event
[State Machine: listening state]
    ↓ invoke sttActor
[STT Actor] → [STT Service] → [MediaRecorder capture] → [Audio blob]
    ↓                                                         ↓
[Next.js API route] → [Whisper API] → [Transcript]
    ↓ onDone event with transcript
[State Machine: processing state]
    ↓ invoke nluActor
[NLU Actor] → [Next.js API route] → [Claude Haiku] → [Classification]
    ↓ onDone event with classification
[State Machine: next question state (based on classification)]
```

### State Machine Event Flow

```
User clicks "Start"
    ↓
{ type: 'START' } → State Machine
    ↓
State: intro (invoke ttsActor)
    ↓
TTS complete → { type: 'TTS_COMPLETE' }
    ↓
State: question1 (invoke ttsActor)
    ↓
TTS complete → { type: 'TTS_COMPLETE' }
    ↓
State: listening1 (invoke sttActor)
    ↓
STT complete → { type: 'TRANSCRIPT_READY', transcript: "..." }
    ↓
State: processing1 (invoke nluActor)
    ↓
NLU complete → { type: 'CLASSIFICATION_READY', result: "option_a" }
    ↓
State: question2 (selected based on result)
```

### Ambient Audio Phase Transitions

```
State Machine enters new phase
    ↓
Action: assign({ currentPhase: 'purgatorio' })
    ↓
React component detects context.currentPhase change
    ↓
useEffect(() => ambientAudio.transitionTo('purgatorio'), [currentPhase])
    ↓
Howler.js crossfades tracks (2s fade duration)
```

### Analytics Data Collection

```
State Machine transitions
    ↓
Action: send({ type: 'LOG_EVENT', data: {...} }) to analyticsActor
    ↓
Analytics Actor buffers events in memory
    ↓
State Machine reaches 'ending' state
    ↓
Analytics Actor invoked with 'FLUSH' event
    ↓
Batch POST to /api/analytics/log
    ↓
Supabase insert session + events
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **ElevenLabs TTS** | WebSocket streaming via client-side SDK or direct WS connection. Proxy through Next.js API route if API key protection needed. | Use `eleven_turbo_v2` model for lowest latency. Stream PCM format for Web Audio API. Handle reconnection logic. |
| **OpenAI Whisper** | REST API via Next.js API route (`/api/stt/transcribe`). FormData upload with audio blob. | Whisper-1 model, Portuguese language hint. Audio format: webm/opus or mp3. Max file size check. |
| **Claude Haiku** | REST API via Next.js API route (`/api/nlu/classify`). System prompt defines binary classification task. | Use Haiku 4 for speed. Streaming not needed. Prompt includes context (question + expected responses). Timeout: 5s. |
| **Supabase** | Supabase JS client via Next.js API route. Batch insert at session end. | RLS policies ensure write-only from API route. Schema: sessions table + events table (1-to-many). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **State Machine ↔ Actors** | Events (send/receive). Machine invokes actors, actors resolve with output. | Actors are isolated async operations. No direct actor-to-actor communication. |
| **Actors ↔ Services** | Direct function calls. Actors orchestrate, services execute. | Services are pure utilities. No state retention. Can be tested independently. |
| **React Components ↔ State Machine** | `useMachine()` hook. Components read `state.context` and `state.value`, send events via `send()`. | Components are purely reactive. No business logic. Machine is single source of truth. |
| **Client ↔ API Routes** | Fetch API. Client sends request, API route handles authentication, proxies to external API, returns response. | API routes are thin wrappers. Handle errors, rate limiting, secret management. |
| **Ambient Audio ↔ State Machine** | React component bridges them. `useEffect` listens to `context.currentPhase`, calls `ambientAudio.transitionTo()`. | AmbientAudioManager is singleton. Initialized once, shared across app. |

## Latency-Sensitive Paths

### Critical Path: User speaks → Next TTS plays

**Target:** < 3 seconds total

```
User stops speaking (0ms)
    ↓
MediaRecorder.stop() (10-50ms)
    ↓
Blob concatenation (10-50ms)
    ↓
POST to /api/stt/transcribe (100-200ms network)
    ↓
Whisper API transcription (500-1500ms)
    ↓
Transcript returned to client (100-200ms network)
    ↓
POST to /api/nlu/classify (100-200ms network)
    ↓
Claude Haiku classification (200-800ms)
    ↓
Classification returned to client (100-200ms network)
    ↓
State machine transitions to next question
    ↓
TTS actor invoked
    ↓
ElevenLabs streaming starts (200-400ms to first audio chunk)
    ↓
First audio chunk plays (0ms — queued in Web Audio)
────────────────────────────────────────────────────────────
Total: 1320ms (best case) to 3600ms (worst case)
```

**Optimization strategies:**

1. **Parallel where possible:** Start NLU request immediately when transcript arrives (don't wait for STT UI update).
2. **Streaming TTS:** Use WebSocket streaming so audio starts playing while still generating.
3. **Preload next question audio:** If classification is predictable, pre-generate TTS for likely next question (tradeoff: wasted API calls).
4. **Connection keepalive:** Keep WebSocket connections warm to avoid handshake latency.
5. **Edge API routes:** Deploy Next.js API routes to Vercel Edge for lower latency (Whisper/Claude support edge runtime).

### Secondary Path: TTS playback latency

**Target:** Audio starts within 500ms of TTS request

```
State machine invokes ttsActor (0ms)
    ↓
WebSocket connection to ElevenLabs (100-200ms if cold)
    ↓
Send text payload (10-50ms)
    ↓
ElevenLabs generates first chunk (200-400ms)
    ↓
Receive first audio chunk (50-100ms network)
    ↓
Decode audio buffer (10-50ms)
    ↓
Queue in Web Audio API (1-5ms)
    ↓
Audio starts playing (0ms — synchronized)
────────────────────────────────────────────────────────────
Total: 371ms (best case) to 805ms (worst case)
```

**Optimization strategies:**

1. **WebSocket pooling:** Keep one persistent WebSocket connection open per session (reuse for multiple TTS requests).
2. **Turbo model:** Use `eleven_turbo_v2` model specifically (faster than multilingual v2).
3. **Smaller text chunks:** If narrative allows, break long monologues into smaller sentences (start playing sooner).

### Tertiary Path: Ambient audio crossfade smoothness

**Target:** Seamless transition, no audio glitches

```
State machine transitions to new phase (0ms)
    ↓
React useEffect detects context.currentPhase change (1-16ms — next frame)
    ↓
Call ambientAudio.transitionTo('purgatorio', 2000) (1ms)
    ↓
New track starts at volume 0 (5-20ms — Howler.js play)
    ↓
Simultaneous fade-in/fade-out over 2000ms
    ↓
Old track stops after fade complete (2000ms)
────────────────────────────────────────────────────────────
Total: 2000ms crossfade duration (configurable)
```

**Optimization strategies:**

1. **Preload all tracks:** Load all ambient audio on app initialization (prevents loading delay).
2. **Overlap tracks:** Start next track slightly before current finishes (creates smooth handoff).
3. **Volume curve tuning:** Use logarithmic fade curves (sounds more natural than linear).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **2-3 stations (MVP)** | Current architecture sufficient. All client-side except API proxies. Each station is independent webapp instance. No server-side state. |
| **10-50 stations** | Consider: (1) API route rate limiting per IP, (2) Supabase connection pooling, (3) CDN for audio assets, (4) Monitor ElevenLabs quota. |
| **100+ stations (future)** | Consider: (1) Dedicated WebSocket server for TTS (avoid Next.js API route overhead), (2) Redis for session state if adding operator dashboard with live monitoring, (3) Audio asset edge caching. |

### Scaling Priorities

1. **First bottleneck: External API rate limits**
   - ElevenLabs has concurrent request limits (typically 5-10 for standard plans)
   - **Fix:** Upgrade ElevenLabs plan, or implement request queuing with backpressure

2. **Second bottleneck: Supabase connection pooling**
   - Default Supabase Postgres has connection limits
   - **Fix:** Use Supabase Edge Functions for analytics writes, or batch writes from client-side with idempotency keys

3. **Third bottleneck: Browser audio context limits**
   - Some browsers limit concurrent AudioContext instances
   - **Fix:** Singleton AudioContext pattern (already in architecture)

## Anti-Patterns

### Anti-Pattern 1: Multiple AudioContext instances

**What people do:** Create new `AudioContext` for each audio operation (TTS playback, ambient audio, mic capture).

**Why it's wrong:** Browsers limit concurrent AudioContexts (typically 6-8). Causes "NotSupportedError" and audio glitches. Also wastes resources.

**Do this instead:** Create a single shared AudioContext on app initialization. Pass it to all audio services. Suspend/resume as needed for mobile Safari.

```typescript
// lib/audio/audioContext.ts
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Usage in services
import { getAudioContext } from './audioContext';
const ctx = getAudioContext();
```

### Anti-Pattern 2: State machine logic in React components

**What people do:** Put state transition logic (e.g., "if transcript contains X, go to question2a") inside React components or `useEffect`.

**Why it's wrong:** Splits state logic across machine and components. Hard to test. Hard to visualize. Breaks XState's declarative model.

**Do this instead:** All transitions and guards in the state machine. React components are pure views that read `state.value` and `state.context`, send events.

```typescript
// BAD: Logic in component
useEffect(() => {
  if (transcript.includes('sim')) {
    send({ type: 'GO_TO_QUESTION_2A' });
  } else {
    send({ type: 'GO_TO_QUESTION_2B' });
  }
}, [transcript]);

// GOOD: Logic in machine
processing1: {
  invoke: {
    src: 'nluActor',
    onDone: [
      {
        target: 'question2a',
        guard: ({ event }) => event.output.result === 'option_a'
      },
      {
        target: 'question2b',
        guard: ({ event }) => event.output.result === 'option_b'
      }
    ]
  }
}
```

### Anti-Pattern 3: Blocking UI thread during audio processing

**What people do:** Use synchronous audio decoding (`audioContext.decodeAudioData` old callback API) or process large audio blobs on main thread.

**Why it's wrong:** Freezes UI during decoding. Causes jank and poor UX.

**Do this instead:** Use promise-based `decodeAudioData` (returns promise, runs off main thread). For large operations, use Web Workers.

```typescript
// BAD: Blocks main thread
const buffer = audioContext.decodeAudioData(arrayBuffer, (buffer) => {
  // Callback API is deprecated and can block
});

// GOOD: Promise-based, non-blocking
const buffer = await audioContext.decodeAudioData(arrayBuffer);
```

### Anti-Pattern 4: Not handling microphone permission denial

**What people do:** Assume `navigator.mediaDevices.getUserMedia()` will always succeed. No error handling.

**Why it's wrong:** User can deny permission, or browser can block (non-HTTPS, private browsing). App breaks silently or with cryptic error.

**Do this instead:** Wrap in try-catch. Show clear error message. Provide fallback (e.g., text input, retry prompt).

```typescript
// lib/services/stt.ts
async startRecording(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    // ... rest of logic
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Microphone permission denied. Please allow access and try again.');
    } else if (err.name === 'NotFoundError') {
      throw new Error('No microphone found. Please connect a microphone and try again.');
    } else {
      throw new Error(`Microphone error: ${err.message}`);
    }
  }
}
```

### Anti-Pattern 5: Not cleaning up audio resources

**What people do:** Create Howler instances, MediaRecorder streams, AudioBufferSourceNodes but never stop/disconnect them.

**Why it's wrong:** Memory leaks, audio keeps playing in background, MediaRecorder keeps camera light on.

**Do this instead:** Always clean up resources. Stop MediaRecorder tracks. Stop/disconnect AudioBufferSourceNodes. Unload Howler instances if dynamic.

```typescript
// Cleanup MediaRecorder
if (this.mediaRecorder) {
  this.mediaRecorder.stop();
  this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

// Cleanup AudioBufferSourceNode
source.stop();
source.disconnect();

// Cleanup Howler (if not reusing)
howl.unload();
```

## Build Order (Dependency-Based)

Based on the architecture, here's the recommended build order to minimize rework:

### Phase 1: Foundation (no dependencies)
1. **Project setup**: Next.js 14 App Router + TypeScript + Tailwind
2. **Audio context singleton**: `lib/audio/audioContext.ts`
3. **Script content**: `lib/content/script.ts` (hardcoded narrative text)
4. **Basic UI shell**: `app/oracle/page.tsx` with "Start" button

### Phase 2: State Machine Core (depends on: script content)
5. **State machine definition**: `lib/machines/oracleMachine.ts` (basic states, no actors yet)
6. **React integration**: Hook up `useMachine()` in `OracleExperience.tsx`
7. **Phase visualizer**: `components/PhaseVisualizer.tsx` (shows current phase based on `state.value`)

### Phase 3: TTS Pipeline (depends on: audio context, state machine)
8. **TTS service**: `lib/services/tts.ts` (streaming WebSocket logic)
9. **TTS API route**: `app/api/tts/stream/route.ts` (proxy to ElevenLabs)
10. **TTS actor**: `lib/actors/ttsActor.ts`
11. **Integrate TTS into state machine**: Update `oracleMachine.ts` to invoke `ttsActor` in question states

### Phase 4: STT Pipeline (depends on: state machine)
12. **STT service**: `lib/services/stt.ts` (MediaRecorder capture)
13. **STT API route**: `app/api/stt/transcribe/route.ts` (Whisper proxy)
14. **STT actor**: `lib/actors/sttActor.ts`
15. **Mic indicator**: `components/MicIndicator.tsx`
16. **Integrate STT into state machine**: Add listening states with `sttActor`

### Phase 5: NLU Pipeline (depends on: STT pipeline)
17. **NLU API route**: `app/api/nlu/classify/route.ts` (Claude Haiku proxy)
18. **NLU actor**: `lib/actors/nluActor.ts`
19. **Integrate NLU into state machine**: Add processing states with `nluActor` and transition guards

### Phase 6: Ambient Audio (depends on: state machine phases)
20. **Ambient audio service**: `lib/services/ambientAudio.ts` (Howler.js wrapper)
21. **Ambient audio actor**: `lib/actors/ambientAudioActor.ts` (optional — or just manage via React useEffect)
22. **Phase transition audio**: Wire `currentPhase` context changes to `ambientAudio.transitionTo()`

### Phase 7: Analytics (depends on: state machine events)
23. **Analytics API route**: `app/api/analytics/log/route.ts` (Supabase insert)
24. **Analytics actor**: `lib/actors/analyticsActor.ts` (event buffer + flush)
25. **Integrate analytics**: Add logging actions to state machine transitions

### Phase 8: Error Handling & Fallbacks (depends on: all pipelines)
26. **Timeout handling**: Add timeout logic to listening states
27. **Fallback states**: Poetic redirect states when STT/NLU fails
28. **Error UI**: Error boundary and user-facing error messages

### Phase 9: Admin Panel (depends on: analytics)
29. **Admin dashboard**: `app/admin/page.tsx`
30. **Real-time metrics**: Query Supabase for session stats
31. **Station status**: Heartbeat endpoint to show which stations are active

## Sources

**Confidence: MEDIUM**

Architecture based on:
- **XState v5 documentation** (training data, pre-January 2025): Actor model, `fromPromise`, `useMachine` hook patterns
- **Web Audio API MDN documentation** (training data): AudioContext lifecycle, decodeAudioData, AudioBufferSourceNode
- **MediaRecorder API MDN documentation** (training data): Browser audio capture patterns, blob handling
- **ElevenLabs API patterns** (training data): WebSocket streaming general architecture (specific endpoints not verified)
- **Howler.js documentation** (training data): Fade methods, preloading, loop patterns
- **Next.js 14 App Router** (training data): API route patterns, RSC architecture

**Limitations:**
- Web search and WebFetch tools were unavailable for verification
- ElevenLabs streaming API specifics (exact WebSocket endpoints, payload format) not verified against current 2026 docs
- XState v5 patterns verified against training data (v5 released late 2023), may have minor API changes in 2026
- Claude Haiku API specifics (exact model ID for 2026) not verified

**Recommendations for validation:**
1. Verify ElevenLabs WebSocket streaming endpoint and payload format in current API docs
2. Confirm XState v5 `fromPromise` and `useMachine` APIs haven't changed
3. Test MediaRecorder `mimeType` support across target browsers (Chrome, Edge, Safari)
4. Verify Whisper API accepts webm/opus format (may need conversion)
5. Confirm Claude Haiku model availability and latency characteristics

---
*Architecture research for: O Oráculo — Interactive Voice Agent*
*Researched: 2026-03-24*
*Confidence: MEDIUM (framework patterns verified via training data; API specifics need current doc verification)*
