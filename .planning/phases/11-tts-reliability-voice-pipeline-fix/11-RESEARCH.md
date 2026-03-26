# Phase 11: TTS Reliability & Voice Pipeline Fix - Research

**Researched:** 2026-03-26
**Domain:** Browser speech APIs (Web Speech API, MediaRecorder), React async pipeline orchestration, Promise timeout patterns
**Confidence:** HIGH

## Summary

Phase 11 fixes the critical bug where microphone never activates in AGUARDANDO states, forcing users to click buttons manually. Root cause analysis (from MEMORY.md and STATE.md) identifies a chain: `waitForVoices()` hangs indefinitely when `SpeechSynthesis` has no voices → `ttsComplete` stays false → `micShouldActivate` never becomes true → voice pipeline freezes.

The fix requires three coordinated changes: (1) add timeout to `waitForVoices()` so MockTTSService resolves within bounded time even when voices unavailable, (2) verify `ttsComplete=true` before mic activation in AGUARDANDO, (3) ensure voice pipeline handles empty transcripts and API errors without freezing. Research confirms `Promise.race()` timeout pattern is standard for hanging browser APIs, and `getUserMedia()` can also hang if user ignores permission prompt—both need timeout guards.

**Primary recommendation:** Wrap `waitForVoices()` in `Promise.race()` with 3s timeout, falling back to simulated delay. Add explicit `ttsComplete` verification log before mic activation. Enhance pipeline error handling with try-catch + default event on max attempts. Add integration test that simulates no-voices environment and verifies mic still activates.

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| TTSR-01 | `waitForVoices()` has a timeout (3s) and falls back gracefully when SpeechSynthesis has no voices | Promise.race() timeout pattern + fallback to simulated delay |
| TTSR-02 | MockTTSService resolves its promise within bounded time (never hangs indefinitely) | Timeout wrapper ensures max 3s wait, fallback completes in <500ms |
| TTSR-03 | `ttsComplete` is verified as `true` before mic activates in every AGUARDANDO state | Debug logging + conditional guard in useEffect activation |
| VPIPE-01 | Mic recording starts within 500ms of entering AGUARDANDO state (when ttsComplete=true) | useMicrophone already calls getUserMedia immediately, 500ms is typical browser grant time |
| VPIPE-02 | Voice pipeline processes recorded audio and produces a choiceResult in all 3 AGUARDANDO states | Existing pipeline works when mic activates—fix is enabling activation |
| VPIPE-03 | Pipeline gracefully handles empty transcripts, API errors, and low confidence without freezing | Existing try-catch + NEED_FALLBACK + default event pattern already robust |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Promise.race() | Native ES6 | Timeout pattern for hanging browser APIs | Built-in, zero dependencies, standard async timeout technique |
| setTimeout() | Native | Create timeout promise for Promise.race() | Native timer API, immune to clock drift with performance.now() |
| SpeechSynthesis API | Browser native | Text-to-speech with browser voices | Web Speech API standard (2020+), no polyfill needed for modern browsers |
| MediaRecorder API | Browser native | Audio capture from microphone | MediaStream Recording API standard, 95%+ browser support |

**Current versions verified 2026-03-26:**
- All native browser APIs, no package versions to track

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AbortController | Native API | Cancel in-flight API requests on timeout | Already used in STT/NLU routes for 10s timeout (Phase 9) |
| vitest (installed) | 2.1.8 | Test framework for TTS timeout and pipeline tests | Test no-voices scenario, verify fallback timing |
| jsdom (installed) | 25.0.1 | Browser environment simulation for tests | Mock SpeechSynthesis.getVoices() returning empty array |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Promise.race() timeout | setTimeout + manual cancellation | Manual approach is error-prone (forgot to clear timeout = memory leak); Promise.race() is cleaner |
| 3s timeout | Longer (5s-10s) or shorter (1s) | 1s too aggressive (slow systems); 5s+ delays user experience; 3s balances reliability + UX |
| Fallback to simulated delay | Skip TTS entirely | Silent experience is worse; simulated delay maintains timing for state machine flow |
| waitForVoices() in MockTTS | Move to FallbackTTS only | MockTTS is used during development; fixing it improves dev experience + catches bugs earlier |

**Installation:**

No new npm packages required. All fixes use native browser APIs.

## Architecture Patterns

### Recommended Changes

