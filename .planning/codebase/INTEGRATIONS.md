# External Integrations

**Analysis Date:** 2025-03-25

## Integration Architecture

**Pattern:** Interface + Factory + Mock (swap via `NEXT_PUBLIC_USE_REAL_APIS` env var)

All external services follow an identical architecture:
1. **Interface** defined in `src/services/{service}/index.ts`
2. **Factory function** `create{Service}()` checks `NEXT_PUBLIC_USE_REAL_APIS`
3. **Mock implementation** in `src/services/{service}/mock.ts` (no API calls, localStorage or in-memory)
4. **Real implementation** in `src/services/{service}/{provider}.ts` (calls Next.js API route)
5. **API route** in `src/app/api/{service}/route.ts` (server-side, holds API keys)

**Key pattern: API keys are NEVER exposed to the client.** Real service implementations call internal Next.js API routes (`/api/tts`, `/api/stt`, `/api/nlu`), which proxy to external APIs with server-side credentials.

```
Browser (client)                    Next.js Server                External API
ElevenLabsTTSService  ──fetch──>  /api/tts/route.ts  ──fetch──>  api.elevenlabs.io
WhisperSTTService     ──fetch──>  /api/stt/route.ts  ──fetch──>  api.openai.com
ClaudeNLUService      ──fetch──>  /api/nlu/route.ts  ──fetch──>  api.anthropic.com
```

**Environment validation:** All API routes use `requireEnv()` from `src/lib/api/validateEnv.ts` to fail fast with clear errors when env vars are missing.

## Current Integrations (Active)

### 1. ElevenLabs - Text-to-Speech

**Purpose:** Convert Portuguese script text to natural speech audio for the Oracle character.

**Status:** Implemented and wired (v1.1 Phase 05)

**Files:**
- Interface: `src/services/tts/index.ts` - `TTSService` interface, `createTTSService()` factory
- Real impl: `src/services/tts/elevenlabs.ts` - `ElevenLabsTTSService` class
- API route: `src/app/api/tts/route.ts` - Server-side proxy to ElevenLabs
- Mock: `src/services/tts/mock.ts` - `MockTTSService` (simulated delays)
- Fallback: `src/services/tts/fallback.ts` - `FallbackTTSService` (pre-recorded MP3s)
- Tests: `src/services/tts/__tests__/elevenlabs-tts.test.ts`, `src/app/api/tts/__tests__/tts-route.test.ts`

**External API:**
- Endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/stream`
- Method: POST
- Model: `eleven_multilingual_v2`
- Auth: `xi-api-key` header
- Response: `audio/mpeg` stream
- No SDK - plain `fetch`

**Voice Settings (per narrative phase):**
```typescript
// Defined in src/services/tts/index.ts
PHASE_VOICE_SETTINGS: Record<NarrativePhase, VoiceSettings>
// stability, similarity_boost, style, speed - vary per phase
```

**Resilience:**
- Concurrency limiter: max 2 parallel calls (ElevenLabs allows 3, leaves headroom)
- Retry with backoff: up to 2 retries on 429 (rate limit), 1s/2s delays
- Automatic fallback to `FallbackTTSService` on any API failure
- Fallback chain: ElevenLabs API > Pre-recorded MP3s > Browser SpeechSynthesis

**Env vars:**
- `ELEVENLABS_API_KEY` (server-only, required)
- `ELEVENLABS_VOICE_ID` (server-only, optional, defaults to Rachel `21m00Tcm4TlvDq8ikWAM`)

### 2. OpenAI Whisper - Speech-to-Text

**Purpose:** Transcribe visitor voice responses (Portuguese) to text for binary classification.

**Status:** Implemented and wired (v1.1 Phase 05)

**Files:**
- Interface: `src/services/stt/index.ts` - `STTService` interface, `createSTTService()` factory
- Real impl: `src/services/stt/whisper.ts` - `WhisperSTTService` class
- API route: `src/app/api/stt/route.ts` - Server-side proxy to OpenAI
- Mock: `src/services/stt/mock.ts` - `MockSTTService`
- Tests: `src/services/stt/__tests__/whisper-stt.test.ts`, `src/app/api/stt/__tests__/stt-route.test.ts`

**External API:**
- Endpoint: `https://api.openai.com/v1/audio/transcriptions`
- Method: POST (multipart/form-data)
- Model: `whisper-1`
- Language: `pt` (Portuguese, hardcoded)
- Response format: JSON (`{ text: string }`)
- Auth: `Authorization: Bearer` header
- No SDK - plain `fetch`

