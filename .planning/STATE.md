# State: O Oraculo

## Project Reference

**Core Value:** Experiencia seamless e imersiva como um jogo -- o visitante fala, ouve, e e transformado. Se a voz, o roteiro e as transicoes funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.3 Voice Capture Debug & Fix

**Current Focus:** Phase 10 -- Pipeline Debug Instrumentation (ready to plan)

## Current Position

Phase: 10 of 12 (Pipeline Debug Instrumentation)
Plan: 0 of ? in current phase
Status: Ready to plan
Last activity: 2026-03-26 -- Roadmap created for v1.3

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Milestone v1.0 (Complete):**
- Phases: 3/3, Plans: 13/13, Reqs: 41/41
- Duration: 1 day (2026-03-24 to 2026-03-25)

**Milestone v1.1 (Paused):**
- Phases: 2/3 (Phase 6 Supabase deferred)
- Plans: 4/4

**Milestone v1.2 (Complete):**
- Phases: 3/3 (Phases 7-9), Plans: 6/6
- Duration: 1 day (2026-03-25 to 2026-03-26)

**Milestone v1.3 (Active):**
- Phases: 0/3, Plans: 0/?
- Target: Fix mic not activating in AGUARDANDO states

## Accumulated Context

### Decisions

Recent decisions affecting current work:
- [Phase 9]: Frozen config snapshots prevent stale closures in async pipeline
- [Phase 9]: 10s AbortController timeout on STT/NLU API calls
- [Phase 8]: TTS-gated state transitions via ttsComplete flag
- [Phase 8]: micShouldActivate = isAguardando && ttsComplete

### Known Bug (Root Cause Analysis)

Mic never activates in AGUARDANDO states. Suspected chain:
1. MockTTSService calls waitForVoices() which hangs when SpeechSynthesis has no voices
2. ttsComplete stays false indefinitely
3. micShouldActivate never becomes true
4. User forced to click buttons manually

### Active TODOs

- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Blockers

None.

## Session Continuity

Last session: 2026-03-26
Stopped at: Roadmap created for v1.3
Resume: /gsd:plan-phase 10
