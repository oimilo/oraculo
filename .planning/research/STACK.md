# Stack Research

**Domain:** Interactive Voice Agent (Scripted Experience)
**Researched:** 2026-03-24
**Confidence:** MEDIUM (based on training data through Jan 2025, web verification not available)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 14.2.x or 15.x | Web framework with API routes | App Router provides streaming support, API routes handle TTS/STT/NLU orchestration, built-in optimization for audio streaming. Server components reduce client bundle for minimal UI. |
| **React** | 18.3.x | UI framework | Required by Next.js 14+, Concurrent features enable smooth audio state updates without blocking UI. |
| **TypeScript** | 5.3.x+ | Type safety | Critical for state machine types, API response shapes, and audio event handling. XState benefits significantly from TS inference. |
| **XState** | 5.18.x | State machine orchestration | V5 provides actor model, type-safe state definitions, built-in timeout handling, and inspect/dev tools. Perfect for scripted flow with branching paths. |
| **Supabase JS Client** | 2.45.x+ | Analytics + session storage | Realtime subscriptions for admin panel, anonymous session tracking, built-in auth (for admin), low-latency queries. |
| **Tailwind CSS** | 3.4.x | Styling | Minimal bundle for minimal UI, utility classes for rapid phase-specific visual feedback. |

### API Integration Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **elevenlabs** (npm) | 0.8.x+ | ElevenLabs TTS streaming | Official SDK provides WebSocket streaming, voice settings, PT-BR support. Use for all TTS generation. |
| **openai** (npm) | 4.67.x+ | OpenAI Whisper API | Official SDK for audio transcription. Use for STT of visitor utterances. |
| **@anthropic-ai/sdk** | 0.32.x+ | Claude API client | Official SDK for Haiku classification. Use for binary NLU after transcription. |

### Audio Handling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Howler.js** | 2.2.4+ | Ambient audio playback | Use for crossfading background ambient tracks between phases. Handles multiple simultaneous sounds, sprite sheets, fade controls. |
| **Web Audio API** | Native | Low-latency audio control | Use directly for TTS playback from ElevenLabs stream. More control than HTML5 Audio for real-time voice. |
| **MediaRecorder API** | Native | Voice capture | Use for recording visitor speech. Works with headphone mic, produces WebM/Opus for Whisper. |

### State Management & React Integration

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@xstate/react** | 4.1.x | XState hooks for React | Use `useActor`, `useMachine` to connect state machine to UI. Provides reactive subscriptions to state changes. |
| **@xstate/inspect** | 0.8.x | XState visualizer | DEV ONLY. Use during development to debug state transitions and timeouts. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint** | Linting | Use Next.js recommended config + TypeScript rules |
| **Prettier** | Code formatting | Consistent formatting for collaborative work |
| **tsx** | TypeScript execution | Run scripts for testing API integrations outside Next.js |
| **Vercel CLI** | Deployment | Optimized for Next.js, env var management, preview deployments |

## Installation

