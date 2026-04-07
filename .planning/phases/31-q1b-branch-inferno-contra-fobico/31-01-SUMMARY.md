---
phase: 31-q1b-branch-inferno-contra-fobico
plan: 01
subsystem: data + types
tags: [script, nlu, types, branching, q1b, contra-fobico]
status: complete
wave: 1
requirements:
  - BR-01
  - POL-02
requires: []
provides:
  - SCRIPT.INFERNO_Q1B_SETUP (3 segments, PT-BR)
  - SCRIPT.INFERNO_Q1B_PERGUNTA (1 segment)
  - SCRIPT.INFERNO_Q1B_RESPOSTA_A (2 segments, inflection serious)
  - SCRIPT.INFERNO_Q1B_RESPOSTA_B (2 segments, inflection warm)
  - SCRIPT.FALLBACK_Q1B (1 segment)
  - SCRIPT.TIMEOUT_Q1B (1 segment)
  - QUESTION_META[9] for Q1B NLU classification
  - QuestionId union extended with q1b, q5b, q6b
affects:
  - src/data/script.ts (interface ScriptDataV4 + SCRIPT object literal)
  - src/types/index.ts (QUESTION_META + comment header)
  - src/machines/oracleMachine.types.ts (QuestionId union)
tech-stack:
  added: []
  patterns:
    - "ScriptDataV4 interface extension (mirrors Q2B/Q4B branch entry pattern)"
    - "QUESTION_META[N] indexed entry (Q2B@7, Q4B@8, Q1B@9)"
    - "Partial<Record<QuestionId, ChoiceAB>> auto-extension via union type"
key-files:
  created:
    - src/types/__tests__/question-meta.test.ts (10 tests, NLU metadata coverage)
    - src/machines/__tests__/oracleMachine-types.test.ts (5 tests, ChoiceMap type extension)
  modified:
    - src/data/script.ts (lines 110-121 interface, 220-258 SCRIPT entries, 555-568 FALLBACK/TIMEOUT)
    - src/types/index.ts (line 85 comment, lines 153-161 entry 9)
    - src/machines/oracleMachine.types.ts (lines 7-8 QuestionId union)
decisions:
  - "Q1B placed AFTER Q2B/Q4B in interface (chronological by phase, not narrative order) — keeps existing v4.0 entries undisturbed"
  - "patternMatching.ts deliberately untouched (POL-02 acceptance: archetype guards must continue passing without modification)"
  - "FALLBACK_Q1B uses different vocabulary than PERGUNTA ('Atravessar a fresta' vs 'atravessa essa fresta') so NLU keywords cover both phrasings"
  - "TIMEOUT_Q1B uses common phrase 'Vou escolher por você' (matches existing TIMEOUT pattern across phases)"
metrics:
  duration_min: 6
  tasks_completed: 3
  tests_added: 26  # 11 script + 10 nlu + 5 type
  tests_passing: 121  # 89 script + 10 nlu + 5 type + 17 (sub-suite of regression covered)
  files_created: 2
  files_modified: 3
  commits: 6  # 3 RED + 3 GREEN
  date_completed: 2026-04-06
---

# Phase 31 Plan 01: Q1B Branch Data + Types Foundation Summary

Wave 1 of Phase 31 — adds the data primitives (script entries, NLU metadata, type extension) for the "A Porta no Fundo" contra-phobic branch, with zero machine wiring (deferred to Plan 31-02).

## What Changed

### Task 1 — Script entries (BR-01 partial)

Added 6 new keys to `SCRIPT` (`src/data/script.ts`):

- **INFERNO_Q1B_SETUP** (3 segments, lines ~236-240): the doorless door appears with a sliver of light
- **INFERNO_Q1B_PERGUNTA** (1 segment, line ~242): "Você atravessa essa fresta — ou volta pra coisa no chão, que ainda pulsa atrás de você?"
- **INFERNO_Q1B_RESPOSTA_A** (2 segments, lines ~247-250): atravessar (courage to cross emptiness, inflection `serious`)
- **INFERNO_Q1B_RESPOSTA_B** (2 segments, lines ~253-256): voltar (fear chosen as interlocutor, inflection `warm`)
- **FALLBACK_Q1B** (1 segment, line ~555): NLU retry phrasing
- **TIMEOUT_Q1B** (1 segment, line ~566): default-on-silence

