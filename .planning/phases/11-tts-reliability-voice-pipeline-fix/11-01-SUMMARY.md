---
phase: 11-tts-reliability-voice-pipeline-fix
plan: 01
subsystem: audio
tags: [speechsynthesis, tts, promise-race, timeout, voice-pipeline]

# Dependency graph
requires:
  - phase: 08-flow-sequencing
    provides: TTS-gated state transitions and mic activation gating
provides:
  - waitForVoices() with configurable timeout (default 3s) and Promise.race fallback
  - MockTTSService bounded speak() with explicit waitForVoices(3000) call
  - FallbackTTSService timeout-guarded fallbackToSpeechSynthesis path
  - Tests verifying timeout behavior for all three layers
affects: [11-02-voice-pipeline-fix, voice-choice, mic-activation]

# Tech tracking
tech-stack:
  added: []
  patterns: [promise-race-timeout, empty-voices-guard, bounded-fallback-delay]

key-files:
  created: []
  modified:
    - src/lib/audio/speechSynthesis.ts
    - src/lib/audio/speechSynthesis.test.ts
    - src/services/tts/mock.ts
    - src/services/tts/fallback.ts
    - src/services/tts/__tests__/tts-service.test.ts

key-decisions:
  - "waitForVoices timeout resolves with empty array (not reject) to allow graceful fallback"
  - "3000ms default timeout balances giving browsers time to load voices vs not blocking pipeline"
  - "Bounded simulated delay capped at 500ms for no-voices fallback path"

patterns-established:
  - "Promise.race timeout pattern: race real async op against setTimeout that resolves with safe default"
  - "Empty-voices guard: check voices.length === 0 after waitForVoices and return/simulate instead of proceeding"

requirements-completed: [TTSR-01, TTSR-02]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 11 Plan 01: TTS Reliability Summary

**waitForVoices() timeout via Promise.race prevents indefinite hang when SpeechSynthesis has no voices, unblocking ttsComplete and mic activation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T15:27:36Z
- **Completed:** 2026-03-26T15:30:31Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- waitForVoices() now accepts timeoutMs parameter (default 3000) and uses Promise.race to resolve with empty array when timeout wins
- speakSegments() returns early when no voices available instead of crashing on undefined voice
- MockTTSService explicitly calls waitForVoices(3000) and simulates bounded delay when no voices
- FallbackTTSService fallbackToSpeechSynthesis uses same timeout-guarded pattern
- 5 new tests verify timeout, immediate resolution, no-voices guard, bounded speak, and no-speak-call behaviors
- Full suite: 333 tests passing across 32 files, zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add timeout to waitForVoices() and update speakSegments + tests** - `049b39d` (feat)
2. **Task 2: Update MockTTSService and FallbackTTSService to use bounded waitForVoices + tests** - `ba3e3f5` (feat)

## Files Created/Modified
- `src/lib/audio/speechSynthesis.ts` - waitForVoices() with timeout param and Promise.race; speakSegments empty-voices guard
- `src/lib/audio/speechSynthesis.test.ts` - Tests 10-12: timeout, immediate, and no-voices speakSegments behavior
- `src/services/tts/mock.ts` - MockTTSService with explicit waitForVoices(3000) and bounded fallback
- `src/services/tts/fallback.ts` - FallbackTTSService.fallbackToSpeechSynthesis with timeout-guarded waitForVoices
- `src/services/tts/__tests__/tts-service.test.ts` - MockTTSService no-voices tests (bounded timing, no speak call)

## Decisions Made
- waitForVoices timeout resolves with empty array (not reject) to allow graceful fallback without try/catch
- 3000ms default timeout balances giving browsers time to load voices vs not blocking the voice pipeline
- Bounded simulated delay capped at Math.min(totalDuration, 500) for no-voices fallback path

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TTS reliability fix complete: waitForVoices never hangs, ttsComplete will resolve in bounded time
- Ready for Plan 02 (voice pipeline fix) which depends on ttsComplete becoming true reliably
- The root cause chain (waitForVoices hangs -> ttsComplete stuck false -> mic never activates) is now broken at step 1

## Self-Check: PASSED

All 5 modified files verified present on disk. Both task commits (049b39d, ba3e3f5) verified in git log. 333 tests passing.

---
*Phase: 11-tts-reliability-voice-pipeline-fix*
*Completed: 2026-03-26*
