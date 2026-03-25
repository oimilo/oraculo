# Project Research Summary

**Project:** O Oráculo — Interactive Voice-First Art Installation
**Domain:** Live event voice interaction (scripted narrative experience)
**Researched:** 2026-03-24
**Confidence:** MEDIUM

## Executive Summary

O Oráculo is a voice-driven psychoanalytical journey through Dante's Divine Comedy, designed for the São Paulo Art Biennial (May 2026). Visitors wear headphones and engage in a 5-10 minute scripted conversation where they respond to philosophical questions, with their speech classified into binary choices that branch the narrative across Inferno, Purgatorio, and Paradiso phases. This is fundamentally a **state machine orchestration problem** layered with real-time voice processing (TTS, STT, NLU) and ambient audio design.

The recommended architecture uses **XState v5 as the orchestrator**, managing the conversation flow as an actor-based state machine. Voice processing happens through a three-stage pipeline: **OpenAI Whisper** (PT-BR transcription) → **Claude Haiku** (intent classification) → **ElevenLabs** (TTS with streaming). All external API calls are proxied through **Next.js 14 API routes** for security. Ambient audio uses **Howler.js** for crossfading between phases, while **Web Audio API** handles TTS playback. The frontend is minimal React with **Tailwind CSS**, and **Supabase** provides anonymous session analytics.

**Critical risks center on latency and live-event reliability.** The target response time is <3 seconds from visitor speech to system response, but the API pipeline (Whisper 800-2000ms + Haiku 200-800ms + ElevenLabs 400-1200ms) can total 5-8 seconds on slow connections. Mitigation requires streaming TTS (start playback on first chunk), pre-recorded fallback audio for network failures, and careful timeout handling that treats silence as a valid narrative choice. Browser autoplay policies, microphone permission flows, and LGPD compliance around audio data all require careful implementation before the multi-station event deployment.

## Key Findings

### Recommended Stack

The stack prioritizes **low-latency streaming** for voice processing and **declarative state management** for complex branching logic. All three API providers (ElevenLabs, OpenAI, Anthropic) require Node.js 18+ due to native fetch API usage.

**Core technologies:**
- **XState v5**: State machine orchestration using actor model — perfect for scripted flow with timeouts, fallbacks, and branching transitions
- **Next.js 14 (App Router)**: Web framework with streaming support — API routes handle TTS/STT/NLU proxying while protecting API keys server-side
- **ElevenLabs SDK (0.8.x+)**: TTS streaming via WebSocket — multilingual_v2 model for PT-BR, adjustable voice parameters per phase (Inferno vs Paradise)
- **OpenAI Whisper (whisper-1)**: PT-BR transcription — 500-1500ms latency, language hint improves accuracy
- **Claude Haiku**: Binary classification of free-form PT-BR speech — ~100-200ms latency, handles imperfect transcriptions
- **Web Audio API**: Low-latency TTS playback — native browser API with gapless audio queuing for streamed chunks
- **Howler.js (2.2.x)**: Ambient audio crossfading — handles 3-5 tracks per phase with 2-3s overlap transitions
- **Supabase**: Anonymous session analytics — real-time subscriptions for admin dashboard, zero PII storage

**Critical compatibility:** Deploy to Node.js 18+ environment (Vercel recommended). All API SDKs require this minimum version.

### Expected Features

**Must have (table stakes):**
- **State machine with full scripted flow** — 3 questions, binary choices, 4 paths, timeout handling per question
- **Clear audio feedback** — visual "listening" indicator, audible acknowledgment before response
- **Graceful failure handling** — poetic fallback responses (not error messages), max 1 retry before default choice
- **Predictable response timing** — max 2-3s from speech end to system response start (requires streaming TTS)
- **Consistent voice identity** — same voice throughout, but stability/similarity parameters shift with phases
- **Session continuity** — resilient to network hiccups, pre-cached fallback audio for offline operation

