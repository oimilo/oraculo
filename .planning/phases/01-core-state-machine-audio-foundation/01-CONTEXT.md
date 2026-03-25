# Phase 1: Core State Machine & Audio Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

State machine orchestrates complete narrative flow with audio capabilities unlocked and microphone permissions secured. This phase delivers the full XState state machine (all states, transitions, fallbacks, timeouts), AudioContext initialization, microphone permission flow, and a minimal UI shell (start button, phase-color backgrounds, fade-to-black ending). TTS/STT integration is Phase 2 — voice is simulated via Browser SpeechSynthesis API and choices are made via temporary on-screen buttons.

</domain>

<decisions>
## Implementation Decisions

### Audio Playback Strategy
- Browser SpeechSynthesis API simulates Oracle voice in Phase 1 — free, instant, lets us hear the full script flow and test timings
- Ambient audio deferred to Phase 2 (AMB-* requirements) — keep audio graph simple in Phase 1
- Full AudioContext + audio graph initialized on first click — gain nodes and routing ready for Phase 2 plug-in
- Full configurable pause system matching PRD [pausa Ns] markers implemented now — critical for flow feel

### Choice Interaction (without STT)
- On-screen buttons (temporary testing UI) allow visitor to pick choices + timeout auto-advance after 15s
- Timeout always triggers default path matching FLOW-11 behavior (Inferno→Silêncio, Purgatório→default contextual)
- Full state machine with ALL states including fallback and timeout redirect — fallback triggerable via dev tools
- All 4 paths testable end-to-end via button selection — validates entire state machine branching

### UI Shell Design
- Full-screen overlay step before start explains what will happen and requests mic permission (matches RES-03)
- Background color shifts implemented now: bordô (Inferno) → azul acinzentado (Purgatório) → dourado (Paraíso) per PRD
- CSS pulse animation on dark background for start button (matches UI-01 "botão pulsante")
- Desktop-only fixed viewport — event uses laptops with headphones, no mobile needed

### Claude's Discretion
- Next.js App Router folder structure and component organization
- XState v5 machine structure (nested vs flat states, action naming)
- Tailwind CSS specific classes and design tokens
- Test strategy and test framework choice

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. Only PRD.md exists with complete script and state diagram.

### Established Patterns
- Stack decided: Next.js 14 (App Router) + XState v5 + Tailwind CSS + Howler.js/Web Audio API
- PRD Section 6 defines complete state machine with all states and transitions
- PRD Section 3.3 has the full script with pause markers and voice direction per phase
- PRD Section 5 has ElevenLabs voice settings per phase (for Phase 2, but useful for SpeechSynthesis approximation)

### Integration Points
- AudioContext must be unlocked on first user interaction (browser requirement)
- State machine context tracks: sessionId, choices, fallbackCount, currentPhase, audioState
- Future Phase 2 will replace SpeechSynthesis with ElevenLabs TTS and add real STT
- Future Phase 3 adds Supabase analytics, offline fallbacks, multi-station

</code_context>

<specifics>
## Specific Ideas

- PRD defines exact state names (IDLE, APRESENTACAO, INFERNO_NARRATIVA, etc.) — follow these precisely
- PRD OracleContext interface should be the basis for XState context
- Voice direction per phase (calmo, grave, sussurro) can inform SpeechSynthesis pitch/rate as approximation
- Pause timings from PRD are specific: [pausa 1.5s], [pausa 2s], [pausa 3s], [pausa 4s] — implement as data-driven delays
- Permission screen should be warm/inviting, not technical ("Vamos precisar do seu microfone para ouvir suas respostas")

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
