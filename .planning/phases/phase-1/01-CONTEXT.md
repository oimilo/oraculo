# Phase 1: Core State Machine & Audio Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

State machine orchestrates complete narrative flow with audio capabilities unlocked and microphone permissions secured. Delivers the full state graph (IDLE through ENCERRAMENTO and back), AudioContext unlock on first interaction, microphone permission flow, and minimal UI shell (start button, phase-colored backgrounds, fade-to-black ending). TTS and STT integration deferred to Phase 2 — this phase uses timer-based delays simulating speech durations.

</domain>

<decisions>
## Implementation Decisions

### Project Foundation
- Package manager: pnpm (fast, disk-efficient, strict by default)
- Next.js 15 with App Router (latest stable, improved streaming support)
- Feature-based project structure: `src/features/state-machine/`, `src/features/audio/`, `src/features/ui/`
- TypeScript strict mode enabled for maximum type safety

### State Machine Architecture
- Single hierarchical XState v5 machine with nested states per narrative phase (IDLE → APRESENTACAO → INFERNO → PURGATORIO → PARAISO → DEVOLUCAO → ENCERRAMENTO)
- XState invoke pattern for audio completion triggers — each narrative block is an invoked promise that resolves when audio finishes, auto-transitioning to next state
- Timer-based delays simulating speech (setTimeout matching PRD timings ~2-4s per block). Real TTS added in Phase 2
- XState test model for unit testing state transitions with `createActor` + assertions on state values

### Audio & Permissions Flow
- Single start button unlocks both AudioContext and triggers mic permission — one entry point as per PRD
- Permission overlay screen before start button: brief explanation ("Esta experiencia usa seu microfone...") with "Permitir" button that triggers permission API, then reveals start button
- Web Audio API basics only (AudioContext, gain nodes, basic playback). Howler.js deferred to Phase 2 when ambient crossfade is needed
- Silent timer-based delays matching PRD timing table (Apresentacao ~90s, Inferno ~90s, etc.) as placeholder for real TTS

### UI Shell
- CSS-only water animation on start screen — keyframe animation with radial gradients/blur simulating water ripple
- CSS custom properties (`--phase-color`) with 2s transitions for phase background colors (bordo → azul acinzentado → dourado)
- Minimal pulsing dot indicator showing "experience active" during narrative. Full waveform deferred to Phase 2
- CSS overlay with opacity transition for fade-to-black ending (absolute div, opacity 0→1 over 2s, reset after 5s)

### Claude's Discretion
- Internal XState state naming conventions and event naming
- Component file organization within feature directories
- Test file placement and naming patterns
- CSS animation specific keyframe values and timing curves

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project. PRD.md contains complete roteiro, state machine definition, API contracts, and voice settings per phase.

### Established Patterns
- No established patterns yet — this phase sets the foundation. PRD specifies: Next.js App Router, XState v5, Tailwind CSS, Web Audio API.

### Integration Points
- State machine context type `OracleContext` defined in PRD section 6 — implement as specified
- API endpoint contracts defined in PRD section 7 — Phase 1 creates route stubs, Phase 2 implements
- Voice settings per phase defined in PRD section 5.1 — store as config for Phase 2 consumption
- Supabase session schema defined in PRD section 9 — Phase 3 implements analytics

</code_context>

<specifics>
## Specific Ideas

- PRD section 6 defines exact state machine states and transitions — implement faithfully
- PRD section 3.3 contains complete roteiro with exact pause timings — use these for timer delays
- PRD section 8 specifies exact UI screens (dark bg, pulsing button, phase colors, no text during experience)
- Permission screen should explain mic usage in Portuguese: "Esta experiencia usa seu microfone para ouvir suas escolhas"

</specifics>

<deferred>
## Deferred Ideas

- ElevenLabs TTS integration → Phase 2
- Whisper STT integration → Phase 2
- Claude Haiku NLU classification → Phase 2
- Howler.js ambient soundscapes with crossfade → Phase 2
- Waveform audio visualization → Phase 2
- Supabase analytics → Phase 3
- Admin dashboard → Phase 3
- Offline fallback audio files → Phase 3

</deferred>
