# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` (e.g., `OracleExperience.tsx`, `PhaseBackground.tsx`)
- Hooks: `use{Name}.ts` (e.g., `useVoiceChoice.ts`, `useTTSOrchestrator.ts`)
- Services: lowercase descriptive (e.g., `elevenlabs.ts`, `fallback.ts`, `mock.ts`)
- Service index: always `index.ts` (interface + factory + re-exports)
- Types: `index.ts` in `types/` directory, or descriptive (e.g., `analytics.ts`)
- Tests: `{name}.test.ts` or `{name}.test.tsx`

**Functions:**
- `camelCase` for all functions (e.g., `createTTSService`, `buildChoiceConfig`, `determineArchetype`)
- Factory functions: `create{ServiceName}()` pattern (e.g., `createTTSService()`, `createNLUService()`)
- Guards: `is{Archetype}` pattern (e.g., `isSeeker`, `isMirror`)
- Hooks: `use{Name}` (e.g., `useVoiceChoice`, `useMicrophone`)

**Variables:**
- `camelCase` for local variables and parameters
- `UPPER_SNAKE_CASE` for constants (e.g., `SCRIPT`, `PHASE_COLORS`, `QUESTION_META`, `ARCHETYPE_GUARDS`)
- Refs: `{name}Ref` suffix (e.g., `ttsRef`, `prevStateRef`, `autoStopRef`)

**Types:**
- `PascalCase` for interfaces and type aliases (e.g., `TTSService`, `OracleContextV4`, `ChoiceConfig`)
- Prefix `I` is NOT used (use plain `TTSService`, not `ITTSService`)
- Enums not used; prefer union types (e.g., `type NarrativePhase = 'APRESENTACAO' | 'INFERNO' | ...`)

**Machine states:**
- `UPPER_SNAKE_CASE` for state names (e.g., `Q1_AGUARDANDO`, `DEVOLUCAO_SEEKER`)
- `UPPER_SNAKE_CASE` for events (e.g., `NARRATIVA_DONE`, `CHOICE_A`)
- Question identifiers: `q{n}` or `q{n}b` lowercase (e.g., `q1`, `q2b`)

## Code Style

**Formatting:**
- No Prettier config detected; relies on editor defaults
- 2-space indentation (inferred from all source files)
- Single quotes for strings in TypeScript
- Semicolons used
- Trailing commas in multi-line structures

**Linting:**
- ESLint with `next/core-web-vitals` preset only
- `// eslint-disable-next-line react-hooks/exhaustive-deps` used sparingly where dependency arrays are intentionally incomplete

## Import Organization

**Order (observed pattern):**
1. React imports (`import { useState, useEffect, ... } from 'react'`)
2. External library imports (`import { useMachine } from '@xstate/react'`)
3. Path-aliased imports from project (`import { SCRIPT } from '@/data/script'`)
4. Relative imports (within same directory)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vitest.config.ts`)
- Always use `@/` for cross-directory imports (e.g., `import type { SpeechSegment } from '@/types'`)
- Relative imports only within the same service/component directory

**Type imports:**
- Use `import type { ... }` for type-only imports (e.g., `import type { SpeechSegment, NarrativePhase } from '@/types'`)

## Error Handling

**Patterns:**
- Async/await with try/catch in all service methods and hooks
- Error messages use descriptive strings: `'Speech cancelled'`, `'TTS API error: {status}'`
- `cancelled` flag pattern for cleanup in async operations:
  ```typescript
  let cancelled = false;
  async function doWork() {
    // ... await something ...
    if (cancelled) return;
    // ... continue ...
  }
  doWork();
  return () => { cancelled = true; };
  ```
- Graceful degradation: try primary service -> try fallback -> simulate/default
- Never throw in UI components; errors stored in state and displayed

**API Route errors:**
- Return structured JSON: `{ error: 'message' }` with appropriate HTTP status
- Status codes: 400 (bad input), 500 (config missing), 502 (upstream API error), 504 (timeout)

## Logging

**Framework:** Custom `createLogger(namespace)` in `src/lib/debug/logger.ts`

**Pattern:**
```typescript
import { createLogger } from '@/lib/debug/logger';
const logger = createLogger('TTS');

