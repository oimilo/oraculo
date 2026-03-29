---
phase: 27-state-machine-redesign
plan: 02
subsystem: state-machine
tags: [xstate, testing, branching, guards, choiceMap, vitest]

# Dependency graph
requires:
  - phase: 27-state-machine-redesign
    plan: 01
    provides: "OracleContextV4 with choiceMap, recordChoice, Q2B/Q4B branch states and guards"
  - phase: 26-script-branching
    provides: "Variable-length ChoicePattern, percentage-based archetype matching"
provides:
  - "58 comprehensive tests proving all 4 branch permutations work correctly"
  - "runFullPathV4 test helper for branching-aware path execution"
  - "Test coverage for all 8 devolucao archetypes across variable-length choice arrays"
affects: [28-audio-regeneration, 29-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["runFullPathV4 branching test helper: handles Q2B/Q4B conditionally based on guard logic", "Non-branching advanceTo* helpers use CHOICE_B to avoid triggering branch guards"]

key-files:
  modified:
    - src/machines/oracleMachine.test.ts

key-decisions:
  - "advanceTo* helpers use CHOICE_B for Q2/Q3/Q4/Q5 to avoid triggering branch guards in non-branching tests"
  - "runFullPathV4 accepts explicit config object with optional q2b/q4b fields, mirroring machine guard logic in test"
  - "Pattern matching tests (59 tests) confirmed passing without any changes -- guards only read context.choices which is still ChoicePattern"

patterns-established:
  - "Branch-aware test helpers: runFullPathV4 uses PathConfig with optional branch fields"
  - "Guard isolation: separate describe blocks prove each guard condition independently"

requirements-completed: [MACH-01, MACH-02, MACH-03]

# Metrics
duration: 4min
completed: 2026-03-29
---

# Phase 27 Plan 02: Branching Machine Tests Summary

**58 tests proving all 4 branch permutations (6Q/7Q/7Q/8Q), guard logic, choiceMap tracking, 8 archetype routings, timeouts, and context resets for the V4 branching state machine**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-29T01:01:03Z
- **Completed:** 2026-03-29T01:05:23Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Rewrote oracleMachine.test.ts from v3 (linear 6-choice) to v4 (branching 6-8 choice) with 58 tests
- Created runFullPathV4 helper that handles Q2B/Q4B branches automatically based on guard conditions
- Updated advanceTo* helpers to use CHOICE_B, avoiding branch triggers for non-branching test scenarios
- Tests prove Q2B guard: activates only when Q1=A AND Q2=A, skipped for Q1=B or Q2=B
- Tests prove Q4B guard: activates only when Q3=A AND Q4=A, skipped for Q3=B or Q4=B
- Tests verify all 4 path lengths: 6Q (no branch), 7Q+Q2B, 7Q+Q4B, 8Q (both branches)
- Tests verify choiceMap tracks question names correctly (q1-q6 + q2b/q4b when branched)
- Tests verify all 8 devolucao archetypes route correctly across different path lengths
- Tests verify Q2B and Q4B timeouts default to A
- Tests verify context reset with V4 shape (choices=[], choiceMap={})
- Confirmed 59 pattern matching tests pass without changes (context-shape agnostic)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite test helpers and update tests for V4 context** - `b586f3e` (test)
2. **Task 2: Verify pattern matching tests still pass** - no commit needed (59 tests pass unchanged)

## Files Created/Modified
- `src/machines/oracleMachine.test.ts` - Complete rewrite: 521 -> 1034 lines, v3 -> v4, 58 tests covering branching, choice tracking, routing, timeouts, resets

## Decisions Made
- advanceTo* helpers now use CHOICE_B for Q2/Q3/Q4/Q5 to stay on non-branching paths. This is intentional: branching tests use runFullPathV4 or explicit manual steps instead.
- runFullPathV4 accepts a PathConfig object with optional q2b/q4b fields. The helper mirrors the machine's guard logic internally (checking q1+q2 for Q2B, q3+q4 for Q4B).
- Pattern matching tests were confirmed passing without any modifications -- the guards only read `context.choices` which is still `ChoicePattern = ChoiceAB[]`, unaffected by the V4 context shape change.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 branch permutations proven correct with comprehensive test coverage
- Pattern matching confirmed working with variable-length arrays (6-8 choices)
- Phase 28 (audio regeneration) can proceed knowing machine states are tested
- Phase 29 (integration) can proceed knowing context shape and routing are verified

## Known Stubs

None - all tests exercise real machine behavior with actual XState actors.

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 27-state-machine-redesign*
*Completed: 2026-03-29*
