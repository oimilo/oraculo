---
phase: 32-q5b-branch-paraiso-gap-closure
plan: 02
subsystem: machine + UI orchestration
tags: [machine, oracleExperience, branching, q5b, portador, tdd]
status: complete
wave: 2
requirements:
  - BR-02
requires:
  - "32-01"
provides:
  - shouldBranchQ5B guard (q4=A && q5=A)
  - 6 Q5B states in PARAISO (Q5B_SETUP, Q5B_PERGUNTA, Q5B_AGUARDANDO, Q5B_TIMEOUT, Q5B_RESPOSTA_A, Q5B_RESPOSTA_B)
  - Q5_RESPOSTA_A guarded transition (branches to Q5B_SETUP when guard passes)
  - Q5B sibling rejoin to Q6_SETUP (no #oracle. prefix)
  - Q5B_CHOICE + 6 OracleExperience helper extensions
affects:
  - src/machines/oracleMachine.ts (guard + 6 states + modified Q5_RESPOSTA_A)
  - src/machines/oracleMachine.test.ts (15 new Q5B tests + updated 7 existing tests for Q5B coexistence)
  - src/components/experience/OracleExperience.tsx (6 helper extensions)
  - src/components/experience/__tests__/OracleExperience-helpers.test.ts (7 new smoke tests)
tech-stack:
  added: []
  patterns:
    - "TDD: Tests written first (RED), then implementation (GREEN)"
    - "Sibling-state rejoin pattern (plain 'Q6_SETUP' target, no #oracle. prefix)"
    - "Q4B+Q5B coexistence (both consume q4=A, can fire sequentially)"
    - "PathConfig interface extension (q5b?: 'A' | 'B')"
    - "runFullPathV4 helper Q5B awareness (conditional branch handling)"
key-files:
  created: []
  modified:
    - src/machines/oracleMachine.ts (lines ~43 guard, 512-516 Q5_RESPOSTA_A, 565+ Q5B states)
    - src/machines/oracleMachine.test.ts (15 Q5B tests + 7 updated tests, PathConfig interface)
    - src/components/experience/OracleExperience.tsx (lines 50 Q5B_CHOICE, 89-90 + 118 + 134 breathing, 199-204 scriptKey, 232 fallback, 290 + 304 + 352 choice/mic)
    - src/components/experience/__tests__/OracleExperience-helpers.test.ts (7 Q5B smoke tests)
decisions:
  - "Q5B rejoins at sibling Q6_SETUP (plain string target, not qualified #oracle. prefix) — stays inside PARAISO compound state"
  - "Q4B + Q5B coexistence explicitly tested (q3=A, q4=A, q5=A fires BOTH branches sequentially)"
  - "Existing tests updated to account for Q5B (9-choice paths when q4=A and q5=A)"
  - "TDD approach: tests written first, confirmed RED, then implementation to GREEN"
  - "isPergunta extension critical for mic warm-up (prevents ~1s lag at Q5B_AGUARDANDO)"
metrics:
  duration_min: 8
  tasks_completed: 2
  tests_added: 22  # 15 machine + 7 helper
  tests_passing: 97  # 83 machine + 14 helper
  files_created: 0
  files_modified: 4
  commits: 2
  date_completed: 2026-04-07
---

# Phase 32 Plan 02: Q5B Branch Machine + UI Wiring Summary

Wave 2 of Phase 32 — wires the Q5B branch data primitives (created in Plan 32-01) into the XState machine and OracleExperience component so the PORTADOR profile precursor (q4=A && q5=A) actually plays the Q5B script.

## What Changed

### Task 1 — Machine Wiring (TDD)

**Tests first (RED phase):**
Added 15 failing tests to `src/machines/oracleMachine.test.ts` covering:
- Q5B trigger when q4=A && q5=A
- Q5B skip when q4=B or q5=B
- Q5B state sequence (SETUP → PERGUNTA → AGUARDANDO → RESPOSTA_A/B/TIMEOUT)
- choiceMap.q5b recording
- Q5B_RESPOSTA_A/B → Q6_SETUP sibling rejoin
- Q4B + Q5B coexistence when q3=A, q4=A, q5=A
- Q1B, Q2B, Q4B regression (existing branches unaffected)

Also added helper function `advanceToQ5AguardandoQ5B` for test setup.

**Implementation (GREEN phase):**
Modified `src/machines/oracleMachine.ts`:
1. Added `shouldBranchQ5B` guard to guards block (line ~46):
   ```typescript
   shouldBranchQ5B: ({ context }) => context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A',
   ```

2. Modified `Q5_RESPOSTA_A` state to use guarded array transition (lines ~512-520):
   ```typescript
   Q5_RESPOSTA_A: {
     on: {
       NARRATIVA_DONE: [
         { target: 'Q5B_SETUP', guard: 'shouldBranchQ5B' },
         { target: 'Q6_SETUP' },
       ],
     },
   },
   ```

3. Added 6 new Q5B states inside PARAISO.states (after Q6_RESPOSTA_B, lines ~565+):
   - Q5B_SETUP → Q5B_PERGUNTA
   - Q5B_PERGUNTA → Q5B_AGUARDANDO
   - Q5B_AGUARDANDO (25s timeout, CHOICE_A/B handlers with `assign(recordChoice('q5b', 'A'))`)
   - Q5B_TIMEOUT → Q5B_RESPOSTA_A
   - Q5B_RESPOSTA_A → 'Q6_SETUP' (plain string — sibling rejoin)
   - Q5B_RESPOSTA_B → 'Q6_SETUP' (plain string — sibling rejoin)

**Critical structural difference from Phase 31 Q1B:**
Q5B rejoins at a SIBLING state (`'Q6_SETUP'`), NOT a parent-level qualified target (`#oracle.PARAISO`). Both Q5B and Q6_SETUP live inside the same PARAISO compound state, so the target is a simple string reference.

**Test updates:**
- Extended `PathConfig` interface with `q5b?: 'A' | 'B'`
- Extended `runFullPathV4` helper to handle Q5B conditional branch
- Updated 7 existing tests that now fire Q5B (when q4=A and q5=A):
  - "9-choice path (Q2B+Q4B+Q5B)" (was "8-choice path")
  - "choiceMap has correct keys for 9-choice path" (was 8)
  - "all A (9 choices)" → DEVOLUCAO_DEPTH_SEEKER
  - "SEEKER: 75% A (9 choices)"
  - "PIVOT_EARLY" (changed to avoid Q5B, kept at 7 choices with Q1B only)
  - "Path 3: Q4B only (7Q)" (changed q5=A to q5=B to avoid Q5B)
  - "Path 4: All three branches (9Q)" (was "Both branches (8Q)")

All 83 machine tests passing (15 new Q5B + 68 existing/updated).

**Commit:** `4952f4b` — feat(32-02): add shouldBranchQ5B guard + 6 Q5B states (BR-02)

### Task 2 — OracleExperience Helper Extensions (TDD)

**Tests first (RED phase):**
Added 7 smoke tests to `src/components/experience/__tests__/OracleExperience-helpers.test.ts`:
- SCRIPT.PARAISO_Q5B_SETUP exists
- SCRIPT.PARAISO_Q5B_PERGUNTA exists
- SCRIPT.PARAISO_Q5B_RESPOSTA_A exists
- SCRIPT.PARAISO_Q5B_RESPOSTA_B exists
- SCRIPT.FALLBACK_Q5B exists
- SCRIPT.TIMEOUT_Q5B exists
- QUESTION_META[10] well-formed (optionA='Fundir', optionB='Ordenar')

Tests passed immediately (GREEN phase) because Plan 32-01 already created the data primitives.

**Implementation:**
Modified `src/components/experience/OracleExperience.tsx` with 6 helper extensions:

1. **Q5B_CHOICE constant** (line 50):
   ```typescript
   const Q5B_CHOICE = buildChoiceConfig(10);
   ```

2. **getBreathingDelay** (3 insertions):
   - Q5B_RESPOSTA_A → LONG (line ~89)
   - Q5B_RESPOSTA_B → LONG (line ~90)
   - Q5B_SETUP → MEDIUM (line ~118)
   - Q5B_PERGUNTA → NONE (line ~134)

3. **getScriptKey** (5 insertions, lines ~199-204):
   - Q5B_SETUP → 'PARAISO_Q5B_SETUP'
   - Q5B_PERGUNTA → 'PARAISO_Q5B_PERGUNTA'
   - Q5B_RESPOSTA_A → 'PARAISO_Q5B_RESPOSTA_A'
   - Q5B_RESPOSTA_B → 'PARAISO_Q5B_RESPOSTA_B'
   - Q5B_TIMEOUT → 'TIMEOUT_Q5B'

4. **getFallbackScript** (line ~232):
   ```typescript
   if (machineState.matches({ PARAISO: 'Q5B_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q5B, key: 'FALLBACK_Q5B' };
   ```

5. **activeChoiceConfig** useMemo (line ~290):
   ```typescript
   if (state.matches({ PARAISO: 'Q5B_AGUARDANDO' })) return Q5B_CHOICE;
   ```

6. **isAguardando** (line ~304):
   ```typescript
   state.matches({ PARAISO: 'Q5B_AGUARDANDO' }) ||
   ```

7. **isPergunta** (line ~352):
   ```typescript
   state.matches({ PARAISO: 'Q5B_PERGUNTA' }) ||
   ```

**Critical: isPergunta extension**
Without Q5B_PERGUNTA in the `isPergunta` chain, mic warm-up would lag ~1s at Q5B_AGUARDANDO, dropping the visitor's first words (Phase 31 voice pipeline lesson learned).

**Self-checklist grep:** `grep -c "Q5B_" OracleExperience.tsx` → 14 matches (expected ≥12). All 6 helpers extended.

All 14 helper tests passing (7 new Q5B + 7 existing Q1B).

**Commit:** `6d7d8a2` — feat(32-02): extend OracleExperience 6 helper functions for Q5B states (BR-02)

## Deviations from Plan

None — plan executed exactly as written. No bugs found, no missing critical functionality, no blocking issues, no architectural decisions needed. TDD approach worked cleanly: tests RED → implementation GREEN → all tests passing.

## Q4B + Q5B Coexistence Verification

**Critical test (Test 12):** Visitor with q3=A, q4=A, q5=A fires BOTH Q4B (during PURGATORIO) AND Q5B (during PARAISO) sequentially. Final machine state after Q5B:
- `context.choiceMap.q4b === 'A'` ✓ (from Q4B)
- `context.choiceMap.q5b === 'A'` ✓ (from Q5B)
- Machine at `{ PARAISO: 'Q5B_SETUP' }` ✓

Both branches coexist without conflict. Q4B fires first (post-Q4), Q5B fires second (post-Q5). This is intentional — the PORTADOR profile (Phase 34) will read BOTH q4b and q5b from choiceMap.

## Regression Verification

All Phase 31 (Q1B) and Phase 29 (Q2B, Q4B) tests still passing:
- Q1B branch (q1=B && q2=B) → Q1B_SETUP ✓
- Q2B branch (q1=A && q2=A) → Q2B_SETUP ✓
- Q4B branch (q3=A && q4=A) → Q4B_SETUP ✓
- Q4B fires but Q5B does NOT when q5=B ✓

Zero v4.0 regressions. All 83 machine tests + 14 helper tests passing.

## Sibling Rejoin Pattern Confirmation

Both Q5B_RESPOSTA_A and Q5B_RESPOSTA_B target plain `'Q6_SETUP'` (NO `#oracle.` prefix). Grep verification:
```bash
grep "Q5B_RESPOSTA.*#oracle" src/machines/oracleMachine.ts  # Returns 0 matches
```

Machine tests confirm sibling rejoin works:
- Q5B_RESPOSTA_A + NARRATIVA_DONE → `state.matches({ PARAISO: 'Q6_SETUP' })` ✓
- Q5B_RESPOSTA_B + NARRATIVA_DONE → `state.matches({ PARAISO: 'Q6_SETUP' })` ✓

State stays inside PARAISO compound state throughout Q5B → Q6 transition.

## Test Counts

| Test Suite | Before | After | New |
|------------|--------|-------|-----|
| `oracleMachine.test.ts` | 68 | 83 | +15 |
| `OracleExperience-helpers.test.ts` | 7 | 14 | +7 |
| **Total** | **75** | **97** | **+22** |

## Ready Signal for Plan 32-03

Plan 32-03 (audio + timing + roteiro documentation) can now:
- Generate 6 MP3s via `scripts/generate-audio-v3.ts` (SCRIPT keys exist, machine references them, OracleExperience consumes them)
- Update `scripts/validate-timing.ts` from 6-path to 12-path matrix (Q5B independence dimension)
- Update `public/roteiro.html` with Q5B flowchart node + narrative block

The Q5B branch is fully wired end-to-end at the machine + UI orchestration layer. A developer running `npm run dev` and clicking through Q4=A, Q5=A will see the machine advance through Q5B states (though audio will be silent until Plan 32-03 generates MP3s).

## Self-Check: PASSED

Files modified:
- FOUND: `src/machines/oracleMachine.ts` (shouldBranchQ5B guard, 6 Q5B states, Q5_RESPOSTA_A guarded transition)
- FOUND: `src/machines/oracleMachine.test.ts` (15 Q5B tests, PathConfig extension, runFullPathV4 Q5B handling)
- FOUND: `src/components/experience/OracleExperience.tsx` (Q5B_CHOICE + 6 helper extensions)
- FOUND: `src/components/experience/__tests__/OracleExperience-helpers.test.ts` (7 Q5B smoke tests)

Commits exist:
- FOUND: `4952f4b` — feat(32-02): add shouldBranchQ5B guard + 6 Q5B states (BR-02)
- FOUND: `6d7d8a2` — feat(32-02): extend OracleExperience 6 helper functions for Q5B states (BR-02)

Guard verification:
- `grep -c "shouldBranchQ5B" src/machines/oracleMachine.ts` → 3 (definition + usage + comment)

State count verification:
- `grep -c "Q5B_" src/machines/oracleMachine.ts` → 13 (6 states × 2 minimum + comment mentions)

Sibling rejoin verification:
- `grep "Q5B_RESPOSTA.*#oracle" src/machines/oracleMachine.ts` → 0 matches (NO #oracle. prefix — sibling rejoin confirmed)

Helper extension verification:
- `grep -c "Q5B_" src/components/experience/OracleExperience.tsx` → 14 (≥12 expected — all 6 helpers extended)

Test passing verification:
- `npx vitest run src/machines/oracleMachine.test.ts` → 83/83 passing ✓
- `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts` → 14/14 passing ✓
