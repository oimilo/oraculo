---
phase: 02-voice-processing-pipeline
plan: 05
subsystem: voice-orchestration
tags: [voice, orchestration, react-hooks, stt, nlu, pipeline]
dependency_graph:
  requires:
    - 02-01-SUMMARY.md  # STT and NLU services
    - 02-03-SUMMARY.md  # useMicrophone hook
  provides:
    - useVoiceChoice orchestration hook
  affects:
    - 02-06 (OracleExperience will consume this hook)
tech_stack:
  added:
    - useVoiceChoice hook (orchestration)
  patterns:
    - Pipeline orchestration via React hooks
    - Lazy service initialization
    - Confidence-based retry logic
    - Fallback state propagation
key_files:
  created:
    - src/hooks/useVoiceChoice.ts
    - src/hooks/__tests__/useVoiceChoice.test.ts
  modified: []
decisions:
  - title: "Fallback orchestration separation"
    rationale: "useVoiceChoice sets needsFallback=true but doesn't play fallback audio. OracleExperience (Plan 06) reads this state and calls TTSService.speak(FALLBACK_SCRIPT). This keeps hook focused on voice pipeline, not TTS playback."
    alternatives: "Could have played fallback within hook, but that couples voice input with audio output."
  - title: "Lazy service initialization"
    rationale: "Services created via refs on first use, not on every render. Improves performance and avoids unnecessary instantiation."
    alternatives: "Could use useMemo, but refs are simpler for services that don't change."
  - title: "Max 2 attempts before default"
    rationale: "Per STT-03 requirement: 2 fallback attempts max. After that, returns default event (configurable, defaults to eventMap.B)."
    alternatives: "Could have infinite retries, but that traps user in loop. 2 attempts balances accuracy with flow."
metrics:
  duration_minutes: 3
  tasks_completed: 1
  tests_added: 16
  files_created: 2
  commits: 2
  completed_at: "2026-03-25T10:03:18Z"
---

# Phase 02 Plan 05: Voice Choice Orchestration Hook Summary

**One-liner:** Complete voice choice pipeline orchestration via useVoiceChoice hook: record → transcribe → classify → event, with confidence-based retry (max 2 attempts) and fallback state propagation

## What Was Built

Created `useVoiceChoice` hook that orchestrates the complete voice choice flow from microphone capture through transcription and classification to final XState event mapping. The hook integrates `useMicrophone`, `STTService`, and `NLUService` into a single React hook that handles:

- Recording start/stop with isListening state
- Automatic transcription when audio becomes available
- NLU classification with confidence threshold (default 0.7)
- Retry logic with max 2 attempts (per STT-03)
- Fallback state propagation (needsFallback) for OracleExperience to read
- Error handling that degrades gracefully to default choice
- Event type mapping from classification result to XState events

## Implementation Approach

### TDD Flow
1. **RED:** Created 16 comprehensive tests covering all requirements
2. **GREEN:** Implemented hook to pass all tests
3. **VERIFY:** TypeScript compilation clean, all tests pass

### Key Design Patterns

**Pipeline Orchestration:**
```typescript
useEffect(() => {
  if (!audioBlob) return;
  // Step 1: Transcribe
  const transcript = await stt.transcribe(audioBlob);
  // Step 2: Classify
  const classification = await nlu.classify(transcript, ...);
  // Step 3: Map to event
  const eventType = classification.choice === 'A' ? eventMap.A : eventMap.B;
}, [audioBlob]);
```

**Confidence-Based Retry:**
- High confidence (>= 0.7): Return choice result immediately
- Low confidence (< 0.7): Set needsFallback=true, increment attemptCount
- Max attempts reached: Return default event with wasDefault=true

**Fallback Responsibility Split:**
- `useVoiceChoice`: Sets needsFallback=true, tracks attemptCount
- `OracleExperience` (Plan 06): Reads needsFallback, calls TTSService.speak(FALLBACK_SCRIPT), restarts listening

This separation keeps the hook focused on voice input pipeline, not audio playback.

## Tests

All 16 tests passing:

✓ Accepts choiceConfig with questionContext, options, eventMap
✓ startListening() begins recording, sets isListening=true
✓ stopListening() triggers transcription + classification
✓ High confidence (>= 0.7) returns mapped event type
✓ Low confidence (< 0.7) sets needsFallback=true
✓ After 2 failed attempts, returns default choice
✓ isProcessing=true while pipeline runs
✓ reset() clears all state
✓ Handles STT errors gracefully
✓ Handles NLU errors gracefully
✓ Respects max 2 fallback attempts (STT-03)
✓ Treats empty transcript as silence
✓ Supports custom confidenceThreshold
✓ Supports custom defaultEvent
✓ Maps choice B correctly to eventMap.B
✓ Exposes microphone error through error field

## Deviations from Plan

None - plan executed exactly as written.

## Requirements Satisfied

- **FLOW-04:** Binary choice classification via NLU integrated into orchestration hook
- **FLOW-07:** Event mapping from classification to XState event types
- **FLOW-11:** Silence timeout handled (empty transcript after max attempts → default event)
- **STT-01:** Transcription integrated into pipeline
- **STT-02:** Classification integrated into pipeline
- **STT-03:** Max 2 fallback attempts enforced with attemptCount tracking
- **STT-04:** Mock latency target met (STT ~500ms + NLU ~200ms = ~700ms < 3s)

## Known Stubs

None. All functionality is implemented. Mock services provide realistic latency simulation for testing.

## Integration Points

**Upstream Dependencies:**
- `useMicrophone` (Plan 03): Provides recording control and audioBlob
- `createSTTService` (Plan 01): Transcribes audio to text
- `createNLUService` (Plan 01): Classifies transcript into binary choice

**Downstream Consumers:**
- Plan 06 (OracleExperience): Will use useVoiceChoice to handle voice input at choice points, read needsFallback state, and trigger fallback TTS playback

## Next Steps

1. **Plan 06:** Integrate useVoiceChoice into OracleExperience component
2. Wire fallback flow: OracleExperience reads needsFallback → calls TTSService.speak(FALLBACK_SCRIPT) → restarts listening
3. Test end-to-end flow with real audio input in browser

## Commits

- **b9ee74d:** test(02-05): add failing test for useVoiceChoice hook
- **77ad798:** feat(02-05): implement useVoiceChoice hook orchestrating voice choice flow

## Self-Check: PASSED

**Created files exist:**
✓ FOUND: src/hooks/useVoiceChoice.ts
✓ FOUND: src/hooks/__tests__/useVoiceChoice.test.ts

**Commits exist:**
✓ FOUND: b9ee74d
✓ FOUND: 77ad798

**Tests pass:**
✓ All 16 tests passing

**TypeScript:**
✓ No compilation errors
