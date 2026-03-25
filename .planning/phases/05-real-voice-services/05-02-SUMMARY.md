---
phase: 05-real-voice-services
plan: 02
subsystem: voice-services
tags: [factory-pattern, service-integration, feature-toggle]
dependency_graph:
  requires:
    - "05-01: ElevenLabsTTSService, WhisperSTTService, ClaudeNLUService implementations"
  provides:
    - "Factory functions wired to real AI services via NEXT_PUBLIC_USE_REAL_APIS toggle"
    - "Complete service toggle mechanism (mock ↔ real)"
  affects:
    - "Frontend application now switches between mock and real services via env var"
tech_stack:
  added: []
  patterns:
    - "Factory pattern with environment-based service selection"
    - "Dynamic import ordering to prevent test hoisting issues"
key_files:
  created: []
  modified:
    - src/services/tts/index.ts
    - src/services/stt/index.ts
    - src/services/nlu/index.ts
    - src/services/tts/__tests__/elevenlabs-tts.test.ts
decisions:
  - key: "Fixed test import hoisting issue"
    rationale: "Moving PHASE_VOICE_SETTINGS import after mocks prevents Vitest hoisting from triggering module load before mocks initialized"
    alternatives: ["Dynamic import in factory (adds runtime overhead)", "Separate constants file (breaks cohesion)"]
metrics:
  duration_seconds: 172
  tasks_completed: 2
  tests_added: 0
  files_created: 0
  files_modified: 4
  commits: 1
  requirements_validated:
    - RTTS-01
    - RSTT-01
    - RNLU-01
completed_date: "2026-03-25"
---

# Phase 05 Plan 02: Factory Wiring Summary

**One-liner:** Factory functions wired to return real AI services (ElevenLabs, Whisper, Claude) when NEXT_PUBLIC_USE_REAL_APIS=true

Completed the service toggle mechanism by importing and returning real service implementations from factory functions when `NEXT_PUBLIC_USE_REAL_APIS=true`. All TODO(Phase 5) placeholders removed. Full test suite passes (213 tests).

## What Was Built

### Task 1: Wire real service classes into factory functions (3aed024)

**Updated src/services/tts/index.ts:**
- Added import: `import { ElevenLabsTTSService } from './elevenlabs'`
- Replaced TODO(Phase 5) block with: `return new ElevenLabsTTSService()`
- Removed placeholder console.warn and fallback logic from factory
- Factory now returns ElevenLabsTTSService when `NEXT_PUBLIC_USE_REAL_APIS=true` and `typeof window !== 'undefined'`
- Continues returning MockTTSService when env var not set

**Updated src/services/stt/index.ts:**
- Added import: `import { WhisperSTTService } from './whisper'`
- Replaced TODO(Phase 5) block with: `return new WhisperSTTService()`
- Removed placeholder console.warn
- Factory now returns WhisperSTTService when `NEXT_PUBLIC_USE_REAL_APIS=true` and `typeof window !== 'undefined'`
- Continues returning MockSTTService when env var not set

**Updated src/services/nlu/index.ts:**
- Added import: `import { ClaudeNLUService } from './claude'`
- Replaced TODO(Phase 5) block with: `return new ClaudeNLUService()`
- Removed placeholder console.warn
- Factory now returns ClaudeNLUService when `NEXT_PUBLIC_USE_REAL_APIS=true` and `typeof window !== 'undefined'`
- Continues returning MockNLUService when env var not set

**Fixed src/services/tts/__tests__/elevenlabs-tts.test.ts:**
- Moved `PHASE_VOICE_SETTINGS` import from top-level to after vi.mock() setup
- Used dynamic `await import()` to prevent hoisting issue
- Issue: Top-level import of `PHASE_VOICE_SETTINGS` from `../index` caused index.ts to load before mocks were initialized, triggering "Cannot access 'mockGetAudioContext' before initialization" error
- Solution: Import after mocks are set up to prevent module execution during hoisting phase

**Factory behavior after wiring:**
- When `NEXT_PUBLIC_USE_REAL_APIS=true` (and browser environment): Real services call /api/tts, /api/stt, /api/nlu routes
- When env var not set or SSR: Mock services return simulated data
- ElevenLabsTTSService includes fallback chain (ElevenLabs API → FallbackTTS → SpeechSynthesis)
- WhisperSTTService and ClaudeNLUService throw errors on API failure (no fallback needed)

