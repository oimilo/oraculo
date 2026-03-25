# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework & Setup

**Runner:**
- Vitest 2.1.8
- Config: `vitest.config.ts`

**Environment:**
- jsdom (via `environment: 'jsdom'`)
- Globals enabled (`globals: true`)
- Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`)

**Assertion Library:**
- Vitest built-in `expect` + `@testing-library/jest-dom` matchers

**React Testing:**
- `@testing-library/react` 16.1.0 (render, screen, renderHook, act, waitFor)
- `@vitejs/plugin-react` for JSX transform

**Audio Mocking:**
- `standardized-audio-context-mock` 9.7.28 in devDependencies (available but manual mocking preferred)

**Run Commands:**
```bash
npm test                # Run all tests once (vitest run)
npm run test:watch      # Watch mode (vitest)
npm run test:ui         # Vitest UI (vitest --ui)
```

## Test Organization

**Location:** Tests are in `__tests__/` subdirectories adjacent to source files.

**Pattern:**
```
src/
  machines/
    oracleMachine.ts
    oracleMachine.test.ts          # Co-located (exception for machine)
  services/
    tts/
      index.ts
      mock.ts
      elevenlabs.ts
      fallback.ts
      __tests__/
        tts-service.test.ts        # Interface/factory tests
        elevenlabs-tts.test.ts     # Real impl tests
        fallback-tts.test.ts       # Fallback impl tests
    stt/
      __tests__/
        stt-service.test.ts
        whisper-stt.test.ts
    nlu/
      __tests__/
        nlu-service.test.ts
        claude-nlu.test.ts
    analytics/
      __tests__/
        analytics-service.test.ts
    audio/
      __tests__/
        crossfader.test.ts
        ambient-player.test.ts
    station/
      __tests__/
        station-registry.test.ts
  hooks/
    __tests__/
      useMicrophone.test.ts
      useWaveform.test.ts
      useVoiceChoice.test.ts
      useSessionAnalytics.test.ts
  components/
    audio/
      __tests__/
        WaveformVisualizer.test.tsx
        ListeningIndicator.test.tsx
  lib/
    audio/
      audioContext.test.ts          # Co-located
      speechSynthesis.test.ts       # Co-located
  app/
    api/
      tts/__tests__/tts-route.test.ts
      stt/__tests__/stt-route.test.ts
      nlu/__tests__/nlu-route.test.ts
  __tests__/
    voice-flow-integration.test.ts  # Cross-cutting integration test
```

**Naming:**
- Test files: `{module-name}.test.ts` or `{component-name}.test.tsx`
- Use kebab-case for test filenames (e.g., `tts-service.test.ts`, `ambient-player.test.ts`)
- Integration tests: descriptive names (e.g., `voice-flow-integration.test.ts`)

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentOrModule', () => {
  // Setup
  beforeEach(() => {
    vi.useFakeTimers();  // For time-dependent tests
    // Mock setup
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Feature or behavior group', () => {
    it('should do specific thing', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Test Naming Styles:**
Two styles are used throughout the codebase:

1. **Numbered tests** (for requirement traceability):
   ```typescript
   it('Test 1: startSession stores a session with status "active"', () => { ... });
   it('Test 7: SessionRecord never contains audio blobs (ANA-02 compliance)', () => { ... });
   ```

2. **Descriptive tests** (for behavior documentation):
   ```typescript
   it('should transition from IDLE to APRESENTACAO on START and assign sessionId', () => { ... });
   it('returns default choice after 2 failed attempts (confidence < 0.7)', async () => { ... });
   ```

**For new tests:** Use descriptive style with "should" prefix. Numbered style exists from early phases.

## Coverage Summary

**Total: 213 tests passing, 24 test files, 0 failures**

| Area | Test File | Tests |
|------|-----------|-------|
| State Machine | `src/machines/oracleMachine.test.ts` | ~30 (all paths, timeouts, context) |
| TTS Interface | `src/services/tts/__tests__/tts-service.test.ts` | 5 |
| TTS ElevenLabs | `src/services/tts/__tests__/elevenlabs-tts.test.ts` | 8 |
| TTS Fallback | `src/services/tts/__tests__/fallback-tts.test.ts` | 6 |
| STT Interface | `src/services/stt/__tests__/stt-service.test.ts` | 3 |
| STT Whisper | `src/services/stt/__tests__/whisper-stt.test.ts` | ~6 |
| NLU Interface | `src/services/nlu/__tests__/nlu-service.test.ts` | 4 |
| NLU Claude | `src/services/nlu/__tests__/claude-nlu.test.ts` | ~6 |
| Analytics | `src/services/analytics/__tests__/analytics-service.test.ts` | 8 |
| Crossfader | `src/services/audio/__tests__/crossfader.test.ts` | 6 |
| Ambient Player | `src/services/audio/__tests__/ambient-player.test.ts` | 13 |
| Station Registry | `src/services/station/__tests__/station-registry.test.ts` | 7 |
| useMicrophone | `src/hooks/__tests__/useMicrophone.test.ts` | 8 |
| useWaveform | `src/hooks/__tests__/useWaveform.test.ts` | 7 |
| useVoiceChoice | `src/hooks/__tests__/useVoiceChoice.test.ts` | 14 |
| useSessionAnalytics | `src/hooks/__tests__/useSessionAnalytics.test.ts` | 6 |
| WaveformVisualizer | `src/components/audio/__tests__/WaveformVisualizer.test.tsx` | 8 |
| ListeningIndicator | `src/components/audio/__tests__/ListeningIndicator.test.tsx` | 8 |
| TTS API Route | `src/app/api/tts/__tests__/tts-route.test.ts` | 9 |
| STT API Route | `src/app/api/stt/__tests__/stt-route.test.ts` | ~6 |
| NLU API Route | `src/app/api/nlu/__tests__/nlu-route.test.ts` | ~6 |
| AudioContext | `src/lib/audio/audioContext.test.ts` | ~5 |
| SpeechSynthesis | `src/lib/audio/speechSynthesis.test.ts` | ~5 |
| Integration | `src/__tests__/voice-flow-integration.test.ts` | 7 |

**Coverage Gaps:**
- No tests for `src/components/experience/OracleExperience.tsx` (orchestrator, complex integration)
- No tests for `src/components/experience/PermissionScreen.tsx`
- No tests for `src/components/experience/StartButton.tsx`
- No tests for `src/components/experience/PhaseBackground.tsx`
- No tests for `src/components/experience/ChoiceButtons.tsx`
- No tests for `src/components/experience/EndFade.tsx`
- No tests for `src/hooks/useAmbientAudio.ts`
- No tests for `src/app/page.tsx` or `src/app/admin/page.tsx`
- No E2E tests

## Mock Patterns

### 1. Service Factory Mocking (vi.mock)

For testing hooks that depend on services, mock the factory function:
```typescript
vi.mock('../useMicrophone');
vi.mock('@/services/stt');
vi.mock('@/services/nlu');

