---
phase: 37-dual-voice-service-layer
plan: 01
subsystem: tts
tags: [elevenlabs, tts, voice-routing, api-route, dual-voice]

# Dependency graph
requires:
  - phase: 36-version-context-voice-classification
    provides: getVoiceType, getVoiceId, ExperienceVersion, VoiceType types
provides:
  - Extended TTSService interface with version + voiceType parameters
  - Server-side voice ID resolution in /api/tts route
  - Voice routing tests (6 test cases for VOZ-03)
affects: [37-02 (FallbackTTS + ElevenLabs client), 38 (orchestrator wiring), 39 (audio generation)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side voice ID resolution via getVoiceType + getVoiceId in API route"
    - "Optional interface extension for backward-compatible dual-voice support"

key-files:
  created: []
  modified:
    - src/services/tts/index.ts
    - src/services/tts/mock.ts
    - src/app/api/tts/route.ts
    - src/app/api/tts/__tests__/tts-route.test.ts

key-decisions:
  - "Voice ID resolved server-side in API route (not client-side) to keep ELEVENLABS_VOICE_ID_V2 env var server-only"
  - "Interface params are optional for zero-regression V1 backward compatibility"
  - "API route defaults to VOZ_PERGUNTA when no script_key provided (safe fallback to original voice)"

patterns-established:
  - "Server-side voice routing: API route accepts version + script_key, resolves voice ID via getVoiceType + getVoiceId"
  - "Fallback chain: resolvedVoiceId || ELEVENLABS_VOICE_ID env || hardcoded default"

requirements-completed: [VOZ-03]

# Metrics
duration: 4min
completed: 2026-05-09
---

# Phase 37 Plan 01: TTS Interface + API Route Voice Routing Summary

**Extended TTSService interface with optional version/voiceType params and wired server-side voice ID resolution in /api/tts using Phase 36 getVoiceType + getVoiceId**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-09T11:18:11Z
- **Completed:** 2026-05-09T11:22:06Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- TTSService.speak() now accepts optional version and voiceType parameters (backward-compatible)
- API route /api/tts resolves voice ID server-side from version + script_key classification
- V1 behavior unchanged: no version/script_key = default voice ID (zero regression)
- V2 narrative keys route to ELEVENLABS_VOICE_ID_V2 (somber voice)
- V2 question/fallback keys route to ELEVENLABS_VOICE_ID (original voice)
- 6 new voice routing tests verify all routing scenarios

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TTSService interface + update MockTTSService + update API route** - `4cc404b` (feat)
2. **Task 2: Add voice routing tests for API route** - `265bb15` (test)

## Files Created/Modified
- `src/services/tts/index.ts` - Extended TTSService interface with version + voiceType optional params
- `src/services/tts/mock.ts` - Updated MockTTSService signature to match extended interface
- `src/app/api/tts/route.ts` - Added server-side voice ID resolution via getVoiceType + getVoiceId
- `src/app/api/tts/__tests__/tts-route.test.ts` - Added 6 voice routing tests

## Decisions Made
- Voice ID resolved server-side in API route (not client-side) to keep ELEVENLABS_VOICE_ID_V2 env var server-only -- consistent with existing ELEVENLABS_VOICE_ID convention
- Interface extension uses optional parameters so all existing callers work without changes
- When no script_key provided, default to VOZ_PERGUNTA (safe fallback to original voice for any unclassified request)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TTSService interface ready for Plan 02 (FallbackTTS dual-directory routing + ElevenLabs client version threading)
- API route accepts version + script_key fields, ready for ElevenLabsTTSService to send them
- All 38 TTS tests pass (15 route + 9 elevenlabs + 7 fallback + 7 service)

## Self-Check: PASSED

- [x] src/services/tts/index.ts: FOUND
- [x] src/services/tts/mock.ts: FOUND
- [x] src/app/api/tts/route.ts: FOUND
- [x] src/app/api/tts/__tests__/tts-route.test.ts: FOUND
- [x] Commit 4cc404b: FOUND
- [x] Commit 265bb15: FOUND

---
*Phase: 37-dual-voice-service-layer*
*Completed: 2026-05-09*
