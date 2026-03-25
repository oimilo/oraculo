# Phase 7: Voice Architecture Refactor - Research

**Researched:** 2026-03-25
**Domain:** React hooks architecture, state machine coupling, async test patterns
**Confidence:** HIGH

## Summary

This phase addresses technical debt in the voice choice orchestration layer. The current implementation works but has ambiguous lifecycle states, coupling between TTS orchestration and voice choice logic, and rigid state machine choice handlers. These issues cause flakiness in integration tests and make the system fragile to timing changes.

The research identifies three refactoring targets: (1) useVoiceChoice hook needs explicit finite state machine pattern with idle/listening/processing/decided states, (2) TTS orchestration and voice choice should communicate via events not shared refs, (3) state machine choice points should use generic guard patterns that accept any option set.

Testing strategy shifts from mocking all timing to running tests with realistic async delays (MSW delay patterns) to catch timing bugs that pure mocks hide.

**Primary recommendation:** Refactor useVoiceChoice to useReducer-based finite state machine, extract TTS orchestration into separate hook, implement generic XState guard factory for choice points.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUAL-01 | useVoiceChoice refactored with clear lifecycle phases (idle/listening/processing/decided) | useReducer FSM pattern, explicit state transitions, eliminates ambiguous states |
| QUAL-02 | TTS orchestration decoupled from voice choice logic (no shared mutable state) | Separate hooks, event-based communication, ref isolation patterns |
| QUAL-03 | State machine choice points are generic/extensible for future branches | XState guard factory, parameterized transitions, type-safe event mapping |
| QUAL-04 | All voice flow integration tests pass with real service timing patterns | MSW realistic delays, waitFor best practices, no fake timers in integration tests |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | Hook lifecycle management | Already in use, hooks are standard state pattern |
| XState | 5.20.0 | State machine orchestration | Already in use, v5 supports generic guards |
| @xstate/react | 6.1.0 | React XState integration | Already in use, useMachine hook |
| Vitest | 4.1.1 | Test framework | Already in use, fast async support |
| @testing-library/react | 16.3.2 | Hook testing utilities | Already in use, renderHook + waitFor |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MSW | Latest (if added) | Mock service delays | For realistic async testing patterns |
| standardized-audio-context-mock | 9.7.28 | Audio API mocking | Already in use for Web Audio tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer FSM | XState hook in component | useReducer lighter weight, XState overkill for single hook state |
| Event emitter pattern | Direct function calls | Events decouple but add complexity, use refs for simple cases |
| MSW realistic delays | Fake timers everywhere | Fake timers miss timing bugs, MSW closer to production |

**Installation:**
```bash
# No new dependencies needed - refactoring existing code
# Optional MSW for enhanced testing (not required):
npm install -D msw@latest
```

**Version verification:** All packages already installed per package.json (read 2026-03-25). No version updates needed for this phase.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useVoiceChoice.ts          # Refactor to FSM pattern
│   ├── useTTSOrchestrator.ts      # Extract from OracleExperience
│   ├── useMicrophone.ts           # No changes (already clean)
│   └── __tests__/
│       ├── useVoiceChoice.test.ts # Add FSM state tests
│       └── useTTSOrchestrator.test.ts
├── machines/
│   ├── oracleMachine.ts           # Add generic guard factory
│   └── guards/
│       └── createChoiceGuard.ts   # Generic choice point guard
└── __tests__/
    └── voice-flow-integration.test.ts # Add realistic delay tests
```

### Pattern 1: useReducer-based Finite State Machine

**What:** Replace useState-based lifecycle with useReducer FSM that explicitly models idle → listening → processing → decided → idle transitions.

**When to use:** When hook has multiple boolean flags (isListening, isProcessing, needsFallback) that create ambiguous combinations.

**Example:**
```typescript
// Source: https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/
type VoiceState =
  | { status: 'idle'; choiceResult: null }
  | { status: 'listening'; startTime: number }
  | { status: 'processing'; audioBlob: Blob }
  | { status: 'decided'; choiceResult: VoiceChoiceResult }
  | { status: 'fallback'; attempt: number };