**Client-side flow:**
1. `useMicrophone` hook records audio as `Blob` (webm/opus preferred)
2. `WhisperSTTService.transcribe(audioBlob)` sends to `/api/stt` as FormData
3. API route forwards to OpenAI with server-side API key
4. Returns transcription text

**Env vars:**
- `OPENAI_API_KEY` (server-only, required)

### 3. Anthropic Claude - Natural Language Understanding

**Purpose:** Binary classification of visitor spoken responses into choice A or B.

**Status:** Implemented and wired (v1.1 Phase 05)

**Files:**
- Interface: `src/services/nlu/index.ts` - `NLUService` interface, `createNLUService()` factory
- Real impl: `src/services/nlu/claude.ts` - `ClaudeNLUService` class
- API route: `src/app/api/nlu/route.ts` - Server-side proxy to Anthropic
- Mock: `src/services/nlu/mock.ts` - `MockNLUService`
- Tests: `src/services/nlu/__tests__/claude-nlu.test.ts`, `src/app/api/nlu/__tests__/nlu-route.test.ts`

**External API:**
- Endpoint: `https://api.anthropic.com/v1/messages`
- Method: POST
- Model: `claude-3-5-haiku-20241022`
- Max tokens: 256
- API version: `2023-06-01`
- Auth: `x-api-key` header
- No SDK - plain `fetch`

**Classification flow:**
1. Client sends: `{ transcript, questionContext, options: { A, B } }`
2. API route builds system+user prompts for binary classification
3. Claude returns JSON: `{ choice: "A"|"B", confidence: 0.0-1.0, reasoning: string }`
4. Fallback on parse failure: `{ choice: "A", confidence: 0.5, reasoning: "Failed to parse" }`

**System prompt** (hardcoded in `src/app/api/nlu/route.ts`):
> "You are a binary classifier for an interactive art installation called O Oraculo. Classify the visitor's response into one of two options. Return ONLY valid JSON..."

**Env vars:**
- `ANTHROPIC_API_KEY` (server-only, required)

## Planned Integrations (Not Yet Implemented)

### 4. Supabase - Analytics

**Purpose:** Persistent analytics storage with real-time capabilities, replacing localStorage mock.

**Status:** Planned (env vars commented out in `.env.example`, factory stub in code)

**Files:**
- Interface: `src/services/analytics/index.ts` - `AnalyticsService` interface, `createAnalyticsService()` factory
- Mock (current): `src/services/analytics/mock.ts` - `MockAnalyticsService` (localStorage-backed)
- Real impl: NOT YET CREATED
- Tests: `src/services/analytics/__tests__/analytics-service.test.ts`

**Current factory** (falls through to mock):
```typescript
// src/services/analytics/index.ts
export function createAnalyticsService(): AnalyticsService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    // Real Supabase implementation (future)
    // For now fall through to mock
  }
  return new MockAnalyticsService();
}
```

**Planned architecture:**
- Client: `@supabase/supabase-js` SDK (the only planned SDK dependency)
- Auth: Supabase anon key (client-exposed, RLS-protected)
- Database: PostgreSQL via Supabase
- Table: `sessions` (mirrors `SessionRecord` type from `src/types/analytics.ts`)
- LGPD compliant: zero PII by design (no audio, transcripts, visitor IDs, or IPs)