**Should have (competitive advantage):**
- **Intentional pauses as design** — 2-4s gaps between phrases create dramatic tension (controlled via state machine timing)
- **Adaptive voice parameters** — ElevenLabs stability/similarity sliders create distinct Inferno vs Paradise voice character
- **NLU-based binary classification** — Claude Haiku classifies free-form PT-BR speech into choices (not keyword matching)
- **Layered ambient soundscape** — 3-5 tracks per phase, crossfade on transitions (2-3s overlap)
- **Timeout as narrative choice** — silence becomes valid answer (Inferno→Silence default, Purgatory→contextual)
- **Literary reflection variants** — 4 pre-written reflections mapped to decision tree outcomes

**Defer (v2+):**
- **Visitor return detection** — requires persistent identifier (privacy concern), unclear value for one-time event
- **Voice emotion analysis** — adds 200-500ms latency, unclear how to adapt script dynamically
- **Multi-language support** — PT-BR quality critical for v1, translation doubles testing surface
- **Generative narrative variants** — unpredictable quality and latency vs. pre-scripted literary precision

### Architecture Approach

The system is a **layered pipeline with XState orchestration at the core**. The state machine spawns actors for each async operation (TTS, STT, NLU, ambient audio, analytics), maintains conversation state, and handles transitions based on actor outcomes. React components are purely presentational, subscribing to machine state via `useMachine()` hook.

**Major components:**

1. **OracleStateMachine (XState v5)** — Defines states (idle, intro, question1, listening1, processing1, question2..., ending), spawns service actors, manages context (currentPhase, transcript, classification, choices), handles timeouts and error transitions

2. **Voice Pipeline Actors** — TTSActor (streams ElevenLabs WebSocket to Web Audio API), STTActor (MediaRecorder capture → Whisper transcription), NLUActor (transcript → Claude Haiku classification), each isolated and testable

3. **Ambient Audio Manager** — Howler.js wrapper preloads 3 phase tracks (inferno, purgatorio, paradiso), crossfades on phase transitions triggered by state machine context changes

4. **Next.js API Routes** — `/api/tts/stream` (ElevenLabs proxy), `/api/stt/transcribe` (Whisper proxy), `/api/nlu/classify` (Claude proxy), `/api/analytics/log` (Supabase insert), all server-side to protect API keys

5. **Session Analytics** — Event buffer in AnalyticsActor, batch write on session end, schema: session_id + timestamp + path_taken + fallback_count (zero PII, no audio persistence)

**Critical pattern:** Single shared AudioContext (singleton) prevents browser limits (6-8 concurrent contexts). All audio operations (TTS, ambient) use this shared context.

**Latency-critical path:** User speech → MediaRecorder stop (50ms) → Whisper transcription (1-2s) → Claude classification (200-800ms) → ElevenLabs streaming (400ms to first chunk) → Total: 1.3-3.6s best/worst case.

### Critical Pitfalls

1. **Browser autoplay policy blocking TTS** — Click → async TTS request → playback = BLOCKED by browser. **Solution:** Create AudioContext on user click, play silent buffer immediately to unlock audio capabilities before async pipeline starts.

2. **Microphone permission breaking immersion** — Native browser dialog has no context, high denial rate. **Solution:** Pre-permission screen explains voice requirement, test permission state before start button, operator pre-grants permission during setup.

3. **Network latency destroying conversational flow** — 5-8s silence after visitor speaks feels broken. **Solution:** Stream TTS (first chunk plays in 400ms), visual "listening/thinking/responding" states, pre-generate likely responses, timeout at 8s triggers fallback.

4. **ElevenLabs rate limiting during event peaks** — 3 concurrent stations × peak hours = 429 errors. **Solution:** Pre-record all static content (questions, fallbacks) as MP3s, only generate dynamic responses via API, verify tier limits support 3 concurrent streams.

5. **Whisper transcription failing on short/whispered PT-BR** — "sim" (yes) transcribes as "si" or empty. **Solution:** Prompt design forces multi-word responses, Whisper language hint + vocabulary prompt, Claude Haiku handles imperfect transcriptions semantically (not keyword matching), min 1s recording before STT.

