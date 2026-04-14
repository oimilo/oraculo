---
phase: 34-detectable-archetypes-contra-fobico-portador
plan: 02
subsystem: state-machine
tags: [xstate, guards, archetype, contra-fobico, portador, choicemap, devolucao, oracle-experience]

# Dependency graph
requires:
  - phase: 34-detectable-archetypes-contra-fobico-portador
    provides: DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR script keys, DevolucaoArchetype union extended to 11 variants (Wave 1, plan 34-01)
  - phase: 33-q6b-espelho-silencioso
    provides: ESPELHO_SILENCIOSO precedent for top-level DEVOLUCAO_* sibling states + DEVOLUCAO.always priority pattern
provides:
  - isContraFobico guard reading context.choiceMap.q1/q2/q1b
  - isPortador guard reading context.choiceMap.q4/q5/q5b
  - Extended PatternContext with optional choiceMap field (named lookup)
  - ARCHETYPE_GUARDS const extended to 10 keys (8 baseline + 2 Phase 34)
  - 2 new top-level sibling states DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR with NARRATIVA_DONE → ENCERRAMENTO + 5-min idle reset
  - DEVOLUCAO.always priority order updated to 12 entries (ESPELHO[0] > CONTRA_FOBICO[1] > PORTADOR[2] > 8 baseline[3-10] > unguarded CONTRADICTED[11])
  - OracleExperience.tsx getScriptKey extended to map 11 DEVOLUCAO archetypes
  - 19 new patternMatching unit tests + 9 new oracleMachine routing tests + 6 new OracleExperience helper smoke tests
