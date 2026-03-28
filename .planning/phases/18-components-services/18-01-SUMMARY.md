---
phase: 18-components-services
plan: 01
subsystem: audio
tags: [tts, fallback, prerecorded, script-v3]

# Dependency graph
requires:
  - phase: 16-script
    provides: "v3 SCRIPT with 49 keys (6 choices, 8 devoluções, fallbacks, timeouts)"
provides:
  - "FallbackTTSService dynamically generates 49 audio URLs from SCRIPT keys"
  - "URL mapping pattern: /audio/prerecorded/{key.toLowerCase()}.mp3"
affects: [19-audio-generation, 20-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic URL derivation from SCRIPT keys using Object.fromEntries"
    - "Auto-sync pattern: PRERECORDED_URLS always matches current script.ts"

key-files:
  created: []
  modified:
    - src/services/tts/fallback.ts
    - src/services/tts/__tests__/fallback-tts.test.ts

key-decisions:
  - "Replace static 26-key v2 mapping with dynamic 49-key v3 generation"
  - "Use Object.keys(SCRIPT).map pattern for maintainability"

patterns-established:
  - "Dynamic audio mapping: derive URLs from script keys to prevent drift"

requirements-completed: [CMPV3-02]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 18 Plan 01: FallbackTTS v3 Script Keys Summary

**FallbackTTSService dynamically generates 49 audio URL mappings from v3 SCRIPT keys, replacing static 26-key v2 hardcoded map**

## Performance

- **Duration:** 3 min (161 seconds)
- **Started:** 2026-03-28T19:46:25Z
- **Completed:** 2026-03-28T19:49:05Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced static 26-key v2 PRERECORDED_URLS with dynamic generation from SCRIPT
- All 49 v3 script keys now automatically mapped to /audio/prerecorded/{key}.mp3 paths
- Tests updated to verify v3 key patterns (INFERNO_Q1_SETUP, DEVOLUCAO_SEEKER, etc.)
- Added test verifying 49 entries (one per script key)

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace static PRERECORDED_URLS with dynamic derivation** - `32e8dde` (feat)
2. **Task 2: Update fallback-tts test for v3 script keys** - `15637ab` (test)

## Files Created/Modified
- `src/services/tts/fallback.ts` - Replaced static Record with Object.fromEntries generating URLs from SCRIPT keys
- `src/services/tts/__tests__/fallback-tts.test.ts` - Updated tests to v3 keys, added 49-entry count verification

## Decisions Made

**Dynamic URL generation:** Used `Object.fromEntries(Object.keys(SCRIPT).map(...))` pattern to auto-sync with script.ts. This eliminates manual maintenance when script keys change — PRERECORDED_URLS is always in sync with current SCRIPT structure.

**Corrected key count:** Plan referenced 50 keys but actual count is 49 (verified by test). Updated test expectation to match reality.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation. Plan's "50 keys" was incorrect (actual: 49), but test caught it immediately.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

FallbackTTSService ready for Phase 19 audio generation. All 49 URL mappings established. Phase 19 will generate corresponding MP3 files at those paths.

**Blocker check:** No blockers. Ready to proceed with Plan 02 (OracleExperience updates).

## Self-Check: PASSED

All files and commits verified:
- FOUND: src/services/tts/fallback.ts
- FOUND: src/services/tts/__tests__/fallback-tts.test.ts
- FOUND: 32e8dde (Task 1 commit)
- FOUND: 15637ab (Task 2 commit)

---
*Phase: 18-components-services*
*Completed: 2026-03-28*
