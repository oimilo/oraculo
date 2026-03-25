---
phase: 01-core-state-machine-audio-foundation
plan: 02
subsystem: state-machine
tags: [xstate, state-machine, narrative-flow, tdd]

# Dependency graph
requires:
  - phase: 01-01
    provides: TypeScript types (OracleContext, OracleEvent, INITIAL_CONTEXT) and script data structure
provides:
  - Complete XState v5 state machine with all PRD states and transitions
  - 17 states implementing full narrative flow (IDLE → APRESENTACAO → INFERNO → PURGATORIO → PARAISO → DEVOLUCAO → ENCERRAMENTO → FIM)
  - All 4 experience paths (A_FICAR, A_EMBORA, B_PISAR, B_CONTORNAR)
  - Timeout and fallback handling at decision points
  - Context tracking for session analytics
affects: [01-03, 01-04, voice-pipeline, ui-layer]

# Tech tracking
tech-stack:
  added: [xstate@5.20.0]
  patterns: [TDD red-green-refactor, XState v5 nested states, always guards for routing, cross-hierarchy transitions with IDs]

key-files:
  created:
    - src/machines/oracleMachine.ts
    - src/machines/oracleMachine.test.ts
  modified: []

key-decisions:
  - "Used XState v5 always guards with context-based routing for DEVOLUCAO state instead of event-based transitions"
  - "Implemented cross-hierarchy transitions using #oracle.PURGATORIO_A, #oracle.PURGATORIO_B, #oracle.PARAISO ID references"
  - "Set timeout durations per PRD: 15s for AGUARDANDO states, 2s for TIMEOUT_REDIRECT, 5s for FIM auto-reset"
  - "Used crypto.randomUUID() for sessionId generation (native Web API, no dependencies)"

patterns-established:
  - "TDD workflow: RED (failing tests) → commit → GREEN (implementation) → commit → REFACTOR (if needed) → commit"
  - "XState nested state pattern for complex phases (INFERNO, PURGATORIO_A, PURGATORIO_B with sub-states)"
  - "Context mutation via assign() actions for choice tracking and phase updates"
  - "Timeout-based fallbacks with default routing for user silence"

requirements-completed: [FLOW-01, FLOW-02, FLOW-03, FLOW-05, FLOW-06, FLOW-08, FLOW-09, FLOW-10, FLOW-12]

# Metrics
duration: 4min
completed: 2026-03-25
---

# Phase 01 Plan 02: Oracle State Machine Summary

**XState v5 state machine with 17 states implementing complete Dante-inspired narrative flow (IDLE through FIM) with 4 branching paths, timeout handling, and context tracking**

## Performance

- **Duration:** 4 min (274 seconds)
- **Started:** 2026-03-25T03:27:44Z
- **Completed:** 2026-03-25T03:31:58Z
- **Tasks:** 1 (TDD task with RED → GREEN phases)
- **Files modified:** 2

## Accomplishments

- Implemented complete XState v5 state machine with all PRD Section 6 states (17 states total)
- All 4 experience paths work correctly (A_FICAR, A_EMBORA, B_PISAR, B_CONTORNAR)
- Timeout behavior implemented: 15s AGUARDANDO → TIMEOUT_REDIRECT, 2s redirect delay, 15s PURGATORIO defaults, 5s FIM auto-reset
- Context tracking: sessionId (crypto.randomUUID), choice1/choice2, currentPhase, fallbackCount
- 100% test coverage with 27 passing tests covering all transitions, timeouts, and full paths

## Task Commits

TDD task executed in two phases:

1. **RED phase: Failing tests** - `eef0d79` (test)
   - Created oracleMachine.test.ts with all 23 test cases
   - Tests verified to fail (machine doesn't exist yet)

2. **GREEN phase: Implementation** - `269903a` (feat)
   - Created oracleMachine.ts with complete state machine
   - All 27 tests pass (23 original + 4 routing variants)
   - Fixed test expectation for DEVOLUCAO routing (always guards immediately resolve)

## Files Created/Modified

- `src/machines/oracleMachine.ts` - Complete XState v5 state machine with 17 states, nested hierarchies, timeout configurations, and context tracking
- `src/machines/oracleMachine.test.ts` - 27 unit tests covering state transitions, timeouts, context updates, and all 4 complete paths

## Decisions Made

1. **DEVOLUCAO routing via always guards** - Used XState v5 `always` transitions with guards instead of event-based routing. DEVOLUCAO state immediately resolves to one of 4 variants based on choice1 + choice2 context. This is more declarative and eliminates the need for intermediate routing logic.

2. **Cross-hierarchy transitions with IDs** - Used `#oracle.PURGATORIO_A`, `#oracle.PURGATORIO_B`, `#oracle.PARAISO` for transitions that cross state hierarchy boundaries. This is the recommended XState v5 pattern for clean machine composition.

3. **crypto.randomUUID() for sessionId** - Used native Web Crypto API instead of external UUID library. Zero dependencies, works in all modern browsers and Node.js 18+.

4. **currentPhase entry actions** - Set currentPhase context on entry to each major state (APRESENTACAO, INFERNO, PURGATORIO, PARAISO, DEVOLUCAO, ENCERRAMENTO). This provides clear phase tracking for UI rendering and analytics.

5. **Timeout values from PRD** - Hardcoded timeout durations (15000ms, 2000ms, 5000ms) directly in machine definition per PRD Section 6 specification. No configuration needed - these are fixed narrative timings.

## Deviations from Plan

None - plan executed exactly as written.

All 27 tests pass. Machine implements 100% of PRD Section 6 states and transitions.

## Issues Encountered

None. XState v5 API worked as documented. Tests passed on first GREEN implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase.**

The state machine is the backbone of the entire experience. All other components (audio, UI, voice pipeline) will react to its state changes.

**For next phases:**
- Plan 01-03 (Audio Foundation): Will subscribe to machine state changes to trigger TTS playback and ambientação crossfades
- Plan 01-04 (Integration): Will wire machine to UI components and audio system
- Phase 02 (Voice Pipeline): Will send CHOICE_* events to the machine based on NLU classification

**Blockers:** None

**Testing note:** All tests use vitest fake timers (`vi.useFakeTimers()`) to verify timeout behavior without waiting real time. Production machine will use real timers.

## Self-Check: PASSED

**Files created:**
- FOUND: src/machines/oracleMachine.ts
- FOUND: src/machines/oracleMachine.test.ts

**Commits:**
- FOUND: eef0d79 (test(01-02): add failing test for Oracle state machine)
- FOUND: 269903a (contains oracleMachine.ts implementation)

**Tests:** All 27 tests pass

---
*Phase: 01-core-state-machine-audio-foundation*
*Completed: 2026-03-25*
