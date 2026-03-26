---
phase: 13-voice-infrastructure-v3-migration
plan: 02
subsystem: tts
tags: [elevenlabs, v3, tts, api-route, generation-script, dual-mode]

# Dependency graph
requires:
  - phase: 13-01
    provides: "convertPauseToTag/buildV3Text conversion functions and SpeechSegment.inflection field"
provides:
  - "v2/v3 dual-mode TTS API route via USE_V3_MODEL env flag"
  - "v3-migrated generation script with audio tags, 192kbps, pt-BR"
  - "Optional VoiceSettings.speed for v3 compatibility"
affects: [13-03 script-revision-inflection-tags]

# Tech tracking
tech-stack:
  added: []
  patterns: ["v2/v3 env flag toggle: USE_V3_MODEL=true for eleven_v3", "conditional API body construction for dual-mode ElevenLabs support"]

key-files:
  created: []
  modified:
    - src/app/api/tts/route.ts
    - src/services/tts/index.ts
    - src/services/tts/elevenlabs.ts
    - scripts/generate-audio.mjs
    - .env.example

key-decisions:
  - "v2/v3 toggle via USE_V3_MODEL env var (safe testing without code changes)"
  - "v3 mode omits speed and use_speaker_boost (not supported by eleven_v3)"
  - "Generation script reimplements convertPauseToTag inline (mjs cannot import ts)"
  - "Lower stability values in generation script for v3 Natural mode (0.40-0.70 range)"
  - "192kbps output for headphone delivery quality"

patterns-established:
  - "Dual-mode API body: conditional spread for v2/v3 params based on env flag"
  - "Optional speed in VoiceSettings interface for v3 compatibility"

requirements-completed: [VINF-01, VINF-02, VINF-03]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 13 Plan 02: API Route & Generation Script V3 Migration Summary

**Dual-mode TTS API route (v2/v3 via USE_V3_MODEL env flag) and generation script migrated to eleven_v3 with audio tags, pt-BR, 192kbps output**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T18:00:41Z
- **Completed:** 2026-03-26T18:04:20Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- API route supports dual v2/v3 mode via `USE_V3_MODEL` env flag: v3 uses eleven_v3 model with language_code pt-BR, omits speed/speaker_boost; v2 behavior unchanged
- Generation script fully migrated to v3: eleven_v3 model, audio tags instead of SSML breaks, 192kbps output, pt-BR language code, no speed/speaker_boost
- VoiceSettings.speed made optional across the service layer (backward compatible -- all 369 tests pass)
- 5000 char limit warning added to generation script for v3 compliance
- .env.example documents USE_V3_MODEL toggle and IVC voice requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Update API route and service layer for v3 dual-mode support** - `3b3784b` (feat)
2. **Task 2: Update generation script to use v3 model with audio tags** - `b5d9e5f` (feat)

## Files Created/Modified
- `src/app/api/tts/route.ts` - v2/v3 dual-mode API route with conditional params based on USE_V3_MODEL env var
- `src/services/tts/index.ts` - VoiceSettings.speed made optional for v3 compatibility
- `src/services/tts/elevenlabs.ts` - Conditional speed inclusion in API request body
- `scripts/generate-audio.mjs` - Full v3 migration: eleven_v3, audio tags, 192kbps, pt-BR, no speed/speaker_boost
- `.env.example` - USE_V3_MODEL toggle documentation with IVC voice requirement note

## Decisions Made
- v2/v3 toggle via `USE_V3_MODEL` env var allows safe testing without code changes
- v3 mode omits `speed` and `use_speaker_boost` params (not supported by eleven_v3 model)
- Generation script reimplements `convertPauseToTag` inline because .mjs cannot import TypeScript modules
- Lower stability values (0.40-0.70) for v3 Natural mode in generation script voice settings
- Output bitrate upgraded from 128kbps to 192kbps for headphone delivery quality

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in API route test files (NextRequest vs Request) -- out of scope, not caused by this task. Same issue documented in Plan 01 summary.

## User Setup Required
None - no external service configuration required. To use v3 mode, set `USE_V3_MODEL=true` in `.env.local`.

## Next Phase Readiness
- API route and generation script ready for v3 model usage
- Generation script ready to be re-run with `node scripts/generate-audio.mjs` to regenerate all 25 MP3s with v3 quality
- Inflection tags in generation script segments will be populated by future plans (currently segments have no inflection field set)

## Self-Check: PASSED

- All 5 modified files exist on disk
- Both commit hashes (3b3784b, b5d9e5f) found in git log
- 369 tests passing with no regressions

---
*Phase: 13-voice-infrastructure-v3-migration*
*Completed: 2026-03-26*
