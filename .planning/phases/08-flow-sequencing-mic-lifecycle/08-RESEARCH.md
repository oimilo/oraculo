# Phase 8: Flow Sequencing & Mic Lifecycle - Research

**Researched:** 2026-03-25
**Domain:** Voice interaction flow sequencing, microphone lifecycle management, XState state machine coordination
**Confidence:** HIGH

## Summary

Phase 8 addresses flow sequencing bugs and microphone lifecycle issues in the Oracle voice experience. The current implementation suffers from TTS audio overlaps, incorrect question playback timing, and unclear microphone recording lifecycle that prevents STT from capturing visitor responses.

The research reveals that these issues stem from **timing coordination gaps** between three independent systems: (1) XState state machine transitions, (2) TTS playback lifecycle, and (3) microphone recording lifecycle. The refactored architecture from Phase 7 (FSM-based useVoiceChoice, decoupled useTTSOrchestrator) provides a clean foundation, but the integration layer in OracleExperience.tsx lacks explicit sequencing controls.

**Primary recommendation:** Implement explicit TTS-completion-gated state transitions and microphone activation triggers. Use TTS orchestrator's isSpeaking flag to gate NARRATIVA → PERGUNTA → AGUARDANDO transitions, and only activate voice choice (mic opens) after entering AGUARDANDO state. This ensures the sequence: narration TTS completes → question TTS plays → question TTS completes → mic opens → visitor speaks → mic stops → STT/NLU processes → state transition.

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-01 | TTS narration completes fully before microphone opens for listening | Requires TTS completion guard before AGUARDANDO entry |
| FLOW-02 | Question TTS plays in PERGUNTA state, before entering AGUARDANDO | State machine already has PERGUNTA state; need to wire TTS to it |
| FLOW-03 | TIMEOUT_REDIRECT text only plays after 15s timeout, not as primary question | State machine correct; OracleExperience needs script mapping fix |
| FLOW-04 | No TTS audio overlaps at any point during the experience | Requires TTS cancellation on state exit + single TTS instance |
| FLOW-05 | State transitions wait for TTS completion before proceeding | Requires effect dependency on tts.isSpeaking before sending NARRATIVA_DONE |
| MIC-01 | Microphone recording starts only when entering AGUARDANDO state | useVoiceChoice already has activation flag tied to isAguardando |
| MIC-02 | Recording starts only after all TTS audio has finished playing | Requires TTS completion check before setting active=true |
| MIC-03 | Recording duration captures full visitor response (configurable) | useMicrophone already supports maxDuration parameter (6000ms default) |
| MIC-04 | Audio blob from previous AGUARDANDO is never processed in a new state | voiceLifecycleReducer RESET on deactivation prevents stale blob processing |
| MIC-05 | Microphone stops cleanly on state exit (no orphaned streams) | useMicrophone cleanup in useEffect return already releases tracks |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| XState | 5.20.0 | State machine orchestration | Industry standard for complex state flows; explicit state transitions prevent race conditions |
| React | 19.0.0 | Component lifecycle + hooks | useEffect dependencies control sequencing; useRef prevents stale closures |
| MediaRecorder API | Browser native | Audio capture | W3C standard for audio recording; no external dependencies needed |
| Web Audio API | Browser native | TTS playback + ambient audio | Low-level audio control; precise timing events (ended, canplaythrough) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @xstate/react | 5.0.0 | useMachine hook | React integration for XState; provides snapshot updates on state transitions |
| Vitest | 2.1.8 | Test framework | Integration tests with real async delays (QUAL-04 pattern from Phase 7) |
| @testing-library/react | 16.1.0 | Component testing | Testing hooks with renderHook and waitFor for async state updates |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| XState state machine | Zustand + manual flags | Simpler API but loses explicit state modeling — harder to prevent invalid state combinations |
| useReducer FSM (Phase 7) | useState booleans | More direct but creates 2^n state combinations — Phase 7 proved FSM prevents impossible states |
| MediaRecorder stop() on state exit | setTimeout auto-stop only | Less precise cleanup — could orphan streams if component unmounts mid-recording |

