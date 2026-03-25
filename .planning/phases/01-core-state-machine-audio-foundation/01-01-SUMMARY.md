---
phase: 01-core-state-machine-audio-foundation
plan: 01
subsystem: foundation
tags: [setup, types, script-data, next-js, xstate, vitest]
dependency_graph:
  requires: []
  provides:
    - Next.js 15 project with TypeScript strict mode
    - XState 5 and @xstate/react dependencies
    - Vitest test framework with jsdom
    - Complete type system (OracleContext, OracleEvent, NarrativePhase, SpeechSegment)
    - Complete PRD script as structured data (25 narrative states)
    - PHASE_COLORS and VOICE_DIRECTIONS constants
  affects:
    - All subsequent plans in Phase 01
    - Plan 02 (state machine implementation depends on types)
    - Plan 03 (audio engine depends on script data)
    - Plan 04 (UI components depend on types and Next.js setup)
tech_stack:
  added:
    - Next.js 15.5.14 (App Router, TypeScript, Tailwind v4)
    - XState 5.20.0
    - @xstate/react 5.0.0
    - Vitest 2.1.9 with jsdom
    - Tailwind CSS 4.2.2 with @tailwindcss/postcss
  patterns:
    - Structured script data with SpeechSegment interface
    - Type-safe state machine context and events
    - Path alias configuration (@/* -> ./src/*)
key_files:
  created:
    - package.json (dependencies and scripts)
    - tsconfig.json (TypeScript strict mode configuration)
    - next.config.ts (Next.js configuration)
    - tailwind.config.ts (Tailwind CSS v4 configuration)
    - postcss.config.mjs (@tailwindcss/postcss plugin)
    - vitest.config.ts (Vitest with jsdom and path aliases)
    - src/app/layout.tsx (Portuguese metadata, black background)
    - src/app/page.tsx (minimal placeholder)
    - src/app/globals.css (Tailwind v4 import)
    - src/test/setup.ts (Vitest setup with testing-library/jest-dom)
    - src/types/index.ts (core type definitions)
    - src/machines/oracleMachine.types.ts (XState types)
    - src/data/script.ts (complete PRD script with 25 states)
  modified: []
decisions:
  - Used Tailwind CSS v4 with new @import syntax and @tailwindcss/postcss plugin
  - Applied +100ms buffer to all pause timings per Research recommendation
  - Set project name to lowercase "oraculo" for npm compatibility
  - Configured Portuguese (pt-BR) as default language in layout
metrics:
  duration_minutes: 5.5
  tasks_completed: 2
  files_created: 13
  commits: 2
  lines_of_code: ~9500
completed_at: "2026-03-25T03:24:57Z"
---

# Phase 01 Plan 01: Next.js Project Scaffold with Types and Script Data

**One-liner:** Next.js 15 project initialized with XState 5, Vitest, complete type system, and all 25 PRD narrative states as structured TypeScript data with pause timings.

## What Was Built

This plan established the complete foundation for O Oráculo:

1. **Next.js 15 Project**: Full TypeScript setup with App Router, Tailwind CSS v4, ESLint, and strict mode compilation
2. **State Machine Dependencies**: XState 5.20.0 and @xstate/react 5.0.0 installed and ready
3. **Test Infrastructure**: Vitest 2.1.9 configured with jsdom environment, path aliases, and testing-library integration
4. **Type System**: Complete TypeScript types matching PRD Section 6 specification
5. **Script Data**: All dialogue from PRD Section 3.3 converted to structured SpeechSegment arrays with precise pause timings

## Implementation Details

### Task 1: Next.js Initialization

Created Next.js project manually (create-next-app rejected "Oraculo" with capital letter) with:
- Package.json with lowercase "oraculo" name
- TypeScript 5.7.3 with strict mode enabled
- Tailwind CSS 4.2.2 with new v4 architecture (@tailwindcss/postcss plugin)
- Vitest with jsdom environment and @/ path alias resolution
- Portuguese metadata: title "O Oráculo", lang="pt-BR", black background
- Minimal placeholder page (will be replaced in Plan 04)

**Key fix applied:** Tailwind v4 requires `@tailwindcss/postcss` package instead of using `tailwindcss` directly in PostCSS config. Also updated `standardized-audio-context-mock` from non-existent 10.x to 9.7.28.

### Task 2: Types and Script Data

Created three core files:

1. **src/types/index.ts**:
   - `SpeechSegment` interface (text + optional pauseAfter)
   - `NarrativePhase` type (6 phases)
   - `Choice1` and `Choice2` types for user choices
   - `PHASE_COLORS` constant (per CONTEXT.md locked decision)
   - `VOICE_DIRECTIONS` constant (SpeechSynthesis approximation of ElevenLabs settings)

2. **src/machines/oracleMachine.types.ts**:
   - `OracleContext` interface matching PRD Section 6
   - `OracleEvent` union type (9 event types)
   - `INITIAL_CONTEXT` constant

3. **src/data/script.ts**:
   - Complete `ScriptData` interface with 25 keys
   - `SCRIPT` object with all PRD dialogue (exact Portuguese text preserved)
   - Pause timings: [pausa 2s] → 2100ms (+100ms buffer per Research)
   - 19 narrative states + 6 fallback/timeout states

All dialogue copied character-for-character from PRD Section 3.3 with accented characters preserved.

## Verification Results

✅ **Build**: `npm run build` completes without errors
✅ **TypeScript**: `npx tsc --noEmit` reports zero errors in strict mode
✅ **Vitest**: Configuration valid, discovers test files (0 tests found as expected)
✅ **Dependencies**: All 7 production deps + 14 dev deps installed successfully
✅ **Script completeness**: 25 keys in SCRIPT object (19 narrative + 6 fallback/timeout)
✅ **Type safety**: All imports resolve, no type errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Bug] Fixed npm package name capitalization**
- **Found during:** Task 1 initialization
- **Issue:** create-next-app rejected "Oraculo" directory name (npm doesn't allow capital letters in package names)
- **Fix:** Created package.json manually with lowercase "oraculo" name while keeping directory as "Oraculo"
- **Files modified:** package.json
- **Commit:** e1f8d9e

**2. [Rule 3 - Bug] Fixed Tailwind v4 PostCSS plugin configuration**
- **Found during:** Task 1 build verification
- **Issue:** Tailwind v4 moved PostCSS plugin to separate package (@tailwindcss/postcss), build failed with error about direct usage
- **Fix:** Installed `@tailwindcss/postcss` package and updated postcss.config.mjs to use '@tailwindcss/postcss' instead of 'tailwindcss'
- **Files modified:** package.json, postcss.config.mjs
- **Commit:** e1f8d9e

**3. [Rule 3 - Bug] Corrected standardized-audio-context-mock version**
- **Found during:** Task 1 npm install
- **Issue:** Package version ^10.0.2 doesn't exist (latest is 9.7.28)
- **Fix:** Updated package.json to use ^9.7.28
- **Files modified:** package.json
- **Commit:** e1f8d9e

All three were blocking issues preventing task completion, resolved inline per deviation Rule 3.

## Known Stubs

None. This plan only scaffolds infrastructure and data — no UI rendering or stub components created.

## Decisions Made

1. **Tailwind v4 adoption**: Used latest Tailwind CSS 4.x with new architecture (separate PostCSS plugin, `@import` syntax instead of `@tailwind` directives)
2. **Pause timing buffer**: Applied +100ms to all pause markers per Research pitfall 3 recommendation (browser timing imprecision)
3. **Lowercase project name**: Used "oraculo" in package.json for npm compatibility while keeping "Oraculo" directory name
4. **Exact script preservation**: Copied all Portuguese text character-for-character from PRD, preserving accents (é, á, ó, ú, ã, õ, ç)

## What's Next

Plan 02 will implement the XState machine using the types and script data created here. The machine will orchestrate the complete narrative flow with all states, transitions, and timeout handling.

## Commits

| Task | Type | Hash | Message |
|------|------|------|---------|
| 1 | chore | e1f8d9e | Initialize Next.js project with dependencies and configuration |
| 2 | feat | e88d612 | Create TypeScript types and complete PRD script data |

## Self-Check: PASSED

**Created files exist:**
✅ package.json exists
✅ tsconfig.json exists
✅ next.config.ts exists
✅ tailwind.config.ts exists
✅ postcss.config.mjs exists
✅ vitest.config.ts exists
✅ src/app/layout.tsx exists
✅ src/app/page.tsx exists
✅ src/app/globals.css exists
✅ src/test/setup.ts exists
✅ src/types/index.ts exists
✅ src/machines/oracleMachine.types.ts exists
✅ src/data/script.ts exists

**Commits exist:**
✅ e1f8d9e found in git log
✅ e88d612 found in git log

**Build verification:**
✅ `npm run build` exits 0
✅ `npx tsc --noEmit` exits 0
