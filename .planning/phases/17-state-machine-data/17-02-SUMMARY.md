---
phase: 17-state-machine-data
plan: 02
subsystem: state-machine
tags: [xstate, state-machine, v3, linear-flow, devolucao-routing, pattern-matching]

# Dependency graph
requires:
  - phase: 17-01
    provides: v3 types (OracleContextV3, choices array, updateChoice) and pattern matching guards

provides:
  - v3 Oracle state machine with 6 linear choices and 8 devolucao archetypes
  - Comprehensive test suite (34 tests) covering linear flow, choice tracking, and routing
  - Clean removal of v2 branching artifacts

affects: [18-components, 19-audio-generation, 20-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Hierarchical XState v5 machine with INFERNO/PURGATORIO/PARAISO parent states
    - Always guards for immediate devolucao routing (synchronous pattern matching)
    - Linear flow design: all visitors experience Q1-Q6 regardless of choices
    - Cross-phase transitions via id references (#oracle.PURGATORIO, #oracle.PARAISO, #oracle.DEVOLUCAO)

key-files:
  created: []
  modified:
    - src/machines/oracleMachine.ts (complete rewrite: 387 lines, v3 linear machine)
    - src/machines/oracleMachine.test.ts (complete rewrite: 514 lines, 34 comprehensive tests)
  deleted:
    - src/machines/guards/createChoiceGuard.ts (v2 path guards, replaced by patternMatching.ts)
    - src/machines/guards/__tests__/createChoiceGuard.test.ts (v2 guard tests, no longer needed)

key-decisions:
  - "DEVOLUCAO uses always guards (not initial state) for immediate routing - no NARRATIVA_DONE needed after entering DEVOLUCAO"
  - "Explicit state writing (no factory function) for clarity - Q1-Q6 substates written out to avoid debugging indirection"
  - "Choice indices hardcoded (Q1=0, Q2=1, ..., Q6=5) with clear comments to prevent off-by-one errors"
  - "Q6 timeout defaults to B (all others default to A) - matches QUESTION_META from types/index.ts"
  - "Test helpers (advanceToQxAguardando, runFullPath) encapsulate common traversal patterns"

patterns-established:
  - "Hierarchical state pattern: parent state (INFERNO) contains question sub-flow (Q1_SETUP -> Q1_PERGUNTA -> Q1_AGUARDANDO -> Q1_RESPOSTA)"
  - "Cross-phase transition pattern: Q2_RESPOSTA -> #oracle.PURGATORIO, Q4_RESPOSTA -> #oracle.PARAISO, Q6_RESPOSTA -> #oracle.DEVOLUCAO"
  - "Always guard routing: DEVOLUCAO entry triggers immediate synchronous routing to archetype via always: [...] guards"
  - "Immutable choice updates: updateChoice(index, value) creates new array copy for XState assign()"

requirements-completed: [SMV3-01, SMV3-02, SMV3-03]

# Metrics
duration: 9 min
completed: 2026-03-28
---

# Phase 17 Plan 02: v3 Oracle State Machine Implementation Summary

**v3 Oracle state machine with 6 linear choices, 8 devolucao archetypes, hierarchical INFERNO/PURGATORIO/PARAISO states, and comprehensive test coverage (34 tests, 100% passing)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-28T00:36:20Z
- **Completed:** 2026-03-28T00:45:44Z
- **Tasks:** 2
- **Files modified:** 2 (rewritten), 2 deleted

## Accomplishments

- Rewrote Oracle state machine from v2 branching (2 choices, 4 paths) to v3 linear (6 choices, 8 archetypes)
- Implemented hierarchical states: INFERNO (Q1+Q2), PURGATORIO (Q3+Q4), PARAISO (Q5+Q6) with INTRO substates
- Integrated ARCHETYPE_GUARDS from patternMatching.ts for immediate devolucao routing via always guards
- Comprehensive test suite: 34 tests covering linear flow, choice array tracking, devolucao routing, timeouts, context reset
- Clean removal of v2 artifacts: deleted createChoiceGuard.ts and its tests

## Task Commits

1. **Task 1: Rewrite Oracle state machine for v3 linear flow** - `224402a` (feat)
   - Replaced v2 branching (2 choices, 4 paths) with v3 linear (6 choices, 8 archetypes)
   - Hierarchical states: INFERNO (Q1+Q2), PURGATORIO (Q3+Q4), PARAISO (Q5+Q6)
   - Each question: SETUP → PERGUNTA → AGUARDANDO → RESPOSTA_A/B
   - All 6 AGUARDANDO states have 25s timeouts with correct defaultOnTimeout (Q1-Q5=A, Q6=B)
   - DEVOLUCAO routing uses ARCHETYPE_GUARDS from patternMatching.ts
   - Context tracks choices array at indices 0-5 via updateChoice helper
   - Cross-phase transitions: Q2→PURGATORIO, Q4→PARAISO, Q6→DEVOLUCAO
   - All visitors experience all 6 questions (no branching)
   - FIM resets choices to [null x6]
   - Added minimal smoke test (3 tests) validating machine starts, transitions, and has v3 context
   - Removed v2 artifacts: PATH_GUARDS, PURGATORIO_A/B, CHOICE_FICAR/EMBORA/PISAR/CONTORNAR

2. **Task 2: Rewrite machine tests and delete v2 guard files** - `8972e7c` (test)
   - Replaced v2 tests (788 lines) with comprehensive v3 test suite (514 lines, 34 tests)
   - Test coverage: linear flow (SMV3-01), choice array tracking (SMV3-02), devolucao routing (SMV3-03)
   - Tests verify all 6 questions are experienced by all visitors regardless of choices
   - Tests verify choices array tracks at correct indices (0-5)
   - Tests verify DEVOLUCAO routing to all 8 archetypes
   - Tests verify timeouts with correct defaults (Q1-Q5=A, Q6=B)
   - Tests verify context reset behavior (FIM -> IDLE with choices=[null x6])
   - Tests verify currentPhase tracking through all narrative phases
   - Tests verify full end-to-end paths (DEPTH_SEEKER, SURFACE_KEEPER)
   - Helper functions: advanceToQ1-Q6Aguardando, runFullPath
   - Deleted v2 guard files: createChoiceGuard.ts and __tests__/createChoiceGuard.test.ts
   - All 34 tests passing

**Plan metadata:** `<pending>` (docs: complete plan metadata commit)

## Files Created/Modified

- `src/machines/oracleMachine.ts` - Complete rewrite: v3 linear machine with 387 lines, hierarchical INFERNO/PURGATORIO/PARAISO states, 6 questions, 8 devolucao archetypes
- `src/machines/oracleMachine.test.ts` - Complete rewrite: 514 lines, 34 comprehensive tests covering all v3 behaviors

## Files Deleted

- `src/machines/guards/createChoiceGuard.ts` - v2 path guards (isPathAFicar, isPathAEmbora, etc.), replaced by patternMatching.ts archetype guards
- `src/machines/guards/__tests__/createChoiceGuard.test.ts` - v2 guard tests, no longer needed with v3 pattern matching

## Decisions Made

- **DEVOLUCAO routing uses always guards (not initial state)** - Enables immediate synchronous routing to archetype states without requiring NARRATIVA_DONE. Cleaner than PURGATORIO/PARAISO pattern with INTRO substates.
- **Explicit state writing (no factory function)** - Q1-Q6 substates written out explicitly to avoid debugging indirection. Copy-paste is intentional for state machine clarity.
- **Choice indices hardcoded with clear comments** - Q1=0, Q2=1, ..., Q6=5 explicitly documented to prevent off-by-one errors during implementation.
- **Q6 timeout defaults to B** - Only question with default B (all others default to A). Matches QUESTION_META definition in types/index.ts for "End of the game" scenario.
- **Test helpers encapsulate traversal** - advanceToQxAguardando functions and runFullPath helper reduce boilerplate and make tests more readable.

## Deviations from Plan

None - plan executed exactly as written. All tasks completed with no auto-fixes or blocking issues.

## Issues Encountered

**Issue 1: Test helper confusion with NARRATIVA_DONE count** - Initial implementation of runFullPath sent extra NARRATIVA_DONE after Q6_RESPOSTA, causing immediate transition to ENCERRAMENTO instead of stopping at DEVOLUCAO_* state. Fixed by removing extra NARRATIVA_DONE - Q6_RESPOSTA -> DEVOLUCAO transition triggers always guards which route immediately (synchronously) to archetype, so no second NARRATIVA_DONE needed.

**Issue 2: Windows "nul" file conflict** - Git staging failed due to invalid "nul" file path on Windows. Removed file before staging. No impact on implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 17-03 (if exists) or Phase 18 (components update). The v3 machine is complete and fully tested.

**Known work for Phase 18:**
- Update OracleExperience.tsx to use v3 context (choices array instead of choice1/choice2)
- Update state matching to use new hierarchical states (INFERNO.Q1_AGUARDANDO instead of INFERNO.AGUARDANDO)
- Update FallbackTTSService to handle v3 script keys (INFERNO_Q1_SETUP vs INFERNO_NARRATIVA)
- Update useVoiceChoice hook to work with v3 choice indices

**Blockers:** None. All v2 -> v3 migration work for state machine is complete.

---
*Phase: 17-state-machine-data*
*Completed: 2026-03-28*