**Planned env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` (client-exposed)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-exposed, RLS-protected)

## Internal Services (No External API)

### Audio System

**Files:**
- `src/lib/audio/audioContext.ts` - Global AudioContext singleton
- `src/lib/audio/speechSynthesis.ts` - Browser SpeechSynthesis wrapper (pt-BR)
- `src/services/audio/crossfader.ts` - Equal-power crossfade between GainNodes
- `src/services/audio/ambientPlayer.ts` - Ambient audio manager with crossfade transitions
- `src/services/tts/fallback.ts` - Pre-recorded MP3 playback (25 audio files mapped)

**Pre-recorded audio (offline fallback):**
- Location: `public/audio/prerecorded/*.mp3` (25 files, not yet recorded)
- Ambient: `public/audio/ambient-{inferno,purgatorio,paraiso}.mp3`
- Mapping: `PRERECORDED_URLS` in `src/services/tts/fallback.ts`
- Buffer caching: in-memory `Map<string, AudioBuffer>`

### Station Management

**Files:**
- `src/services/station/registry.ts` - `StationRegistry` singleton
- `src/services/station/index.ts` - Exports

**Purpose:** Multi-station support via `?station=station-N` query param, heartbeat-based online detection, localStorage-backed.

### Session Analytics (Mock)

**Files:**
- `src/services/analytics/mock.ts` - `MockAnalyticsService`
- `src/types/analytics.ts` - `SessionRecord`, `SessionStartData`, `SessionEndData`

**Storage key:** `oraculo_analytics` in localStorage

## API Routes

| Route | Method | Purpose | External API | Auth Env Var |
|-------|--------|---------|-------------|-------------|
| `/api/tts` | POST | Text-to-speech proxy | ElevenLabs | `ELEVENLABS_API_KEY` |
| `/api/stt` | POST | Speech-to-text proxy | OpenAI Whisper | `OPENAI_API_KEY` |
| `/api/nlu` | POST | NLU classification proxy | Anthropic Claude | `ANTHROPIC_API_KEY` |

**Common patterns across all routes:**
- Validate env vars with `requireEnv()` from `src/lib/api/validateEnv.ts`
- Return 400 for missing/invalid request fields
- Return 500 for missing configuration (env vars)
- Return 502 for upstream API errors
- Use `NextRequest` / `NextResponse` from `next/server`
- No middleware, no authentication on routes (designed for same-origin use)

## Environment Variables

**Required for real API mode (`NEXT_PUBLIC_USE_REAL_APIS=true`):**

| Variable | Scope | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_USE_REAL_APIS` | Client | Yes | Toggle mock vs real services |
| `ELEVENLABS_API_KEY` | Server | Yes (for TTS) | ElevenLabs authentication |
| `ELEVENLABS_VOICE_ID` | Server | No (has default) | Voice selection (default: Rachel) |
| `OPENAI_API_KEY` | Server | Yes (for STT) | OpenAI Whisper authentication |
| `ANTHROPIC_API_KEY` | Server | Yes (for NLU) | Claude Haiku authentication |

**Planned (not yet active):**

| Variable | Scope | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | For analytics | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | For analytics | Supabase anonymous key |

**Configuration file:** `.env.example` (copy to `.env.local`)

**SECURITY WARNING:** The `.env.example` file currently contains real API key values instead of placeholders. These should be replaced with placeholder text before committing.

## Voice Choice Pipeline

The voice choice pipeline orchestrates STT + NLU for user decisions.

**Hook:** `src/hooks/useVoiceChoice.ts`
**Microphone:** `src/hooks/useMicrophone.ts`

**Flow:**
1. State machine enters `AGUARDANDO` state
2. `useVoiceChoice` hook activates (via `active` flag)
3. `useMicrophone` starts recording (max duration timeout)
4. User speaks, recording stops
5. `STTService.transcribe()` sends audio blob to `/api/stt`
6. `NLUService.classify()` sends transcript to `/api/nlu`
7. Classification result mapped to state machine event
8. `send({ type: eventType })` advances state machine
9. On failure: `needsFallback` flag triggers fallback TTS + retry

## Webhooks & Callbacks

**Incoming:** None
**Outgoing:** None

---

*Integration audit: 2025-03-25*
