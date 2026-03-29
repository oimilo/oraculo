---
phase: 27-state-machine-redesign
plan: 01
subsystem: state-machine
tags: [xstate, branching, guards, conditional-transitions, choiceMap]

# Dependency graph
requires:
  - phase: 26-script-branching
    provides: "Q2B/Q4B script content, variable-length ChoicePattern, percentage-based archetype matching"
provides:
  - "OracleContextV4 type with choiceMap for named choice tracking"
  - "recordChoice helper for dual-write (choices array + choiceMap)"
  - "QuestionId type for 8 named question identifiers"
  - "XState v5 machine with Q2B/Q4B conditional branch states"
  - "shouldBranchQ2B/shouldBranchQ4B guards"
affects: [27-02 (machine tests), 28-audio-regeneration, 29-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["choiceMap dual-write pattern: every recordChoice appends to choices[] AND sets choiceMap[name]", "conditional guard transitions: RESPOSTA_A -> [guard branch, fallthrough]"]

key-files:
  modified:
    - src/machines/oracleMachine.types.ts
    - src/machines/oracleMachine.ts

key-decisions:
  - "choices[] starts empty (not pre-allocated [null x6]) — built up dynamically as questions are answered"
  - "choiceMap enables O(1) named lookup for branch guards while choices[] preserves ordered array for pattern matching"
  - "Branch guards on RESPOSTA_A only (not RESPOSTA_B) — B answers never trigger branches per game design"

patterns-established:
  - "recordChoice dual-write: always update both choices array and choiceMap in a single assign call"
  - "Conditional guard transitions: array of targets with first matching guard wins, last entry is unguarded fallthrough"

requirements-completed: [MACH-01, MACH-02, MACH-03]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 27 Plan 01: State Machine Redesign Summary

**XState v5 machine rewritten with Q2B/Q4B conditional branch states, choiceMap-based guards, and recordChoice dual-write pattern for 6-8 decision point flow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T00:55:53Z
- **Completed:** 2026-03-29T00:58:55Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Evolved type system to OracleContextV4 with choiceMap (named lookup) + choices[] (pattern matching array)
- Added 12 new branch states (6 for Q2B in INFERNO, 6 for Q4B in PURGATORIO)
- Implemented shouldBranchQ2B (Q1=A AND Q2=A) and shouldBranchQ4B (Q3=A AND Q4=A) guards
- Replaced all updateChoice(index) calls with recordChoice(name) for named question tracking
- All v3 exports preserved with @deprecated markers for backward compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Evolve type system -- OracleContextV4 with choiceMap and recordChoice** - `8c679f4` (feat)
2. **Task 2: Rewrite oracleMachine with Q2B and Q4B branch states** - `503bc07` (feat)

## Files Created/Modified
- `src/machines/oracleMachine.types.ts` - Added QuestionId, OracleContextV4, OracleEventV4, INITIAL_CONTEXT_V4, recordChoice; preserved v3 exports with deprecation markers
- `src/machines/oracleMachine.ts` - Rewritten from v3 linear to v4 branching: 12 new states, 2 branch guards, recordChoice calls, conditional transitions

## Decisions Made
- `choices[]` starts as empty array (not pre-allocated `[null x6]`) and gets built up dynamically as each question is answered. This aligns with variable-length pattern matching from Phase 26.
- `choiceMap` provides O(1) named lookup for branch guards (e.g., `context.choiceMap.q1 === 'A'`) while `choices[]` preserves the ordered array needed by `determineArchetype()`.
- Branch guards only check RESPOSTA_A transitions -- choosing B for Q2 or Q4 always skips the branch. This matches the game design where only specific "deeper" choice patterns unlock bonus questions.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Machine definition complete with all branch states and guards
- Plan 02 (machine tests) can now test all 4 branch permutations (no-branch, Q2B-only, Q4B-only, both branches)
- Phase 28 (audio regeneration) has machine state names needed for audio key mapping
- Phase 29 (integration) has OracleContextV4 type for component prop updates

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 27-state-machine-redesign*
*Completed: 2026-03-29*