6. **State machine race conditions from double-click** — Overlapping sessions, duplicate audio playback. **Solution:** Button disabled during initialization, XState guards prevent concurrent transitions, microphone muted during TTS playback.

7. **Internet drop with no recovery** — WiFi fails mid-journey, visitor stuck. **Solution:** Pre-record all critical audio as MP3s in `/public/audio/`, graceful degradation uses static files when API fails, retry logic with exponential backoff, mobile hotspot backup.

8. **LGPD violation through audio persistence** — Blob URLs linger, analytics logs transcriptions. **Solution:** Explicit cleanup (revoke blob URLs, clear state), analytics schema excludes transcription/audio columns, memory-only processing (never write audio to disk/IndexedDB).

## Implications for Roadmap

Based on research, the project naturally divides into **3 major phases** with a critical foundation phase first. Dependencies flow: Foundation → Voice Pipeline → Polish & Resilience. The state machine must work before voice integration, and voice must work before multi-station deployment.

### Phase 1: Core State Machine & Audio Foundation
**Rationale:** State machine orchestration is the architectural core. Must be solid before adding complex voice processing. Audio context setup (autoplay unlock, shared singleton) prevents critical pitfalls discovered in research.

**Delivers:**
- XState v5 machine with full narrative flow (all states, transitions, timeout handling)
- React integration via `useMachine()` hook
- Audio context singleton with autoplay unlock pattern
- Basic UI shell (start button, phase visualizer, listening indicator)
- Microphone permission flow with graceful error handling

**Addresses:**
- State machine with full scripted flow (FEATURES: must-have)
- Clear audio feedback (FEATURES: table stakes)
- Graceful failure handling foundation (FEATURES: table stakes)