logger.log('speak START', { phase, segmentCount });
logger.error('speak FAILED', { error: err.message });
```

**Output format:** `[{elapsed}ms] [{namespace}] {message} {optional data}`

**Namespaces in use:** `TTS`, `VoiceChoice`, `Mic`, `Activation`

**Server-side:** Use `console.log('[STT] message')` / `console.warn('[TTS] message')` with tag prefix

## Comments

**When to Comment:**
- Block comments (`/** */`) for exported functions, interfaces, and complex types
- Inline comments for non-obvious logic (e.g., guard conditions, timing values)
- Section headers use decorated dividers:
  ```typescript
  // ═══════════════════════════════════════════════════════════════
  // SECTION NAME
  // ═══════════════════════════════════════════════════════════════
  ```
- `@deprecated` JSDoc tag on legacy types/functions with replacement pointer

**JSDoc:**
- Used on public service interfaces and exported functions
- Not required on React components or hooks (they use descriptive names)
- Include `@param` and `@returns` for complex functions

## Function Design

**Size:** Functions range from small (5-20 lines for utilities) to large (50-100 lines for hooks/effects). The `OracleExperience` component is 570 lines but contains many small effects.

**Parameters:**
- Use typed objects for 3+ parameters: `{ questionContext, options, keywords }`
- Single primitive parameters are fine: `transcribe(audioBlob: Blob)`
- Optional parameters use `?` or default values

**Return Values:**
- Services return `Promise<T>` for async operations
- Hooks return named interface objects (e.g., `UseMicrophoneReturn`, `UseVoiceChoiceReturn`)
- Factory functions return the interface type

## Module Design

**Service pattern (canonical):**
```typescript
// index.ts
export interface TTSService {
  speak(segments: SpeechSegment[], voiceSettings: VoiceSettings, scriptKey?: string): Promise<void>;
  cancel(): void;
}

export function createTTSService(): TTSService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    return new ElevenLabsTTSService();
  }
  return new FallbackTTSService();
}
```

**Exports:**
- Named exports only (no default exports except React components)
- React components use `export default function {Name}()`
- Types re-exported from index files

**Barrel Files:**
- `src/services/station/index.ts` re-exports from `registry.ts`
- `src/types/index.ts` serves as barrel for core types
- Not used universally (most imports go directly to the file)

## React Component Patterns

**Components:**
- `'use client'` directive at top of every interactive component
- `export default function {Name}()` syntax
- Props interfaces defined inline or as named interface above component
- Hooks called at top of component body
- `useCallback` for event handlers
- `useMemo` for derived state
- `useRef` for mutable values that don't trigger re-renders

**Effects:**
- Named with descriptive comments (e.g., `/** Effect A: Play TTS on state change */`)
- Cleanup functions always provided when starting async work
- `cancelled` flag pattern prevents stale callback execution
- `setTimeout(fn, 0)` used to defer operations past React Strict Mode double-invoke

## State Machine Conventions

**State naming:** `PHASE.SUBSTATE` for hierarchical (e.g., `{ INFERNO: 'Q1_AGUARDANDO' }`)

**Question flow pattern:**
```
Qn_SETUP -> Qn_PERGUNTA -> Qn_AGUARDANDO (25s timeout) -> Qn_TIMEOUT -> Qn_RESPOSTA_A
                                         -> CHOICE_A -> Qn_RESPOSTA_A
                                         -> CHOICE_B -> Qn_RESPOSTA_B
```

**Context updates:** Use `assign()` with `recordChoice(questionId, value)` helper for immutable updates.

**Guards:** Defined in `setup()` block, referenced by string name in transitions.

---

*Convention analysis: 2026-03-29*
