---
phase: 01-core-state-machine-audio-foundation
plan: 03
subsystem: audio-foundation
tags:
  - audio
  - web-audio-api
  - speech-synthesis
  - browser-api
  - tdd
dependency_graph:
  requires:
    - "01-01-PLAN.md (SpeechSegment, VoiceDirection types)"
  provides:
    - "AudioContext singleton with unlock pattern"
    - "SpeechSynthesis wrapper with pause system"
  affects:
    - "01-04-PLAN.md (orchestrator will consume these audio utilities)"
tech_stack:
  added:
    - "Web Audio API (AudioContext, GainNode)"
    - "Speech Synthesis API (SpeechSynthesisUtterance)"
  patterns:
    - "Singleton pattern for AudioContext"
    - "Promise-based sequential speech playback"
    - "Browser API unlock pattern (resume on user gesture)"
key_files:
  created:
    - "src/lib/audio/audioContext.ts"
    - "src/lib/audio/audioContext.test.ts"
    - "src/lib/audio/speechSynthesis.ts"
    - "src/lib/audio/speechSynthesis.test.ts"
  modified: []
decisions:
  - title: "AudioContext unlock pattern"
    rationale: "Browser autoplay policies require AudioContext to be resumed on first user gesture"
    outcome: "initAudioContext() creates and resumes context, must be called from click handler"
  - title: "GainNode created at init time"
    rationale: "Phase 2 will plug ElevenLabs audio into the audio graph - gain node ready now"
    outcome: "Full audio graph initialized on first click, not lazily"
  - title: "Sequential speech playback with explicit pauses"
    rationale: "PRD specifies exact pause durations between segments for narrative pacing"
    outcome: "speakSegments() uses async/await to play segments sequentially with setTimeout pauses"
  - title: "pt-BR voice selection with fallback"
    rationale: "Experience is Portuguese-only, but voices may not be loaded immediately"
    outcome: "waitForVoices() handles async loading, finds pt-BR voice or falls back to first available"
metrics:
  duration_minutes: 3.5
  tasks_completed: 2
  tests_written: 18
  tests_passing: 18
  files_created: 4
  commits: 4
  completed_at: "2026-03-25T03:31:20Z"
---

# Phase 01 Plan 03: Audio Foundation (AudioContext + SpeechSynthesis)

**One-liner:** AudioContext singleton with unlock-on-click pattern and SpeechSynthesis wrapper supporting sequential playback with configurable pauses and voice direction.

## What Was Built

Two browser audio utility modules that provide the foundation for Oracle speech playback:

1. **AudioContext singleton** (`src/lib/audio/audioContext.ts`)
   - Creates single AudioContext instance with unlock pattern
   - Resumes context on first user gesture (browser autoplay policy compliance)
   - Creates GainNode connected to destination (ready for Phase 2 audio graph)
   - Exports: `initAudioContext()`, `getAudioContext()`, `getGainNode()`, `resetAudioContext()`

2. **SpeechSynthesis wrapper** (`src/lib/audio/speechSynthesis.ts`)
   - Speaks `SpeechSegment[]` arrays sequentially with inter-segment pauses
   - Configurable rate/pitch via `VoiceDirection` parameter (per-phase voice settings)
   - pt-BR voice selection with fallback
   - Handles async voice loading via `waitForVoices()`
   - Cancellation support with Promise rejection
   - Exports: `speakSegments()`, `cancelSpeech()`, `waitForVoices()`

Both modules fully tested (18 tests, 100% passing) using mocked browser APIs.

## Execution Summary

**Pattern:** TDD (RED-GREEN-REFACTOR)

**Tasks:**
1. AudioContext singleton with unlock on user gesture (TDD)
2. SpeechSynthesis wrapper with pause system and cancellation (TDD)

**Commits:**
- `fe69fb3`: test(01-03): add failing test for AudioContext singleton (RED)
- `75f16f2`: feat(01-03): implement AudioContext singleton with unlock pattern (GREEN)
- `269903a`: test(01-03): add failing test for SpeechSynthesis wrapper (RED)
- `b11f327`: feat(01-03): implement SpeechSynthesis wrapper with pause system (GREEN)

**Duration:** 3.5 minutes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added SpeechSynthesisUtterance global mock**
- **Found during:** Task 2 test execution
- **Issue:** Vitest test environment doesn't have browser SpeechSynthesisUtterance constructor
- **Fix:** Added `globalThis.SpeechSynthesisUtterance` mock in test setup using `vi.fn()`
- **Files modified:** `src/lib/audio/speechSynthesis.test.ts`
- **Commit:** `269903a` (included in RED phase commit)

**2. [Rule 1 - Bug] Fixed duplicate key warning in audioContext test mock**
- **Found during:** Task 1 test execution
- **Issue:** Mock object had both property initializer and getter for `state` key
- **Fix:** Removed property initializer, kept only getter to allow state mutation
- **Files modified:** `src/lib/audio/audioContext.test.ts`
- **Commit:** `75f16f2` (included in GREEN phase commit)

## Requirements Satisfied

- **RES-04 (Resource Management):** AudioContext singleton created with proper lifecycle (init/reset)
- **FLOW-02 (Narrative Phases):** SpeechSynthesis wrapper supports phase-specific voice direction (rate/pitch)

## Integration Points

**Downstream consumers (Plan 01-04):**
- Orchestrator component will call `initAudioContext()` on first user click
- Orchestrator will use `speakSegments()` to play narrative segments with correct `VoiceDirection` per phase
- `VOICE_DIRECTIONS` constant from `src/types/index.ts` maps `NarrativePhase` to voice settings
- `SCRIPT` data from `src/data/script.ts` provides `SpeechSegment[]` arrays with pause timings

**Phase 2 integration point:**
- `getGainNode()` returns the node where ElevenLabs WebSocket audio will be connected
- Audio graph already established: ElevenLabs → GainNode → AudioContext.destination

## Known Stubs

None. All functionality is fully implemented and tested.

## Self-Check: PASSED

**Files created:**
- ✓ src/lib/audio/audioContext.ts exists
- ✓ src/lib/audio/audioContext.test.ts exists
- ✓ src/lib/audio/speechSynthesis.ts exists
- ✓ src/lib/audio/speechSynthesis.test.ts exists

**Commits:**
- ✓ fe69fb3 exists (audioContext test)
- ✓ 75f16f2 exists (audioContext implementation)
- ✓ 269903a exists (speechSynthesis test)
- ✓ b11f327 exists (speechSynthesis implementation)

**Tests:**
- ✓ All 18 tests passing (9 audioContext + 9 speechSynthesis)

---

**Plan 01-03 execution complete.** Audio foundation ready for orchestrator integration (Plan 01-04).