// In beforeEach:
const { useMicrophone } = await import('../useMicrophone');
const { createSTTService } = await import('@/services/stt');
vi.mocked(useMicrophone).mockReturnValue(mockUseMicrophone);
vi.mocked(createSTTService).mockReturnValue(mockSTTService);
```
File: `src/hooks/__tests__/useVoiceChoice.test.ts`

### 2. Module Mocking with Dynamic Import

For mocking modules that need setup before import:
```typescript
const mockGetAudioContext = vi.fn();
vi.mock('@/lib/audio/audioContext', () => ({
  getAudioContext: mockGetAudioContext,
  initAudioContext: mockInitAudioContext,
}));

// Import AFTER mock setup
const { ElevenLabsTTSService } = await import('../elevenlabs');
```
File: `src/services/tts/__tests__/elevenlabs-tts.test.ts`

### 3. Browser API Mocking (vi.stubGlobal)

For mocking Web APIs not available in jsdom:
```typescript
vi.stubGlobal('navigator', {
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue(mockStream),
  },
});

vi.stubGlobal('MediaRecorder', MockMediaRecorderClass);
vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => { ... }));
```
File: `src/hooks/__tests__/useMicrophone.test.ts`

### 4. localStorage Mocking

Two patterns used:

**Pattern A - Object.defineProperty:**
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
```
File: `src/services/analytics/__tests__/analytics-service.test.ts`

**Pattern B - vi.stubGlobal with Map:**
```typescript
mockStorage = new Map();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
});
```
File: `src/services/station/__tests__/station-registry.test.ts`

**For new tests:** Use Pattern B with `vi.stubGlobal` (cleaner cleanup in afterEach with `vi.unstubAllGlobals()`).

### 5. AudioContext Mocking

Manual mock objects that mirror the Web Audio API shape:
```typescript
const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 1024,
  getByteTimeDomainData: vi.fn((array: Uint8Array) => array.fill(128)),
  connect: vi.fn(),
  disconnect: vi.fn(),
} as any;

const mockAudioContext = {
  createAnalyser: vi.fn(() => mockAnalyser),
  createBufferSource: vi.fn(() => mockSourceNode),
  createGain: vi.fn(() => mockGainNode),
  decodeAudioData: vi.fn().mockResolvedValue(mockAudioBuffer),
  destination: {},
  currentTime: 0,
} as any;
```
File: `src/hooks/__tests__/useWaveform.test.ts`, `src/services/audio/__tests__/ambient-player.test.ts`

### 6. fetch Mocking

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
) as any;
```
File: `src/services/audio/__tests__/ambient-player.test.ts`

### 7. Timer Mocking (XState timeouts)

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Trigger XState delayed transitions
vi.advanceTimersByTime(15000);  // Choice timeout
vi.advanceTimersByTime(120000); // Inactivity timeout
vi.advanceTimersByTime(5000);   // FIM -> IDLE reset
```
File: `src/machines/oracleMachine.test.ts`

### 8. Asynchronous Playback Simulation