PT-BR text copied verbatim from blueprint (`next-milestone-v5-deep-branching.md` lines 29-57). Inflection tags use only working tags for voice ID `PznTnBc8X6pvixs9UkQm`: `thoughtful`, `serious`, `warm`.

The `ScriptDataV4` interface was extended in two places (lines 110-113 narrative + 118 fallback + 121 timeout) to type-check the new entries.

**Commits:**
- `4368acc` test(31-01): add failing tests for Q1B script entries (RED)
- `6b618c9` feat(31-01): add Q1B branch script entries (GREEN, BR-01)

### Task 2 — QUESTION_META[9] (BR-01 partial)

Added a new entry at index 9 in `QUESTION_META` (`src/types/index.ts` lines 153-161) for Q1B NLU classification:

```typescript
9: {
  questionContext: 'Visitante destemido encontra uma porta sem maçaneta com fresta de luz, escolhendo entre atravessar o vazio ou voltar pra coisa pulsante atras dele',
  optionA: 'Atravessar',
  optionB: 'Voltar',
  keywordsA: ['atravessar', 'atravesso', 'passar', 'ir', 'fresta', 'luz', 'sim', 'porta', 'frente'],
  keywordsB: ['voltar', 'volto', 'coisa', 'recuar', 'nao', 'atras', 'pulsar', 'reconhecer'],
  defaultOnTimeout: 'A',
},
```

Comment header above QUESTION_META updated from "(6 base + 2 branch)" to "(6 base + 3 branch — Q2B@7, Q4B@8, Q1B@9)".

Entries 1-8 are byte-identical (regression-critical — all v4.0 NLU still works).

**Commits:**
- `292a470` test(31-01): add failing tests for QUESTION_META[9] (Q1B NLU) (RED)
- `9933a69` feat(31-01): add QUESTION_META[9] for Q1B NLU classification (GREEN, BR-01)

### Task 3 — QuestionId extension (POL-02 complete)

Extended `QuestionId` union (`src/machines/oracleMachine.types.ts` line 8) from 8 to 11 members:

```typescript
// Before:
export type QuestionId = 'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6';

// After:
export type QuestionId = 'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q1b' | 'q5b' | 'q6b';
```

Because `OracleContextV4.choiceMap` is typed as `Partial<Record<QuestionId, ChoiceAB>>`, the new fields are automatically optional — no other type changes needed. `INITIAL_CONTEXT_V4.choiceMap` remains `{}` so the runtime initial state is byte-identical (full backward compat).