**Avoids:**
- Browser autoplay policy blocking (PITFALLS #1)
- Microphone permission breaking immersion (PITFALLS #2)
- State machine race conditions (PITFALLS #6)

**Research flag:** Standard patterns. XState v5 well-documented, skip additional research.

---

### Phase 2: Voice Processing Pipeline
**Rationale:** TTS → STT → NLU pipeline is the core interaction. Must optimize for latency (streaming TTS) and accuracy (PT-BR transcription, NLU classification). This phase implements the critical path that determines UX quality.

**Delivers:**
- TTS streaming via ElevenLabs (WebSocket → Web Audio API queuing)
- STT transcription via Whisper (MediaRecorder → API route → language hints)
- NLU binary classification via Claude Haiku (semantic understanding of imperfect transcripts)
- Next.js API routes for all three services (server-side API key protection)
- Ambient audio crossfading with Howler.js (phase transitions trigger 2-3s crossfades)
- Intentional pause system (XState delayed transitions, SSML breaks)

**Uses:**
- ElevenLabs SDK for TTS streaming (STACK: core)
- OpenAI Whisper API for STT (STACK: core)
- Claude Haiku for NLU (STACK: core)
- Howler.js for ambient audio (STACK: audio handling)
- Web Audio API for TTS playback (STACK: audio handling)

**Implements:**
- Voice Pipeline Actors (ARCHITECTURE: component #2)
- Ambient Audio Manager (ARCHITECTURE: component #3)
- Next.js API Routes (ARCHITECTURE: component #4)

**Avoids:**
- Network latency destroying flow (PITFALLS #3) — streaming TTS mitigates
- ElevenLabs rate limiting (PITFALLS #4) — pre-record static content
- Whisper transcription failures (PITFALLS #5) — language hints, semantic NLU

**Research flag:** NEEDS RESEARCH. ElevenLabs WebSocket streaming endpoint specifics, Whisper optimal parameters for PT-BR, Claude Haiku prompt engineering for binary classification with imperfect transcripts. `/gsd:research-phase` recommended during planning.

---

### Phase 3: Polish, Resilience & Multi-Station
**Rationale:** Live event requires bulletproof error handling, offline fallbacks, and multi-station isolation. This phase addresses all "looks done but isn't" items and operator workflow needs.

**Delivers:**
- Pre-cached fallback audio (MP3s for offline operation)
- Network failure detection and graceful degradation
- Session analytics (anonymous, LGPD-compliant, batch writes)
- Admin dashboard (real-time station monitoring, session metrics)
- Comprehensive error handling (timeout variations, fallback escalation)
- Browser tab backgrounding detection and pause/resume
- Multi-station isolation testing (3 concurrent sessions)
- LGPD audit and cleanup enforcement

**Addresses:**
- Anonymous session analytics (FEATURES: should-have)
- Session continuity (FEATURES: table stakes)
- Predictable response timing with timeout handling (FEATURES: table stakes)

**Avoids:**
- Internet drop with no recovery (PITFALLS #7)
- Browser backgrounding breaking session (PITFALLS #7)
- LGPD violation through audio persistence (PITFALLS #8)

**Research flag:** Standard patterns. Supabase real-time subscriptions, offline-first strategies, LGPD compliance are well-documented. Skip additional research.

---

### Phase Ordering Rationale

- **Foundation first (Phase 1):** State machine is single source of truth. Audio system must unlock browser autoplay before voice pipeline can work. Microphone permissions must be tested early (cannot defer to late-stage testing).

- **Voice pipeline second (Phase 2):** Dependencies on foundation layer (audio context, state machine actors). Latency optimization requires all three APIs working together (cannot tune in isolation). Ambient audio depends on phase transitions from state machine.

- **Polish last (Phase 3):** Requires working voice pipeline to test failure modes. Analytics only meaningful once full journey executes. Admin dashboard needs real sessions to monitor. LGPD compliance audit requires complete data flow.

**Interdependencies identified in research:**
- TTS requires AudioContext unlock (Phase 1 → Phase 2)
- NLU requires STT output (Phase 2 internal dependency)
- Ambient audio requires state machine phase context (Phase 1 → Phase 2)
- Analytics requires state machine events (Phase 1 → Phase 3)
- Multi-station testing requires full pipeline (Phase 2 → Phase 3)

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Voice Pipeline):** ElevenLabs streaming WebSocket endpoints and payload format may have changed since training data (Jan 2025). Whisper optimal parameters for short PT-BR utterances need empirical testing. Claude Haiku prompt engineering for handling transcription errors requires experimentation. **Recommend `/gsd:research-phase` before implementation.**

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Core State Machine):** XState v5 actor model well-documented, React `useMachine()` hook established pattern, Web Audio API stable specification.
- **Phase 3 (Polish & Resilience):** Supabase client library standard patterns, offline-first strategies well-established, LGPD compliance requirements clear.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core technologies (Next.js, XState, React) are HIGH confidence based on stable APIs. API SDKs (ElevenLabs, Whisper, Claude) are MEDIUM — version numbers and endpoints not verified against current 2026 docs (training data Jan 2025). |
| Features | HIGH | Voice UI patterns (timeout, fallback, VAD) are well-established industry standards. Feature requirements clearly derived from art installation context and conversation design best practices. |
| Architecture | MEDIUM | State machine orchestration and actor model patterns are HIGH confidence (XState designed for this use case). Web Audio API and MediaRecorder API are stable specifications (HIGH). Integration patterns for specific API endpoints need verification (MEDIUM). |
| Pitfalls | HIGH | Browser API pitfalls (autoplay policy, microphone permissions, AudioContext limits) are documented specifications. Live event failure modes (network drops, rate limits, race conditions) are established technical patterns. LGPD compliance requirements are clear. |

**Overall confidence:** MEDIUM

### Gaps to Address

**API endpoint specifics (address during Phase 2 planning):**
- ElevenLabs WebSocket streaming: exact endpoint URL, authentication flow, payload format, reconnection handling — verify against current API docs
- Whisper API: confirm webm/opus format acceptance or need for conversion, test `language` and `prompt` parameters empirically with PT-BR short utterances
- Claude Haiku: confirm model availability (`claude-3-5-haiku-20241022` or newer), test latency characteristics, validate prompt structure for binary classification

**Browser compatibility (address during Phase 1 implementation):**
- MediaRecorder `mimeType` support across Chrome/Edge/Firefox on Windows — test target browser environment
- Autoplay policy variations — test production build on remote device (not localhost exempt)
- AudioContext suspension behavior — verify Web Audio API state management across browsers

**Performance validation (address during Phase 2 implementation):**
- End-to-end latency measurement: instrument full pipeline (speech → transcription → classification → TTS playback) to validate <3s target
- ElevenLabs rate limits: load test 3 concurrent sessions, confirm tier supports expected concurrency
- Whisper transcription accuracy: benchmark with actual event headphones + background noise simulation

**LGPD compliance audit (address during Phase 3 implementation):**
- Code review: verify zero audio persistence beyond session (no localStorage, IndexedDB, Supabase storage)
- Analytics schema verification: confirm no PII, no transcription text, only session metadata (path, timing, fallback count)
- Operator training checklist: ensure DevTools never opened during live sessions, no screenshots of visitor audio data

## Sources

### Primary (HIGH confidence)
- **XState v5 documentation** (training data through Jan 2025): Actor model, `fromPromise`, `useMachine` hook patterns — stable API since mid-2024
- **Web Audio API specification** (MDN training data): AudioContext lifecycle, decodeAudioData, AudioBufferSourceNode, autoplay policies — W3C standard
- **MediaRecorder API specification** (MDN training data): Browser audio capture, blob handling, MIME type support — W3C standard
- **Next.js 14 App Router** (training data through Jan 2025): API route patterns, streaming support, React Server Components
- **Browser autoplay policies** (Chrome/Firefox/Safari vendor docs, training data): User interaction requirements, AudioContext unlocking patterns

### Secondary (MEDIUM confidence)
- **ElevenLabs API patterns** (training data through Jan 2025): WebSocket streaming general architecture, multilingual_v2 model for PT-BR, voice parameter controls — specific endpoints need verification
- **OpenAI Whisper API** (training data through Jan 2025): whisper-1 model, language hint parameters, expected latency ranges — API stable since 2023
- **Claude Haiku API** (training data late 2024): Model announced Oct 2024, expected latency characteristics, prompt engineering patterns — model availability should be verified
- **Howler.js documentation** (training data through Jan 2025): Fade methods, preloading, loop patterns — v2.2.x stable, minimal API changes expected
- **Supabase client library** (training data through Jan 2025): Real-time subscriptions, RLS policies, connection pooling — v2.x API backward compatible

### Tertiary (LOW confidence, needs validation)
- **Live event failure modes**: Network drops during high-density WiFi (200-500 attendees), API rate limit behavior during concurrent usage spikes — patterns synthesized from general technical knowledge
- **PT-BR Whisper accuracy**: Performance on short whispered utterances with ambient noise — extrapolated from general Whisper behavior, needs empirical testing
- **ElevenLabs rate limits**: Concurrent request limits for paid tiers — mentioned in research but not verified against current pricing/limits

**Limitations:**
- Web search and documentation fetch were unavailable during research (no internet access for verification)
- API SDK versions and endpoints reflect training data through January 2025, may have minor changes by March 2026
- ElevenLabs streaming WebSocket endpoint format not verified against current docs
- Claude Haiku model ID for 2026 not confirmed (training data shows Oct 2024 release)

**Recommended validation before implementation:**
1. Verify all API SDK versions against current npm registry (March 2026)
2. Test ElevenLabs WebSocket streaming endpoint and payload format from official docs
3. Confirm Claude Haiku model availability and pricing
4. Benchmark Whisper transcription accuracy with target hardware (headphones + mic) and PT-BR test phrases
5. Load test API rate limits with 3 concurrent sessions to validate tier selection

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
