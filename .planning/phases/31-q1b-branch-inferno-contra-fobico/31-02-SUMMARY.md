---
phase: 31-q1b-branch-inferno-contra-fobico
plan: 02
subsystem: state machine + UI orchestration
tags: [xstate, branching, q1b, contra-fobico, oracle-experience, helpers]
status: complete
wave: 2
requirements:
  - BR-01
requires:
  - "31-01"  # Q1B script entries, QUESTION_META[9], QuestionId union
provides:
  - shouldBranchQ1B guard in oracleMachine
  - 6 Q1B states (SETUP, PERGUNTA, AGUARDANDO, TIMEOUT, RESPOSTA_A, RESPOSTA_B)
  - Q2_RESPOSTA_B guarded array transition (Q1B_SETUP | PURGATORIO)
  - Q1B_CHOICE constant in OracleExperience (buildChoiceConfig(9))
  - 6 OracleExperience helper extensions (getBreathingDelay, getScriptKey, getFallbackScript, activeChoiceConfig, isAguardando, isPergunta)
affects:
  - src/machines/oracleMachine.ts (guard + 6 states + Q2_RESPOSTA_B modification)
  - src/machines/oracleMachine.test.ts (11 new tests under "Q1B Branch" describe)
  - src/components/experience/OracleExperience.tsx (Q1B_CHOICE + 6 helpers)
  - src/components/experience/__tests__/OracleExperience-helpers.test.ts (7 smoke tests)
tech-stack:
  added: []
  patterns:
    - "Guarded array transition mirroring Q2B/Q4B branch entry pattern"
    - "Helper checklist approach for 6 OracleExperience extension points (Pitfall 1 prevention)"
    - "Smoke test contract verification for private helpers (SCRIPT keys + QUESTION_META index)"
key-files:
  created:
    - src/components/experience/__tests__/OracleExperience-helpers.test.ts (7 contract smoke tests)
  modified:
    - src/machines/oracleMachine.ts (guards block + Q2_RESPOSTA_B + 6 new Q1B states inside INFERNO.states)
    - src/machines/oracleMachine.test.ts (added describe block "Q1B Branch (Phase 31, BR-01)" with 11 tests)
    - src/components/experience/OracleExperience.tsx (Q1B_CHOICE constant line 49 + 6 helper extensions: 4 in getBreathingDelay, 5 in getScriptKey, 1 in getFallbackScript, 1 in activeChoiceConfig useMemo, 1 in isAguardando, 1 in isPergunta)
decisions:
  - "Q1B helpers placed AFTER Q2B equivalents in each function (chronological consistency with Q2B/Q4B convention)"
  - "Q2_RESPOSTA_B converted from string transition to guarded array with shouldBranchQ1B as first option (Q2_RESPOSTA_A already used this pattern for Q2B)"
  - "Smoke test approach for OracleExperience helpers (private functions cannot be unit tested directly without refactor — out of scope)"
metrics:
  duration_min: 8
  tasks_completed: 2
  tests_added: 18  # 11 machine + 7 helper smoke
  tests_passing: 76  # 69 machine (full suite incl. regression) + 7 smoke
  files_created: 1
  files_modified: 3
  commits: 4  # bf214ff RED + 01e3264 GREEN + f3ab5fd smoke + 2368021 helpers
  date_completed: 2026-04-07
---

# Phase 31 Plan 02: Q1B Branch Wiring (Machine + UI) Summary

Wave 2 of Phase 31 — wires the Q1B "A Porta no Fundo" branch into the XState machine and the OracleExperience orchestrator so the script primitives delivered by Plan 31-01 actually play for visitors with the contra-fóbico profile (q1=B AND q2=B).

## What Changed

### Task 1 — Machine wiring (`src/machines/oracleMachine.ts`)

**Guard added** (line 44):

```typescript
shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B',
```

Mirrors `shouldBranchQ2B` and `shouldBranchQ4B` patterns — checks two named entries in `choiceMap` for the contra-fóbico signature (procurou a porta + ficou olhando a coisa).

**`Q2_RESPOSTA_B` modified** (lines ~199-204) — converted from unconditional string transition to guarded array form:

```typescript
Q2_RESPOSTA_B: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q1B_SETUP', guard: 'shouldBranchQ1B' },
      { target: '#oracle.PURGATORIO' },
    ],
  },
},
```

This is the only modification to a pre-existing v4.0 state. `Q2_RESPOSTA_A` remains unchanged (it already had its own guarded array for Q2B).

**6 new Q1B states added** (lines ~250-294) inside the `INFERNO.states` block, immediately after `Q2B_RESPOSTA_B`:

