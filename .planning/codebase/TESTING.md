# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Runner:**
- Vitest ^2.1.8
- Config: `vitest.config.ts`
- Environment: `jsdom`
- Globals: `true` (describe/it/expect without imports)

**Assertion Library:**
- Vitest built-in (`expect`)
- @testing-library/jest-dom matchers (via `src/test/setup.ts`)

**Run Commands:**
```bash
npm run test         # vitest run (single pass)
npm run test:watch   # vitest (watch mode)
npm run test:ui      # vitest --ui (visual browser UI)
```

## Test File Organization

**Location:** Co-located `__tests__/` directories adjacent to source code

**Naming:** `{name}.test.ts` or `{name}.test.tsx`

**Pattern:**
```
src/services/tts/
├── index.ts
├── elevenlabs.ts
├── fallback.ts
├── mock.ts
└── __tests__/
    ├── tts-service.test.ts
    ├── elevenlabs-tts.test.ts
    └── fallback-tts.test.ts
```

**Exception:** `src/machines/oracleMachine.test.ts` is co-located (not in `__tests__/`)

**Integration tests:** `src/__tests__/` directory for cross-cutting tests

## Current Test Inventory

**34 test files, 496 passing, 25 failing (2 stale test files)**

| Category | File | Tests | Status |
|----------|------|-------|--------|
| Machine | `src/machines/oracleMachine.test.ts` | 60+ | PASS |
| Guards | `src/machines/guards/__tests__/patternMatching.test.ts` | 40+ | PASS |
| Script | `src/data/__tests__/script-v3.test.ts` | 60+ | PASS |
| Voice Choice | `src/hooks/__tests__/useVoiceChoice.test.ts` | 30+ | PASS |
| TTS Orchestrator | `src/hooks/__tests__/useTTSOrchestrator.test.ts` | ~10 | PASS |
| Microphone | `src/hooks/__tests__/useMicrophone.test.ts` | ~10 | PASS |
| Services (all) | `src/services/*/__tests__/*.test.ts` | ~50 | PASS |
| API Routes | `src/app/api/*/__tests__/*.test.ts` | ~30 | PASS |
| Components | `src/components/*/__tests__/*.test.tsx` | ~10 | PASS |
| Lib/Audio | `src/lib/audio/*.test.ts` | ~15 | PASS |
| **STALE** | `src/__tests__/flow-sequencing.test.ts` | 15 | **FAIL** |
| **STALE** | `src/__tests__/voice-flow-integration.test.ts` | 10 | **FAIL** |

## Test Structure

**Suite Organization (machine tests example):**
```typescript
describe('oracleMachine v4', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.restoreAllMocks(); });

  describe('linear flow (no branches)', () => {
    it('transitions IDLE -> APRESENTACAO -> INFERNO.INTRO', () => { ... });
    it('Q1 choice advances to Q2', () => { ... });
  });

  describe('Q2B branch (MACH-01)', () => {
    it('Q2B triggers when Q1=A AND Q2=A', () => { ... });
    it('Q2B does NOT trigger when Q1=B', () => { ... });
  });

  describe('devolucao routing (MACH-03)', () => { ... });
  describe('timeouts', () => { ... });
  describe('context reset', () => { ... });
  describe('full paths', () => { ... });
});
```

**Test Helper Pattern (machine tests):**
```typescript
function advanceToQ1Aguardando(actor: ActorType) {
  actor.send({ type: 'START' });
  actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO -> INFERNO.INTRO
  actor.send({ type: 'NARRATIVA_DONE' }); // INTRO -> Q1_SETUP
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_SETUP -> Q1_PERGUNTA
  actor.send({ type: 'NARRATIVA_DONE' }); // Q1_PERGUNTA -> Q1_AGUARDANDO
}

function runFullPathV4(actor: ActorType, config: PathConfig) {
  // Runs entire experience with specified choices, handling branches automatically
}
```

## Mocking

**Framework:** Vitest built-in (`vi.fn()`, `vi.mock()`, `vi.spyOn()`)

**Service Mocking Pattern:**
```typescript
// Mock the service module
vi.mock('@/services/stt', () => ({
  createSTTService: vi.fn(() => ({
    transcribe: vi.fn().mockResolvedValue('ficar'),
  })),
}));

vi.mock('@/services/nlu', () => ({
  createNLUService: vi.fn(() => ({
    classify: vi.fn().mockResolvedValue({
      choice: 'A',
      confidence: 0.95,
      reasoning: 'test',
    }),
  })),
}));
```