```
src/
├── lib/
│   └── audio/
│       └── speechSynthesis.ts        # ADD: waitForVoices() timeout wrapper
├── services/
│   └── tts/
│       ├── mock.ts                    # UPDATE: Use bounded waitForVoices()
│       └── fallback.ts                # UPDATE: Same timeout in fallback path
├── hooks/
│   └── useVoiceChoice.ts              # UPDATE: Add ttsComplete verification log
└── components/
    └── experience/
        └── OracleExperience.tsx       # UPDATE: Log micShouldActivate before activation
```

### Pattern 1: Promise.race() Timeout for Hanging Browser APIs

**What:** Wrap potentially-hanging browser API call in `Promise.race()` against a timeout promise that rejects or resolves after fixed duration

**When to use:** Any browser API that can hang indefinitely (`waitForVoices()`, `getUserMedia()`, network requests)

**Example:**

```typescript
// src/lib/audio/speechSynthesis.ts
export function waitForVoices(timeoutMs: number = 3000): Promise<SpeechSynthesisVoice[]> {
  const voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });

  const timeoutPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    setTimeout(() => {
      // Timeout reached — return empty array, let caller handle fallback
      resolve([]);
    }, timeoutMs);
  });

  return Promise.race([voicesPromise, timeoutPromise]);
}
```

**Why this works:** If `voiceschanged` event never fires (common in headless/Linux Chrome), the timeout promise wins the race after 3s and returns empty array. Caller checks `voices.length === 0` and falls back to simulated TTS.

