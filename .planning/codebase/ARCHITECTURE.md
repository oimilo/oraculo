# Architecture

**Analysis Date:** 2026-03-25

## High-Level Overview

O Oraculo is a **single-page interactive voice experience** built on Next.js 15 App Router. A visitor interacts via voice (microphone) while the system narrates a branching Dante-inspired journey using TTS. The architecture centers on an **XState v5 state machine** that orchestrates the entire flow, with a **service layer** that abstracts AI providers behind interfaces swappable via environment variable.

**Pattern:** Component-orchestrated state machine with dependency-injected services.

**Key Characteristics:**
- Single orchestrator component (`OracleExperience`) drives the entire experience
- XState v5 state machine defines all narrative flow, branching, and timeouts
- Interface + Factory + Mock pattern for all external services (TTS, STT, NLU, Analytics)
- Server-side API routes proxy external AI calls (keys never reach client)
- Client-side localStorage for analytics and station registry (mock phase)
- Desktop-only, dark-theme, minimal UI -- voice is primary interaction

## State Machine Architecture

**Location:** `src/machines/oracleMachine.ts`
**Types:** `src/machines/oracleMachine.types.ts`

The state machine is the **single source of truth** for the experience flow. It defines 17 states across 6 narrative phases, with 2 binary choice points producing 4 possible paths.

### State Hierarchy

```
IDLE
APRESENTACAO
INFERNO (compound)
  NARRATIVA -> PERGUNTA -> AGUARDANDO -> RESPOSTA_A | RESPOSTA_B | TIMEOUT_REDIRECT
PURGATORIO_A (compound)
  NARRATIVA -> PERGUNTA -> AGUARDANDO -> RESPOSTA_FICAR | RESPOSTA_EMBORA
PURGATORIO_B (compound)
  NARRATIVA -> PERGUNTA -> AGUARDANDO -> RESPOSTA_PISAR | RESPOSTA_CONTORNAR
PARAISO
DEVOLUCAO (routing state - uses `always` guards)
  -> DEVOLUCAO_A_FICAR | DEVOLUCAO_A_EMBORA | DEVOLUCAO_B_PISAR | DEVOLUCAO_B_CONTORNAR
ENCERRAMENTO
FIM
```

### Branching Logic

- **Choice 1 (INFERNO):** `CHOICE_A` (Vozes) or `CHOICE_B` (Silencio) -- timeout defaults to B
- **Choice 2 (PURGATORIO_A):** `CHOICE_FICAR` or `CHOICE_EMBORA` -- timeout defaults to FICAR
- **Choice 2 (PURGATORIO_B):** `CHOICE_PISAR` or `CHOICE_CONTORNAR` -- timeout defaults to CONTORNAR
- **4 Paths:** A_FICAR, A_EMBORA, B_PISAR, B_CONTORNAR

### Context

```typescript
interface OracleContext {
  sessionId: string;         // UUID per session
  choice1: 'A' | 'B' | null;
  choice2: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;
  fallbackCount: number;     // times voice recognition fell back
  currentPhase: NarrativePhase;  // for UI background color
}
```

### Event Types

All events the machine accepts (defined in `src/machines/oracleMachine.types.ts`):
- `START` -- begin experience
- `NARRATIVA_DONE` -- TTS finished speaking current script segment
- `CHOICE_A`, `CHOICE_B` -- Inferno choice
- `CHOICE_FICAR`, `CHOICE_EMBORA` -- Purgatorio A choice
- `CHOICE_PISAR`, `CHOICE_CONTORNAR` -- Purgatorio B choice
- `TIMEOUT` -- unused directly (machine uses `after` delays)
- `FALLBACK_USED` -- increments fallbackCount

### Timeout Strategy

Every state (except IDLE and FIM) has a 120-second global `after` timeout that returns to IDLE. AGUARDANDO sub-states have a 15-second timeout that auto-selects the default choice. FIM auto-transitions to IDLE after 5 seconds.

## Service Layer Architecture

All external integrations follow the **Interface + Factory + Mock** pattern, toggled by `NEXT_PUBLIC_USE_REAL_APIS` environment variable.

### Pattern

```typescript
// 1. Interface (in index.ts)
export interface TTSService {
  speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void>;
  cancel(): void;
}

// 2. Factory (in index.ts)
export function createTTSService(): TTSService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    return new ElevenLabsTTSService();
  }
  return new MockTTSService();
}

// 3. Mock (in mock.ts) -- uses browser SpeechSynthesis
// 4. Real (in elevenlabs.ts) -- calls /api/tts
// 5. Fallback (in fallback.ts) -- plays pre-recorded MP3s
```

### Service Map

