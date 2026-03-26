---
phase: 08-flow-sequencing-mic-lifecycle
plan: 02
subsystem: voice-orchestration
tags: [tdd, mic-lifecycle, stream-cleanup, integration-testing]
dependency_graph:
  requires: [FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, QUAL-01]
  provides: [MIC-01, MIC-02, MIC-03, MIC-04, MIC-05]
  affects: []
tech_stack:
  added: []
  patterns: [reducer-fsm-testing, stream-cleanup-hardening, cross-reference-unit-tests]
key_files:
  created:
    - src/__tests__/mic-lifecycle.test.ts
  modified:
    - src/hooks/useMicrophone.ts
decisions:
  - Test voiceLifecycleReducer in isolation as pure function for MIC-01 and MIC-04 validation
  - Use cross-reference placeholder tests for MIC-03 and MIC-05 (already covered in existing unit tests)
  - Add safety releaseStream() before getUserMedia to prevent MediaStream accumulation edge case
  - Gate mic activation with micShouldActivate = isAguardando && ttsComplete (from Plan 01)
metrics:
  duration_seconds: 122
  tasks_completed: 2
  files_created: 1
  files_modified: 1
  tests_added: 19
  tests_passing: 282
  completed_at: "2026-03-26T00:20:22.860Z"
---

# Phase 08 Plan 02: Microphone Lifecycle Integration Tests & Hardening Summary

**One-liner:** Integration tests validate mic lifecycle FSM (MIC-01 through MIC-05) + safety hardening prevents MediaStream accumulation.

## What Was Built

Created comprehensive integration tests for the microphone lifecycle state machine (voiceLifecycleReducer) and added a safety guard to prevent MediaStream accumulation during rapid recording restarts.

**Test coverage:**
- **MIC-01:** Mic only starts in AGUARDANDO via START_LISTENING from idle/fallback
- **MIC-02:** micShouldActivate gates activation with `isAguardando && ttsComplete` logic
- **MIC-03:** Cross-reference to existing maxDuration unit tests (already passing)
- **MIC-04:** RESET from any phase prevents stale blob processing (drops references)
- **MIC-05:** Cross-reference to existing stream cleanup unit tests (already passing)
- **Integration tests:** Full lifecycle paths, retry cycles, mid-processing RESET scenarios

**Hardening fix:** Added `releaseStream()` call before `getUserMedia` in `startRecording` to handle edge case where previous recorder's `onstop` hasn't fired yet, preventing MediaStream reference accumulation.

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Validated

- **MIC-01:** Recording only starts when entering AGUARDANDO state ✓
- **MIC-02:** Recording only starts after TTS audio finishes (ttsComplete flag) ✓
- **MIC-03:** Configurable recording duration via maxDuration parameter ✓ (existing tests)
- **MIC-04:** Audio blob from previous AGUARDANDO never processed in new state ✓
- **MIC-05:** Microphone stops cleanly on state exit with no orphaned MediaStream tracks ✓ (hardened)

## Commits

- `0f52b50` — test(08-02): add microphone lifecycle integration tests
- `9058749` — fix(08-02): harden useMicrophone with safety releaseStream before new recording

## Files Created

### `src/__tests__/mic-lifecycle.test.ts`

Integration tests validating microphone lifecycle FSM behavior. Tests the pure reducer function `voiceLifecycleReducer` in isolation.

**MIC-01 tests (4):**
- START_LISTENING transitions from idle to listening
- START_LISTENING ignored in processing/decided phases
- START_LISTENING from fallback preserves attempt count

**MIC-02 tests (4):**
- micShouldActivate truth table (all 4 combinations of isAguardando × ttsComplete)

**MIC-03 test (1):**
- Cross-reference placeholder confirming existing unit test coverage

**MIC-04 tests (6):**
- RESET from processing/listening/fallback/idle all return to idle
- AUDIO_READY ignored in idle/processing phases (only valid in listening)

**MIC-05 test (1):**
- Cross-reference placeholder confirming existing unit test coverage

**Integration tests (3):**
- Full lifecycle: idle → listening → processing → decided
- Fallback retry: idle → listening → processing → fallback → listening → processing → decided
- RESET mid-processing simulates state exit during STT/NLU

