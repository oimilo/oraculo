---
phase: 02-voice-processing-pipeline
plan: 01
subsystem: voice-services
tags: [interfaces, contracts, mocks, tdd]
dependencies:
  requires:
    - "01-*"
  provides:
    - TTSService interface
    - STTService interface
    - NLUService interface
    - Mock implementations for all services
  affects:
    - "02-02"
    - "02-03"
    - "02-04"
    - "02-05"
    - "02-06"
tech_stack:
  added:
    - service-factory-pattern
  patterns:
    - interface-first-design
    - mock-driven-development
key_files:
  created:
    - src/services/tts/index.ts
    - src/services/tts/mock.ts
    - src/services/tts/__tests__/tts-service.test.ts
    - src/services/stt/index.ts
    - src/services/stt/mock.ts
    - src/services/stt/__tests__/stt-service.test.ts
    - src/services/nlu/index.ts
    - src/services/nlu/mock.ts
    - src/services/nlu/__tests__/nlu-service.test.ts
  modified: []
decisions:
  - "Used static imports instead of dynamic require() for mock classes to avoid TypeScript/Vitest compatibility issues"
  - "MockTTSService delegates to Phase 1 SpeechSynthesis wrapper, maintaining architectural consistency"
  - "VoiceSettings includes ElevenLabs-compatible fields plus phase field for mock routing"
  - "MockNLUService uses simple keyword matching with configurable confidence for realistic testing"
metrics:
  duration_seconds: 178
  tasks_completed: 2
  files_created: 9
  tests_added: 12
  completed_at: "2026-03-25T09:57:11Z"
---

# Phase 02 Plan 01: Voice Service Contracts and Mocks Summary

**One-liner:** Defined TTSService, STTService, and NLUService interfaces with factory functions and mock implementations that delegate to Phase 1 browser APIs, enabling end-to-end pipeline testing without real API keys.

## What Was Built

Created the foundational service layer contracts for the voice processing pipeline. All three services (TTS, STT, NLU) now have TypeScript interfaces, factory functions that select between mock/real implementations based on environment variables, and fully functional mock implementations.

**Key contracts:**
- `TTSService.speak()` accepts speech segments with ElevenLabs-compatible voice settings
- `STTService.transcribe()` accepts audio Blob and returns transcribed text
- `NLUService.classify()` accepts transcript + context and returns structured classification with confidence

**Mock implementations:**
- `MockTTSService` delegates to Phase 1 `speakSegments()` from `speechSynthesis.ts`
- `MockSTTService` returns configurable transcripts with simulated API latency
- `MockNLUService` performs keyword matching with configurable confidence scores

## Tasks Completed

| Task | Description | Commit | Key Files |
|------|-------------|--------|-----------|
| 1 | Define service interfaces and factory functions (TDD) | 334fa1f | tts/index.ts, stt/index.ts, nlu/index.ts, mock.ts files, test files |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed dynamic require() syntax incompatibility**
- **Found during:** Task 1 GREEN phase
- **Issue:** `require('./mock')` without extension failed in Vitest, then `require('./mock.ts')` caused "Unexpected token" errors
- **Fix:** Changed to static imports (`import { MockTTSService } from './mock'`) which work correctly in TypeScript/Vitest environment
- **Files modified:** src/services/tts/index.ts, src/services/stt/index.ts, src/services/nlu/index.ts
- **Commit:** 334fa1f (included in Task 1 commit)

## Verification Results

**Automated tests:**
- `npx vitest run src/services` — 12/12 tests passing (TTS: 5, STT: 3, NLU: 4)
- All service interfaces export correct types and factory functions
- Mock implementations satisfy interface contracts
- `PHASE_VOICE_SETTINGS` constant contains all 6 narrative phases

**TypeScript compilation:**
- New service files compile without errors
- Pre-existing Phase 1 test errors in `useMicrophone.test.ts` and `useWaveform.test.ts` are out of scope

## Known Stubs

None. All mock implementations are fully functional and provide realistic behavior for testing. MockTTSService delegates to real browser SpeechSynthesis API. MockSTT and MockNLU simulate API behavior with configurable responses.

## Requirements Satisfied

- **TTS-01:** TTSService interface defined with speak() method
- **TTS-02:** VoiceSettings type created with ElevenLabs-compatible fields
- **TTS-03:** PHASE_VOICE_SETTINGS constant maps all 6 narrative phases
- **TTS-04:** MockTTSService delegates to Phase 1 SpeechSynthesis
- **STT-01:** STTService interface defined with transcribe() method
- **STT-02:** MockSTTService provides configurable transcripts
- **STT-03:** STT mock simulates API latency (~500ms)

## Next Plan Dependencies

All subsequent Phase 2 plans (02-02 through 02-06) can now import and use these service interfaces. Plan 02-02 (Audio Input Capture) will consume STTService. Plan 02-03 (NLU Integration) will consume NLUService. Plan 02-04 (TTS Integration) will consume TTSService.

## Self-Check: PASSED

**Created files verified:**
```
FOUND: src/services/tts/index.ts
FOUND: src/services/tts/mock.ts
FOUND: src/services/tts/__tests__/tts-service.test.ts
FOUND: src/services/stt/index.ts
FOUND: src/services/stt/mock.ts
FOUND: src/services/stt/__tests__/stt-service.test.ts
FOUND: src/services/nlu/index.ts
FOUND: src/services/nlu/mock.ts
FOUND: src/services/nlu/__tests__/nlu-service.test.ts
```

**Commits verified:**
```
FOUND: 334fa1f
```

**Exports verified:**
- TTSService interface ✓
- VoiceSettings type ✓
- PHASE_VOICE_SETTINGS constant ✓
- createTTSService factory ✓
- STTService interface ✓
- createSTTService factory ✓
- NLUService interface ✓
- ClassificationResult type ✓
- createNLUService factory ✓
