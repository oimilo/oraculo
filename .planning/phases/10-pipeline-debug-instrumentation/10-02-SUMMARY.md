---
phase: 10-pipeline-debug-instrumentation
plan: 02
subsystem: debugging
tags: [logging, debug-panel, react-hooks, instrumentation, developer-experience]

# Dependency graph
requires:
  - phase: 10-pipeline-debug-instrumentation
    plan: 01
    provides: DebugPanel component, createLogger utility, useKeyboardShortcut hook
  - phase: 07-voice-fsm-refactor
    provides: VoiceLifecycle types for debug display
  - phase: 08-flow-sequencing
    provides: ttsComplete and micShouldActivate flags
affects: [11-mock-tts-fix, 12-browser-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Structured logging with namespace and timestamp for voice pipeline observability"
    - "useDebugValue for React DevTools inspection of hook state"
    - "Development-only debug overlay (process.env.NODE_ENV guard)"
    - "Live state prop injection into debug panel for real-time pipeline visibility"

key-files:
  created: []
  modified:
    - src/hooks/useVoiceChoice.ts
    - src/hooks/useMicrophone.ts
    - src/hooks/useTTSOrchestrator.ts
    - src/components/experience/OracleExperience.tsx

key-decisions:
  - "Replace ALL raw console.log calls with structured createLogger for consistent timestamping"
  - "Add useDebugValue to useVoiceChoice for React DevTools visibility of lifecycle phase"
  - "Log critical pipeline events: getUserMedia success, mic start/stop, TTS speak lifecycle, STT/NLU results"
  - "Wire DebugPanel with 6 live state props (ttsComplete, micShouldActivate, voiceLifecyclePhase, isRecording, currentState, attemptCount)"
  - "Wrap DebugPanel in process.env.NODE_ENV === 'development' to prevent production bundle bloat"

patterns-established:
  - "createLogger pattern for all voice pipeline hooks (VoiceChoice, Mic, TTS namespaces)"
  - "Effect-level logging in OracleExperience (Effect A/B transitions, choice result handling)"
  - "Log structured objects with relevant context (size, attempt, confidence, etc.)"

requirements-completed: [DIAG-01, DIAG-02]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 10 Plan 02: Wire Debug Panel and Add Pipeline Logging Summary

**DebugPanel wired with live state, structured logging across all voice hooks, 328 tests passing**

## Performance

- **Duration:** 5 minutes
- **Started:** 2026-03-26T13:43:48Z
- **Completed:** 2026-03-26T13:49:06Z
- **Tasks:** 2
- **Files modified:** 4 (3 hooks + 1 component)

## Accomplishments

- All voice pipeline hooks (useVoiceChoice, useMicrophone, useTTSOrchestrator) now use structured timestamped logging via createLogger
- Zero raw console.log calls remain in voice pipeline code
- useDebugValue added to useVoiceChoice for React DevTools inspection
- DebugPanel wired into OracleExperience with 6 live state props: ttsComplete, micShouldActivate, voiceLifecyclePhase, isRecording, currentState, attemptCount
- TTS orchestration logging added to OracleExperience effects (Effect A/B transitions, choice result handling)
- All 328 tests passing (307 existing + 21 debug infrastructure)
- Zero new dependencies added

## Task Commits

Each task was committed atomically:

1. **Task 1: Add structured logging to voice pipeline hooks** - `c3f9e98` (feat)
   - useVoiceChoice: Replaced all console.log with createLogger, added useDebugValue
   - useMicrophone: Replaced all console.log/error with createLogger, added getUserMedia and state transition logs
   - useTTSOrchestrator: Added logging for initTTS, cancel, speak lifecycle (START/END/error)
   - All 43 existing hook tests pass

2. **Task 2: Wire DebugPanel into OracleExperience with live state props** - `885de45` (feat)
   - Import DebugPanel and createLogger
   - Add structured logging to Effect A (TTS playback), Effect B (NARRATIVA_DONE sender), voice choice result handler
   - Render DebugPanel with all 6 pipeline state props
   - Panel only renders in development mode, toggleable via Ctrl+Shift+D
   - All 328 tests pass

## Files Created/Modified

**Created:** None (all infrastructure created in Plan 01)

**Modified:**
- `src/hooks/useVoiceChoice.ts` - Structured logging with createLogger('VoiceChoice'), useDebugValue for lifecycle phase
- `src/hooks/useMicrophone.ts` - Structured logging with createLogger('Mic'), log points for getUserMedia, start/stop, releaseStream
- `src/hooks/useTTSOrchestrator.ts` - Structured logging with createLogger('TTS'), log points for initTTS, cancel, speak START/END/error
- `src/components/experience/OracleExperience.tsx` - Import DebugPanel + createLogger, add logging to Effects A/B and choice handler, render DebugPanel with live props

## Decisions Made

- **Logging namespace strategy:** Each hook gets its own namespace (VoiceChoice, Mic, TTS) for easy filtering in browser console
- **Log message format:** Use structured objects for context (e.g., `{ size, attempt }`) instead of interpolated strings for better readability
- **useDebugValue placement:** Added to useVoiceChoice for React DevTools visibility of lifecycle phase and active status
- **DebugPanel guard:** Wrapped in `process.env.NODE_ENV === 'development'` to prevent production bundle bloat (panel code tree-shaken in production build)
- **Effect A/B logging:** Log at effect trigger, speak start/end, cleanup, and NARRATIVA_DONE send to trace full TTS-to-state-machine flow

## Deviations from Plan

None - plan executed exactly as written. All logging instrumentation added, DebugPanel wired, tests passing.

## Issues Encountered

None - TDD foundation from Plan 01 made integration smooth. All tests passed on first run after implementation.

## Known Stubs

None - this plan adds pure instrumentation code with no business logic dependencies.

## User Setup Required

None - debug panel is opt-in via keyboard shortcut (Ctrl+Shift+D), no configuration needed.

## Next Phase Readiness

**Phase 10 Complete - Ready for Phase 11 (Mock TTS Fix):**
- Developers can now press Ctrl+Shift+D to see live pipeline state
- Console logs provide millisecond-level timestamps for every pipeline transition
- Full observability into the "mic not activating" bug root cause
- 328 tests passing ensures debug instrumentation doesn't break voice flow

**Key debugging capabilities now available:**
1. **Visual state tracking:** DebugPanel shows ttsComplete, micShouldActivate, voiceLifecycle, isRecording, machineState, attemptCount updating in real-time
2. **Console trace:** Timestamped logs for TTS start/end, mic getUserMedia/start/stop, STT/NLU results, Effect A/B transitions
3. **React DevTools:** useDebugValue exposes voice lifecycle phase for hook inspection

**Blockers:** None

**Next steps:** Phase 11 will use this instrumentation to diagnose and fix the MockTTSService bug causing ttsComplete to stay false (suspected SpeechSynthesis.getVoices() hanging).

---
*Phase: 10-pipeline-debug-instrumentation*
*Completed: 2026-03-26*

## Self-Check: PASSED

**Files verified:**
- src/hooks/useVoiceChoice.ts: MODIFIED (contains createLogger, useDebugValue)
- src/hooks/useMicrophone.ts: MODIFIED (contains createLogger)
- src/hooks/useTTSOrchestrator.ts: MODIFIED (contains createLogger)
- src/components/experience/OracleExperience.tsx: MODIFIED (contains DebugPanel import and render)

**Commits verified:**
- c3f9e98: Task 1 (structured logging to hooks)
- 885de45: Task 2 (wire DebugPanel with live props)

**Tests verified:**
- Full suite: 328 passing (307 existing + 21 debug infrastructure from Plan 01)
- No regressions introduced by logging instrumentation
