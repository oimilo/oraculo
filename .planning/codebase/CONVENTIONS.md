# Coding Conventions

**Analysis Date:** 2026-03-25

## TypeScript Patterns

**Strict Mode:**
- `tsconfig.json` enforces `"strict": true`
- Target: ES2017, module: esnext, moduleResolution: bundler
- `noEmit: true` (Next.js handles compilation)
- `isolatedModules: true` (required by bundlers)

**Type-Only Imports:**
- Use `import type { ... }` for types that have no runtime value
- Example from `src/machines/oracleMachine.ts`:
  ```typescript
  import type { OracleContext, OracleEvent } from './oracleMachine.types';
  import { INITIAL_CONTEXT } from './oracleMachine.types';
  ```

**Union Types Over Enums:**
- String literal unions preferred over TypeScript enums
- Example from `src/types/index.ts`:
  ```typescript
  export type NarrativePhase = 'APRESENTACAO' | 'INFERNO' | 'PURGATORIO' | 'PARAISO' | 'DEVOLUCAO' | 'ENCERRAMENTO';
  export type Choice1 = 'A' | 'B' | null;
  export type ExperiencePath = 'A_FICAR' | 'A_EMBORA' | 'B_PISAR' | 'B_CONTORNAR';
  ```

**Null Handling:**
- Nullable fields use `| null` (not `undefined`) for serialization safety
- Example: `choice1: Choice1` where `Choice1 = 'A' | 'B' | null`

**Type Assertion Avoidance:**
- `as any` used sparingly, only for XState event type bridging in `src/components/experience/OracleExperience.tsx`
- Pattern: `send({ type: voiceChoice.choiceResult.eventType as any })`

## Component Patterns

**File Organization:**
- One component per file, default export
- File name matches component name in PascalCase
- `'use client'` directive at top of every component file (Next.js App Router)

**Component Structure:**
```typescript
'use client';
import { ... } from 'react';
import { ... } from '@/...';

interface ComponentNameProps {
  prop1: Type1;
  prop2?: Type2;
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks
  // effects
  // handlers
  // render
  return (...);
}
```

**Props Interface:**
- Define inline in same file, named `{ComponentName}Props`
- Use `interface` (not `type`) for component props
- Place directly above the component function
- Example from `src/components/audio/WaveformVisualizer.tsx`:
  ```typescript
  export interface WaveformVisualizerProps {
    visible?: boolean;
    strokeColor?: string;
    lineWidth?: number;
    width?: number;
    height?: number;
  }
  ```

**Conditional Rendering:**
- Return `null` for hidden components (not CSS display:none)
- Example: `if (!visible) return null;` in `src/components/audio/WaveformVisualizer.tsx`
- Example: `if (!isListening) return null;` in `src/components/audio/ListeningIndicator.tsx`

**Accessibility:**
- `aria-hidden="true"` on decorative elements (`src/components/audio/WaveformVisualizer.tsx`)
- `aria-label` + `role="status"` on status indicators (`src/components/audio/ListeningIndicator.tsx`)
- `data-testid` attributes on interactive/testable elements
- UI-05 compliance: no visible text in experience view (audio-only UI)

**Styling:**
- Tailwind CSS classes only, no CSS modules or styled-components
- Inline styles only for dynamic values (colors, animation delays)
- Dark theme: `bg-black`, `text-white`, `bg-white/10` opacity patterns
- Transition classes: `transition-all duration-300`, `transition-colors duration-[3000ms]`

## State Management Patterns

**XState v5 State Machine:**
- Single state machine definition in `src/machines/oracleMachine.ts`
- Types separated into `src/machines/oracleMachine.types.ts`
- Context typed via `types: {} as { context: OracleContext; events: OracleEvent }`
- Use `assign()` for context mutations
- Use `after:` for delayed transitions (timeouts)
- Use `always:` with guards for conditional routing (DEVOLUCAO routing)
- State IDs for cross-hierarchy transitions: `target: '#oracle.PURGATORIO_A'`