**Timer Mocking:**
```typescript
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.restoreAllMocks(); });

// In test:
vi.advanceTimersByTime(25000); // Trigger 25s timeout
```

**Fetch Mocking (API routes):**
```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ text: 'transcribed text' }),
  blob: async () => new Blob(['audio']),
});
```

**What to Mock:**
- External API calls (fetch to ElevenLabs/OpenAI/Anthropic)
- Browser APIs (MediaRecorder, navigator.mediaDevices, AudioContext)
- Timer functions (setTimeout, setInterval)
- Service factory functions (for hook/component tests)

**What NOT to Mock:**
- State machine logic (test real XState actors)
- Pattern matching algorithms (test real `determineArchetype`)
- Script data validation (test against real SCRIPT export)

## Test Data

**Script validation tests use real data:**
```typescript
import { SCRIPT } from '@/data/script';

it('APRESENTACAO has 5-8 segments', () => {
  expect(SCRIPT.APRESENTACAO.length).toBeGreaterThanOrEqual(5);
  expect(SCRIPT.APRESENTACAO.length).toBeLessThanOrEqual(8);
});
```

**Machine tests use inline choice configurations:**
```typescript
runFullPathV4(actor, { q1: 'A', q2: 'A', q2b: 'A', q3: 'B', q4: 'B', q5: 'B', q6: 'B' });
```

**Mock context helpers:**
```typescript
const makeContext = (choices: ChoicePattern): MockContext => ({ choices });
```

## Coverage

**Requirements:** None enforced (no coverage thresholds configured)

**Strong coverage areas:**
- State machine: All 4 path permutations (6Q, 7Q+Q2B, 7Q+Q4B, 8Q) tested end-to-end
- Pattern matching: All 8 archetypes + edge cases + variable-length arrays
- Script: Structure validation, PT-BR language checks, timing constraints, inflection density
- API routes: Happy path + error cases + timeouts

**Weak coverage areas:**
- `OracleExperience.tsx` (570 lines, no direct unit tests -- too complex to render)
- `useAmbientAudio` hook (no tests)
- Admin dashboard components (no tests)
- End-to-end browser tests (none)

## Test Types

**Unit Tests:**
- State machine actors tested synchronously with `createActor().start()`
- Pure functions tested directly (`determineArchetype`, `normalize`, `extractJSON`)
- Hooks tested with `@testing-library/react` `renderHook`

**Integration Tests:**
- `src/__tests__/stt-nlu-pipeline.test.ts` - Tests STT -> NLU -> classification pipeline
- `src/__tests__/mic-lifecycle.test.ts` - Tests microphone start/stop/cleanup

**E2E Tests:**
- Not implemented. No Playwright/Cypress setup.

## Known Failing Tests

**2 test files from v1.0 are stale and failing (25 tests):**

1. `src/__tests__/flow-sequencing.test.ts` - Tests v1 machine states (NARRATIVA, PERGUNTA as top-level states) that no longer exist in v4's hierarchical structure
2. `src/__tests__/voice-flow-integration.test.ts` - Tests v1 events (CHOICE_EMBORA, CHOICE_PISAR, CHOICE_CONTORNAR) and states (PURGATORIO_A, PURGATORIO_B) that were removed in v3

These tests need to be deleted or rewritten for the v4 machine.

## Common Patterns

**Async Testing:**
```typescript
it('transcribes audio', async () => {
  const result = await sttService.transcribe(mockBlob);
  expect(result).toBe('expected text');
});
```

**Timer-Based Testing:**
```typescript
it('Q1 25s timeout -> Q1_TIMEOUT', () => {
  advanceToQ1Aguardando(actor);
  vi.advanceTimersByTime(25000);
  expect(actor.getSnapshot().value).toEqual({ INFERNO: 'Q1_TIMEOUT' });
});
```

**State Machine Testing:**
```typescript
it('transitions correctly', () => {
  const actor = createActor(oracleMachine).start();
  actor.send({ type: 'START' });
  expect(actor.getSnapshot().value).toBe('APRESENTACAO');
  actor.stop();
});
```

---

*Testing analysis: 2026-03-29*
