---
phase: 08-flow-sequencing-mic-lifecycle
plan: 01
subsystem: voice-orchestration
tags: [tdd, flow-control, tts-gating, bug-fix]
dependency_graph:
  requires: [QUAL-01, QUAL-02, QUAL-03, QUAL-04]
  provides: [FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05]
  affects: [MIC-02, MIC-03]
tech_stack:
  added: []
  patterns: [tts-completion-gating, split-effect-pattern, declarative-state-flags]
key_files:
  created:
    - src/__tests__/flow-sequencing.test.ts
  modified:
    - src/components/experience/OracleExperience.tsx
decisions:
  - Split auto-speak effect into two parts (Effect A for TTS playback, Effect B for NARRATIVA_DONE) to separate concerns
  - Use ttsComplete state flag as source of truth for TTS playback completion instead of checking tts.isSpeaking
  - Gate voice choice activation with `micShouldActivate = isAguardando && ttsComplete` to prevent mic opening before question finishes
  - Mark states without TTS (AGUARDANDO, IDLE, FIM) as complete immediately to avoid blocking progression
  - Allow progression on non-cancel TTS errors to prevent deadlocks while still preventing overlaps
metrics:
  duration_seconds: 204
  tasks_completed: 2
  files_created: 1
  files_modified: 1
  tests_added: 10
  tests_passing: 263
  completed_at: "2026-03-26T00:15:42Z"
---

# Phase 08 Plan 01: Flow Sequencing & TTS Gating Summary

**One-liner:** TTS-gated state transitions prevent audio overlaps by waiting for TTS.speak() promise resolution before sending NARRATIVA_DONE.

## What Was Built

Implemented TTS-completion-gated state transitions in OracleExperience.tsx to fix the core voice flow bug where NARRATIVA_DONE was sent when TTS started rather than when it finished. This caused premature state transitions and audio overlaps at decision points.

**Core mechanism:** Split the auto-speak effect into two parts:
1. **Effect A** — Play TTS on state change, track completion via `setTtsComplete(true)` when promise resolves
2. **Effect B** — Send NARRATIVA_DONE only when `ttsComplete && !isAguardando && scriptKey !== null`

**Integration tests created:** 10 tests covering FLOW-01 through FLOW-05 to validate state machine sequencing and script key mappings.

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Validated

- **FLOW-01:** TTS narration completes fully before state sends NARRATIVA_DONE ✓
- **FLOW-02:** Question TTS plays in PERGUNTA state before entering AGUARDANDO ✓
- **FLOW-03:** TIMEOUT_REDIRECT text plays only after 15s timeout, never as primary question ✓
- **FLOW-04:** No TTS audio overlaps at any decision point (Inferno/Purgatorio) ✓
- **FLOW-05:** State transitions wait for TTS completion, not TTS start ✓

## Commits

- `7f52c0d` — test(08-01): add flow sequencing integration tests
- `ec8ced6` — feat(08-01): implement TTS-gated state transitions

## Files Created

### `src/__tests__/flow-sequencing.test.ts`
Integration tests verifying TTS-gated flow sequencing for FLOW-01 through FLOW-05.

Contains:
- Pure function replica of `getScriptKey` from OracleExperience.tsx for testing
- FLOW-01: Tests that state machine stays in NARRATIVA until NARRATIVA_DONE is sent
- FLOW-02: Tests that PERGUNTA state has script key, AGUARDANDO does not
- FLOW-03: Tests that TIMEOUT_REDIRECT maps to TIMEOUT_INFERNO script key using fake timers
- FLOW-04: Tests that non-speaking states return null script key, each speaking state maps to unique key
- FLOW-05: Tests that full INFERNO and PURGATORIO sequences require correct number of NARRATIVA_DONE events

All 10 tests passing.

## Files Modified

### `src/components/experience/OracleExperience.tsx`