**React Integration:**
- `useMachine(oracleMachine)` from `@xstate/react` in `src/components/experience/OracleExperience.tsx`
- Returns `[state, send]` tuple
- State matching via `state.matches('IDLE')` and `state.matches({ INFERNO: 'AGUARDANDO' })`
- Context access via `state.context.currentPhase`

**State Constants:**
- `INITIAL_CONTEXT` exported from `src/machines/oracleMachine.types.ts`
- `PHASE_COLORS`, `VOICE_DIRECTIONS` exported from `src/types/index.ts`
- `PHASE_VOICE_SETTINGS` exported from `src/services/tts/index.ts`
- `SCRIPT` exported from `src/data/script.ts`

## Service Patterns

**Interface + Factory + Mock:**
Every service follows this three-file pattern:

1. **`index.ts`** - Interface definition + factory function + re-exports
2. **`mock.ts`** - Mock implementation using browser APIs or in-memory state
3. **`{provider}.ts`** - Real implementation (e.g., `elevenlabs.ts`, `whisper.ts`, `claude.ts`)

Factory function pattern from `src/services/tts/index.ts`:
```typescript
export interface TTSService {
  speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void>;
  cancel(): void;
}

export function createTTSService(): TTSService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    return new ElevenLabsTTSService();
  }
  return new MockTTSService();
}
```

**Key conventions:**
- Factory names: `create{Service}Service()` (e.g., `createTTSService`, `createSTTService`, `createNLUService`)
- Environment toggle: `NEXT_PUBLIC_USE_REAL_APIS === 'true'`
- Always check `typeof window !== 'undefined'` before checking env vars
- Mock classes named `Mock{Service}Service`
- Real classes named `{Provider}{Service}Service` (e.g., `ElevenLabsTTSService`)

**Lazy Initialization in Hooks:**
- Services created lazily via `useRef` + `useCallback`
- Pattern from `src/hooks/useVoiceChoice.ts`:
  ```typescript
  const sttRef = useRef<STTService | null>(null);
  const getSTT = useCallback((): STTService => {
    if (!sttRef.current) {
      sttRef.current = createSTTService();
    }
    return sttRef.current;
  }, []);
  ```

**Singleton Pattern:**
- `StationRegistry` uses classic singleton with `getInstance()` + `resetInstance()` for tests
- Located in `src/services/station/registry.ts`

**Fallback Chain:**
- `ElevenLabsTTSService` -> `FallbackTTSService` (pre-recorded audio) -> `SpeechSynthesis` (browser)
- Automatic fallback on API failure: `catch { return this.fallbackService.speak(segments, voiceSettings); }`

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `OracleExperience.tsx`, `StartButton.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useMicrophone.ts`, `useVoiceChoice.ts`)
- Services: `camelCase.ts` (e.g., `crossfader.ts`, `ambientPlayer.ts`)
- Types: `camelCase.ts` (e.g., `oracleMachine.types.ts`)
- Tests: `{name}.test.ts` or `{name}.test.tsx`
- Mock services: `mock.ts` in service directory
- Index files: `index.ts` for service barrel exports

**Functions:**
- camelCase for all functions and methods
- Factory functions: `create{Thing}()` (e.g., `createTTSService()`, `createAnalyticsService()`)
- Boolean getters: `is{Thing}()` (e.g., `isOnline()`)
- Hook return handlers: `start{Action}`, `stop{Action}`, `reset` (e.g., `startListening`, `stopRecording`)

**Variables:**
- camelCase for variables and parameters
- UPPER_SNAKE_CASE for constants (e.g., `STORAGE_KEY`, `MAX_CONCURRENT`, `PHASE_COLORS`)
- Refs: `{name}Ref` (e.g., `ttsRef`, `mediaRecorderRef`, `autoStopRef`)

**Types:**
- PascalCase for interfaces and type aliases
- Interface names: descriptive nouns (e.g., `SessionRecord`, `VoiceSettings`, `ClassificationResult`)
- Props interfaces: `{ComponentName}Props`
- Return type interfaces: `Use{Hook}Return` (e.g., `UseMicrophoneReturn`, `UseVoiceChoiceReturn`)

**Test Descriptions:**
- `describe()` blocks use component/module name
- `it()` blocks use descriptive sentences starting with "should" or "Test N:" prefix
- Example: `it('should transition from IDLE to APRESENTACAO on START and assign sessionId', ...)`