All 19 tests passing.

## Files Modified

### `src/hooks/useMicrophone.ts`

**Change:** Added safety `releaseStream()` call before `getUserMedia` in `startRecording` (after line 58).

```typescript
const startRecording = useCallback(async (maxDuration?: number) => {
  // Stop any previous recording first
  stopRecording();

  // Safety: release any lingering stream from previous recording
  // (handles edge case where onstop hasn't fired yet)
  releaseStream();

  try {
    // ... rest of function unchanged
  }
}, [releaseStream, stopRecording]);
```

**Rationale:** Prevents MediaStream accumulation in edge case where `startRecording` is called again before previous recorder's `onstop` callback fires. The existing `releaseStream` call in `onstop` (line 90) handles the normal path. This is a defensive guard for rapid restarts.

## Key Decisions

1. **Test reducer in isolation:** The `voiceLifecycleReducer` is a pure function, so we test it directly without rendering hooks. This gives precise control over state transitions and validates the FSM logic independently from React rendering cycles.

2. **Cross-reference unit tests for MIC-03 and MIC-05:** Instead of duplicating existing unit test coverage, we document that MIC-03 (configurable duration) is already tested in `useMicrophone.test.ts` (Test 2-4, maxDuration parameter), and MIC-05 (stream cleanup) is already tested (Test 5-6, releaseStream on stop/unmount).

3. **Safety releaseStream before getUserMedia:** Even though `stopRecording()` is called first, the `onstop` callback is asynchronous. Adding an explicit `releaseStream()` before requesting a new stream ensures no MediaStream references accumulate during rapid restarts. This is a defensive hardening fix — not strictly required in normal operation, but prevents hard-to-debug issues in edge cases.

4. **micShouldActivate gating logic:** Plan 01 introduced the `ttsComplete` flag. This plan validates that the gating logic `micShouldActivate = isAguardando && ttsComplete` correctly prevents mic opening before TTS finishes. All 4 truth table combinations tested.

## Technical Debt

None introduced.

## Known Issues

None — all 282 tests passing, zero regressions.

## Next Steps

1. **Phase 08 verification:** Run `/gsd:verify-phase 08` to confirm both Plan 01 (flow sequencing) and Plan 02 (mic lifecycle) are complete.

2. **Phase 09 planning:** Plan voice pipeline integration (STT/NLU wiring, error handling, transcript validation) to complete the voice flow stabilization milestone.

3. **Browser UAT:** After Phase 09, perform browser user acceptance testing for flow sequencing + mic lifecycle + voice pipeline integration to validate the full voice-driven experience works end-to-end.

## Self-Check: PASSED

### Files Exist
- [x] `src/__tests__/mic-lifecycle.test.ts` exists
- [x] `src/hooks/useMicrophone.ts` modified

### Commits Exist
- [x] Commit `0f52b50` exists
- [x] Commit `9058749` exists

### Code Patterns Verified
- [x] `releaseStream()` call added before `getUserMedia` in `startRecording`
- [x] `releaseStream()` call exists in `onstop` callback (line 90, unchanged)
- [x] `releaseStream()` call exists in cleanup useEffect (line 129, unchanged)
- [x] `voiceLifecycleReducer` imported and tested in `mic-lifecycle.test.ts`
- [x] `micShouldActivate` truth table tested (4 test cases)
- [x] MIC-01 through MIC-05 describe blocks present

### Tests Pass
- [x] `npx vitest run src/__tests__/mic-lifecycle.test.ts` — 19/19 passing
- [x] `npx vitest run src/__tests__/flow-sequencing.test.ts` — 10/10 passing
- [x] `npx vitest run src/__tests__/voice-flow-integration.test.ts` — 22/22 passing
- [x] `npx vitest run` — 282/282 passing (up from 253 in Phase 7)

### Integration Verification
- [x] All Plan 01 flow sequencing tests still pass (no regressions)
- [x] All Phase 7 voice architecture tests still pass (no regressions)
- [x] New mic lifecycle tests validate existing behavior (FSM already correct)
- [x] Safety releaseStream hardening adds defensive guard without breaking existing logic