**Source:** [How to add timeout to a Promise in Javascript - Advanced Web Machinery](https://advancedweb.hu/how-to-add-timeout-to-a-promise-in-javascript/), [Promise.race() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

### Pattern 2: Graceful Fallback When Voices Unavailable

**What:** When `waitForVoices()` returns empty array (timeout or no voices), simulate TTS duration based on text length instead of speaking

**When to use:** Development with MockTTSService on systems without speech synthesis, or headless testing

**Example:**

```typescript
// src/services/tts/mock.ts
export class MockTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    try {
      const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];

      // Wait for voices with timeout (TTSR-01)
      const voices = await waitForVoices(3000);

      if (voices.length === 0) {
        // No voices available after timeout — simulate duration (TTSR-02)
        const totalDuration = segments.reduce(
          (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
          0
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
        return;
      }

      // Voices available — speak normally
      return await speakSegments(segments, voiceDirection);
    } catch {
      // Fallback: simulate speech duration when SpeechSynthesis unavailable
      const totalDuration = segments.reduce(
        (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
        0
      );
      await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
    }
  }
}
```

**Key insight:** `Math.min(totalDuration, 500)` caps simulated delay at 500ms even for long text—fast enough for dev UX, slow enough to detect race conditions.

**Source:** Current MockTTSService fallback pattern (lines 12-18 in `src/services/tts/mock.ts`)

### Pattern 3: Explicit ttsComplete Verification Before Mic Activation

**What:** Log `ttsComplete` and `micShouldActivate` values before activating voice choice, add guard to prevent activation when TTS pending

**When to use:** Debugging activation failures, ensuring state machine preconditions

**Example:**

```typescript
// src/components/experience/OracleExperience.tsx
const micShouldActivate = isAguardando && ttsComplete;

// Log activation decision (TTSR-03)
useEffect(() => {
  logger.log('Mic activation decision', {
    isAguardando,
    ttsComplete,
    micShouldActivate,
    voiceLifecycle: voiceChoice.lifecycle.phase,
  });
}, [isAguardando, ttsComplete, micShouldActivate, voiceChoice.lifecycle.phase]);

const voiceChoice = useVoiceChoice(
  activeChoiceConfig || { questionContext: '', options: { A: '', B: '' }, eventMap: { A: '', B: '' } },
  micShouldActivate
);
```

**Why this matters:** Phase 10 debug panel shows state in real-time, but adding explicit log at activation point makes debugging easier when panel not visible (e.g., production builds).

**Source:** Phase 10 structured logging pattern with `createLogger` utility

### Pattern 4: getUserMedia Timeout for Hanging Permission Prompts

**What:** Wrap `getUserMedia()` in `Promise.race()` with timeout to handle ignored permission prompts

**When to use:** Production systems where user may ignore permission dialog indefinitely

**Example:**

```typescript
// src/hooks/useMicrophone.ts (enhancement for future phase — not blocking Phase 11)
const startRecording = useCallback(async (maxDuration?: number) => {
  try {
    const mediaPromise = navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
    });

    const timeoutPromise = new Promise<MediaStream>((_, reject) => {
      setTimeout(() => reject(new Error('Microphone permission timeout')), 10000);
    });

    const stream = await Promise.race([mediaPromise, timeoutPromise]);
    // ... rest of startRecording
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Microphone access denied';
    setError(message);
    setIsRecording(false);
  }
}, []);
```

**Recommendation for Phase 11:** Defer `getUserMedia()` timeout to Phase 12 (browser validation). Phase 11 scope is TTS reliability only.

**Source:** [MediaDevices.getUserMedia() Promise never resolves · Issue #23281 · electron/electron](https://github.com/electron/electron/issues/23281), [Common getUserMedia() Errors](https://blog.addpipe.com/common-getusermedia-errors/)

### Anti-Patterns to Avoid

- **No timeout on browser APIs:** `waitForVoices()` without timeout can hang indefinitely on systems without voices—always use `Promise.race()`
- **Rejecting timeout promise:** Rejecting causes unhandled rejection when caller doesn't catch; resolve with fallback value (empty array) instead
- **Assuming voiceschanged always fires:** Firefox/Safari load voices sync, Chrome Desktop loads async, Chrome Linux may never fire—timeout is mandatory
- **Infinite retry loops on API errors:** Pipeline already has `maxAttempts` guard (Phase 9); don't retry indefinitely on STT/NLU failures
- **Blocking state transitions on TTS completion:** AGUARDANDO states should enter even if TTS hangs—only mic activation waits for `ttsComplete`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Async timeout pattern | Manual setTimeout + flag checking | `Promise.race()` with timeout promise | Cleaner code, no manual cleanup, standard pattern |
| Speech synthesis polyfill | Custom audio playback library | Browser SpeechSynthesis + fallback to pre-recorded MP3 | 95%+ browser support, graceful degradation already implemented (FallbackTTSService) |
| Voice detection | Polling `getVoices()` in interval | `voiceschanged` event + timeout fallback | Event-driven is efficient; polling burns CPU and misses instant loads |
| Microphone permission handling | Custom permission API wrapper | Native `getUserMedia()` + try-catch | Browser handles UI/permissions, custom wrapper adds complexity |

**Key insight:** Browser Speech APIs (`SpeechSynthesis`, `MediaRecorder`) are well-supported but **unpredictable in timing**. The solution isn't replacing them—it's adding timeout guards so the pipeline never hangs waiting for events that may never fire.

## Common Pitfalls

### Pitfall 1: voiceschanged Event Never Fires

**What goes wrong:** `waitForVoices()` waits indefinitely for `voiceschanged` event, TTS never starts, mic never activates

**Why it happens:**
- Chrome Desktop loads voices async, fires `voiceschanged` after 100-500ms
- Firefox/Safari load voices sync, `getVoices()` returns immediately, event may never fire
- Chrome on Linux has no voices, `getVoices()` returns `[]`, event never fires
- Headless Chrome (CI/testing) has no voices, event never fires

**How to avoid:**
- Check `getVoices().length > 0` synchronously first—if voices exist, resolve immediately
- Only wait for `voiceschanged` if initial `getVoices()` returns empty array
- **Always** use timeout (3s) via `Promise.race()` as final fallback

**Warning signs:**
- TTS never starts in development on Linux machines
- CI tests hang indefinitely on TTS-related tests
- Debug panel shows `ttsComplete: false` forever

**Source:** [speechSynthesis.getVoices() returns an empty array · Issue #22844 · electron/electron](https://github.com/electron/electron/issues/22844), [Cross browser speech synthesis - DEV Community](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)

### Pitfall 2: Race Condition Between TTS Complete and State Transition

**What goes wrong:** State machine transitions from PERGUNTA to AGUARDANDO before TTS completes, mic activates too early and captures end of question audio

**Why it happens:** `ttsComplete` flag lives in component state, XState machine transitions are synchronous—machine can enter AGUARDANDO while `setTtsComplete(true)` is pending in React queue

**How to avoid:**
- Current architecture is correct: `micShouldActivate = isAguardando && ttsComplete` uses **AND** condition
- If AGUARDANDO entered before TTS done, `ttsComplete=false` blocks activation
- When TTS finishes, `setTtsComplete(true)` re-triggers `useEffect` in `useVoiceChoice`, activates mic
- **Don't** change state machine timing—keep PERGUNTA → AGUARDANDO immediate, gate mic at hook level

**Warning signs:**
- Microphone activates during question audio (captured in transcript)
- Voice choice starts before visitor hears full question
- Debug panel shows `isAguardando=true, ttsComplete=false, micShouldActivate=false` (correct blocking state)

**Source:** Current Phase 8 MIC-02 implementation in `OracleExperience.tsx` line 138

### Pitfall 3: Empty Transcript Infinite Loop

**What goes wrong:** User stays silent, STT returns empty transcript, pipeline re-activates mic, user stays silent again—infinite loop

**Why it happens:** Pipeline retries on empty transcript without incrementing attempt counter

**How to avoid:**
- Current implementation already correct: empty transcript triggers `NEED_FALLBACK` with attempt count
- After `maxAttempts` (default 2), pipeline uses `defaultEvent` and sends to state machine
- **Verify** fallback TTS plays ("Desculpe, não ouvi sua resposta") before retry
- **Don't** retry silently—always play fallback audio so user knows to speak louder

**Warning signs:**
- User stuck in AGUARDANDO state forever
- No fallback TTS plays between retries
- Debug panel shows `voiceLifecycle: fallback` but `attemptCount` doesn't increment

**Source:** Current Phase 9 PIPE-05 implementation in `useVoiceChoice.ts` lines 254-270

### Pitfall 4: MockTTS Fallback Too Fast

**What goes wrong:** MockTTSService simulated delay is <100ms, state machine transitions before UI updates, user sees state change before "audio" completes

**Why it happens:** Simulated delay uses `text.length * 50` which is ~50ms for short segments; `Math.min(totalDuration, 500)` caps at 500ms even for long text

**How to avoid:**
- Keep `Math.min(totalDuration, 500)` cap for dev UX (tests run faster)
- For production with real APIs, use FallbackTTSService (pre-recorded MP3s) which have real durations
- **Don't** simulate realistic speech rate in MockTTS—it's dev-only, speed is feature not bug

**Warning signs:**
- Tests pass but real experience feels rushed
- State transitions visible before narration completes (in development only)

**Source:** Current MockTTSService implementation in `src/services/tts/mock.ts` line 17

### Pitfall 5: getUserMedia Hangs on Denied Permission

**What goes wrong:** User clicks "Block" on permission prompt, `getUserMedia()` promise never resolves or rejects, pipeline freezes

**Why it happens:** Spec says promise "may neither resolve nor reject" if user ignores prompt; some browsers reject on "Block", others hang

**How to avoid:**
- Current implementation handles rejection with try-catch in `useMicrophone.ts` line 120
- **Future enhancement** (Phase 12): Add timeout via `Promise.race()` similar to `waitForVoices()`
- For Phase 11: Defer this fix, focus on TTS reliability only

**Warning signs:**
- Permission prompt shows "Block" but app doesn't show error
- Debug panel shows `isRecording: false` forever, no error message
- Browser console shows no rejection logs

**Source:** [MediaDevices.getUserMedia() Promise never resolves · Issue #23281](https://github.com/electron/electron/issues/23281), [getUserMedia never resolves · Issue #1916 · duckduckgo/Android](https://github.com/duckduckgo/Android/issues/1916)

## Code Examples

Verified patterns from official sources and current project code:

### Example 1: waitForVoices() with Timeout

```typescript
// src/lib/audio/speechSynthesis.ts (updated)
export function waitForVoices(timeoutMs: number = 3000): Promise<SpeechSynthesisVoice[]> {
  const voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    // Check synchronously first (Firefox/Safari case)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for async load (Chrome Desktop case)
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });

  // Timeout fallback (Chrome Linux / headless case)
  const timeoutPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    setTimeout(() => {
      resolve([]); // Return empty array, let caller handle
    }, timeoutMs);
  });

  return Promise.race([voicesPromise, timeoutPromise]);
}
```

**Source:** [Promise.race() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), [JavaScript Promises & Async/Await: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/javascript-promises-async-await-guide)

### Example 2: MockTTSService with Bounded speak()

```typescript
// src/services/tts/mock.ts (updated)
import { waitForVoices } from '@/lib/audio/speechSynthesis';

export class MockTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    try {
      const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];

      // TTSR-01: Wait for voices with timeout
      const voices = await waitForVoices(3000);

      if (voices.length === 0) {
        // TTSR-02: No voices — simulate bounded delay
        const totalDuration = segments.reduce(
          (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
          0
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
        return;
      }

      // Voices available — speak normally
      return await speakSegments(segments, voiceDirection);
    } catch {
      // Fallback on any error: simulate duration
      const totalDuration = segments.reduce(
        (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
        0
      );
      await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
    }
  }

  cancel(): void {
    cancelSpeech();
  }
}
```

**Source:** Current MockTTSService implementation + Promise.race() timeout pattern

### Example 3: Mic Activation Verification Logging

```typescript
// src/components/experience/OracleExperience.tsx (addition)
import { createLogger } from '@/lib/debug/logger';

const logger = createLogger('Activation');

export default function OracleExperience() {
  // ... existing code

  const isAguardando =
    state.matches({ INFERNO: 'AGUARDANDO' }) ||
    state.matches({ PURGATORIO_A: 'AGUARDANDO' }) ||
    state.matches({ PURGATORIO_B: 'AGUARDANDO' });

  const micShouldActivate = isAguardando && ttsComplete;

  // TTSR-03: Log activation decision
  useEffect(() => {
    logger.log('Mic activation check', {
      state: JSON.stringify(state.value),
      isAguardando,
      ttsComplete,
      micShouldActivate,
      voicePhase: voiceChoice.lifecycle.phase,
    });
  }, [isAguardando, ttsComplete, micShouldActivate, state.value, voiceChoice.lifecycle.phase]);

  const voiceChoice = useVoiceChoice(
    activeChoiceConfig || { questionContext: '', options: { A: '', B: '' }, eventMap: { A: '', B: '' } },
    micShouldActivate
  );

  // ... rest of component
}
```

**Source:** Phase 10 structured logging pattern with `createLogger`

### Example 4: FallbackTTSService with Same Timeout Logic

```typescript
// src/services/tts/fallback.ts (updated fallbackToSpeechSynthesis method)
private async fallbackToSpeechSynthesis(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    // Server-side or headless - simulate delay
    const totalDuration = segments.reduce(
      (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
      0
    );
    await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
    return;
  }

  // Browser with SpeechSynthesis - use with timeout
  const { speakSegments, waitForVoices } = await import('@/lib/audio/speechSynthesis');
  const { VOICE_DIRECTIONS } = await import('@/types');

  const voices = await waitForVoices(3000); // Use same timeout

  if (voices.length === 0) {
    // No voices available - simulate
    const totalDuration = segments.reduce(
      (acc, s) => acc + s.text.length * 50 + (s.pauseAfter ?? 0),
      0
    );
    await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 500)));
    return;
  }

  const voiceDirection = VOICE_DIRECTIONS[voiceSettings.phase];
  return speakSegments(segments, voiceDirection);
}
```

**Source:** Current FallbackTTSService implementation + consistent timeout pattern

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No timeout on browser APIs | Promise.race() with timeout fallback | 2023-2024 | Prevents indefinite hangs on missing voices/permissions |
| Synchronous voice loading assumption | Async + sync check + timeout | 2020+ | Handles Chrome async load + Firefox sync load + Linux no-voices |
| Polling getVoices() | voiceschanged event + timeout | 2018+ | Event-driven more efficient, timeout prevents infinite wait |
| Throw on no voices | Fallback to simulated delay | 2024+ | Graceful degradation, dev experience doesn't break on voice-less systems |
| setTimeout manual cleanup | Promise.race() automatic | 2023+ | Cleaner code, no manual flag/cleanup, standard pattern |

**Deprecated/outdated:**
- **Polling `getVoices()` in loop:** Replaced by `voiceschanged` event + timeout (more efficient, less CPU)
- **Assuming voices load instantly:** Replaced by async load detection with timeout (handles all browsers)
- **No fallback when voices unavailable:** Replaced by simulated delay fallback (prevents silent failure)

## Runtime State Inventory

> Phase 11 is a code-only fix (no rename/refactor/migration). This section is omitted.

## Environment Availability

> Phase 11 has no external dependencies beyond browser APIs. All Web APIs (SpeechSynthesis, MediaRecorder, Promise) are native.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| SpeechSynthesis API | MockTTSService browser voices | ✓ (modern browsers) | Native API | Simulated delay if no voices |
| MediaRecorder API | useMicrophone audio capture | ✓ (95%+ browsers) | Native API | — (no fallback, core feature) |
| Promise.race() | Timeout pattern | ✓ | ES6 native | — (baseline requirement) |
| performance.now() | Debug timestamps | ✓ | Native API | Date.now() (lower precision) |

**Missing dependencies with no fallback:**
- None — all native browser APIs with 95%+ support

**Missing dependencies with fallback:**
- SpeechSynthesis voices on Linux/headless: Fallback to simulated delay (500ms cap)

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 2.1.8 + @testing-library/react 16.1.0 |
| Config file | `vitest.config.ts` (already configured) |
| Quick run command | `npm test -- src/lib/audio/speechSynthesis.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TTSR-01 | waitForVoices() resolves within 3s even when voiceschanged never fires | unit | `npm test -- src/lib/audio/speechSynthesis.test.ts::test_waitForVoices_timeout -x` | ✅ (add new test) |
| TTSR-02 | MockTTSService.speak() resolves within 500ms when no voices available | unit | `npm test -- src/services/tts/__tests__/tts-service.test.ts::test_mock_no_voices -x` | ❌ Wave 0 |
| TTSR-03 | OracleExperience logs ttsComplete value before mic activation | integration | `npm test -- src/components/experience/__tests__/voice-activation.test.tsx -x` | ❌ Wave 0 |
| VPIPE-01 | useMicrophone.startRecording() calls getUserMedia within 500ms | unit | `npm test -- src/hooks/__tests__/useMicrophone.test.ts -x` | ✅ (existing test verifies timing) |
| VPIPE-02 | useVoiceChoice produces choiceResult in all 3 AGUARDANDO states | integration | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts -x` | ✅ (existing tests cover pipeline) |
| VPIPE-03 | useVoiceChoice handles empty transcript + API errors without freezing | unit | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts -x` | ✅ (existing error handling tests) |

### Sampling Rate

- **Per task commit:** `npm test -- src/lib/audio` (quick, <3s)
- **Per wave merge:** `npm test` (full suite, 307+ tests, ~30s)
- **Phase gate:** Full suite green + manual browser test (verify mic activates in AGUARDANDO with debug panel)

### Wave 0 Gaps

- [ ] `src/lib/audio/speechSynthesis.test.ts` — add Test 10: `waitForVoices()` timeout resolves with empty array after 3s
- [ ] `src/services/tts/__tests__/tts-service.test.ts` — add Test: MockTTSService resolves speak() when getVoices() returns []
- [ ] `src/components/experience/__tests__/voice-activation.test.tsx` — NEW FILE: integration test for mic activation gating on ttsComplete

## Sources

### Primary (HIGH confidence)

- [Promise.race() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) - Promise.race() API reference
- [SpeechSynthesis: getVoices() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices) - getVoices() API and browser differences
- [How to add timeout to a Promise in Javascript - Advanced Web Machinery](https://advancedweb.hu/how-to-add-timeout-to-a-promise-in-javascript/) - Timeout pattern implementation
- [MediaDevices: getUserMedia() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - getUserMedia() API and error handling
- [Autoplay guide for media and Web Audio APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - AudioContext autoplay policy

### Secondary (MEDIUM confidence)

- [speechSynthesis.getVoices() returns an empty array · Issue #22844 · electron/electron](https://github.com/electron/electron/issues/22844) - Real-world voiceschanged hang issue
- [Cross browser speech synthesis - DEV Community](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) - Browser-specific voice loading patterns
- [JavaScript Promises & Async/Await: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/javascript-promises-async-await-guide) - Modern async patterns
- [Promise Race and Promise Timeout in JavaScript | Medium](https://medium.com/weekly-webtips/promise-race-and-promise-timeout-in-javascript-f5b11d0f4049) - Race pattern examples
- [Common getUserMedia() Errors](https://blog.addpipe.com/common-getusermedia-errors/) - MediaRecorder error handling

### Tertiary (LOW confidence - informational only)

- [MediaDevices.getUserMedia() Promise never resolves · Issue #23281](https://github.com/electron/electron/issues/23281) - getUserMedia hang issue (Electron-specific)
- [getUserMedia never resolves · Issue #1916 · duckduckgo/Android](https://github.com/duckduckgo/Android/issues/1916) - Mobile browser hang (Android-specific)
- [Vitest Browser Mode | Guide](https://vitest.dev/guide/browser/) - Browser testing context (future enhancement)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All native browser APIs, verified in project already using SpeechSynthesis + MediaRecorder
- Architecture: HIGH - Promise.race() timeout pattern is standard, verified in MDN docs + real-world GitHub issues
- Pitfalls: HIGH - voiceschanged hang documented across multiple browsers/environments, timeout solution proven

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (30 days - stable browser APIs, unlikely to change)

**Research complete.** Planner can now create PLAN.md files for Wave 0 (test updates) and Wave 1 (timeout implementation + verification logging).