type VoiceAction =
  | { type: 'START_LISTENING' }
  | { type: 'AUDIO_CAPTURED'; blob: Blob }
  | { type: 'CHOICE_DECIDED'; result: VoiceChoiceResult }
  | { type: 'NEED_FALLBACK' }
  | { type: 'RESET' };

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  // Explicit state transitions - invalid transitions return current state
  if (state.status === 'idle' && action.type === 'START_LISTENING') {
    return { status: 'listening', startTime: Date.now() };
  }
  if (state.status === 'listening' && action.type === 'AUDIO_CAPTURED') {
    return { status: 'processing', audioBlob: action.blob };
  }
  // ... all valid transitions
  return state; // Invalid transition - stay in current state
}

export function useVoiceChoice(config: ChoiceConfig, active: boolean) {
  const [state, dispatch] = useReducer(voiceReducer, { status: 'idle', choiceResult: null });

  // Derived flags for backward compatibility
  const isListening = state.status === 'listening';
  const isProcessing = state.status === 'processing';
  const choiceResult = state.status === 'decided' ? state.choiceResult : null;

  return { state, isListening, isProcessing, choiceResult };
}
```

**Benefits:**
- Eliminates impossible states (e.g., isListening=true + isProcessing=true)
- Makes valid transitions explicit and testable
- Easier to visualize state flow (can generate diagrams)
- Matches mental model of voice pipeline lifecycle

### Pattern 2: Event-Based Hook Decoupling

**What:** Separate TTS orchestration from voice choice using event callbacks instead of shared mutable refs.

**When to use:** When two hooks need to coordinate but shouldn't share state (low coupling).

**Example:**
```typescript
// Source: https://thelinuxcode.com/react-custom-hooks-in-2026-a-practical-guide-to-cleaner-components-fewer-bugs-and-faster-product-delivery/

// Separate TTS orchestration hook
export function useTTSOrchestrator(phase: NarrativePhase) {
  const ttsRef = useRef<TTSService | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (segments: SpeechSegment[]) => {
    setIsSpeaking(true);
    await ttsRef.current?.speak(segments, PHASE_VOICE_SETTINGS[phase]);
    setIsSpeaking(false);
  }, [phase]);

  return { isSpeaking, speak, cancel: () => ttsRef.current?.cancel() };
}

// Voice choice communicates via callbacks, not shared state
export function useVoiceChoice(config: ChoiceConfig, active: boolean, onNeedFallback: () => void) {
  // ... FSM logic

  useEffect(() => {
    if (state.status === 'fallback') {
      onNeedFallback(); // Notify parent, don't reach into TTS directly
    }
  }, [state.status, onNeedFallback]);
}

// In component: wire them together with callbacks
function OracleExperience() {
  const tts = useTTSOrchestrator(state.context.currentPhase);

  const handleFallback = useCallback(async () => {
    const fallbackScript = getFallbackScript(state);
    await tts.speak(fallbackScript);
    voiceChoice.restart(); // After TTS completes
  }, [state, tts, voiceChoice]);

  const voiceChoice = useVoiceChoice(activeChoiceConfig, isAguardando, handleFallback);
}
```

**Benefits:**
- TTS orchestration can be tested independently
- Voice choice doesn't need TTS service reference
- Clear responsibility boundaries
- Easy to swap TTS implementation

### Pattern 3: Generic XState Guards with Type Safety

**What:** Create factory function that generates type-safe guards for any choice point configuration.

**When to use:** When state machine has multiple choice points with same pattern but different options.

**Example:**
```typescript
// Source: https://stately.ai/docs/guards (XState v5)

// Generic guard factory
export function createChoiceGuard<T extends string>(
  contextField: keyof OracleContext,
  expectedValue: T
) {
  return ({ context }: { context: OracleContext }) => {
    return context[contextField] === expectedValue;
  };
}

