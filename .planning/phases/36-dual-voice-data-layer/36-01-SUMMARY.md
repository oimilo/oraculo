---
phase: 36-dual-voice-data-layer
plan: 01
subsystem: voice
tags: [voice-classification, dual-voice, elevenlabs, tdd, types]

# Dependency graph
requires:
  - phase: 35-timing-mitigation-browser-uat
    provides: v6.0 complete baseline with 82 SCRIPT keys
provides:
  - VoiceType union type ('VOZ_PERGUNTA' | 'VOZ_NARRATIVA')
  - ExperienceVersion union type ('V1' | 'V2')
  - getVoiceType(key) pure function classifying all 82 SCRIPT keys
  - getVoiceId(version, voiceType) voice ID routing helper
  - ELEVENLABS_VOICE_ID_V2 env var in .env.example
affects: [36-02, 37-dual-voice-service-layer, 39-audio-generation-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [voice-classification-by-key-name, version-aware-voice-routing]

key-files:
  created:
    - src/lib/voice/voiceClassification.ts
    - src/types/__tests__/voice-classification.test.ts
  modified:
    - src/types/index.ts
    - .env.example

key-decisions:
  - "Voice classification derived from key name pattern matching (not lookup tables)"
  - "getVoiceType uses hierarchy: explicit names > prefix > suffix > default narrative"
  - "getVoiceId reads env vars at call time (not cached) for flexibility"

patterns-established:
  - "Voice classification via pure function on key string — no SCRIPT object mutation"
  - "src/lib/voice/ directory for voice-related utilities"

requirements-completed: [VOZ-01, VOZ-02]

# Metrics
duration: 3min
completed: 2026-05-08
---

# Phase 36 Plan 01: Voice Classification Data Layer Summary

**VoiceType + getVoiceType() classifying all 82 SCRIPT keys as VOZ_PERGUNTA (35) or VOZ_NARRATIVA (47), plus getVoiceId() routing by version, with 21 TDD tests and ELEVENLABS_VOICE_ID_V2 env var**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-08T23:55:24Z
- **Completed:** 2026-05-08T23:58:19Z
- **Tasks:** 2 (Task 1 with TDD RED/GREEN, Task 2)
- **Files modified:** 4

## Accomplishments
- VoiceType and ExperienceVersion union types exported from src/types/index.ts
- getVoiceType() correctly classifies all 82 SCRIPT keys (35 VOZ_PERGUNTA, 47 VOZ_NARRATIVA) via pattern matching on key name
- getVoiceId() routes to correct ElevenLabs voice ID based on version (V1/V2) and voice type
- 21 comprehensive tests with exhaustive coverage including all SCRIPT key enumeration
- ELEVENLABS_VOICE_ID_V2 env var documented in .env.example (server-side only)

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests** - `8838920` (test)
2. **Task 1 GREEN: Implementation** - `a75768d` (feat)
3. **Task 2: Env var** - `066ecdc` (chore)

## TDD Gate Compliance

- RED gate: `8838920` (test commit) -- 21 tests written, all fail (module not found)
- GREEN gate: `a75768d` (feat commit) -- implementation passes all 21 tests
- REFACTOR gate: skipped (logic too simple, no cleanup needed)

## Files Created/Modified
- `src/lib/voice/voiceClassification.ts` - Pure functions getVoiceType() and getVoiceId() for dual-voice classification and routing
- `src/types/__tests__/voice-classification.test.ts` - 21 tests: 8 VOZ_PERGUNTA, 7 VOZ_NARRATIVA, 2 exhaustive coverage, 4 getVoiceId routing
- `src/types/index.ts` - Added VoiceType and ExperienceVersion union types after DevolucaoArchetype
- `.env.example` - Added ELEVENLABS_VOICE_ID_V2 with descriptive comments, server-side only

## Decisions Made
- Voice classification uses pure function with key name pattern matching (no lookup tables or SCRIPT object mutation) -- per D-01
- Classification hierarchy: explicit names (APRESENTACAO, ENCERRAMENTO) > prefix (FALLBACK_, TIMEOUT_) > suffix (_PERGUNTA) > default VOZ_NARRATIVA -- per D-02/D-03/D-04
- getVoiceId reads environment variables at call time rather than caching, enabling runtime flexibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing test failures in script-v3.test.ts (9 failures from older phases where script content changed) confirmed as unrelated to this plan's changes.

## User Setup Required

None - no external service configuration required. When user obtains their V2 voice ID from ElevenLabs, they add it to `.env.local` as `ELEVENLABS_VOICE_ID_V2=<id>`. This is a Phase 39 concern.

## Next Phase Readiness
- getVoiceType() and getVoiceId() ready for consumption by Phase 37 (TTS service layer routing)
- VoiceType and ExperienceVersion types ready for Phase 36-02 (VersionContext provider)
- ELEVENLABS_VOICE_ID_V2 env var ready for Phase 39 (audio generation script)

## Self-Check: PASSED

- All 5 files exist (voiceClassification.ts, voice-classification.test.ts, index.ts, .env.example, 36-01-SUMMARY.md)
- All 3 commits verified (8838920, a75768d, 066ecdc)

---
*Phase: 36-dual-voice-data-layer*
*Completed: 2026-05-08*
