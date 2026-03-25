# Roadmap: O Oráculo v1.0

**Milestone:** v1.0 O Oráculo — MVP para Bienal
**Target:** Evento 29-30 Mai 2026
**Granularity:** Standard
**Created:** 2026-03-24

## Phases

- [ ] **Phase 1: Core State Machine & Audio Foundation** - XState orchestration, audio context unlock, permissions, minimal UI shell
- [ ] **Phase 2: Voice Processing Pipeline** - TTS streaming, STT transcription, NLU classification, ambient audio crossfading
- [ ] **Phase 3: Polish, Resilience & Multi-Station** - Offline fallbacks, analytics dashboard, error handling, multi-station deployment

## Phase Details

### Phase 1: Core State Machine & Audio Foundation
**Goal**: State machine orchestrates complete narrative flow with audio capabilities unlocked and microphone permissions secured

**Depends on**: Nothing (first phase)

**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-05, FLOW-06, FLOW-08, FLOW-09, FLOW-10, FLOW-12, RES-03, RES-04, UI-01, UI-06

**Success Criteria** (what must be TRUE):
1. Visitor can click start button and trigger the complete narrative state flow from idle through all phases to ending
2. Audio playback works without browser autoplay blocking (AudioContext unlocked on first click)
3. Microphone permission is granted before experience begins with clear explanatory screen
4. UI shows phase-appropriate visual feedback (start button, phase indicator, end fade-to-black)
5. Experience completes full cycle and returns to idle state ready for next visitor

**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold, types, script data, Vitest config
- [x] 01-02-PLAN.md — XState state machine (TDD) with all states and transitions
- [x] 01-03-PLAN.md — Audio utilities (AudioContext unlock, SpeechSynthesis wrapper)
- [x] 01-04-PLAN.md — UI components, orchestrator wiring, visual verification

**UI hint**: yes

---

### Phase 2: Voice Processing Pipeline
**Goal**: Visitor speaks and receives intelligent TTS responses with ambient soundscapes matching narrative phases

**Depends on**: Phase 1 (requires state machine, audio context, microphone access)

**Requirements**: FLOW-04, FLOW-07, FLOW-11, TTS-01, TTS-02, TTS-03, TTS-04, STT-01, STT-02, STT-03, STT-04, STT-05, AMB-01, AMB-02, AMB-03, AMB-04, UI-02, UI-03, UI-04, UI-05

**Success Criteria** (what must be TRUE):
1. Visitor hears Oráculo speak with ElevenLabs voice that varies parameters by phase (grave in Inferno, soft in Paradise)
2. Visitor speaks freely and their choice is understood and classified into correct narrative branch within 3 seconds
3. When classification confidence is low, Oráculo responds with poetic redirection and listens again (max 2 attempts)
4. Ambient soundscape shifts seamlessly between phases with crossfade transitions (no audio gaps)
5. UI shows "listening" indicator when microphone is active and waveform reacts to audio playback
6. Silence timeout is treated as valid narrative choice with appropriate transition dialogue

**Plans**: TBD

**UI hint**: yes

---

### Phase 3: Polish, Resilience & Multi-Station
**Goal**: System operates reliably across 2-3 concurrent stations with graceful offline fallbacks and operator visibility into session analytics

**Depends on**: Phase 2 (requires working voice pipeline to test failure modes)

**Requirements**: RES-01, RES-02, RES-05, ANA-01, ANA-02, ANA-03, ANA-04, ANA-05

**Success Criteria** (what must be TRUE):
1. When internet drops during experience, visitor continues with pre-recorded fallback audio without interruption
2. Session completes and logs anonymous analytics (path taken, duration, fallback count) without collecting any personal data
3. Admin dashboard shows real-time status of all stations and aggregated session metrics (paths, completion rate, timing)
4. Three concurrent sessions run on separate stations without audio interference or state collision
5. Session that becomes inactive for 30 seconds automatically resets to idle state

**Plans**: TBD

**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core State Machine & Audio Foundation | 0/4 | Planned | - |
| 2. Voice Processing Pipeline | 0/? | Not started | - |
| 3. Polish, Resilience & Multi-Station | 0/? | Not started | - |

## Dependencies

```
Phase 1: Core State Machine & Audio Foundation
    ↓
Phase 2: Voice Processing Pipeline
    ↓
Phase 3: Polish, Resilience & Multi-Station
```

## Coverage

**Total v1 Requirements:** 41
- State Machine & Flow: 12 (FLOW-01 to FLOW-12)
- TTS: 4 (TTS-01 to TTS-04)
- STT & NLU: 5 (STT-01 to STT-05)
- Ambient Audio: 4 (AMB-01 to AMB-04)
- UI: 6 (UI-01 to UI-06)
- Resilience: 5 (RES-01 to RES-05)
- Analytics: 5 (ANA-01 to ANA-05)

**Mapped to Phases:** 41/41 ✓

## Research Flags

**Phase 2 flagged for deeper research** during planning:
- ElevenLabs WebSocket streaming endpoint specifics (may have changed since Jan 2025)
- Whisper optimal parameters for short PT-BR utterances
- Claude Haiku prompt engineering for binary classification with imperfect transcripts
- Recommend `/gsd:research-phase 2` before implementation

**Phases 1 and 3:** Standard patterns, skip additional research.

---
*Last updated: 2026-03-25 after Phase 1 planning*
