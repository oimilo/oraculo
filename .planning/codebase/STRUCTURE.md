# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
Oraculo/
├── .claude/                    # Claude Code agent config
├── .planning/                  # GSD workflow planning docs
│   ├── codebase/               # Codebase analysis (this file)
│   ├── milestones/             # Milestone definitions
│   ├── phases/                 # Phase plans and execution logs
│   └── research/               # Research notes
├── public/
│   └── audio/                  # Static audio assets (ambient tracks, prerecorded)
│       └── prerecorded/        # 25 pre-recorded MP3s for fallback TTS
├── src/
│   ├── __tests__/              # Cross-cutting integration tests
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── admin/              # Admin dashboard route
│   │   │   ├── components/     # Admin-specific components
│   │   │   └── page.tsx        # Admin page
│   │   ├── api/                # Server-side API routes
│   │   │   ├── nlu/            # NLU classification endpoint
│   │   │   ├── stt/            # Speech-to-text endpoint
│   │   │   └── tts/            # Text-to-speech endpoint
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main experience page
│   ├── components/             # React UI components
│   │   ├── audio/              # Audio visualization components
│   │   └── experience/         # Core experience flow components
│   ├── data/                   # Static data (narrative script)
│   ├── hooks/                  # Custom React hooks
│   │   └── __tests__/          # Hook tests
│   ├── lib/                    # Shared utilities
│   │   ├── api/                # API utilities (env validation)
│   │   └── audio/              # Audio context and speech synthesis
│   ├── machines/               # XState state machine definitions
│   ├── services/               # Service layer (interface+factory+mock pattern)
│   │   ├── analytics/          # Session analytics service
│   │   ├── audio/              # Ambient audio player and crossfader
│   │   ├── nlu/                # Natural language understanding service
│   │   ├── station/            # Multi-station registry
│   │   ├── stt/                # Speech-to-text service
│   │   └── tts/                # Text-to-speech service
│   ├── test/                   # Test configuration
│   └── types/                  # TypeScript type definitions
├── .env.example                # Environment variable template
├── .eslintrc.json              # ESLint config
├── .gitignore                  # Git ignore rules
├── next.config.ts              # Next.js config (minimal)
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS config for Tailwind
├── PRD.md                      # Product requirements document
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── vitest.config.ts            # Vitest test runner config
```

## Directory Purposes

### `src/app/` -- Next.js App Router

- Purpose: File-based routing, pages, layouts, and API routes
- Contains: Page components (`page.tsx`), layouts (`layout.tsx`), API route handlers (`route.ts`)
- Key files:
  - `src/app/page.tsx`: Main experience entry point, renders `<OracleExperience />`
  - `src/app/layout.tsx`: Root HTML layout (lang=pt-BR, dark theme)
  - `src/app/admin/page.tsx`: Admin dashboard with session metrics and station monitoring

### `src/app/api/` -- Server-Side API Routes

- Purpose: Proxy external AI service calls, keeping API keys server-side
- Contains: POST route handlers for TTS, STT, NLU
- Each route directory has a `route.ts` and `__tests__/` subdirectory
- Key files:
  - `src/app/api/tts/route.ts`: ElevenLabs TTS proxy with concurrency limiter and retry
  - `src/app/api/stt/route.ts`: OpenAI Whisper proxy for Portuguese transcription
  - `src/app/api/nlu/route.ts`: Anthropic Claude Haiku proxy for binary classification

### `src/machines/` -- State Machine

- Purpose: Core experience flow logic
- Contains: XState v5 machine definition and TypeScript types
- Key files:
  - `src/machines/oracleMachine.ts`: 17-state machine with branching, timeouts, guards
  - `src/machines/oracleMachine.types.ts`: Context, event, and initial context types
  - `src/machines/oracleMachine.test.ts`: State transition tests

### `src/services/` -- Service Layer

- Purpose: External service abstractions following interface + factory + mock pattern
- Contains: One directory per service domain, each with `index.ts` (interface + factory), `mock.ts`, and optional real implementation
- Structure per service:
  ```
  services/{name}/
  ├── index.ts          # Interface + factory function + re-exports
  ├── mock.ts           # Mock implementation (browser APIs or stubs)
  ├── {provider}.ts     # Real implementation (e.g., elevenlabs.ts, whisper.ts)
  ├── fallback.ts       # Optional fallback (TTS only)
  └── __tests__/        # Service tests
  ```

### `src/components/` -- UI Components

- Purpose: React presentation components
- Organization: Grouped by feature area
- Key files:
  - `src/components/experience/OracleExperience.tsx`: **Main orchestrator** -- wires state machine, TTS, voice choice, ambient audio, and all UI
  - `src/components/experience/PhaseBackground.tsx`: Full-screen background with phase-colored transitions
  - `src/components/experience/PermissionScreen.tsx`: Microphone permission request UI
  - `src/components/experience/StartButton.tsx`: Pulsing "Toque para comecar" button
  - `src/components/experience/ChoiceButtons.tsx`: Binary choice buttons with countdown timer
  - `src/components/experience/EndFade.tsx`: Fade-to-black on experience end
  - `src/components/audio/WaveformVisualizer.tsx`: Canvas-based audio waveform display
  - `src/components/audio/ListeningIndicator.tsx`: Pulsing bars animation during recording

### `src/hooks/` -- Custom React Hooks

- Purpose: Reusable stateful logic for audio, voice, and analytics
- Key files:
  - `src/hooks/useVoiceChoice.ts`: Full voice choice pipeline (record -> STT -> NLU -> result). Lifecycle managed by `active` boolean.
  - `src/hooks/useMicrophone.ts`: MediaRecorder wrapper with auto-stop timer, MIME type detection, stream cleanup
  - `src/hooks/useSessionAnalytics.ts`: Analytics service wrapper with start/end session lifecycle
  - `src/hooks/useAmbientAudio.ts`: Ambient audio player lifecycle with phase-based crossfading
  - `src/hooks/useWaveform.ts`: AnalyserNode waveform rendering to canvas ref

### `src/lib/` -- Shared Utilities

- Purpose: Low-level utilities shared across the app
- Key files:
  - `src/lib/audio/audioContext.ts`: AudioContext singleton (init, get, reset). Must be initialized on user gesture.
  - `src/lib/audio/speechSynthesis.ts`: Browser SpeechSynthesis wrapper for segment-by-segment playback with pause timing
  - `src/lib/api/validateEnv.ts`: `requireEnv()` helper for API route environment variable validation

### `src/types/` -- Type Definitions

- Purpose: Shared TypeScript types and constants
- Key files:
  - `src/types/index.ts`: Core types (`SpeechSegment`, `NarrativePhase`, `Choice1`, `Choice2`, `ExperiencePath`) and constants (`PHASE_COLORS`, `VOICE_DIRECTIONS`)
  - `src/types/analytics.ts`: Session analytics types (`SessionRecord`, `SessionStatus`, `SessionStartData`, `SessionEndData`)
  - `src/types/station.ts`: Station types (`StationInfo`, `StationStatus`)

### `src/data/` -- Static Data

- Purpose: Hardcoded narrative content
- Key files:
  - `src/data/script.ts`: Complete narrative script with 25 keyed entries mapping to `SpeechSegment[]` arrays. Includes main narrative, response variants, fallback prompts, and timeout messages.

### `src/test/` -- Test Setup

- Purpose: Global test configuration
- Key files:
  - `src/test/setup.ts`: Vitest setup file (DOM mocks, global config)

### `public/audio/` -- Static Audio Assets

- Purpose: Pre-recorded audio files for offline fallback and ambient soundscapes
- Contains:
  - `public/audio/prerecorded/`: 25 MP3 files mapping 1:1 to SCRIPT keys (not yet recorded)
  - `public/audio/ambient-inferno.mp3`, `ambient-purgatorio.mp3`, `ambient-paraiso.mp3`: Phase ambient loops

## Key File Locations

### Entry Points

- `src/app/page.tsx`: Root page, renders OracleExperience
- `src/app/admin/page.tsx`: Admin dashboard
- `src/app/layout.tsx`: Root HTML layout

### Configuration

- `package.json`: Dependencies, scripts (dev, build, test)
- `tsconfig.json`: TypeScript strict mode, `@/*` path alias to `./src/*`
- `vitest.config.ts`: Test runner config
- `tailwind.config.ts`: Tailwind CSS config
- `next.config.ts`: Next.js config (currently empty)
- `.env.example`: Environment variable template (API keys, feature flags)

### Core Logic

- `src/machines/oracleMachine.ts`: State machine (the brain)
- `src/components/experience/OracleExperience.tsx`: Orchestrator component (the spine)
- `src/hooks/useVoiceChoice.ts`: Voice recognition pipeline
- `src/data/script.ts`: Complete narrative content

### Service Interfaces (entry points for service layer)

- `src/services/tts/index.ts`: TTSService interface + createTTSService()
- `src/services/stt/index.ts`: STTService interface + createSTTService()
- `src/services/nlu/index.ts`: NLUService interface + createNLUService()
- `src/services/analytics/index.ts`: AnalyticsService interface + createAnalyticsService()
- `src/services/station/index.ts`: StationRegistry re-export

### Testing

- `src/machines/oracleMachine.test.ts`: State machine transition tests
- `src/hooks/__tests__/*.test.ts`: Hook unit tests
- `src/services/*/tests__/*.test.ts`: Service unit tests
- `src/app/api/*/__tests__/*.test.ts`: API route tests
- `src/__tests__/voice-flow-integration.test.ts`: End-to-end voice pipeline integration test
- `src/components/audio/__tests__/*.test.tsx`: Audio component tests

## Naming Conventions

### Files

- **Components:** PascalCase with `.tsx` extension -- `OracleExperience.tsx`, `PhaseBackground.tsx`
- **Hooks:** camelCase prefixed with `use` -- `useVoiceChoice.ts`, `useMicrophone.ts`
- **Services:** camelCase matching the provider/concept -- `elevenlabs.ts`, `whisper.ts`, `claude.ts`, `mock.ts`
- **Service indexes:** Always `index.ts` (interface + factory)
- **Types:** camelCase -- `analytics.ts`, `station.ts`
- **Tests:** Same name as source with `.test.ts`/`.test.tsx` suffix
- **API routes:** Always `route.ts` (Next.js App Router convention)
- **Utilities:** camelCase -- `audioContext.ts`, `speechSynthesis.ts`, `validateEnv.ts`

### Directories

- **Feature groups:** lowercase singular -- `experience/`, `audio/`, `station/`
- **Service domains:** lowercase singular matching the service name -- `tts/`, `stt/`, `nlu/`, `analytics/`
- **Test directories:** `__tests__/` (co-located within parent directory)

### Exports

- **Components:** `export default function ComponentName` (default exports for pages and components)
- **Hooks:** `export function useHookName` (named exports)
- **Services:** Classes use `export class ServiceName`, factory functions use `export function createServiceName()`
- **Types:** `export interface`/`export type` (named exports)
- **Constants:** `export const UPPER_CASE` for config objects (`PHASE_COLORS`, `VOICE_DIRECTIONS`, `SCRIPT`)

## Import Organization

### Path Alias

All `src/` imports use the `@/*` alias mapped to `./src/*`:

```typescript
import { oracleMachine } from '@/machines/oracleMachine';
import type { NarrativePhase } from '@/types';
import { createTTSService } from '@/services/tts';
```

### Import Order (observed pattern)

1. React/framework imports (`react`, `next/server`, `xstate`)
2. Internal modules via `@/` alias (machines, services, hooks, types, lib)
3. Relative imports (sibling components)

```typescript
// Example from OracleExperience.tsx
import { useMachine } from '@xstate/react';                          // 1. Framework
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { oracleMachine } from '@/machines/oracleMachine';            // 2. Internal
import { SCRIPT } from '@/data/script';
import type { NarrativePhase, SpeechSegment } from '@/types';
import { createTTSService } from '@/services/tts';
import { useVoiceChoice } from '@/hooks/useVoiceChoice';
import PermissionScreen from './PermissionScreen';                    // 3. Relative
import StartButton from './StartButton';
```

### Type-Only Imports

Use `import type` for pure type imports:
```typescript
import type { OracleContext, OracleEvent } from './oracleMachine.types';
import type { SpeechSegment, NarrativePhase } from '@/types';
```

## Where to Add New Code

### New Service (e.g., Supabase Analytics)

1. Create implementation file: `src/services/analytics/supabase.ts`
2. Implement the existing `AnalyticsService` interface from `src/services/analytics/index.ts`
3. Update factory in `src/services/analytics/index.ts` to return real implementation when `NEXT_PUBLIC_USE_REAL_APIS === 'true'`
4. Add tests: `src/services/analytics/__tests__/supabase-analytics.test.ts`
5. Add any needed API route: `src/app/api/analytics/route.ts`

### New API Route

1. Create directory: `src/app/api/{name}/`
2. Create handler: `src/app/api/{name}/route.ts` -- export `POST` (or `GET`) async function
3. Use `requireEnv()` from `src/lib/api/validateEnv.ts` for env var validation
4. Add tests: `src/app/api/{name}/__tests__/{name}-route.test.ts`
5. Add env var to `.env.example`

### New UI Component

1. Determine category: `experience/` (flow-related) or `audio/` (audio-visual) or create new directory
2. Create file: `src/components/{category}/{ComponentName}.tsx`
3. Use `'use client'` directive at top (all current components are client-side)
4. Export as default: `export default function ComponentName`
5. Wire into `OracleExperience.tsx` if it's part of the experience flow
6. Add tests: `src/components/{category}/__tests__/{ComponentName}.test.tsx`

### New Hook

1. Create file: `src/hooks/use{Name}.ts`
2. Follow pattern: `export function use{Name}(params): Return`
3. Use `useRef` for service instances (lazy init pattern)
4. Add tests: `src/hooks/__tests__/use{Name}.test.ts`

### New Type Definitions

1. Add to existing file if related: `src/types/index.ts` (core), `src/types/analytics.ts` (analytics), `src/types/station.ts` (station)
2. Create new file for new domain: `src/types/{domain}.ts`
3. Use `export type` and `export interface`

### New State Machine Event or State

1. Add event type to `OracleEvent` union in `src/machines/oracleMachine.types.ts`
2. Add state/transition in `src/machines/oracleMachine.ts`
3. If state has narration: add script entry in `src/data/script.ts`
4. Update `getScriptKey()` mapping in `src/components/experience/OracleExperience.tsx`
5. Add transition tests in `src/machines/oracleMachine.test.ts`

### New Utility

1. Determine domain: `lib/audio/` (audio), `lib/api/` (API helpers), or create `lib/{domain}/`
2. Create file: `src/lib/{domain}/{utilName}.ts`
3. Use named exports
4. Add co-located test: `src/lib/{domain}/{utilName}.test.ts`

## Special Directories

### `.planning/`

- Purpose: GSD workflow artifacts (milestone plans, phase plans, codebase analysis)
- Generated: By Claude Code agents
- Committed: Yes (tracked in git)

### `public/audio/`

- Purpose: Static audio assets served at build time
- Generated: No (must be manually recorded/placed)
- Committed: Yes (audio files are tracked)
- Note: 25 pre-recorded MP3 files in `prerecorded/` are referenced by `FallbackTTSService` but may not exist yet (pending studio recording)

### `.next/`

- Purpose: Next.js build output
- Generated: Yes (by `next build` / `next dev`)
- Committed: No (in `.gitignore`)

### `node_modules/`

- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

## Module Boundaries

### Client vs. Server

| Module | Runtime | Reason |
|--------|---------|--------|
| `src/app/api/**` | Server only | API keys, external service calls |
| `src/lib/api/validateEnv.ts` | Server only | `process.env` without `NEXT_PUBLIC_` prefix |
| `src/components/**` | Client only | `'use client'` directive, browser APIs |
| `src/hooks/**` | Client only | React hooks, browser APIs (MediaRecorder, AudioContext) |
| `src/services/tts/elevenlabs.ts` | Client | Calls `/api/tts` via fetch, plays via Web Audio |
| `src/services/stt/whisper.ts` | Client | Calls `/api/stt` via fetch |
| `src/services/nlu/claude.ts` | Client | Calls `/api/nlu` via fetch |
| `src/services/analytics/mock.ts` | Client | localStorage access |
| `src/services/station/registry.ts` | Client | localStorage access |
| `src/machines/**` | Isomorphic | Pure logic, no browser/server APIs |
| `src/types/**` | Isomorphic | Type definitions only |
| `src/data/**` | Isomorphic | Static data, no side effects |

### Dependency Direction

```
app/page.tsx
  └── components/experience/OracleExperience.tsx (orchestrator)
        ├── machines/oracleMachine.ts (state management)
        ├── data/script.ts (content)
        ├── hooks/useVoiceChoice.ts
        │     ├── hooks/useMicrophone.ts (MediaRecorder)
        │     ├── services/stt/ (transcription)
        │     └── services/nlu/ (classification)
        ├── hooks/useAmbientAudio.ts
        │     └── services/audio/ambientPlayer.ts
        │           └── services/audio/crossfader.ts
        ├── hooks/useSessionAnalytics.ts
        │     └── services/analytics/
        ├── services/tts/ (narration)
        │     └── lib/audio/speechSynthesis.ts
        ├── services/station/ (heartbeat)
        ├── lib/audio/audioContext.ts (shared AudioContext)
        ├── types/ (shared type definitions)
        └── components/experience/* (UI pieces)
              └── components/audio/* (visualizers)

app/api/tts/route.ts  ─── (server) ──→ ElevenLabs API
app/api/stt/route.ts  ─── (server) ──→ OpenAI Whisper API
app/api/nlu/route.ts  ─── (server) ──→ Anthropic Messages API
```

**Rule:** Services never import from components or hooks. Components import from services. Hooks import from services. Types are imported by everyone. `lib/` is imported by services and hooks.

---

*Structure analysis: 2026-03-25*