For testing audio services, simulate `onended` callback:
```typescript
const speakPromise = service.speak(segments, voiceSettings);

setTimeout(() => {
  const mockSource = mockAudioContext.createBufferSource.mock.results[0]?.value;
  if (mockSource?.onended) {
    mockSource.onended();
  }
}, 10);

await speakPromise;
```
File: `src/services/tts/__tests__/elevenlabs-tts.test.ts`

## Test Types

**Unit Tests:**
- Service implementations (mock, real, fallback)
- Hook behavior (useMicrophone, useWaveform, useVoiceChoice, useSessionAnalytics)
- Component rendering (WaveformVisualizer, ListeningIndicator)
- Utility functions (crossfader, validateEnv, audioContext)
- API route handlers (tts, stt, nlu)
- State machine transitions and context

**Integration Tests:**
- `src/__tests__/voice-flow-integration.test.ts` - State machine + voice pipeline
- Tests verify that voice classification events produce correct state transitions across the full experience flow

**E2E Tests:**
- Not implemented. Browser UAT items tracked separately.
- 3 UAT items pending: multi-station isolation, inactivity timeout, choice timeout

## Common Patterns

**XState Actor Testing:**
```typescript
const actor = createActor(oracleMachine);
actor.start();

actor.send({ type: 'START' });
expect(actor.getSnapshot().value).toBe('APRESENTACAO');
expect(actor.getSnapshot().context.sessionId).not.toBe('');

actor.send({ type: 'NARRATIVA_DONE' });
expect(actor.getSnapshot().value).toEqual({ INFERNO: 'NARRATIVA' });

// State matching for nested states
expect(actor.getSnapshot().matches({ INFERNO: 'AGUARDANDO' })).toBe(true);
```

**React Hook Testing:**
```typescript
const { result, rerender } = renderHook(() => useVoiceChoice(config, false));

await act(async () => {
  await result.current.startListening();
});

// Simulate external state change
mockUseMicrophone.audioBlob = mockBlob;
rerender();

// Wait for async processing
await waitFor(() => {
  expect(result.current.choiceResult).toEqual({ ... });
});
```

**Component Testing:**
```typescript
render(<WaveformVisualizer visible={false} />);
const canvas = screen.queryByTestId('waveform-canvas');
expect(canvas).not.toBeInTheDocument();

render(<ListeningIndicator isListening={true} />);
const indicator = screen.getByTestId('listening-indicator');
expect(indicator).toHaveAttribute('aria-label', 'Ouvindo');
```

**API Route Testing:**
```typescript
const request = new Request('http://localhost/api/tts', {
  method: 'POST',
  body: JSON.stringify({ text: 'Hello', voice_settings: { ... } }),
  headers: { 'Content-Type': 'application/json' },
});

const response = await POST(request);
const data = await response.json();

expect(response.status).toBe(400);
expect(data.error).toContain('text');
```

**Error Testing:**
```typescript
// Service errors
mockTranscribe.mockRejectedValue(new Error('STT service unavailable'));
await waitFor(() => {
  expect(result.current.error).toBe('STT service unavailable');
  expect(result.current.needsFallback).toBe(true);
});

// Cancellation errors
service.cancel();
await expect(speakPromise).rejects.toThrow('Speech cancelled');
```

**Async Testing:**
```typescript
// Use waitFor for state that updates asynchronously
await waitFor(() => {
  expect(result.current.isProcessing).toBe(false);
  expect(result.current.choiceResult).not.toBeNull();
});

// Use act for synchronous state updates
act(() => {
  result.current.reset();
});
expect(result.current.choiceResult).toBeNull();
```

## What to Mock vs What NOT to Mock

**Always Mock:**
- Browser APIs (MediaRecorder, AudioContext, localStorage, navigator, fetch)
- External service calls (ElevenLabs, Whisper, Claude)
- `setTimeout`/timers for timeout-based tests (`vi.useFakeTimers()`)

**Never Mock:**
- XState machine logic (test real transitions)
- Business logic within hooks (test the actual pipeline)
- Type structures (let TypeScript verify)

## Adding New Tests

**New Service:**
1. Create `src/services/{name}/__tests__/{name}-service.test.ts`
2. Test interface compliance via factory function
3. Test mock behavior
4. Test real implementation with mocked external APIs

**New Hook:**
1. Create `src/hooks/__tests__/use{Name}.test.ts`
2. Use `renderHook` from `@testing-library/react`
3. Mock dependent services via `vi.mock`
4. Test lifecycle (mount, update, unmount)

**New Component:**
1. Create `src/components/{dir}/__tests__/{Name}.test.tsx`
2. Use `render` + `screen` from `@testing-library/react`
3. Test rendering, props, accessibility attributes
4. Mock hooks tested separately via `vi.mock`

**New API Route:**
1. Create `src/app/api/{name}/__tests__/{name}-route.test.ts`
2. Test with `new Request()` and call handler directly
3. Mock `process.env` and `global.fetch`
4. Test validation (400), config errors (500), upstream errors (502), success (200)

---

*Testing analysis: 2026-03-25*