affects: [34-03-audio-timing, 35-uat-mitigation, future-archetype-additions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Field-isolated guards: bespoke Phase 34 guards read context.choiceMap (named lookup), baseline guards read context.choices (positional via determineArchetype) — POL-02 deeper invariant"
    - "Top-level DEVOLUCAO_* sibling states (no UPNJ_* nesting) reusing Phase 33 ESPELHO_SILENCIOSO precedent"
    - "DEVOLUCAO.always priority cascade: bespoke (ESPELHO/CONTRA_FOBICO/PORTADOR) > baseline (MIRROR/DEPTH/SURFACE/PIVOT/SEEKER/GUARDIAN) > unguarded fallthrough (CONTRADICTED)"

key-files:
  created: []
  modified:
    - src/machines/guards/patternMatching.ts
    - src/machines/guards/__tests__/patternMatching.test.ts
    - src/machines/oracleMachine.ts
    - src/machines/oracleMachine.test.ts
    - src/components/experience/OracleExperience.tsx
    - src/components/experience/__tests__/OracleExperience-helpers.test.ts

key-decisions:
  - "isContraFobico + isPortador read context.choiceMap (NOT context.choices) to preserve POL-02 deeper invariant — baseline determineArchetype logic remains untouched"
  - "Priority order locked as ESPELHO[0] > CONTRA_FOBICO[1] > PORTADOR[2] > 8 baseline[3-10] > CONTRADICTED unguarded[11] — bespoke archetypes always beat positional ones"
  - "Pre-existing all-A 9Q test expectations updated from DEPTH_SEEKER → PORTADOR (legitimate routing semantics change because q4=A && q5=A && q5b=A now triggers Phase 34 PORTADOR before reaching baseline)"
  - "Per CONTEXT D-16, did NOT modify getBreathingDelay/getFallbackScript/isAguardando/activeChoiceConfig in OracleExperience.tsx — devolução archetypes are non-AGUARDANDO terminal states reusing DEVOLUCAO_BREATHING"
  - "ChoiceMap shape duplicated locally in patternMatching.ts (NOT imported from oracleMachine.types.ts) to avoid cross-package coupling that would force the guards module to depend on full machine types"

patterns-established:
  - "Field-isolation rationale: bespoke guards live alongside baseline guards but read different context fields (choiceMap vs choices), so they cannot interfere with positional logic — invariant preserved by 59 baseline determineArchetype tests still passing"
  - "TDD discipline: each task RED → GREEN with separate tests appended to existing files (not replaced), tests must fail before implementation"
  - "Priority cascade testing: every new bespoke archetype needs explicit 'X wins over Y' tests covering its full priority neighborhood (ESPELHO > CONTRA_FOBICO > PORTADOR + each over baseline)"

requirements-completed: [AR-02, AR-03]

# Metrics
duration: 65min
completed: 2026-04-08
---

# Phase 34 Plan 02: Wire isContraFobico + isPortador Guards Summary

**Two new bespoke archetype guards (CONTRA_FOBICO + PORTADOR) wired into XState DEVOLUCAO.always priority cascade with field-isolated choiceMap reads, top-level sibling states, and OracleExperience getScriptKey routing — POL-02 deeper invariant preserved (all 59 baseline determineArchetype tests still pass).**

## Performance

- **Duration:** ~65 min
- **Started:** 2026-04-08T00:21:00Z
- **Completed:** 2026-04-08T01:26:08Z
- **Tasks:** 3 (all TDD)
- **Files modified:** 6

## Accomplishments
- isContraFobico + isPortador exported from patternMatching.ts as named functions reading context.choiceMap (NOT context.choices)
- ARCHETYPE_GUARDS const extended from 8 to 10 keys; PatternContext extended with optional choiceMap field
- 2 new top-level DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR sibling states wired into oracleMachine.ts (NARRATIVA_DONE → ENCERRAMENTO, after 5 min idle → IDLE with full context reset)
- DEVOLUCAO.always priority cascade extended to 12 entries with ESPELHO[0] > CONTRA_FOBICO[1] > PORTADOR[2] > 8 baseline > unguarded CONTRADICTED
- OracleExperience.tsx getScriptKey extended from 9 → 11 archetype matchers
- 34 new tests added (19 guard unit tests + 9 routing priority tests + 6 helper smoke tests)
- All 59 baseline determineArchetype tests still pass (POL-02 deeper invariant preserved)
- Full regression: 732 passing, 17 failing (all pre-existing — voice-flow-integration v1.0 PURGATORIO_A/B states + ambient-player + fallback-tts SCRIPT count 80→82 mismatch which Wave 3 will fix), 3 skipped

## Task Commits

Each task was committed atomically (TDD: tests + implementation in same commit per CONTEXT skip_discuss=true autonomous mode):

1. **Task 1: Add isContraFobico + isPortador guards to patternMatching.ts (TDD)** - `9e09fbd` (feat)
2. **Task 2: Wire new guards into oracleMachine.ts (TDD)** - `a02b832` (feat)
3. **Task 3: Extend OracleExperience.tsx + helper tests (TDD)** - `f6bde24` (feat)

**Plan metadata:** `c982ce1` (docs: complete Wave 2)

## Files Created/Modified

### Modified
- `src/machines/guards/patternMatching.ts` — Added local ChoiceMap type, extended PatternContext interface with optional `choiceMap?: ChoiceMap`, exported `isContraFobico` and `isPortador` as named functions, extended `ARCHETYPE_GUARDS` const to 10 keys
- `src/machines/guards/__tests__/patternMatching.test.ts` — Added MockChoiceMap type, MockContextWithMap interface, makeContextWithMap helper, 19 new tests across 3 describe blocks (8 isContraFobico + 8 isPortador + 3 ARCHETYPE_GUARDS Phase 34 keys)
- `src/machines/oracleMachine.ts` — Added isContraFobico + isPortador to setup.guards block, inserted 2 new entries in DEVOLUCAO.always at indices [1] and [2], added 2 new top-level sibling states DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR with NARRATIVA_DONE → ENCERRAMENTO and 5-min idle → IDLE reset
- `src/machines/oracleMachine.test.ts` — Appended top-level describe block "Phase 34 — DEVOLUCAO.always priority for CONTRA_FOBICO + PORTADOR" with 9 new tests; updated 2 pre-existing tests at lines 679 and 1037 (all-A 9Q → expect DEVOLUCAO_PORTADOR not DEPTH_SEEKER, due to Phase 34 priority shift)
- `src/components/experience/OracleExperience.tsx` — Extended getScriptKey DEVOLUCAO archetype block from 9 to 11 matchers, adding DEVOLUCAO_CONTRA_FOBICO and DEVOLUCAO_PORTADOR between ESPELHO_SILENCIOSO and SEEKER
- `src/components/experience/__tests__/OracleExperience-helpers.test.ts` — Appended describe block "OracleExperience Phase 34 helper contracts (CONTRA_FOBICO + PORTADOR)" with 6 new tests (4 SCRIPT shape + 2 source-match contract tests)

## Decisions Made

- **Field isolation via choiceMap:** Phase 34 guards read context.choiceMap (named lookup) NOT context.choices (positional). This is the POL-02 deeper invariant — baseline guards via determineArchetype cannot distinguish q1b from q2b from q4b positionally, so Phase 34 guards live alongside them but read from a different field, preventing any cross-interference. Confirmed by all 59 baseline determineArchetype tests still passing.
- **Priority cascade order:** ESPELHO[0] > CONTRA_FOBICO[1] > PORTADOR[2] > MIRROR[3] > DEPTH[4] > SURFACE[5] > PIVOT_LATE[6] > PIVOT_EARLY[7] > SEEKER[8] > GUARDIAN[9] > CONTRADICTED unguarded[11]. Bespoke (ESPELHO/CONTRA_FOBICO/PORTADOR) always beat positional baselines. CONTRA_FOBICO precedes PORTADOR because Inferno gestures (Q1B) precede Paraíso gestures (Q5B) chronologically and the gesture is rarer (q1='B' && q2='B' is the cautious/repulsion path, statistically less common than carrier paths).
- **Local ChoiceMap type alias:** Defined inside patternMatching.ts rather than importing from oracleMachine.types.ts to avoid forcing the guards module to depend on full machine types — keeps guards as a leaf module testable in isolation.
- **TDD per task:** Each task wrote failing tests first (RED), then implementation (GREEN), in a single atomic commit per task (parallel mode + autonomous mode + skip_discuss=true).
- **Did NOT modify breathing/fallback/aguardando helpers in OracleExperience.tsx:** Per CONTEXT D-16, devolução archetypes are non-AGUARDANDO terminal states that reuse DEVOLUCAO_BREATHING from Phase 33 — only getScriptKey needs the new state matchers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated 2 pre-existing test expectations (all-A 9Q → PORTADOR)**
- **Found during:** Task 2 (oracleMachine.ts wiring GREEN phase)
- **Issue:** Two pre-existing tests in oracleMachine.test.ts at lines 679 (`'all A (9 choices, Q2B+Q4B+Q5B branches) -> DEVOLUCAO_DEPTH_SEEKER'`) and 1037 (`'Path 4: All three branches (9Q: Q2B+Q4B+Q5B) - all A end-to-end'`) expected `DEVOLUCAO_DEPTH_SEEKER` but the actor now correctly transitioned to `DEVOLUCAO_PORTADOR`. This is the intended new Phase 34 routing semantics: any all-A 9Q path triggers `q4='A' && q5='A' && q5b='A'` which fires `isPortador` at always[2], beating `isDepthSeeker` at always[4].
- **Fix:** Updated both test expectations from `DEVOLUCAO_DEPTH_SEEKER` to `DEVOLUCAO_PORTADOR` with explanatory comments referencing Phase 34 priority shift.
- **Files modified:** src/machines/oracleMachine.test.ts (lines 679, 1037)
- **Verification:** 125 oracleMachine tests passing, 3 skipped, 0 failing after update.
- **Committed in:** a02b832 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug = legitimate semantic update)
**Impact on plan:** No scope creep. The deviation reflects intentional Phase 34 routing semantics — the planner correctly anticipated baseline tests would shift, and updating expectations is the only correct response. Tests now accurately document the new priority cascade.