// Usage in machine setup
export const oracleMachine = setup({
  guards: {
    // INFERNO choice guards
    isInfernoChoiceA: createChoiceGuard('choice1', 'A'),
    isInfernoChoiceB: createChoiceGuard('choice1', 'B'),

    // PURGATORIO_A choice guards
    isPurgatorioAFicar: createChoiceGuard('choice2', 'FICAR'),
    isPurgatorioAEmbora: createChoiceGuard('choice2', 'EMBORA'),

    // PURGATORIO_B choice guards
    isPurgatorioBPisar: createChoiceGuard('choice2', 'PISAR'),
    isPurgatorioBContornar: createChoiceGuard('choice2', 'CONTORNAR'),
  },
}).createMachine({
  // ... states
  DEVOLUCAO: {
    always: [
      { target: 'DEVOLUCAO_A_FICAR', guard: 'isInfernoChoiceA' and 'isPurgatorioAFicar' },
      // ... other paths
    ],
  },
});
```

**Benefits:**
- Single guard implementation for all choice points
- Type-safe - compiler catches wrong context fields
- Easy to add new choice points without duplication
- XState v5 supports higher-order guards (and, or, not)

### Pattern 4: Realistic Delay Testing with MSW

**What:** Use MSW delay() function to simulate real service timing instead of fake timers.

**When to use:** Integration tests that verify timing-dependent behavior (e.g., audio blob processing after capture).

**Example:**
```typescript
// Source: https://mswjs.io/docs/api/delay/

import { http, delay } from 'msw';
import { setupServer } from 'msw/node';

// Mock STT/NLU with realistic delays
const server = setupServer(
  http.post('/api/stt', async () => {
    await delay('real'); // 100-400ms realistic delay
    return HttpResponse.json({ transcript: 'vozes' });
  }),
  http.post('/api/nlu', async () => {
    await delay('real');
    return HttpResponse.json({ choice: 'A', confidence: 0.85 });
  })
);

describe('Voice Flow Integration with realistic timing', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('processes audio blob after capture completes', async () => {
    const { result } = renderHook(() => useVoiceChoice(config, true));

    // Start listening - microphone captures for 6s
    await act(async () => {
      await result.current.startListening();
    });

    // Wait for audio capture to complete (realistic timing)
    await waitFor(() => {
      expect(result.current.audioBlob).not.toBeNull();
    }, { timeout: 7000 });

    // Wait for STT + NLU processing (realistic delays via MSW)
    await waitFor(() => {
      expect(result.current.choiceResult).not.toBeNull();
    });

    expect(result.current.choiceResult.eventType).toBe('CHOICE_A');
  });
});
```

**Benefits:**
- Catches race conditions that fake timers hide
- Tests match production timing patterns
- No timer coordination between test and implementation
- Exposes real async bugs before production

### Anti-Patterns to Avoid

- **Multiple boolean lifecycle flags:** Using isListening + isProcessing + needsFallback creates 8 possible states when only 5 are valid. Use explicit FSM states instead.
- **Shared mutable refs between hooks:** ttsRef shared by TTS hook and voice choice hook couples them tightly. Use callbacks for coordination.
- **Copy-paste guards in state machine:** Duplicating guard logic for each choice point makes changes error-prone. Use guard factory.
- **Fake timers in integration tests:** vi.useFakeTimers() hides timing bugs because everything is synchronous. Use MSW realistic delays.
- **waitFor with side effects:** Calling dispatch() inside waitFor callback can run multiple times. Put only assertions in waitFor, side effects outside.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finite state machine in hook | Multiple useState flags + useEffect chains | useReducer with FSM pattern | Invalid state combinations, race conditions, hard to test all transitions |
| Audio recorder lifecycle | Custom MediaRecorder wrapper with manual cleanup | Existing useMicrophone hook (already correct) | Already handles stream cleanup, auto-stop timer, MIME fallback |
| XState guard composition | Manual boolean logic in guards | XState v5 higher-order guards (and, or, not) | Type-safe, composable, less error-prone |
| Mock service delays | setTimeout in test mocks | MSW delay('real') | Realistic timing, no coordination between test and impl |

**Key insight:** State management bugs in async React hooks come from ambiguous states and tight coupling. Explicit FSM pattern + event-based decoupling eliminates entire classes of bugs that no amount of testing can catch in coupled code.

## Common Pitfalls

### Pitfall 1: Treating useReducer FSM as Over-Engineering

**What goes wrong:** Developers see useReducer FSM pattern and think "this is too complex for a simple hook, useState is fine."

**Why it happens:** FSM looks verbose compared to 3-4 useState declarations. But useState creates implicit state machine where valid transitions are scattered across useEffects.

**How to avoid:** Count the number of possible states with current boolean flags. If you have 3 booleans (isListening, isProcessing, needsFallback), that's 2^3 = 8 possible states. How many are actually valid? If < 8, you have impossible states that will cause bugs. FSM makes valid states explicit.

**Warning signs:**
- Unit test has to set multiple flags to reach desired state
- Adding new feature requires checking multiple boolean combinations
- Race condition bugs appear when adding setTimeout/async logic

### Pitfall 2: Coupling Hooks via Shared Refs

**What goes wrong:** Two hooks share a ref (e.g., ttsRef) to coordinate. Changes to one hook break the other.

**Why it happens:** Refs seem like "harmless" shared state because they don't trigger re-renders. But they create hidden coupling that's invisible in component code.

**How to avoid:** If hook B needs to call methods on hook A, pass callback from A to B instead of passing ref.

**Example of coupling:**
```typescript
// BAD: Voice choice reaches into TTS ref
const tts = useTTSOrchestrator();
const voiceChoice = useVoiceChoice(config, active, tts.ref); // Tight coupling