### Task 2: Full suite verification and TypeScript compilation check (no commit)

**Verification results:**

1. **Full test suite:** ✅ 213 tests passing (all green)
   - 168 v1.0 baseline tests
   - 24 Phase 4 API route tests
   - 21 Phase 5 Plan 01 service implementation tests
   - All service factory tests passing

2. **TODO placeholder removal:** ✅ Zero matches
   - `grep -r "TODO(Phase 5)" src/services/` → empty
   - `grep -r "not yet implemented" src/services/` → empty

3. **Real service wiring:** ✅ Confirmed
   - `ElevenLabsTTSService` imported and instantiated in tts/index.ts
   - `WhisperSTTService` imported and instantiated in stt/index.ts
   - `ClaudeNLUService` imported and instantiated in nlu/index.ts

4. **TypeScript compilation:**
   - Pre-existing errors in API route test files (src/app/api/{tts,nlu}/__tests__/*.test.ts)
   - These errors existed before this plan (documented in Plan 01 summary as out of scope)
   - Service implementation files compile correctly within project context
   - Out of scope per deviation rules (pre-existing warnings/errors not related to current task)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test import hoisting issue in elevenlabs-tts.test.ts**
- **Found during:** Task 1 verification (test run failed with hoisting error)
- **Issue:** Top-level import of `PHASE_VOICE_SETTINGS` from `../index` triggered index.ts module load during Vitest hoisting phase, before `vi.mock()` setup completed. This caused `ElevenLabsTTSService` import chain to execute before mocked modules were initialized, resulting in "Cannot access 'mockGetAudioContext' before initialization" error.
- **Fix:** Moved `PHASE_VOICE_SETTINGS` import from top-level to dynamic `await import()` after mocks are set up. Kept type imports (`import type`) at top since they don't execute modules.
- **Files modified:** src/services/tts/__tests__/elevenlabs-tts.test.ts
- **Commit:** Included in Task 1 commit (3aed024)

## Test Results

**Test suite:** 213 tests passing (same as Plan 01 baseline — no new tests added)

**Coverage breakdown:**
- Service implementations: 21 tests (from Plan 01)
- Service factories: 5 tests (existing)
- State machine: 90 tests (existing from v1.0)
- Hooks: 22 tests (existing from v1.0)
- Analytics: 25 tests (existing from v1.0)
- Station registry: 7 tests (existing from v1.0)
- API routes: 24 tests (existing from Phase 4)
- Script/data: 19 tests (existing from v1.0)

**Factory toggle validation:**
- ✅ Mock services returned when `NEXT_PUBLIC_USE_REAL_APIS` not set
- ✅ Real services returned when `NEXT_PUBLIC_USE_REAL_APIS=true` (verified via imports)
- ✅ Server-side rendering check (`typeof window !== 'undefined'`) preserved

## Known Stubs

None. All factory functions fully wired to real service implementations.

## Integration Notes

**Ready for end-to-end testing:**
The application now has complete real API service integration. To test with real APIs:

1. Set environment variables in `.env.local`:
   ```
   ELEVENLABS_API_KEY=sk_...
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_USE_REAL_APIS=true
   ```

2. Start dev server: `npm run dev`

3. The application will:
   - Call `/api/tts` for ElevenLabs text-to-speech
   - Call `/api/stt` for Whisper speech-to-text
   - Call `/api/nlu` for Claude NLU binary classification
   - Fall back to pre-recorded audio if TTS API fails
   - Display error messages if STT/NLU APIs fail

**Next steps (Phase 6):**
- Supabase analytics service implementation
- Sessions table migration
- Row-level security policies
- Replace MockAnalyticsService in factory

## Self-Check

### Modified Files
- [x] src/services/tts/index.ts — FOUND (factory wired)
- [x] src/services/stt/index.ts — FOUND (factory wired)
- [x] src/services/nlu/index.ts — FOUND (factory wired)
- [x] src/services/tts/__tests__/elevenlabs-tts.test.ts — FOUND (import order fixed)

### Commits
- [x] 3aed024 — FOUND: "feat(05-02): wire real AI services into factory functions"

### Verification
- [x] All 213 tests passing
- [x] No TODO(Phase 5) placeholders remain
- [x] All three factories import and return real services
- [x] Mock services still returned when env var not set

## Self-Check: PASSED

All files modified, commit exists, tests green, verification complete.
