---
phase: 13-voice-infrastructure-v3-migration
plan: 01
subsystem: audio
tags: [elevenlabs, v3, audio-tags, tts, conversion]

# Dependency graph
requires: []
provides:
  - "SpeechSegment with inflection field for v3 audio tags"
  - "convertPauseToTag() mapping ms thresholds to [pause]/[long pause]"
  - "buildV3Text() converting SpeechSegment[] to v3-tagged text"
affects: [13-02 api-route-generation-script]

# Tech tracking
tech-stack:
  added: []
  patterns: ["v3 audio tag conversion: ms thresholds -> [pause]/[long pause] tags", "inflection tag prepend pattern: [tag]text"]

key-files:
  created:
    - src/lib/audio/v3-conversion.ts
    - src/lib/audio/v3-conversion.test.ts
  modified:
    - src/types/index.ts

key-decisions:
  - "Pause thresholds: <500ms=none, 500-1500ms=[pause], >1500ms=[long pause]"
  - "Trailing pause on last segment is ignored (no trailing tag)"
  - "Inflection tags prepend directly to text without space: [thoughtful]Text"

patterns-established:
  - "v3 audio tag conversion: SpeechSegment[] -> text with [pause]/[long pause]/[inflection] tags"
  - "Threshold-based pause mapping replacing SSML break tags"

requirements-completed: [VINF-03]

# Metrics
duration: 2min
completed: 2026-03-26
---

# Phase 13 Plan 01: V3 Audio Tag Conversion Layer Summary

**convertPauseToTag and buildV3Text functions converting SpeechSegment[] to ElevenLabs v3 text with [pause]/[long pause]/inflection audio tags**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-26T17:56:34Z
- **Completed:** 2026-03-26T17:58:50Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Added `inflection?: string[]` field to SpeechSegment interface (backward compatible -- all 369 existing tests still pass)
- Created `convertPauseToTag()` with threshold-based mapping: <500ms -> empty, 500-1500ms -> [pause], >1500ms -> [long pause]
- Created `buildV3Text()` converting SpeechSegment[] to v3-tagged text with inflection prepend and inter-segment pause tags
- 20 comprehensive unit tests covering boundaries, inflection, mixed scenarios, edge cases

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Add failing tests for v3 conversion** - `82eae9c` (test)
2. **Task 1 (GREEN): Implement v3 audio tag conversion layer** - `915eee5` (feat)

_TDD task with RED -> GREEN commits (no refactor needed -- code was clean)_

## Files Created/Modified
- `src/types/index.ts` - Added `inflection?: string[]` to SpeechSegment interface
- `src/lib/audio/v3-conversion.ts` - New module: convertPauseToTag and buildV3Text exports
- `src/lib/audio/v3-conversion.test.ts` - 20 unit tests for conversion logic

## Decisions Made
- Pause thresholds (<500ms/500-1500ms/>1500ms) align with ARCHITECTURE.md research findings
- Trailing pause on last segment is ignored -- matches existing buildTextWithPauses behavior in generate-audio.mjs
- Inflection tags prepend directly to segment text without space separator (e.g. `[thoughtful]Text`)
- Sub-threshold pauses between segments still get a space separator for readability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in API route test files (NextRequest vs Request) -- out of scope, not caused by this task

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- v3-conversion module ready for consumption by Plan 02 (API route and generation script)
- SpeechSegment interface extended with inflection field -- all existing code backward compatible
- Both `convertPauseToTag` and `buildV3Text` are exported and fully tested

## Self-Check: PASSED

- All 3 created files exist on disk
- Both commit hashes (82eae9c, 915eee5) found in git log
- Key content verified: inflection field, convertPauseToTag export, buildV3Text export

---
*Phase: 13-voice-infrastructure-v3-migration*
*Completed: 2026-03-26*