## Error Handling

**Try-Catch with Type Narrowing:**
```typescript
try {
  // operation
} catch (err) {
  const message = err instanceof Error ? err.message : 'Fallback message';
  setError(message);
}
```

**Empty Catch Blocks:**
- Used for non-critical operations (localStorage, permissions API)
- Always with comment: `catch { /* ignore parse errors */ }` or `catch { /* ignore quota errors */ }`

**Cancellation Pattern:**
- `this.cancelled = false` at start of async operation
- Check `if (this.cancelled) throw new Error('Speech cancelled')` at each await point
- `cancel()` method sets flag + stops audio source
- Used in `src/services/tts/elevenlabs.ts` and `src/services/tts/fallback.ts`

**Effect Cleanup Cancellation:**
```typescript
useEffect(() => {
  let cancelled = false;
  async function process() {
    // ...
    if (cancelled) return;
    // ...
  }
  process();
  return () => { cancelled = true; };
}, [deps]);
```

**API Route Error Responses:**
- Structured JSON: `{ error: string, detail?: string }`
- HTTP status codes: 400 (validation), 500 (config), 502 (upstream API)
- Pattern from `src/app/api/tts/route.ts`

**Graceful Degradation:**
- Ambient audio load failure is non-fatal: `console.warn(...)` and continue
- TTS falls back through chain: ElevenLabs -> pre-recorded -> SpeechSynthesis -> simulated delay
- Voice choice defaults after max attempts

## Import Organization

**Order:**
1. React and framework imports (`react`, `next`, `xstate`)
2. Type-only imports from project
3. Project imports using `@/` alias
4. Relative imports (same directory)

**Path Aliases:**
- `@/` maps to `./src/` (configured in `tsconfig.json` and `vitest.config.ts`)
- Always use `@/` for cross-directory imports
- Use relative imports only within the same directory or `__tests__` subdirectory

**Example from `src/components/experience/OracleExperience.tsx`:**
```typescript
import { useMachine } from '@xstate/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { oracleMachine } from '@/machines/oracleMachine';
import { SCRIPT } from '@/data/script';
import type { NarrativePhase, SpeechSegment } from '@/types';
import { initAudioContext } from '@/lib/audio/audioContext';
import { createTTSService, PHASE_VOICE_SETTINGS, type TTSService } from '@/services/tts';
import { useVoiceChoice, type ChoiceConfig } from '@/hooks/useVoiceChoice';
import PermissionScreen from './PermissionScreen';
```

## Logging

**Framework:** `console.log` / `console.warn` / `console.error`

**Patterns:**
- Prefixed log messages: `[VoiceChoice]`, `[Mic]`, `[TTS]`, `[ElevenLabs]`
- Log at key pipeline stages: start, result, error
- `console.warn` for non-fatal fallbacks
- `console.error` for actual errors

## Comments

**When to Comment:**
- JSDoc on exported interfaces and public class methods
- Inline comments for non-obvious business logic (PRD references)
- PRD/requirement references: `// Per AMB-02:`, `// FLOW-11`, `// ANA-02 compliance`

**JSDoc Style:**
```typescript
/** Segment of speech with optional pause after */
export interface SpeechSegment { ... }

/**
 * Voice choice hook with lifecycle managed by `active` flag.
 * When active=true, starts recording -> auto-stop -> STT -> NLU -> choiceResult.
 * When active=false, stops everything and resets.
 */
export function useVoiceChoice(...) { ... }
```

## Module Design

**Exports:**
- Services: named exports for interface + factory + constants via `index.ts`
- Components: default export per component file
- Types: named exports from `src/types/index.ts` and `src/types/*.ts`
- Hooks: named export of hook function + types from hook file

**Barrel Files:**
- `src/services/{service}/index.ts` exports interface, factory, types
- `src/services/station/index.ts` re-exports from `registry.ts` and types
- `src/types/index.ts` contains core domain types and constants

**No barrel file at `src/` root.** Each module is imported directly via `@/` path.

---

*Convention analysis: 2026-03-25*