// Inside useVoiceChoice
useEffect(() => {
  if (needsFallback) {
    ttsRef.current?.speak(fallbackScript); // Voice choice controls TTS
  }
}, [needsFallback]);
```

**Fixed with callbacks:**
```typescript
// GOOD: Voice choice emits event, parent coordinates
const tts = useTTSOrchestrator();
const voiceChoice = useVoiceChoice(config, active, {
  onNeedFallback: () => tts.speak(fallbackScript)
});
```

**Warning signs:**
- Test for hook A requires mocking hook B
- Can't use hook A without hook B
- Changing hook B breaks tests for hook A

### Pitfall 3: Fake Timers Hide Real Timing Bugs

**What goes wrong:** Integration tests use vi.useFakeTimers() and vi.advanceTimersByTime(). All tests pass. In production, race conditions appear.

**Why it happens:** Fake timers make async code synchronous. Test runs in predictable order. But production has variable network delays, GC pauses, browser throttling.

**How to avoid:** Use fake timers for isolated unit tests (state machine timeouts). Use MSW realistic delays for integration tests (hook → service → state machine).

**Example:**
```typescript
// UNIT TEST: Fake timers OK - testing state machine logic only
it('timeouts to TIMEOUT_REDIRECT after 15s', () => {
  vi.useFakeTimers();
  const actor = createActor(oracleMachine);
  actor.start();
  // ... navigate to AGUARDANDO
  vi.advanceTimersByTime(15000);
  expect(actor.getSnapshot().matches({ INFERNO: 'TIMEOUT_REDIRECT' })).toBe(true);
  vi.useRealTimers();
});

// INTEGRATION TEST: Real delays - testing end-to-end timing
it('processes voice choice with realistic service delays', async () => {
  // MSW handlers with delay('real')
  const { result } = renderHook(() => useVoiceChoice(config, true));
  await act(() => result.current.startListening());

  // Wait for real async completion - no fake timers
  await waitFor(() => {
    expect(result.current.choiceResult).not.toBeNull();
  }, { timeout: 10000 });
});
```

**Warning signs:**
- Tests pass in < 100ms but production takes seconds
- Race condition bugs never appear in tests
- Adding real network calls breaks tests that worked with mocks

### Pitfall 4: waitFor with Assertion Loops

**What goes wrong:** Test puts logic inside waitFor callback that runs on every 50ms poll. Side effects execute multiple times.

**Why it happens:** Misunderstanding waitFor as "wait then run" when it's actually "poll until true."

**How to avoid:** Only assertions in waitFor. Side effects (dispatch, API calls) go outside.

**Example:**
```typescript
// BAD: dispatch runs on every poll (20x in 1 second)
await waitFor(() => {
  dispatch({ type: 'CHECK_COMPLETE' }); // Side effect - runs repeatedly!
  expect(result.current.isComplete).toBe(true);
});