## Issues Encountered

None — all 3 tasks executed cleanly via TDD with no blockers.

## User Setup Required

None — no external service configuration required. All changes are pure code (XState machine + TypeScript types + Vitest tests + React component logic).

## Next Phase Readiness

**Wave 3 (Plan 34-03) prerequisites satisfied:**
- DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR top-level states exist and route correctly
- getScriptKey returns the correct script keys for both new states (Wave 3 audio generation can use these as the source-of-truth filenames)
- Wave 3 will: (1) generate the 12 MP3s (2 archetypes × 6 segments each) via scripts/generate-audio-v3.ts, (2) extend scripts/validate-timing.ts to cover the 4 new max-paths (Q1B → CONTRA_FOBICO + Q5B → PORTADOR variants), (3) update fallback-tts.test.ts SCRIPT count assertion from 80 to 82 (this is the only currently-failing test attributable to Wave 1 + 2 work), (4) sync public/roteiro.html with the new branches.

**Concerns for downstream:**
- Wave 3 max-path budget: Phase 33 left a 36s headroom under the 7:30 budget after Q6B + ESPELHO_SILENCIOSO. CONTRA_FOBICO + PORTADOR are alternative devolucao endings (not additional ones), so they shouldn't push max-path over budget — but Wave 3 timing validator should confirm this.
- Phase 35 UAT will need browser smoke tests for both new archetype paths to confirm getScriptKey + audio + flow all wire end-to-end.

## Self-Check: PASSED

All files verified:
- FOUND: src/machines/guards/patternMatching.ts
- FOUND: src/machines/guards/__tests__/patternMatching.test.ts
- FOUND: src/machines/oracleMachine.ts
- FOUND: src/machines/oracleMachine.test.ts
- FOUND: src/components/experience/OracleExperience.tsx
- FOUND: src/components/experience/__tests__/OracleExperience-helpers.test.ts
- FOUND: .planning/phases/34-detectable-archetypes-contra-fobico-portador/34-02-SUMMARY.md

All commits verified:
- FOUND: 9e09fbd (Task 1: patternMatching guards)
- FOUND: a02b832 (Task 2: oracleMachine wiring)
- FOUND: f6bde24 (Task 3: OracleExperience + helper tests)

---
*Phase: 34-detectable-archetypes-contra-fobico-portador*
*Completed: 2026-04-08*