| Service | Interface | Mock | Real | Fallback | API Route |
|---------|-----------|------|------|----------|-----------|
| TTS | `src/services/tts/index.ts` | `mock.ts` (SpeechSynthesis) | `elevenlabs.ts` | `fallback.ts` (pre-recorded MP3) | `/api/tts` |
| STT | `src/services/stt/index.ts` | `mock.ts` (returns "vozes") | `whisper.ts` | -- | `/api/stt` |
| NLU | `src/services/nlu/index.ts` | `mock.ts` (keyword match) | `claude.ts` | -- | `/api/nlu` |
| Analytics | `src/services/analytics/index.ts` | `mock.ts` (localStorage) | Not yet implemented | -- | -- |
| Station | `src/services/station/index.ts` | `registry.ts` (localStorage singleton) | Not yet implemented | -- | -- |
| Audio | `src/services/audio/` | Direct Web Audio API | -- | -- | -- |

### API Route Architecture

API routes live in `src/app/api/` and act as **server-side proxies** to keep API keys out of client bundles:

- **`src/app/api/tts/route.ts`** -- Proxies to ElevenLabs `/v1/text-to-speech/{voiceId}/stream`. Includes concurrency limiter (max 2 parallel), retry with exponential backoff on 429. Returns `audio/mpeg` stream.
- **`src/app/api/stt/route.ts`** -- Proxies to OpenAI Whisper `/v1/audio/transcriptions`. Accepts FormData with audio file, returns `{ text: string }`.
- **`src/app/api/nlu/route.ts`** -- Proxies to Anthropic Messages API using `claude-3-5-haiku-20241022`. Sends binary classification prompt, parses JSON response, returns `ClassificationResult`.

All routes use `requireEnv()` from `src/lib/api/validateEnv.ts` for env var validation.

## Data Flow

### Primary Experience Flow

```
User Click (START)
  -> OracleExperience.handleStart()
  -> initAudioContext() (unlocks Web Audio on user gesture)
  -> createTTSService() (lazy init)
  -> send({ type: 'START' }) to state machine
  -> Machine transitions: IDLE -> APRESENTACAO
  -> useEffect detects state change
  -> getScriptKey(state) maps machine state to SCRIPT key
  -> ttsRef.current.speak(segments, voiceSettings)
  -> On TTS completion: send({ type: 'NARRATIVA_DONE' })
  -> Machine transitions to next state
  -> Repeat until AGUARDANDO state...
```

### Voice Choice Pipeline (AGUARDANDO states)

```
State enters AGUARDANDO
  -> isAguardando becomes true
  -> useVoiceChoice(config, active=true) activates
  -> useMicrophone.startRecording(6000ms)
  -> MediaRecorder captures audio for 6s (auto-stop timer)
  -> On stop: audioBlob produced
  -> STT service transcribes audioBlob -> text
  -> NLU service classifies text -> { choice: 'A'|'B', confidence }
  -> If confidence >= 0.7: emit choiceResult with mapped event
  -> If confidence < 0.7 and attempts < 2: set needsFallback
  -> If needsFallback: play fallback script, restart listening
  -> If max attempts: use defaultEvent
  -> OracleExperience receives choiceResult -> send(eventType) to machine
  -> Machine transitions to response state
```

### Audio System

Three independent audio paths sharing one `AudioContext`:

1. **TTS Audio** -- `ElevenLabsTTSService` decodes MP3 response into `AudioBuffer`, plays via `AudioBufferSourceNode` connected to `destination`. `MockTTSService` uses browser `SpeechSynthesis`. `FallbackTTSService` plays pre-recorded MP3s from `/public/audio/prerecorded/`.

2. **Ambient Audio** -- `AmbientPlayer` loads ambient tracks per phase (`/audio/ambient-{phase}.mp3`), plays via separate `GainNode` connected directly to `destination` (separate path from TTS per AMB-03). Crossfades between phases using `linearRampToValueAtTime`.

3. **Waveform Visualization** -- `AnalyserNode` taps the main `GainNode` from `audioContext.ts`, reads time-domain data, renders to canvas via `requestAnimationFrame`.

**AudioContext singleton:** `src/lib/audio/audioContext.ts` -- must be initialized on user gesture (`handleStart`). Provides `getAudioContext()` and `getGainNode()` globally.

### Analytics Flow

```
Session Start (START event)
  -> useSessionAnalytics.startSession(sessionId)
  -> MockAnalyticsService writes to localStorage

During Experience
  -> StationRegistry.heartbeat() every 10s (per-tab)
  -> localStorage key: 'oraculo_stations'

Session End (FIM or timeout)
  -> useSessionAnalytics.endSession(sessionId, choices, fallbackCount, completed)
  -> MockAnalyticsService writes to localStorage key: 'oraculo_analytics'

Admin Dashboard (/admin)
  -> Reads same localStorage keys
  -> Polls every 5s
```

### State Management

