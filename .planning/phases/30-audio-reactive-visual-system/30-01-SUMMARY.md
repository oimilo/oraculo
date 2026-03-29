---
phase: 30-audio-reactive-visual-system
plan: 01
subsystem: visual-infrastructure
tags: [hooks, config, testing, canvas, audio-analysis]
dependency_graph:
  requires: [audioContext, NarrativePhase type]
  provides: [VISUAL_THEMES, useAudioAnalyser, useAnimationFrame, canvas-mock]
  affects: []
tech_stack:
  added: [vitest-canvas-mock@0.3.3]
  patterns: [config-constant, audio-tap, animation-loop, useLayoutEffect-cleanup]
key_files:
  created:
    - src/lib/audio/visualConfig.ts
    - src/lib/audio/__tests__/visualConfig.test.ts
    - src/hooks/useAudioAnalyser.ts
    - src/hooks/__tests__/useAudioAnalyser.test.ts
    - src/hooks/useAnimationFrame.ts
    - src/hooks/__tests__/useAnimationFrame.test.ts
  modified:
    - vitest.config.ts
    - package.json
    - package-lock.json
decisions:
  - title: "vitest-canvas-mock version 0.3.3"
    rationale: "Version 1.x requires vitest@^3.0, but project uses vitest@2.1.9. Version 0.3.3 has wildcard peer dependency (*) compatible with vitest 2.x"
    alternatives: ["Upgrade vitest to 3.x (breaking), Use --legacy-peer-deps (unsafe)"]
    outcome: "Installed 0.3.3, all canvas tests work correctly"
  - title: "useLayoutEffect in useAnimationFrame"
    rationale: "Synchronous cleanup prevents frame leak between phase transitions (research pitfall #1 from 30-RESEARCH.md)"
    alternatives: ["useEffect (async cleanup, frame leak risk)"]
    outcome: "useLayoutEffect chosen — cancelAnimationFrame runs immediately before next render"
  - title: "callbackRef pattern in useAnimationFrame"
    rationale: "Avoids recreating animation loop when callback function identity changes (common with inline arrow functions)"
    alternatives: ["Include callback in deps (recreates loop on every callback change)"]
    outcome: "callbackRef stores latest callback, animation loop stable"
  - title: "Default fftSize 256 for useAudioAnalyser"
    rationale: "Equalizer needs fewer bins than waveform (useWaveform uses 2048). Lower fftSize = better performance, 128 bins sufficient for bar chart"
    alternatives: ["2048 like useWaveform (wasteful for frequency bars)"]
    outcome: "256 chosen — 128 frequency bins, optimized for real-time visualization"
metrics:
  duration: "~15 minutes"
  tasks_completed: 2
  files_created: 9
  tests_added: 25
  commits: 2
  completed_date: "2026-03-29"
---

# Phase 30 Plan 01: Audio-Reactive Visual Infrastructure

**One-liner:** Phase-specific visual themes, audio analyser hook, and animation frame hook with canvas test infrastructure.

## What Was Built

### Visual Theme Configuration (Task 1)

Created `src/lib/audio/visualConfig.ts` defining the `VisualTheme` interface and `VISUAL_THEMES` constant:

- Maps all 6 `NarrativePhase` values to distinct visual parameters
- Background colors match `PHASE_COLORS` exactly (contract enforced by tests)
- Each theme specifies:
  - `primaryColor` / `secondaryColor` — rgba strings for equalizer bars and gradients
  - `particleCount` — idle state particle density (40-80 range)
  - `motionIntensity` — 0-1 multiplier for movement speed
  - `blurAmount` — px for atmospheric blur (0-3 range)
- Phase-specific aesthetics:
  - INFERNO: Red-toned (255, 70, 50), high motion (0.7), 80 particles
  - PURGATORIO: Blue-toned (100, 150, 200), calm motion (0.4), 60 particles
  - PARAISO: Gold-toned (255, 215, 100), moderate motion (0.5), 40 particles
  - DEVOLUCAO: Continues PARAISO theme (same colors/params)

**Test coverage:** 9 tests verifying all phases present, background match, type validation, motion bounds, color tones.

### Audio Analysis Hook (Task 2a)

Created `src/hooks/useAudioAnalyser.ts`:

- Connects single `AnalyserNode` to main `GainNode` from `audioContext.ts`
- Read-only tap — doesn't modify audio signal, just reads frequency data
- Returns `{ analyserRef, dataArrayRef, frequencyBinCount }`
- Default `fftSize: 256` (128 frequency bins) — optimized for equalizer bars
- Default `smoothingTimeConstant: 0.8` — smooth visual transitions
- Cleanup: disconnects analyser, nulls refs on unmount
- Null-safe: returns early if no AudioContext or GainNode available

**Differs from useWaveform:** No canvas drawing, no source node param (always uses main GainNode), lower fftSize (256 vs 2048).

**Test coverage:** 10 tests covering setup, custom options, connection, ref management, cleanup, null cases.

### Animation Frame Hook (Task 2b)

Created `src/hooks/useAnimationFrame.ts`:

- Manages `requestAnimationFrame` lifecycle at ~60fps
- Uses `useLayoutEffect` (not `useEffect`) for synchronous cleanup — prevents frame leaks
- Callback ref pattern — stores latest callback, avoids recreating loop on callback change
- Provides `deltaTime` in ms to callback (first frame defaults to 16.67ms)
- Cleanup: cancels frame, resets refs
- Controlled by `running` boolean prop

**Design pattern:** `callbackRef.current = callback` outside useLayoutEffect ensures callback updates don't restart the animation loop.

**Test coverage:** 6 tests covering start/stop, callback invocation, unmount cleanup, running toggle, restart.

### Test Infrastructure (Task 1)

Installed and configured `vitest-canvas-mock@0.3.3`:

- Added to `vitest.config.ts` setupFiles array
- Enables Canvas 2D context mocking in jsdom environment
- Resolves peer dependency conflict (vitest 2.x compatibility)
- Unblocks Plan 02's Canvas components (equalizer, idle animation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest-canvas-mock peer dependency conflict**
- **Found during:** Task 1, npm install
- **Issue:** vitest-canvas-mock@1.1.4 requires vitest@^3.0, project uses vitest@2.1.9. npm install failed with `ERESOLVE unable to resolve dependency tree`.
- **Fix:** Checked version history, found vitest-canvas-mock@0.3.3 has wildcard peer dependency (`vitest: "*"`), compatible with vitest 2.x. Installed 0.3.3 instead.
- **Files modified:** package.json, package-lock.json
- **Verification:** Ran visualConfig tests with canvas mock active — all 9 tests pass.

**2. [Rule 1 - Bug] useAudioAnalyser test hoisting error**
- **Found during:** Task 2, first test run
- **Issue:** Test used `require('@/lib/audio/audioContext')` inside test cases to access mocked functions. Vitest hoists `vi.mock()` calls, causing "Cannot access before initialization" error when factory referenced external variables.
- **Fix:** Rewrote test to use `vi.mock()` factory with inline `vi.fn()` calls, then imported mocked module in `beforeEach` to access spy functions. Removed `require()` calls from test cases.
- **Files modified:** src/hooks/__tests__/useAudioAnalyser.test.ts
- **Verification:** All 10 useAudioAnalyser tests pass after rewrite.

## Testing

All new tests pass:

```
✓ src/lib/audio/__tests__/visualConfig.test.ts (9 tests)
✓ src/hooks/__tests__/useAudioAnalyser.test.ts (10 tests)
✓ src/hooks/__tests__/useAnimationFrame.test.ts (6 tests)

Test Files: 3 passed (3)
Tests: 25 passed (25)
Duration: 1.11s
```

**Key test patterns:**

- VISUAL_THEMES: Background color match with PHASE_COLORS (contract test)
- useAudioAnalyser: Mock AudioContext/GainNode, verify connection, test null safety
- useAnimationFrame: Mock requestAnimationFrame/cancelAnimationFrame, test lifecycle

## Contracts Established

**For Plan 02 (Canvas Components):**

1. `VISUAL_THEMES[phase]` provides all visual parameters (colors, counts, intensities)
2. `useAudioAnalyser()` returns `{ analyserRef, dataArrayRef, frequencyBinCount }` — ready to call `getByteFrequencyData(dataArray)`
3. `useAnimationFrame(callback, running)` runs callback at 60fps with deltaTime when `running=true`
4. Canvas 2D mocking active in all tests (vitest-canvas-mock configured)

## Commits

- `5e5eb13`: chore(30-01): install vitest-canvas-mock and create VISUAL_THEMES config
- `75bd1fe`: feat(30-01): create useAudioAnalyser and useAnimationFrame hooks

## Next Steps

Plan 02 will build on this infrastructure:

- `AudioReactiveBackground` component — uses `useAudioAnalyser` + `useAnimationFrame` to draw equalizer bars
- `IdleAnimation` component — uses `VISUAL_THEMES` + `useAnimationFrame` for particle animation
- Both components will import from `visualConfig.ts` and use the hooks created here

## Self-Check: PASSED

**Files created:**
- [x] src/lib/audio/visualConfig.ts — EXISTS, exports VisualTheme + VISUAL_THEMES
- [x] src/lib/audio/__tests__/visualConfig.test.ts — EXISTS, 9 tests pass
- [x] src/hooks/useAudioAnalyser.ts — EXISTS, exports useAudioAnalyser
- [x] src/hooks/__tests__/useAudioAnalyser.test.ts — EXISTS, 10 tests pass
- [x] src/hooks/useAnimationFrame.ts — EXISTS, exports useAnimationFrame
- [x] src/hooks/__tests__/useAnimationFrame.test.ts — EXISTS, 6 tests pass

**Commits exist:**
- [x] 5e5eb13 — git log shows "chore(30-01): install vitest-canvas-mock and create VISUAL_THEMES config"
- [x] 75bd1fe — git log shows "feat(30-01): create useAudioAnalyser and useAnimationFrame hooks"

**Configuration:**
- [x] vitest.config.ts contains 'vitest-canvas-mock' in setupFiles array
- [x] package.json includes vitest-canvas-mock@0.3.3 in devDependencies

All files, commits, and configuration verified. Plan 01 complete.