**Installation:**

All dependencies already installed (verified in package.json).

**Version verification:**

```bash
# Already verified from package.json read:
# xstate: 5.20.0
# @xstate/react: 5.0.0
# react: 19.0.0
# vitest: 2.1.8
```

## Architecture Patterns

### Recommended Flow Sequencing Pattern

**Problem:** Three independent async systems (state machine, TTS, microphone) must coordinate timing without race conditions.

**Solution:** Use TTS completion as explicit gate for state transitions.

```typescript
// Pattern: TTS-gated state transitions in OracleExperience.tsx

// Current (buggy): Auto-transitions on state entry regardless of TTS status
useEffect(() => {
  const scriptKey = getScriptKey(state);
  if (!scriptKey || tts.isSpeaking) return;

  tts.speak(SCRIPT[scriptKey], state.context.currentPhase)
    .then(() => {
      send({ type: 'NARRATIVA_DONE' }); // Race condition: might fire before audio finishes
    });
}, [state.value, send, tts]);

// Recommended (Phase 8): Explicit TTS completion flag + manual transition control
useEffect(() => {
  const scriptKey = getScriptKey(state);
  if (!scriptKey) return;

  // Cancel previous TTS on state change (FLOW-04)
  if (tts.isSpeaking) {
    tts.cancel();
  }

  setTTSComplete(false); // New local state flag

  tts.speak(SCRIPT[scriptKey], state.context.currentPhase)
    .then(() => {
      setTTSComplete(true); // Enable manual transition
    })
    .catch((err) => {
      if (err.message !== 'Speech cancelled') {
        console.error('Speech error:', err);
      }
    });
}, [state.value, tts]);

// Separate effect: transition only when TTS completes
useEffect(() => {
  if (ttsComplete && !isAguardando) {
    send({ type: 'NARRATIVA_DONE' });
  }
}, [ttsComplete, isAguardando, send]);
```

### Microphone Lifecycle Pattern

**Problem:** Microphone must open AFTER question TTS completes, not immediately on AGUARDANDO entry.

**Solution:** Gate voice choice activation with TTS completion flag.

```typescript
// Current (MIC-02 bug): Mic opens immediately on AGUARDANDO entry
const isAguardando = state.matches({ INFERNO: 'AGUARDANDO' }) ||
                     state.matches({ PURGATORIO_A: 'AGUARDANDO' }) ||
                     state.matches({ PURGATORIO_B: 'AGUARDANDO' });

const voiceChoice = useVoiceChoice(activeChoiceConfig, isAguardando);
// BUG: isAguardando=true immediately when entering AGUARDANDO,
// but question TTS in PERGUNTA state is still playing

// Recommended (Phase 8): Gate activation with TTS completion
const micShouldActivate = isAguardando && ttsComplete;
const voiceChoice = useVoiceChoice(activeChoiceConfig, micShouldActivate);
// MIC-02 satisfied: mic opens only when isAguardando=true AND ttsComplete=true
```

### State Machine Sequence Pattern

**State flow per PRD:**

```
NARRATIVA (narration TTS plays)
    ↓ NARRATIVA_DONE (after TTS completes)
PERGUNTA (question TTS plays)
    ↓ NARRATIVA_DONE (after TTS completes)
AGUARDANDO (mic opens, visitor speaks)
    ↓ CHOICE_A / CHOICE_B / timeout
RESPOSTA_A / RESPOSTA_B (response TTS plays)
    ↓ NARRATIVA_DONE
Next phase...
```

**Current bug:** OracleExperience auto-sends NARRATIVA_DONE immediately after TTS starts, causing premature transitions.

**Fix:** Only send NARRATIVA_DONE after TTS promise resolves AND user hasn't navigated to next state.