// GOOD: dispatch once, wait for result
act(() => {
  dispatch({ type: 'CHECK_COMPLETE' });
});
await waitFor(() => {
  expect(result.current.isComplete).toBe(true);
});
```

**Warning signs:**
- Mock function called 10+ times when test expects 1 call
- Console logs appear multiple times
- Test is slow (waiting full timeout instead of resolving immediately)

## Code Examples

Verified patterns from official sources and current codebase:

### Hook FSM Pattern with useReducer
```typescript
// Source: https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/
// Applied to useVoiceChoice refactor

type VoiceLifecycle =
  | { phase: 'idle' }
  | { phase: 'listening'; startedAt: number }
  | { phase: 'processing'; blob: Blob; attempt: number }
  | { phase: 'decided'; result: VoiceChoiceResult }
  | { phase: 'fallback'; attempt: number };

type VoiceEvent =
  | { type: 'START_LISTENING' }
  | { type: 'AUDIO_READY'; blob: Blob }
  | { type: 'TRANSCRIPTION_COMPLETE'; transcript: string }
  | { type: 'CLASSIFICATION_COMPLETE'; classification: ClassificationResult; config: ChoiceConfig }
  | { type: 'NEED_FALLBACK' }
  | { type: 'RESET' };

function voiceLifecycleReducer(state: VoiceLifecycle, event: VoiceEvent): VoiceLifecycle {
  // Explicit transition table - invalid transitions are no-ops
  switch (state.phase) {
    case 'idle':
      if (event.type === 'START_LISTENING') {
        return { phase: 'listening', startedAt: Date.now() };
      }
      break;

    case 'listening':
      if (event.type === 'AUDIO_READY') {
        return { phase: 'processing', blob: event.blob, attempt: 1 };
      }
      break;

    case 'processing':
      if (event.type === 'CLASSIFICATION_COMPLETE') {
        const { classification, config } = event;
        const threshold = config.confidenceThreshold ?? 0.7;

        if (classification.confidence >= threshold) {
          const eventType = classification.choice === 'A'
            ? config.eventMap.A
            : config.eventMap.B;
          return {
            phase: 'decided',
            result: {
              eventType,
              confidence: classification.confidence,
              transcript: event.transcript || '',
              wasDefault: false,
            },
          };
        } else if (state.attempt >= (config.maxAttempts ?? 2)) {
          // Max attempts - use default
          return {
            phase: 'decided',
            result: {
              eventType: config.defaultEvent ?? config.eventMap.B,
              confidence: classification.confidence,
              transcript: event.transcript || '',
              wasDefault: true,
            },
          };
        } else {
          // Low confidence - need fallback
          return { phase: 'fallback', attempt: state.attempt };
        }
      }
      break;

    case 'fallback':
      if (event.type === 'START_LISTENING') {
        // Retry after fallback TTS
        return { phase: 'listening', startedAt: Date.now() };
      }
      break;

    case 'decided':
      if (event.type === 'RESET') {
        return { phase: 'idle' };
      }
      break;
  }

  // Invalid transition - return current state unchanged
  return state;
}