`q5b` and `q6b` are forward-compatibility for Plans 32-01 and 33-01 (they'll be wired then).

**Commits:**
- `10d36aa` test(31-01): add failing type tests for QuestionId extension (RED)
- `fe3f98a` feat(31-01): extend QuestionId union with q1b, q5b, q6b (GREEN, POL-02)

## POL-02 Acceptance Verification

POL-02 requires the existing v4.0 archetype guards to continue passing without modification. Confirmed:

- **`src/machines/guards/patternMatching.ts` is byte-identical** — `git diff` returns empty
- **All 59 patternMatching tests pass** — DEPTH_SEEKER, SURFACE_KEEPER, MIRROR, PIVOT_EARLY, PIVOT_LATE, SEEKER, GUARDIAN, CONTRADICTED archetypes all detected correctly
- **All 58 oracleMachine tests pass** — machine context shape unchanged at runtime

The 3 new union members (`q1b`, `q5b`, `q6b`) extend type-level coverage without touching guard logic.

## Test Files

### Created

1. **`src/types/__tests__/question-meta.test.ts`** (10 tests)
   - 3 regression tests: Q1 (`Ficar`), Q7/Q2B (`Tocar`), Q8/Q4B (`Reviver`) labels unchanged
   - 7 new tests: Q1B labels, keywords, defaultOnTimeout, questionContext

2. **`src/machines/__tests__/oracleMachine-types.test.ts`** (5 tests)
   - 1 regression test: all 8 v4.0 keys still compile in `choiceMap`
   - 3 new tests: `q1b`, `q5b`, `q6b` accepted (compile-level type checks with runtime sanity)
   - 1 backward compat test: `INITIAL_CONTEXT_V4.choiceMap` still `{}`

### Extended

3. **`src/data/__tests__/script-v3.test.ts`** — added "Q1B branch (Phase 31)" describe block with 11 tests covering segment count, blueprint text verbatim, inflection tags, PT-BR validation, no author references.

## Verification Results

### Tests

```
src/data/__tests__/script-v3.test.ts          89/89 passing
src/types/__tests__/question-meta.test.ts     10/10 passing
src/machines/__tests__/oracleMachine-types.test.ts  5/5 passing
src/machines/guards/__tests__/patternMatching.test.ts  59/59 passing (regression)
src/machines/oracleMachine.test.ts            58/58 passing (regression)
```

**Total relevant: 221/221 passing** (104 plan-targeted + 117 regression)

### TypeScript Compilation

```bash
npx tsc --noEmit  # zero errors in plan-modified files
```

Pre-existing TypeScript errors in unrelated files (NextRequest mocks in API route tests, useVoiceChoice mock signature drift) are out-of-scope and unchanged. Total errors actually dropped from 106 → 72 because the script.ts type narrowing improved with new entries.

### Sanity Greps

```bash
grep -c "INFERNO_Q1B" src/data/script.ts                # 8 (4 keys × 2 — interface + SCRIPT)
grep -c "FALLBACK_Q1B\|TIMEOUT_Q1B" src/data/script.ts  # 4 (2 keys × 2)
grep -c "9: {" src/types/index.ts                       # 1
grep -c "'q1b'" src/machines/oracleMachine.types.ts     # 1
grep -c "Você não recua. Continua olhando" src/data/script.ts  # 1 (verbatim blueprint)
```

## Deviations from Plan

None — plan executed exactly as written. No bugs found, no missing critical functionality, no blocking issues, no architectural decisions needed.

## Ready Signal for Plan 31-02

Plan 31-02 (machine wiring + OracleExperience integration) can now safely:

- Reference `SCRIPT.INFERNO_Q1B_SETUP`, `INFERNO_Q1B_PERGUNTA`, `INFERNO_Q1B_RESPOSTA_A`, `INFERNO_Q1B_RESPOSTA_B`, `FALLBACK_Q1B`, `TIMEOUT_Q1B` in `getScriptKey()` / `getFallbackScript()` helpers
- Call `recordChoice('q1b', 'A' | 'B')` in oracleMachine.ts assign actions
- Use `QUESTION_META[9]` in `buildChoiceConfig(9)` for the voice choice pipeline
- Read `context.choiceMap.q1b` in branch guards without TypeScript errors

The data and type primitives exist; the machine still ignores them. Plan 31-02 wires them in.

## Self-Check: PASSED

Files created:
- FOUND: `src/types/__tests__/question-meta.test.ts`
- FOUND: `src/machines/__tests__/oracleMachine-types.test.ts`

Commits exist:
- FOUND: `4368acc` test(31-01): add failing tests for Q1B script entries
- FOUND: `6b618c9` feat(31-01): add Q1B branch script entries (BR-01)
- FOUND: `292a470` test(31-01): add failing tests for QUESTION_META[9] (Q1B NLU)
- FOUND: `9933a69` feat(31-01): add QUESTION_META[9] for Q1B NLU classification (BR-01)
- FOUND: `10d36aa` test(31-01): add failing type tests for QuestionId extension (POL-02)
- FOUND: `fe3f98a` feat(31-01): extend QuestionId union with q1b, q5b, q6b (POL-02)