### Anti-Patterns to Avoid

- **Automatic state transitions on TTS start:** Causes race conditions where state advances before audio finishes (FLOW-05 violation).
- **Shared mutable refs between TTS and mic:** Phase 7 eliminated this; don't reintroduce it.
- **Forgetting to cancel TTS on state exit:** Causes audio overlaps (FLOW-04 violation). Always call `tts.cancel()` in cleanup.
- **Activating voice choice before TTS completes:** Opens mic during question playback, causing audio feedback loops (MIC-02 violation).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine timeouts | Custom setTimeout in useEffect | XState `after: { 15000: ... }` | XState handles timer cleanup on state exit automatically; custom timers can orphan |
| Audio completion detection | Poll audio.currentTime | HTMLAudioElement 'ended' event or Promise-based TTS service | Polling is inefficient and misses sub-second timing; native events are precise |
| Microphone stream cleanup | Manual track.stop() scattered in code | Centralized cleanup in useMicrophone hook return | Phase 7 pattern already correct; hook owns lifecycle |
| FSM state transitions | Nested if/else or switch statements | useReducer with explicit reducer function | Phase 7 proved reducer pattern eliminates impossible states (32 boolean combos → 5 named states) |

**Key insight:** Timing coordination in voice UIs is deceptively complex. XState's declarative state modeling + React's useEffect dependency arrays provide deterministic sequencing that custom setTimeout logic cannot match. Leverage existing patterns from Phase 7 refactor.

## Common Pitfalls

### Pitfall 1: TTS Promise Resolves Before Audio Finishes Playing

**What goes wrong:** TTS service returns resolved promise when audio element starts playing (`audio.play()` resolves), not when playback completes. This causes state machine to advance while audio is still playing.

**Why it happens:** Web Audio API's `HTMLAudioElement.play()` returns a promise that resolves when playback **starts**, not when it **ends**.

**How to avoid:** Always attach 'ended' event listener to audio element and resolve TTS promise only on 'ended' event.

```typescript
// Bad: Promise resolves on play() start
async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
  const audio = new Audio(audioUrl);
  await audio.play(); // Resolves immediately when playback STARTS
  // BUG: Promise resolved, but audio still playing
}

// Good: Promise resolves on playback end
async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
  const audio = new Audio(audioUrl);
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve(); // Wait for playback to FINISH
    audio.onerror = (err) => reject(err);
    audio.play();
  });
}
```

**Warning signs:** Audio overlaps between states, microphone opening mid-sentence, premature state transitions.

**Current status:** Need to verify MockTTSService and ElevenLabsTTSService both use 'ended' event pattern.

### Pitfall 2: Voice Choice Active Flag Toggles Too Early

**What goes wrong:** Setting `active=true` for useVoiceChoice when entering AGUARDANDO state, but PERGUNTA TTS is still playing. Microphone opens during question playback, causing feedback loop or cutting off question audio.

**Why it happens:** State machine transitions are synchronous (PERGUNTA → AGUARDANDO happens instantly), but TTS playback is async. The `isAguardando` boolean becomes `true` before question audio finishes.

**How to avoid:** Add TTS completion flag to voice choice activation condition.

```typescript
// Bad: Activates mic immediately on AGUARDANDO entry
const isAguardando = state.matches({ INFERNO: 'AGUARDANDO' });
const voiceChoice = useVoiceChoice(config, isAguardando);

// Good: Activates mic only after AGUARDANDO + TTS complete
const isAguardando = state.matches({ INFERNO: 'AGUARDANDO' });
const micShouldActivate = isAguardando && !tts.isSpeaking;
const voiceChoice = useVoiceChoice(config, micShouldActivate);
```

**Warning signs:** Microphone indicator appears while question is still playing, visitor tries to speak but question audio drowns them out, STT captures question audio instead of visitor response.

### Pitfall 3: MediaRecorder Streams Not Released on Component Unmount