| State | Transition | Notes |
|-------|------------|-------|
| `Q1B_SETUP` | `NARRATIVA_DONE → Q1B_PERGUNTA` | Plays SCRIPT.INFERNO_Q1B_SETUP |
| `Q1B_PERGUNTA` | `NARRATIVA_DONE → Q1B_AGUARDANDO` | Asks the visitor's question |
| `Q1B_AGUARDANDO` | `CHOICE_A → Q1B_RESPOSTA_A` (records q1b='A'), `CHOICE_B → Q1B_RESPOSTA_B` (records q1b='B'), `after 25000 → Q1B_TIMEOUT` (default q1b='A') | Voice choice gate |
| `Q1B_TIMEOUT` | `NARRATIVA_DONE → Q1B_RESPOSTA_A` | Default-on-silence path |
| `Q1B_RESPOSTA_A` | `NARRATIVA_DONE → #oracle.PURGATORIO` | "Atravessar" outcome |
| `Q1B_RESPOSTA_B` | `NARRATIVA_DONE → #oracle.PURGATORIO` | "Voltar" outcome |

Both Q1B responses rejoin the main path at `#oracle.PURGATORIO` — same convergence pattern Q2B and Q4B use.

**11 new tests** added under `describe('Q1B Branch (Phase 31, BR-01)', () => { ... })` covering:

