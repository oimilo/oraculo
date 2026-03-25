---
phase: 03-polish-resilience-multi-station
plan: 01
subsystem: resilience
tags:
  - offline-fallback
  - pre-recorded-audio
  - inactivity-timeout
  - web-audio-api
  - state-machine
dependency_graph:
  requires:
    - 02-06-voice-pipeline-integration
    - audio-context
    - script-data
  provides:
    - FallbackTTSService
    - offline-audio-playback
    - 30s-inactivity-reset
  affects:
    - TTS-factory
    - oracle-state-machine
    - session-resilience
tech_stack:
  added:
    - Web Audio API for pre-recorded playback
    - navigator.onLine detection
    - XState after delays for timeout
  patterns:
    - Fallback service pattern
    - Pre-recorded audio caching
    - State machine inactivity guards
key_files:
  created:
    - src/services/tts/fallback.ts
    - src/services/tts/__tests__/fallback-tts.test.ts
  modified:
    - src/services/tts/index.ts
    - src/services/tts/mock.ts
    - src/machines/oracleMachine.ts
    - src/machines/oracleMachine.types.ts
    - src/machines/oracleMachine.test.ts
decisions:
  - Pre-recorded audio served from /audio/prerecorded/*.mp3 (files not created yet)
  - FallbackTTSService matches segments to SCRIPT keys for audio file lookup
  - 30s inactivity timeout on all active states except IDLE and FIM
  - FALLBACK_USED event increments fallbackCount in context
  - MockTTSService has try/catch for headless environments
metrics:
  duration_seconds: 317
  tasks_completed: 2
  files_created: 2
  files_modified: 5
  tests_added: 11
  commits: 2
  completed_date: "2026-03-25"
---

# Phase 03 Plan 01: Offline Resilience & Inactivity Timeout Summary

**One-liner:** FallbackTTSService with Web Audio API pre-recorded playback and 30s state machine inactivity reset to IDLE

## Overview

Implemented offline resilience for the Oracle experience and session recovery mechanisms. When internet drops or TTS service fails, pre-recorded audio files serve all fixed monologue segments. State machine automatically resets to IDLE after 30 seconds of inactivity to prevent stuck sessions at Bienal event.

## Tasks Completed

| Task | Name                                       | Commit  | Key Changes                                                             |
| ---- | ------------------------------------------ | ------- | ----------------------------------------------------------------------- |
| 1    | FallbackTTSService with pre-recorded audio | 87059f5 | Web Audio API playback, SCRIPT key matching, preload cache, 6 tests    |
| 2    | TTS factory + inactivity timeout           | b00f518 | Online detection, FALLBACK_USED event, 30s timeout on active states    |

## Architecture

### FallbackTTSService

- **Purpose:** Plays pre-recorded .mp3 files when offline or primary TTS fails
- **Mechanism:** Matches SpeechSegment[] against SCRIPT data to find correct audio file
- **Audio Files:** 25 pre-recorded URLs mapped in PRERECORDED_URLS constant
- **Web Audio API:** fetch() → decodeAudioData() → AudioBufferSourceNode playback
- **Cache:** `preloadAll()` method pre-fetches and decodes all buffers into Map
- **Fallback Chain:** Pre-recorded → SpeechSynthesis → simulated delay (headless)

### TTS Factory Update

```typescript
export function createTTSService(): TTSService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    if (isOnline()) {
      // Real ElevenLabs (future)
    }
    return new FallbackTTSService();
  }
  return new MockTTSService();
}
```

### Inactivity Timeout

- **Duration:** 30 seconds (30000ms)
- **Applies to:** All active narrative states (APRESENTACAO, INFERNO, PURGATORIO_A/B, PARAISO, DEVOLUCAO_*, ENCERRAMENTO)
- **Does NOT apply to:** IDLE (no timeout) and FIM (has own 5s timer)
- **Action:** Resets to IDLE with full context reset (sessionId, choices, fallbackCount)
- **Implementation:** XState `after: { 30000: { target: '#oracle.IDLE', actions: assign(...) } }`

### Fallback Tracking

- **Event:** `FALLBACK_USED` (root-level handler)
- **Action:** Increments `context.fallbackCount`
- **Purpose:** Analytics tracking for fallback usage patterns at Bienal

## Deviations from Plan

None - plan executed exactly as written.

## Test Coverage

**New tests (11 total):**

- FallbackTTSService implements TTSService interface
- speak() resolves when audio exists
- Segments play sequentially with pauses
- cancel() rejects pending speak() with "Speech cancelled"
- getPrerecordedUrl() maps script keys correctly
- isOnline() returns navigator.onLine value
- Inactivity timeout from APRESENTACAO to IDLE after 30s
- Inactivity timeout from INFERNO.NARRATIVA to IDLE after 30s
- No timeout in IDLE state
- FIM keeps own 5s timer (not affected by 30s)
- Inactivity timeout from PARAISO to IDLE after 30s

**All tests pass:** 161 tests across 17 files

## Known Stubs

**Pre-recorded audio files:** The 25 .mp3 files in `/audio/prerecorded/` directory do not exist yet. FallbackTTSService code and URL mapping are complete. Actual audio recording is a human action (studio recording) to be completed before Bienal event. Files needed:

- apresentacao.mp3
- inferno_narrativa.mp3, inferno_pergunta.mp3, inferno_resposta_a.mp3, inferno_resposta_b.mp3
- purgatorio_narrativa_a.mp3, purgatorio_pergunta_a.mp3, purgatorio_resposta_a_ficar.mp3, purgatorio_resposta_a_embora.mp3
- purgatorio_narrativa_b.mp3, purgatorio_pergunta_b.mp3, purgatorio_resposta_b_pisar.mp3, purgatorio_resposta_b_contornar.mp3
- paraiso.mp3
- devolucao_a_ficar.mp3, devolucao_a_embora.mp3, devolucao_b_pisar.mp3, devolucao_b_contornar.mp3
- encerramento.mp3
- fallback_inferno.mp3, fallback_purgatorio_a.mp3, fallback_purgatorio_b.mp3
- timeout_inferno.mp3, timeout_purgatorio_a.mp3, timeout_purgatorio_b.mp3

## Requirements Met

- **RES-01:** FallbackTTSService exists with PRERECORDED_URLS mapping for all script keys
- **RES-02:** TTS factory detects online status and routes to FallbackTTSService when offline
- **RES-05:** State machine transitions to IDLE after 30s inactivity in any active state

## Next Steps

1. Record 25 pre-recorded audio files in studio (human action)
2. Test FallbackTTSService with actual audio files loaded
3. Implement plan 03-02 (multi-station management)
4. Implement plan 03-03 (admin dashboard)

## Self-Check: PASSED

**Created files exist:**
- FOUND: src/services/tts/fallback.ts
- FOUND: src/services/tts/__tests__/fallback-tts.test.ts

**Commits exist:**
- FOUND: 87059f5 (test/feat for FallbackTTSService)
- FOUND: b00f518 (feat for offline resilience + inactivity timeout)

**Tests pass:**
- ✓ 161 tests across 17 files
- ✓ TypeScript compilation successful

**Key patterns verified:**
- ✓ FallbackTTSService implements TTSService interface
- ✓ PRERECORDED_URLS contains all 25 script keys
- ✓ isOnline() exported from fallback.ts
- ✓ createFallbackTTSService() exported from index.ts
- ✓ FALLBACK_USED event in OracleEvent type
- ✓ after: { 30000: ... } in oracleMachine.ts (multiple states)
- ✓ Inactivity timeout tests in oracleMachine.test.ts

All deliverables confirmed.