- **State Machine:** XState v5 via `useMachine()` hook -- single source of truth for experience flow
- **React State:** `useState` for UI concerns only (micPermissionGranted, experienceStarted, isSpeaking)
- **Refs:** `useRef` for services (ttsRef, sttRef, nluRef) and internal state (prevStateRef, isSpeakingRef) -- avoids re-renders and stale closures
- **localStorage:** Analytics sessions and station heartbeats (mock persistence)
- **No global state management (Redux, Zustand, Context)** -- the state machine handles cross-component coordination

## Key Abstractions

### SpeechSegment

The fundamental unit of narration. Each segment has text and optional pause timing.

- Defined in: `src/types/index.ts`
- Used by: `src/data/script.ts`, all TTS services
- Pattern: Array of segments per script key, sequential playback with pauses

```typescript
interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds
}
```

### VoiceSettings

Phase-specific voice parameters for ElevenLabs TTS (stability, similarity_boost, style, speed) with a `phase` field for mock routing.

- Defined in: `src/services/tts/index.ts`
- Lookup table: `PHASE_VOICE_SETTINGS` maps `NarrativePhase -> VoiceSettings`

### ChoiceConfig

Configuration for the voice choice pipeline at each AGUARDANDO decision point. Defines question context, option labels, event mapping, and thresholds.

- Defined in: `src/hooks/useVoiceChoice.ts`
- Three instances: `INFERNO_CHOICE`, `PURGATORIO_A_CHOICE`, `PURGATORIO_B_CHOICE` in `OracleExperience.tsx`

### NarrativePhase

Union type of 6 phases that drives background colors, voice settings, and ambient audio selection.

- Defined in: `src/types/index.ts`
- Values: `APRESENTACAO`, `INFERNO`, `PURGATORIO`, `PARAISO`, `DEVOLUCAO`, `ENCERRAMENTO`

## Entry Points

### Main Experience (`/`)

- Location: `src/app/page.tsx`
- Renders: `OracleExperience` component
- Triggers: User navigates to root URL, optionally with `?station=station-N`

### Admin Dashboard (`/admin`)

- Location: `src/app/admin/page.tsx`
- Renders: Station cards, session metrics, path distribution charts
- Triggers: Staff navigates to `/admin`

### API Routes

- `src/app/api/tts/route.ts` -- POST, proxies ElevenLabs TTS
- `src/app/api/stt/route.ts` -- POST, proxies OpenAI Whisper
- `src/app/api/nlu/route.ts` -- POST, proxies Anthropic Claude

## Error Handling

### Strategy: Graceful Degradation with Fallback Chains

The system is designed for a live event. Every error path leads to a continued experience rather than a crash.

### TTS Fallback Chain

```
ElevenLabsTTSService (/api/tts)
  -> On API failure: FallbackTTSService (pre-recorded MP3s)
    -> On MP3 not found: Browser SpeechSynthesis
      -> On SpeechSynthesis unavailable: Simulated delay
```

### Voice Choice Fallback

```
Record audio (6s) -> STT -> NLU
  -> Low confidence: Play fallback prompt, retry (max 2 attempts)
  -> Error/empty: Same retry logic
  -> Max attempts reached: Use default choice
  -> 15s state machine timeout: Auto-select default
  -> Button fallback: ChoiceButtons always rendered alongside voice
```

### API Route Error Handling

All API routes follow the same pattern:
1. Validate environment variables with `requireEnv()` -- returns 500 if missing
2. Validate request body -- returns 400 if malformed
3. Call external API -- returns 502 if external service fails
4. Catch-all -- returns 500 for unexpected errors

## Cross-Cutting Concerns

### Logging

Console-based logging with prefixed tags: `[VoiceChoice]`, `[Mic]`, `[TTS]`, `[ElevenLabs]`. No structured logging framework. API routes use `console.error` and `console.warn`.

### Validation

- API route input validation is inline (body field checks)
- Environment variable validation via `requireEnv()` in `src/lib/api/validateEnv.ts`
- TypeScript strict mode enforces type safety at compile time

### Authentication

No user authentication. The experience is public-facing at an art installation. API routes have no auth middleware -- they rely on server-side env vars for external API keys.

### Multi-Station Isolation

Each browser tab is a "station" identified by `?station=station-N` query parameter (defaults to `station-1`). Isolation is per-tab via separate `useMachine()` instances. The `StationRegistry` singleton in `src/services/station/registry.ts` uses localStorage for heartbeat coordination, meaning **multi-station only works across tabs on the same browser** (not across machines).

### LGPD Compliance (ANA-02)

Analytics records are strictly anonymous: UUID session IDs, path choices, duration, fallback count. The `SessionRecord` type in `src/types/analytics.ts` explicitly documents what must NEVER be stored (audio, transcripts, names, IPs).

---

*Architecture analysis: 2026-03-25*