1. Triggers Q1B when q1=B AND q2=B
2. Skips Q1B when q1=A and q2=B (only one B — guard fails)
3. Skips Q1B when q1=B and q2=A (only one B — guard fails)
4. SETUP → PERGUNTA → AGUARDANDO transition chain
5. CHOICE_A → Q1B_RESPOSTA_A and choiceMap.q1b='A' + choices=['B','B','A']
6. CHOICE_B → Q1B_RESPOSTA_B and choiceMap.q1b='B' + choices=['B','B','B']
7. 25s timeout → Q1B_TIMEOUT with default q1b='A'
8. Q1B_TIMEOUT → Q1B_RESPOSTA_A on NARRATIVA_DONE
9. Q1B_RESPOSTA_A → PURGATORIO on NARRATIVA_DONE (rejoin)
10. Q1B_RESPOSTA_B → PURGATORIO on NARRATIVA_DONE (rejoin)
11. Q2B regression — q1=A AND q2=A still triggers Q2B (Q1B addition didn't break Q2B)

**Commits:**
- `bf214ff` test(31-02): add failing tests for Q1B branch (RED)
- `01e3264` feat(31-02): wire Q1B branch into oracleMachine (GREEN, BR-01)

### Task 2 — OracleExperience helpers (`src/components/experience/OracleExperience.tsx`)

**`Q1B_CHOICE` constant** (line 49) — added after `Q4B_CHOICE = buildChoiceConfig(8)`:

```typescript
const Q1B_CHOICE = buildChoiceConfig(9);
```

Reads `QUESTION_META[9]` (added in Plan 31-01) to construct the voice choice config (questionContext, options.A='Atravessar', options.B='Voltar', NLU keywords, defaultEvent='CHOICE_A').

**6 helper functions extended** with Q1B awareness:

1. **`getBreathingDelay()`** — 4 new branches:
   - `Q1B_SETUP` → MEDIUM (1500ms, within-phase narrative beat)
   - `Q1B_PERGUNTA` → NONE (0ms, mic must open instantly)
   - `Q1B_RESPOSTA_A` → LONG (2500ms, cross-phase to PURGATORIO)
   - `Q1B_RESPOSTA_B` → LONG (2500ms, cross-phase to PURGATORIO)

2. **`getScriptKey()`** — 5 new branches in the INFERNO Q2B substates block:
   - `Q1B_SETUP` → `'INFERNO_Q1B_SETUP'`
   - `Q1B_PERGUNTA` → `'INFERNO_Q1B_PERGUNTA'`
   - `Q1B_RESPOSTA_A` → `'INFERNO_Q1B_RESPOSTA_A'`
   - `Q1B_RESPOSTA_B` → `'INFERNO_Q1B_RESPOSTA_B'`
   - `Q1B_TIMEOUT` → `'TIMEOUT_Q1B'`

3. **`getFallbackScript()`** — 1 new branch:
   - `Q1B_AGUARDANDO` → `{ segments: SCRIPT.FALLBACK_Q1B, key: 'FALLBACK_Q1B' }`

4. **`activeChoiceConfig` useMemo** — 1 new branch:
   - `Q1B_AGUARDANDO` → `Q1B_CHOICE`

5. **`isAguardando` boolean** — 1 new disjunct:
   - `state.matches({ INFERNO: 'Q1B_AGUARDANDO' })` added to the OR chain (after Q2B_AGUARDANDO)

6. **`isPergunta` boolean** — 1 new disjunct:
   - `state.matches({ INFERNO: 'Q1B_PERGUNTA' })` added to the OR chain (after Q2B_PERGUNTA, used for getUserMedia warm-up)

**7 smoke tests** at `src/components/experience/__tests__/OracleExperience-helpers.test.ts` verify the contracts those private helpers depend on are intact (private helpers can't be unit-tested directly without refactor — out of scope):

- `SCRIPT.INFERNO_Q1B_SETUP` exists (Array, length > 0)
- `SCRIPT.INFERNO_Q1B_PERGUNTA` exists
- `SCRIPT.INFERNO_Q1B_RESPOSTA_A` exists
- `SCRIPT.INFERNO_Q1B_RESPOSTA_B` exists
- `SCRIPT.FALLBACK_Q1B` exists (length > 0)
- `SCRIPT.TIMEOUT_Q1B` exists
- `QUESTION_META[9]` is well-formed (`optionA='Atravessar'`, `optionB='Voltar'`, both keyword arrays non-empty)

**Commits:**
- `f3ab5fd` test(31-02): add Q1B helper contract smoke tests
- `2368021` feat(31-02): extend OracleExperience helpers for Q1B branch (BR-01)

## Verification Results

### Tests

```
src/components/experience/__tests__/OracleExperience-helpers.test.ts   7/7 passing
src/machines/oracleMachine.test.ts                                    69/69 passing
```

**Total: 76/76 passing** (18 new + 58 v4.0 regression — all green).

The 11 Q1B machine tests + 7 helper smoke tests are all green. All pre-existing v4.0 tests (Q2B branch, Q4B branch, archetype detection, full path permutations) still pass — zero regression.

### Self-Checklist (Pitfall 1 prevention)

```bash
grep -c "Q1B_SETUP\|Q1B_PERGUNTA\|Q1B_AGUARDANDO\|Q1B_RESPOSTA\|Q1B_TIMEOUT\|Q1B_CHOICE" \
  src/components/experience/OracleExperience.tsx
# 14
```

Required ≥ 12. Result: 14 — all 6 helper extension points modified (constant declaration + Q1B_CHOICE assignment in useMemo + 4 in getBreathingDelay + 5 in getScriptKey + 1 in getFallbackScript + 1 in isAguardando + 1 in isPergunta = 14).

### TypeScript Compilation

`npx tsc --noEmit` — pre-existing errors only (voice-flow-integration v1.0 broken file, NextRequest mocks in API route tests, useVoiceChoice mock signature drift). **None caused by Plan 31-02 edits.** Same exact error set as 31-01-SUMMARY notes (these are out-of-scope, tracked elsewhere).

### Sanity Greps

```bash
grep -c "shouldBranchQ1B" src/machines/oracleMachine.ts                  # 2 (definition + guarded transition)
grep -c "Q1B_" src/machines/oracleMachine.ts                             # 13 (6 state defs + 7 transition targets)
grep -c "Q1B_" src/components/experience/OracleExperience.tsx            # 14
```

## Deviations from Plan

None — plan executed exactly as written. No bugs found, no missing critical functionality, no blocking issues, no architectural decisions needed.

The Q1B_CHOICE constant was already added in the working tree before this session resumed (uncommitted), so Step 1 of Task 2 was effectively a no-op verification. Steps 2-7 (the 6 helper extensions) and Steps 8-10 (verification) were executed in this session and committed atomically in `2368021`.

## Authentication Gates

None.

## Ready Signal for Plan 31-03

Plan 31-03 (MP3 generation + validation/docs) can now safely:

- Run `npx ts-node scripts/generate-audio-v3.ts` to generate the 8 new Q1B MP3s (INFERNO_Q1B_SETUP × 3 segments + INFERNO_Q1B_PERGUNTA × 1 + INFERNO_Q1B_RESPOSTA_A × 2 + INFERNO_Q1B_RESPOSTA_B × 2 + FALLBACK_Q1B × 1 + TIMEOUT_Q1B × 1, where ElevenLabs returns one MP3 per segment) — the script.ts has the entries, the generator imports from script.ts directly so no code changes needed
- Update `scripts/validate-timing.ts` to add the Q1B branch path permutation (q1=B, q2=B, q1b=A) and verify max-path remains in budget (target ~7:20 max)
- Update `public/roteiro.html` Mermaid flowchart to show the Q1B branch (already client-facing source of truth)
- Run a manual functional smoke: `npm run dev`, click through Q1=B, Q2=B, observe browser console — should see state advance through Q1B_SETUP → Q1B_PERGUNTA → Q1B_AGUARDANDO → Q1B_RESPOSTA_A/B → PURGATORIO. After Plan 31-03, the new MP3s will play; until then, FallbackTTS will be silent for the Q1B keys.

The machine routes the contra-fóbico profile through the new branch, and OracleExperience knows how to render every Q1B state (script playback, breathing delay, fallback, voice choice config, mic gating). BR-01 is now functional end-to-end at the orchestration layer.

## Self-Check: PASSED

Files created:
- FOUND: `src/components/experience/__tests__/OracleExperience-helpers.test.ts` (committed in `f3ab5fd`)
- FOUND: `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-02-SUMMARY.md` (this file)

Files modified:
- FOUND: `src/machines/oracleMachine.ts` (committed in `01e3264`)
- FOUND: `src/machines/oracleMachine.test.ts` (committed in `bf214ff` + `01e3264`)
- FOUND: `src/components/experience/OracleExperience.tsx` (committed in `2368021`)

Commits exist:
- FOUND: `bf214ff` test(31-02): add failing tests for Q1B branch (RED)
- FOUND: `01e3264` feat(31-02): wire Q1B branch into oracleMachine (GREEN, BR-01)
- FOUND: `f3ab5fd` test(31-02): add Q1B helper contract smoke tests
- FOUND: `2368021` feat(31-02): extend OracleExperience helpers for Q1B branch (BR-01)