**What goes wrong:** MediaRecorder holds references to MediaStream tracks. If component unmounts or state changes before calling `stream.getTracks().forEach(t => t.stop())`, tracks remain active (camera/mic light stays on, memory leak).

**Why it happens:** React useEffect cleanup runs AFTER component unmounts, but MediaRecorder lifecycle is independent of React. Orphaned streams persist until garbage collected.

**How to avoid:** Always use cleanup function in useEffect that creates MediaRecorder.

```typescript
// From useMicrophone.ts (already correct - Phase 7 pattern):
useEffect(() => {
  return () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    releaseStream(); // CRITICAL: Stops all tracks
  };
}, [releaseStream]);
```

**Warning signs:** Microphone permission indicator stays active after session ends, multiple sessions accumulate active streams, browser DevTools shows MediaStream memory leaks.

**Current status:** useMicrophone.ts already implements this correctly (verified in file read). No changes needed for MIC-05.

### Pitfall 4: Stale Audio Blobs Processed in Wrong State

**What goes wrong:** Visitor speaks in INFERNO.AGUARDANDO, but processing takes 2 seconds. Meanwhile, state machine times out to TIMEOUT_REDIRECT. When STT/NLU completes, it sends event for wrong state context (INFERNO instead of PURGATORIO).

**Why it happens:** Voice processing is async (STT + NLU = 500-2000ms). State machine transitions are synchronous. The closure that started processing captures stale state.

**How to avoid:** Reset voice choice FSM on deactivation. Phase 7 voiceLifecycleReducer already handles this with RESET event.

```typescript
// From useVoiceChoice.ts (already correct - Phase 7 pattern):
useEffect(() => {
  if (!active) {
    stopRecording();
    if (lifecycle.phase !== 'idle') {
      dispatch({ type: 'RESET' }); // Prevents stale blob processing
    }
    return;
  }
}, [active]);
```

**Warning signs:** Classification results arriving after state has changed, wrong event types sent to state machine, visitor makes choice but it's applied to wrong question.

**Current status:** Phase 7 refactor already prevents this (MIC-04 satisfied). Verify in integration tests.

## Code Examples

Verified patterns from Phase 7 implementation and research findings.

### TTS Completion Detection Pattern

```typescript
// Source: Web Audio API 'ended' event pattern (MDN docs)
// Context: TTS service must resolve promise only when playback finishes

class TTSServiceImpl implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    const audioUrl = await this.synthesize(segments, voiceSettings);
    const audio = new Audio(audioUrl);

    return new Promise<void>((resolve, reject) => {
      audio.addEventListener('ended', () => {
        resolve(); // Wait for playback completion
      });

      audio.addEventListener('error', (err) => {
        reject(new Error(`Audio playback failed: ${err.message}`));
      });

      audio.play().catch(reject);
    });
  }

  cancel(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}
```

### Sequential State Transitions with TTS Gates

```typescript
// Source: OracleExperience.tsx pattern (to be implemented in Phase 8)
// Context: Coordinate TTS completion with state machine transitions

function OracleExperience() {
  const [state, send] = useMachine(oracleMachine);
  const tts = useTTSOrchestrator();
  const [ttsComplete, setTTSComplete] = useState(false);

  // Effect 1: Play TTS on state change, mark completion
  useEffect(() => {
    const scriptKey = getScriptKey(state);
    if (!scriptKey) return;

    // Cancel previous audio to prevent overlaps (FLOW-04)
    if (tts.isSpeaking) {
      tts.cancel();
    }

    setTTSComplete(false);

    tts.speak(SCRIPT[scriptKey], state.context.currentPhase)
      .then(() => {
        setTTSComplete(true); // Signal completion
      })
      .catch((err) => {
        if (err.message !== 'Speech cancelled') {
          console.error('TTS error:', err);
          setTTSComplete(true); // Allow progression on error
        }
      });

    return () => tts.cancel(); // Cleanup on state exit
  }, [state.value, tts]);

  // Effect 2: Auto-advance when TTS completes (non-AGUARDANDO states only)
  const isAguardando = state.matches({ INFERNO: 'AGUARDANDO' }) ||
                       state.matches({ PURGATORIO_A: 'AGUARDANDO' }) ||
                       state.matches({ PURGATORIO_B: 'AGUARDANDO' });

  useEffect(() => {
    if (ttsComplete && !isAguardando) {
      send({ type: 'NARRATIVA_DONE' });
    }
  }, [ttsComplete, isAguardando, send]);

  // Effect 3: Activate mic only when AGUARDANDO + TTS complete (MIC-02)
  const micShouldActivate = isAguardando && ttsComplete;

  const voiceChoice = useVoiceChoice(
    activeChoiceConfig || DUMMY_CONFIG,
    micShouldActivate
  );

  return <div>...</div>;
}
```