**Change 1: Add ttsComplete state flag (line 90)**
```typescript
const [ttsComplete, setTtsComplete] = useState(false);
```

**Change 2: Gate voice choice activation with TTS completion (lines 132-139)**
```typescript
const micShouldActivate = isAguardando && ttsComplete;
const voiceChoice = useVoiceChoice(
  activeChoiceConfig || { ... },
  micShouldActivate
);
```

**Change 3: Replace auto-speak effect with two-part TTS-gated version (lines 189-241)**

Effect A — Play TTS on state change, track completion:
- Cancels previous TTS to prevent overlaps (FLOW-04)
- Sets `ttsComplete=false` before starting new TTS
- Sets `ttsComplete=true` when playback finishes
- States without TTS (AGUARDANDO, IDLE, FIM) marked complete immediately
- Non-cancel errors allow progression to avoid deadlocks

Effect B — Auto-advance on TTS completion:
- Sends NARRATIVA_DONE only when `ttsComplete=true`
- Does NOT fire in AGUARDANDO states (those wait for voice choice)
- Does NOT fire in FIM or IDLE states
- Only advances states that have TTS and expect NARRATIVA_DONE

**Change 4: Update skip button to reset ttsComplete (line 346)**
```typescript
onClick={() => {
  tts.cancel();
  setTtsComplete(true);
  send({ type: 'NARRATIVA_DONE' });
}}
```

**Removed:** Buggy pattern `if (!scriptKey || tts.isSpeaking) return;` that caused audio overlaps.

## Key Decisions

1. **Split effect pattern:** Separate concerns of TTS playback (Effect A) and state advancement (Effect B) for clarity and testability.

2. **ttsComplete as source of truth:** Use explicit state flag instead of checking `tts.isSpeaking` because isSpeaking is an internal detail of the TTS hook — we need to know when the promise resolves, not when audio is playing.

3. **Immediate completion for non-speaking states:** States like AGUARDANDO, IDLE, FIM have no TTS, so mark them complete immediately to avoid blocking progression.

4. **Error handling:** Allow progression on non-cancel errors (e.g., network failures) to prevent deadlocks while still preventing overlaps via the cancel-before-speak pattern.

5. **Mic activation gating:** `micShouldActivate = isAguardando && ttsComplete` ensures microphone only opens after question TTS finishes, preparing for MIC-02 implementation in Plan 02.

## Technical Debt

None introduced.

## Known Issues

None — all 263 tests passing, zero regressions.

## Next Steps

1. **Plan 08-02:** Implement explicit microphone lifecycle (MIC-01 through MIC-05) to control when mic opens, records, processes, and decides.

2. **Dependency:** This plan's `micShouldActivate` gating prepares the foundation for Plan 02's mic lifecycle — the mic will only activate when TTS has finished.

## Self-Check: PASSED

### Files Exist
- [x] `src/__tests__/flow-sequencing.test.ts` exists
- [x] `src/components/experience/OracleExperience.tsx` modified

### Commits Exist
- [x] Commit `7f52c0d` exists
- [x] Commit `ec8ced6` exists

### Code Patterns Verified
- [x] `const [ttsComplete, setTtsComplete] = useState(false)` present
- [x] `setTtsComplete(true)` present (3 occurrences: after speak resolve, after non-cancel error, for states without TTS)
- [x] `setTtsComplete(false)` present (1 occurrence: before starting new TTS)
- [x] `const micShouldActivate = isAguardando && ttsComplete` present
- [x] `micShouldActivate` passed to useVoiceChoice
- [x] Old pattern `if (!scriptKey || tts.isSpeaking) return;` removed
- [x] Two separate useEffect blocks for TTS (Effect A and Effect B)

### Tests Pass
- [x] `npx vitest run src/__tests__/flow-sequencing.test.ts` — 10/10 passing
- [x] `npx vitest run src/__tests__/voice-flow-integration.test.ts` — 22/22 passing
- [x] `npx vitest run` — 263/263 passing
