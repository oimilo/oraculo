# External Integrations

**Analysis Date:** 2026-03-29

## Integration Architecture

All external APIs are proxied through Next.js API routes. Client-side code never touches API keys directly. Each service follows the pattern: interface + factory + implementation + mock.

```
Browser -> /api/tts  -> ElevenLabs (server-side)
Browser -> /api/stt  -> OpenAI Whisper (server-side)
Browser -> /api/nlu  -> Anthropic Claude (server-side)
```

## APIs & External Services

**Text-to-Speech (ElevenLabs):**
- Purpose: Generate voice narration for the Oracle character
- SDK/Client: Direct HTTP fetch to `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/stream`
- API Route: `src/app/api/tts/route.ts`
- Auth: `ELEVENLABS_API_KEY` (env var, server-side only)
- Config: `ELEVENLABS_VOICE_ID`, `USE_V3_MODEL`
- Model: `eleven_v3` (when USE_V3_MODEL=true) or `eleven_multilingual_v2`
- Features: Concurrency limiter (max 2 parallel), retry on 429 with backoff, streams audio/mpeg
- Fallback: `FallbackTTSService` plays pre-recorded MP3s from `public/audio/prerecorded/`

**Speech-to-Text (OpenAI Whisper):**
- Purpose: Transcribe visitor voice responses
- SDK/Client: Direct HTTP fetch to `https://api.openai.com/v1/audio/transcriptions`
- API Route: `src/app/api/stt/route.ts`
- Auth: `OPENAI_API_KEY` (env var, server-side only)
- Config: `model: "whisper-1"`, `language: "pt"`, `response_format: "json"`
- Features: 10s timeout via AbortController, hallucination filtering (amara.org, legendas, etc.)
- Empty blob handling: returns empty transcript without calling API

**Natural Language Understanding (Anthropic Claude):**
- Purpose: Classify visitor's spoken response as choice A or B
- SDK/Client: Direct HTTP fetch to `https://api.anthropic.com/v1/messages`
- API Route: `src/app/api/nlu/route.ts`
- Auth: `ANTHROPIC_API_KEY` (env var, server-side only)
- Model: `claude-haiku-4-5-20251001` (fast, cheap)
- Max tokens: 256
- Features: 3-tier classification cascade:
  1. Direct text match (confidence 1.0)
  2. Keyword match (confidence 0.95) - accent-insensitive
  3. LLM classification via Claude Haiku (variable confidence)
- Prompt: Art-installation-aware system prompt, interprets metaphorical responses
- JSON extraction: Handles markdown code blocks, raw JSON, text-based fallback
- 10s timeout via AbortController

## Data Storage

**Databases:**
- None currently active
- Supabase planned for analytics (env vars commented out in `.env.example`)

**File Storage:**
- Local filesystem only: `public/audio/prerecorded/` (61 MP3 files)
- Files served statically by Next.js

**Caching:**
- `FallbackTTSService` caches decoded `AudioBuffer` objects in memory (Map)
- No server-side caching

**Session State:**
- In-memory only (XState machine context)
- `StationRegistry` uses `localStorage` for heartbeat tracking between tabs
- `MockAnalyticsService` uses `localStorage` for session records
- No server-side session persistence

## Authentication & Identity

**Auth Provider:**
- None. The installation is a public kiosk. No user accounts.
- API keys are server-side only, never exposed to client.

## Monitoring & Observability

**Error Tracking:**
- `console.error` / `console.warn` only
- No external error tracking service (Sentry, etc.)

**Logging:**
- Custom `createLogger(namespace)` in `src/lib/debug/logger.ts`
- Outputs `[{elapsed}ms] [{namespace}] {message}` format
- Namespaces: `TTS`, `VoiceChoice`, `Mic`, `Activation`
- Server-side API routes use `console.log('[STT]')`, `console.log('[NLU]')`, etc.

**Debug Panel:**
- `src/components/debug/DebugPanel.tsx` - dev-only overlay showing machine state, TTS status, mic activation

## CI/CD & Deployment

**Hosting:**
- Not configured yet. Target: Vercel or any Node.js host.

**CI Pipeline:**
- None configured. Tests run locally via `npm test`.

## Environment Configuration

**Required env vars (for real API mode):**
- `NEXT_PUBLIC_USE_REAL_APIS=true`
- `ELEVENLABS_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

**Optional env vars:**
- `ELEVENLABS_VOICE_ID` (defaults to `21m00Tcm4TlvDq8ikWAM`)
- `USE_V3_MODEL` (defaults to false / v2)

**Offline mode (no env vars needed):**
- Set `NEXT_PUBLIC_USE_REAL_APIS` to anything other than `"true"`
- TTS falls back to pre-recorded MP3s
- STT/NLU use mock services (tests only; voice input non-functional)

**Secrets location:**
- `.env.local` (gitignored)
- `.env.example` provides template with placeholder values

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Service Toggle Matrix

| Service | NEXT_PUBLIC_USE_REAL_APIS=true | Otherwise |
|---------|-------------------------------|-----------|
| TTS | `ElevenLabsTTSService` -> `/api/tts` -> ElevenLabs | `FallbackTTSService` -> pre-recorded MP3s |
| STT | `WhisperSTTService` -> `/api/stt` -> OpenAI | `MockSTTService` (test only) |
| NLU | `ClaudeNLUService` -> `/api/nlu` -> Anthropic | `MockNLUService` (test only) |
| Analytics | `MockAnalyticsService` (localStorage) | `MockAnalyticsService` (localStorage) |

Note: STT and NLU factory functions (`createSTTService`, `createNLUService`) always return real implementations in browser context regardless of the toggle. The toggle only affects TTS. Voice input requires real STT+NLU to function.

---

*Integration audit: 2026-03-29*