### Microphone Lifecycle with Track Cleanup

```typescript
// Source: useMicrophone.ts (existing Phase 7 implementation - verified correct)
// Context: Proper MediaStream cleanup prevents orphaned audio tracks

export function useMicrophone(): UseMicrophoneReturn {
  const streamRef = useRef<MediaStream | null>(null);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      // Stop ALL tracks (critical for MIC-05)
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount (prevents memory leaks)
  useEffect(() => {
    return () => {
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      releaseStream(); // Critical cleanup
    };
  }, [releaseStream]);

  return { isRecording, audioBlob, error, startRecording, stopRecording };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auto-transitions on state entry | TTS-gated transitions | Phase 8 (this phase) | Eliminates audio overlaps and premature state changes |
| Boolean flags for voice choice state | useReducer FSM with 5 explicit states | Phase 7 (completed) | Prevents impossible state combinations (32 boolean combos → 5 named states) |
| Shared mutable refs between hooks | Decoupled useTTSOrchestrator | Phase 7 (completed) | Eliminates stale closure bugs |
| Manual setTimeout for mic duration | useMicrophone with built-in auto-stop timer | Phase 7 (existing) | Auto-stop timer tied to recorder instance, prevents orphaned timers |
| Generic choice guards (inline lambdas) | Named guards via createChoiceGuard factory | Phase 7 (completed) | Type-safe, reusable, explicit guard names in state machine config |

**Deprecated/outdated:**

- **Auto-sending NARRATIVA_DONE on TTS start:** Phase 8 replaces with completion-gated transitions
- **Activating voice choice on AGUARDANDO entry:** Phase 8 adds TTS completion flag to activation condition

## Open Questions

1. **Should PERGUNTA state TTS auto-advance to AGUARDANDO, or require manual skip?**
   - What we know: Current state machine has PERGUNTA → AGUARDANDO transition on NARRATIVA_DONE
   - What's unclear: Should question TTS auto-advance after completion, or should it pause for operator intervention?
   - Recommendation: Auto-advance (consistent with narrative flow). Operator can use Skip button if needed.

2. **What happens if TTS service fails mid-playback?**
   - What we know: ElevenLabsTTSService has fallback to FallbackTTSService, but what if both fail?
   - What's unclear: Should state machine halt, skip to next state, or retry?
   - Recommendation: Set `ttsComplete=true` on error (as shown in code example) to allow progression. Operator can restart session if critical audio fails.

3. **Should mic auto-stop timer start on recording start or on AGUARDANDO entry?**
   - What we know: useMicrophone starts timer when `startRecording(maxDuration)` is called
   - What's unclear: Timer starts when mic opens (correct), but what if there's delay between AGUARDANDO entry and mic activation?
   - Recommendation: Current approach is correct — timer starts on mic open, not state entry. This prevents timeout drift from TTS delays.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 + @testing-library/react 16.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- src/__tests__/voice-flow-integration.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLOW-01 | Narration TTS completes before mic opens | integration | `npm test -- src/__tests__/flow-sequencing.test.ts::FLOW-01` | ❌ Wave 0 |
| FLOW-02 | Question TTS plays in PERGUNTA before AGUARDANDO | integration | `npm test -- src/__tests__/flow-sequencing.test.ts::FLOW-02` | ❌ Wave 0 |
| FLOW-03 | TIMEOUT_REDIRECT text plays only after timeout | integration | `npm test -- src/__tests__/voice-flow-integration.test.ts::FLOW-11` | ✅ (existing) |
| FLOW-04 | No TTS overlaps at decision points | integration | `npm test -- src/__tests__/flow-sequencing.test.ts::FLOW-04` | ❌ Wave 0 |
| FLOW-05 | State transitions wait for TTS completion | integration | `npm test -- src/__tests__/flow-sequencing.test.ts::FLOW-05` | ❌ Wave 0 |
| MIC-01 | Mic starts only in AGUARDANDO | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts::MIC-01` | ❌ Wave 0 |
| MIC-02 | Mic starts only after TTS finishes | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts::MIC-02` | ❌ Wave 0 |
| MIC-03 | Recording captures full visitor response | unit | `npm test -- src/hooks/__tests__/useMicrophone.test.ts` | ✅ (existing) |
| MIC-04 | Stale blobs never processed in new state | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts::MIC-04` | ❌ Wave 0 |
| MIC-05 | Mic stops cleanly on state exit | unit | `npm test -- src/hooks/__tests__/useMicrophone.test.ts` | ✅ (existing) |