```bash
# Core framework
npm install next@14 react@18 react-dom@18

# TypeScript
npm install -D typescript @types/react @types/node

# State machine
npm install xstate@5 @xstate/react

# API clients
npm install elevenlabs openai @anthropic-ai/sdk

# Audio
npm install howler
npm install -D @types/howler

# Database
npm install @supabase/supabase-js

# Styling
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms

# Dev tools
npm install -D eslint eslint-config-next prettier @xstate/inspect tsx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **ElevenLabs SDK** | Direct WebSocket | Only if you need custom buffering logic. SDK handles reconnection, buffering, voice settings. |
| **Howler.js** | Tone.js | If you need advanced audio synthesis or music composition. Overkill for ambient playback + crossfade. |
| **XState v5** | Zustand + useReducer | If state machine is very simple (< 5 states). XState's value is in complex branching, timeouts, history. |
| **Next.js API Routes** | Separate Express backend | If you need WebSocket server beyond ElevenLabs client-side. Next.js API routes sufficient for HTTP endpoints. |
| **Supabase** | Firebase | If you need Google ecosystem integration or already use GCP. Supabase better Postgres support, open-source. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **ElevenLabs Conversational AI** | You need scripted flow control, not free conversation. Their SDK would fight against your state machine. | ElevenLabs TTS API (text-to-speech only) + your own orchestration |
| **Web Speech API (STT)** | Poor accuracy for Portuguese, inconsistent cross-browser, no control over model. | OpenAI Whisper API (whisper-1 model) |
| **react-speech-recognition** | Wraps Web Speech API, inherits same limitations. | MediaRecorder API + Whisper |
| **Redux / MobX** | Unnecessary for state machine already managed by XState. Creates competing state models. | XState context for all application state |
| **Socket.io** | Not needed unless you build custom WebSocket server. ElevenLabs SDK handles WS for TTS streaming. | Native WebSocket (if custom needed) or SDK built-in |
| **HTML5 Audio element** | Higher latency, less control over buffering, can't layer/crossfade easily. | Web Audio API + Howler.js |
| **Next.js 13 Pages Router** | Deprecated pattern, less streaming support, worse TypeScript inference with API routes. | Next.js 14+ App Router |
| **XState v4** | Legacy version, less type-safe, no actor model, harder timeout handling. | XState v5 |

## Integration Patterns

### TTS Streaming Flow
```
User triggers → Next.js API route → ElevenLabs SDK (server) → Stream to client → Web Audio API playback
```
**Why:** Server-side API key protection, client receives pre-buffered chunks, lower latency to playback.

### STT + NLU Flow
```
MediaRecorder → Blob → Next.js API route → Whisper API → Text → Claude Haiku → Classification → XState transition
```
**Why:** All API calls server-side (key protection), single endpoint for visitor, error handling centralized.

### State Machine + React
```
XState machine (server file) → @xstate/react hooks → React components subscribe → UI updates on state change
```
**Why:** Machine logic separate from UI, testable in isolation, React renders based on current state.

### Audio Layering
```
Howler (ambient loop) + Web Audio API (TTS voice) → AudioContext destination → Headphone output
```
**Why:** Howler handles crossfading ambient, Web Audio handles real-time TTS, both can play simultaneously without conflict.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 14.x | React 18.2+ | Requires React 18 for Concurrent features, streaming |
| XState 5.x | @xstate/react 4.x | React integration package version lags behind core XState version (this is normal) |
| elevenlabs 0.8.x | Node 18+ | Uses fetch API, needs Node 18+ or polyfill |
| openai 4.x | Node 18+ | Uses fetch API, needs Node 18+ |
| @anthropic-ai/sdk 0.32.x | Node 18+ | Uses fetch API, needs Node 18+ |
| Howler.js 2.2.x | All modern browsers | No React version dependency, works with any framework |
| Tailwind CSS 3.4.x | Next.js 14+ | Next.js has built-in PostCSS, auto-detects Tailwind config |

**Critical compatibility note:** All three API SDKs (ElevenLabs, OpenAI, Anthropic) require Node.js 18+ because they use native fetch. Ensure deployment environment (Vercel) uses Node 18 or 20.

## Stack Patterns by Use Case

### If deploying to Vercel (recommended):
- Use Next.js API routes for all API calls (serverless functions)
- Set environment variables in Vercel dashboard
- Enable streaming responses for TTS endpoints
- Use Edge Runtime for low-latency classification (Claude Haiku)

### If deploying elsewhere (VPS, Docker):
- Same stack works, but configure Node.js 18+ runtime
- Consider pm2 for process management
- Set up reverse proxy (nginx) for WebSocket support
- May need custom WebSocket server if real-time admin panel features needed

### If testing locally:
- Use `next dev` for hot reload
- Create `.env.local` for API keys (never commit)
- Use @xstate/inspect for state machine visualization
- Test audio with real headphone mic (laptop mics have different characteristics)

## API-Specific Recommendations

### ElevenLabs
- **Model:** `eleven_multilingual_v2` (best PT-BR support as of Jan 2025)
- **Streaming:** Use WebSocket streaming, not HTTP (lower latency)
- **Voice settings per phase:** Adjust `stability`, `similarity_boost`, `style` in API call
- **Cost:** ~$0.30 per 1000 characters with standard voices

### OpenAI Whisper
- **Model:** `whisper-1` (only model available via API)
- **Audio format:** Send WebM/Opus from MediaRecorder, or convert to MP3/M4A
- **Language hint:** Set `language: 'pt'` to improve accuracy
- **Cost:** $0.006 per minute of audio (~$0.001 per 10-second utterance)

### Claude Haiku
- **Model:** `claude-3-5-haiku-20241022` (latest Haiku as of Jan 2025)
- **Performance:** ~100ms p95 latency for classification
- **Prompt engineering:** Use XML tags for structure, provide examples
- **Cost:** $0.80 per million input tokens, $4 per million output (classification uses ~100 tokens total)

### Supabase
- **Create anonymous sessions:** Use `supabase.auth.signInAnonymously()` or just generate UUIDs client-side
- **Analytics schema:** `sessions` table with fields: id, started_at, completed_at, path_taken, phase_durations, fallback_count
- **Real-time:** Use `supabase.channel()` for admin panel to subscribe to active sessions

## Confidence Assessment

| Component | Confidence | Notes |
|-----------|------------|-------|
| Next.js 14 | HIGH | Well-established, no breaking changes expected |
| XState v5 | HIGH | Stable API, designed for this exact use case |
| ElevenLabs API | MEDIUM | Version numbers not verified (no web access), API stable but SDK versions change |
| OpenAI Whisper | HIGH | Single model, stable API since 2023 |
| Claude Haiku | HIGH | Model name verified from training data (late 2024), API stable |
| Howler.js | MEDIUM | Last update may be older, but mature/stable library |
| Web Audio API | HIGH | Native browser API, well-supported |
| Supabase | HIGH | Stable client library, frequent updates but backward compatible |

## Known Gotchas

1. **MediaRecorder codec support:** Safari outputs different audio codecs than Chrome. Test on target browser (likely Chrome on Windows laptops). Whisper accepts multiple formats, so send whatever MediaRecorder produces.

2. **XState v5 breaking changes:** If you find v4 examples online, syntax is different. V5 uses `setup()` and actor model, not `createMachine()` with string states.

3. **ElevenLabs rate limits:** Free tier has strict limits. Ensure production API key with sufficient quota before event.

4. **Concurrent audio contexts:** Browser limits number of AudioContext instances. Reuse single context, create multiple sources.

5. **Next.js API route timeouts:** Vercel serverless functions timeout at 10s (hobby) or 60s (pro). Keep TTS generation async + streaming, don't block.

6. **Howler.js on iOS:** Requires user interaction before audio plays. Ensure "start" button triggers audio unlock.

## Sources

- **Next.js:** Training data (Jan 2025), version 14.x current, version 15 in canary
- **XState:** Training data (Jan 2025), v5 stable since mid-2024
- **ElevenLabs:** Training data (Jan 2025), multilingual v2 model standard for PT-BR
- **OpenAI Whisper:** Training data (Jan 2025), API stable, whisper-1 model
- **Claude:** Training data (late 2024), Haiku 3.5 model announced Oct 2024
- **Howler.js:** Training data (Jan 2025), v2.2.x stable, maintained
- **Supabase:** Training data (Jan 2025), client v2.x stable

**Note:** Web search and documentation fetch were unavailable during research. Versions and API details should be verified against official docs before implementation. Confidence ratings reflect this limitation.

---
*Stack research for: O Oráculo (Interactive Voice Agent)*
*Researched: 2026-03-24*
*Limitation: No web access for real-time verification*