export function useVoiceChoice(config: ChoiceConfig, active: boolean) {
  const [lifecycle, dispatch] = useReducer(voiceLifecycleReducer, { phase: 'idle' });

  // Derived state for backward compatibility
  const isListening = lifecycle.phase === 'listening';
  const isProcessing = lifecycle.phase === 'processing';
  const needsFallback = lifecycle.phase === 'fallback';
  const choiceResult = lifecycle.phase === 'decided' ? lifecycle.result : null;

  // Auto-start when activated
  useEffect(() => {
    if (active) {
      dispatch({ type: 'START_LISTENING' });
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [active]);

  return {
    lifecycle, // Expose full state for debugging
    isListening,
    isProcessing,
    needsFallback,
    choiceResult,
    dispatch, // Allow external transitions
  };
}
```

### XState v5 Generic Guard Factory
```typescript
// Source: https://stately.ai/docs/guards (XState v5 typed guards)

import { setup, assign } from 'xstate';
import type { OracleContext, OracleEvent } from './oracleMachine.types';

// Generic guard factory with type safety
export function createChoiceGuard(
  choiceField: 'choice1' | 'choice2',
  expectedValue: string
) {
  return ({ context }: { context: OracleContext }) => {
    return context[choiceField] === expectedValue;
  };
}

// Compose guards using XState v5 higher-order guards
export const oracleMachine = setup({
  guards: {
    // INFERNO guards
    choseVozes: createChoiceGuard('choice1', 'A'),
    choseSilencio: createChoiceGuard('choice1', 'B'),

    // PURGATORIO_A guards
    choseFicar: createChoiceGuard('choice2', 'FICAR'),
    choseEmbora: createChoiceGuard('choice2', 'EMBORA'),

    // PURGATORIO_B guards
    chosePisar: createChoiceGuard('choice2', 'PISAR'),
    choseContornar: createChoiceGuard('choice2', 'CONTORNAR'),

    // Compound guards using and()
    pathAFicar: and(['choseVozes', 'choseFicar']),
    pathAEmbora: and(['choseVozes', 'choseEmbora']),
    pathBPisar: and(['choseSilencio', 'chosePisar']),
    pathBContornar: and(['choseSilencio', 'choseContornar']),
  },
}).createMachine({
  // ... states
  DEVOLUCAO: {
    always: [
      { target: 'DEVOLUCAO_A_FICAR', guard: 'pathAFicar' },
      { target: 'DEVOLUCAO_A_EMBORA', guard: 'pathAEmbora' },
      { target: 'DEVOLUCAO_B_PISAR', guard: 'pathBPisar' },
      { target: 'DEVOLUCAO_B_CONTORNAR', guard: 'pathBContornar' },
    ],
  },
});
```

### MSW Realistic Delay Testing
```typescript
// Source: https://mswjs.io/docs/api/delay/ + https://testing-library.com/docs/dom-testing-library/api-async/

import { http, delay, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { useVoiceChoice } from '../useVoiceChoice';

// Mock API with realistic delays
const server = setupServer(
  http.post('/api/stt', async () => {
    await delay('real'); // 100-400ms realistic delay
    return HttpResponse.json({ transcript: 'vozes' });
  }),

  http.post('/api/nlu', async () => {
    await delay('real');
    return HttpResponse.json({
      choice: 'A',
      confidence: 0.85,
      reasoning: 'Clear match for vozes',
    });
  })
);

describe('Voice Choice with realistic timing', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('handles full pipeline with realistic service delays', async () => {
    const config = {
      questionContext: 'Inferno choice',
      options: { A: 'vozes', B: 'silêncio' },
      eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
    };

    const { result } = renderHook(() => useVoiceChoice(config, true));

    // Hook auto-starts when active=true
    expect(result.current.isListening).toBe(true);

    // Simulate audio capture completion after 6s
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 6000));
      // useMicrophone auto-stops and produces audioBlob
    });

    // Wait for STT processing (realistic delay via MSW)
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    // Wait for NLU processing and final result
    await waitFor(() => {
      expect(result.current.choiceResult).not.toBeNull();
    }, { timeout: 10000 });

    expect(result.current.choiceResult).toEqual({
      eventType: 'CHOICE_A',
      confidence: 0.85,
      transcript: 'vozes',
      wasDefault: false,
    });
  });

  it('handles low confidence with fallback cycle', async () => {
    // Override NLU to return low confidence first, then high
    let attempt = 0;
    server.use(
      http.post('/api/nlu', async () => {
        await delay('real');
        attempt += 1;
        return HttpResponse.json({
          choice: 'A',
          confidence: attempt === 1 ? 0.5 : 0.9, // Low then high
          reasoning: attempt === 1 ? 'Ambiguous' : 'Clear',
        });
      })
    );

    const { result } = renderHook(() => useVoiceChoice(config, true));

    // First attempt: low confidence
    await waitFor(() => {
      expect(result.current.needsFallback).toBe(true);
    }, { timeout: 10000 });

    // After fallback TTS (simulated by parent), retry
    act(() => {
      result.current.dispatch({ type: 'START_LISTENING' });
    });

    // Second attempt: high confidence
    await waitFor(() => {
      expect(result.current.choiceResult).not.toBeNull();
    }, { timeout: 10000 });

    expect(result.current.choiceResult.confidence).toBe(0.9);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple useState hooks | useReducer FSM pattern | React 16.8+ hooks | Explicit states eliminate impossible combinations |
| Shared refs between hooks | Event-based callbacks | Custom hooks best practice 2024+ | Decoupling enables independent testing |
| XState v4 object-based guards | XState v5 setup() typed guards | XState v5.0 (Dec 2023) | Type safety, higher-order guards (and/or/not) |
| Fake timers for all async tests | MSW realistic delays for integration | MSW 2.0+ adoption 2024+ | Catches production timing bugs |
| getBy + waitFor pattern | findBy queries | Testing Library v12+ | Simpler async element queries |

**Deprecated/outdated:**
- **Multiple boolean lifecycle flags:** useState for isListening + isProcessing + needsFallback creates ambiguous states. Use useReducer FSM instead.
- **XState v4 guard syntax:** Object-based guards { target: 'X', cond: 'guard' } replaced by setup() typed guards in v5.
- **vi.advanceTimersByTime() for integration tests:** Hides real timing bugs. Use for unit tests only, MSW delays for integration.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUAL-01 | useVoiceChoice has explicit lifecycle states (idle/listening/processing/decided) | unit | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts -t "lifecycle states"` | ❌ Wave 0 |
| QUAL-02 | TTS orchestration decoupled from voice choice (no shared mutable state) | unit | `npm test -- src/hooks/__tests__/useTTSOrchestrator.test.ts` | ❌ Wave 0 |
| QUAL-03 | State machine choice points use generic handlers | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "generic guards"` | ✅ (extend) |
| QUAL-04 | Integration tests run against real service timing patterns | integration | `npm test -- src/__tests__/voice-flow-integration.test.ts -t "realistic timing"` | ✅ (extend) |

### Sampling Rate
- **Per task commit:** `npm test -- {changed file test}` (< 5s)
- **Per wave merge:** `npm test` (full suite, ~15s currently)
- **Phase gate:** Full suite green + manual verification of no fake timers in integration tests

### Wave 0 Gaps
- [ ] `src/hooks/__tests__/useVoiceChoice.test.ts` — add FSM lifecycle state tests (idle→listening→processing→decided transitions)
- [ ] `src/hooks/__tests__/useTTSOrchestrator.test.ts` — new file for extracted TTS hook
- [ ] `src/machines/__tests__/createChoiceGuard.test.ts` — test generic guard factory
- [ ] Extend `src/__tests__/voice-flow-integration.test.ts` — add MSW realistic delay tests

## Sources

### Primary (HIGH confidence)
- Current codebase implementation (useVoiceChoice.ts, useMicrophone.ts, oracleMachine.ts, OracleExperience.tsx) - read 2026-03-25
- [XState v5 Guards Documentation](https://stately.ai/docs/guards) - official XState v5 typed guards, higher-order guards
- [Testing Library Async Methods](https://testing-library.com/docs/dom-testing-library/api-async/) - waitFor, findBy official docs
- [MSW delay() API](https://mswjs.io/docs/api/delay/) - realistic delay patterns

### Secondary (MEDIUM confidence)
- [React Custom Hooks in 2026: A Practical Guide](https://thelinuxcode.com/react-custom-hooks-in-2026-a-practical-guide-to-cleaner-components-fewer-bugs-and-faster-product-delivery/) - hook decoupling patterns
- [How to Use useReducer as a Finite State Machine](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - FSM pattern with useReducer
- [React Testing Library: Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - waitFor best practices
- [State Management in React (2026): Hooks, Context API, and Redux](https://thelinuxcode.com/state-management-in-react-2026-hooks-context-api-and-redux-in-practice/) - explicit state patterns

### Tertiary (LOW confidence)
- [React Testing Library + Vitest: The Mistakes That Bite](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8) - Vitest async patterns (not officially verified)
- [Vitest and React Testing Library with Next.js 15 (2026)](https://noqta.tn/en/tutorials/vitest-react-testing-library-nextjs-unit-testing-2026) - Next.js specific patterns (not verified for O Oráculo's use case)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already installed, versions verified from package.json
- Architecture: HIGH - FSM and XState patterns verified from official docs, current codebase shows issues addressed
- Pitfalls: HIGH - derived from known bugs documented in STATE.md and test flakiness patterns
- Testing strategy: MEDIUM - MSW realistic delay pattern verified from official docs, but not yet tested in this codebase

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days - React hooks and XState are stable, testing patterns evolving slowly)