### Sampling Rate

- **Per task commit:** `npm test -- src/__tests__/flow-sequencing.test.ts src/__tests__/mic-lifecycle.test.ts`
- **Per wave merge:** `npm test -- src/__tests__/`
- **Phase gate:** Full suite green (`npm test`) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/flow-sequencing.test.ts` — covers FLOW-01, FLOW-02, FLOW-04, FLOW-05
- [ ] `src/__tests__/mic-lifecycle.test.ts` — covers MIC-01, MIC-02, MIC-04
- [ ] Update `src/components/experience/OracleExperience.tsx` — integrate TTS-gated transitions
- [ ] Verify TTS services use 'ended' event pattern — check MockTTSService and ElevenLabsTTSService

## Sources

### Primary (HIGH confidence)

- [MediaRecorder - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) - MediaRecorder API lifecycle and best practices
- [MediaRecorder: stop() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/stop) - Proper cleanup patterns
- [MediaStream Recording API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) - Track management and cleanup
- Phase 7 implementation files (useVoiceChoice.ts, useTTSOrchestrator.ts, useMicrophone.ts) - Verified current architecture

### Secondary (MEDIUM confidence)

- [XState v5 is here | Stately.ai](https://stately.ai/blog/2023-12-01-xstate-v5) - XState v5 actions execute in order, events preserved through eventless transitions
- [@xstate/react docs | Stately.ai](https://stately.ai/docs/xstate-react) - useMachine hook and React integration patterns
- [How to Use useReducer as a Finite State Machine | Kyle Shevlin](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - FSM pattern with useReducer
- [React useReducer: Complex State Management | Medium](https://yakhil25.medium.com/react-usereducer-complex-state-management-214ae30061b5) - useReducer for coordinating multiple related state updates

### Tertiary (LOW confidence)

- [State Management in 2026: Redux, Context API, and Modern Patterns | Nucamp](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - General state management trends (not specific to voice UI)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All libraries verified in package.json, versions confirmed
- Architecture: HIGH - Phase 7 code reviewed, patterns verified in existing implementation
- Pitfalls: HIGH - Identified from Web Audio API docs + Phase 7 bug fixes + XState semantics
- Code examples: HIGH - Derived from existing Phase 7 implementation and MDN documentation
- Test framework: HIGH - Vitest config and existing test files verified

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days - stable APIs, no breaking changes expected in React 19, XState 5, or Web APIs)
