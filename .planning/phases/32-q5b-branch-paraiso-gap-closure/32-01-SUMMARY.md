---
phase: 32-q5b-branch-paraiso-gap-closure
plan: 01
subsystem: data + types
tags: [script, nlu, types, branching, q5b, portador]
status: complete
wave: 1
requirements:
  - BR-02
requires: []
provides:
  - SCRIPT.PARAISO_Q5B_SETUP (3 segments, PT-BR, inflection thoughtful/gentle)
  - SCRIPT.PARAISO_Q5B_PERGUNTA (1 segment)
  - SCRIPT.PARAISO_Q5B_RESPOSTA_A (2 segments, inflection warm)
  - SCRIPT.PARAISO_Q5B_RESPOSTA_B (2 segments, inflection gentle)
  - SCRIPT.FALLBACK_Q5B (1 segment)
  - SCRIPT.TIMEOUT_Q5B (1 segment, inflection warm)
  - QUESTION_META[10] for Q5B NLU classification (Fundir vs Ordenar)
affects:
  - src/data/script.ts (interface ScriptDataV4 + SCRIPT object literal)
  - src/types/index.ts (QUESTION_META + comment header)
tech-stack:
  added: []
  patterns:
    - "ScriptDataV4 interface extension (mirrors Q1B/Q2B/Q4B branch entry pattern)"
    - "QUESTION_META[N] indexed entry (Q2B@7, Q4B@8, Q1B@9, Q5B@10)"
key-files:
  created: []
  modified:
    - src/data/script.ts (lines 114-121 interface, 399-430 Q5B narrative, 598-599 FALLBACK_Q5B, 611-613 TIMEOUT_Q5B)
    - src/types/index.ts (line 85 comment, lines 162-171 entry 10)
    - src/data/__tests__/script-v3.test.ts (11 new Q5B tests)
    - src/types/__tests__/question-meta.test.ts (7 Q5B tests + 2 regression tests)
decisions:
  - "Q5B placed AFTER Q1B in interface (chronological by phase) — keeps v4.0 entries undisturbed"
  - "patternMatching.ts deliberately untouched (POL-02 acceptance: archetype guards continue passing without modification)"
  - "oracleMachine.types.ts verified unchanged (q5b already added by Phase 31 POL-02)"
  - "FALLBACK_Q5B uses 'Fundir, ou separar' vocabulary matching PERGUNTA phrasing — maximizes NLU keyword coverage"
  - "TIMEOUT_Q5B uses warm inflection ('O peso decide') — matches Paraíso's gentle realm character"
metrics:
  duration_min: 4
  tasks_completed: 3
  tests_added: 18  # 11 script + 7 nlu
  tests_passing: 124  # 11 Q5B script + 7 Q5B nlu + 2 regression + 104 existing
  files_created: 0
  files_modified: 4  # script.ts, index.ts, 2 test files
  commits: 2
  date_completed: 2026-04-07
---

# Phase 32 Plan 01: Q5B Branch Data + Types Foundation Summary

Wave 1 of Phase 32 — adds the data primitives (script entries, NLU metadata) for the "O Que Já Não Cabe" Paraíso conditional branch, with zero machine wiring (deferred to Plan 32-02).

## What Changed

### Task 1 — Script entries (BR-02 partial)

Added 6 new keys to `SCRIPT` (`src/data/script.ts`):

- **PARAISO_Q5B_SETUP** (3 segments, lines ~407-411): Memory and unanswered question fuse into one form
- **PARAISO_Q5B_PERGUNTA** (1 segment, line ~413): "Você deixa eles se fundirem — ou tenta segurar cada um no lugar dele?"
- **PARAISO_Q5B_RESPOSTA_A** (2 segments, lines ~416-419): Fundir (become the form that holds both, inflection `warm`)
- **PARAISO_Q5B_RESPOSTA_B** (2 segments, lines ~422-425): Ordenar (separate as inventory, inflection `gentle`)
- **FALLBACK_Q5B** (1 segment, line ~598): NLU retry phrasing
- **TIMEOUT_Q5B** (1 segment, line ~612): default-on-silence (warm inflection)

PT-BR text copied verbatim from research Option A "Fundir vs Ordenar" (32-RESEARCH.md lines 286-333). Inflection tags use only working tags for voice ID `PznTnBc8X6pvixs9UkQm`: `thoughtful`, `gentle`, `warm`.

The `ScriptDataV4` interface was extended in two places (lines 114-121 narrative + 127 fallback + 129 timeout) to type-check the new entries.

**Commits:**
- `97cce06` feat(32-01): add Q5B branch script entries (BR-02)

### Task 2 — QUESTION_META[10] (BR-02 partial)

Added a new entry at index 10 in `QUESTION_META` (`src/types/index.ts` lines 162-171) for Q5B NLU classification:

```typescript
10: {
  questionContext: 'O Oraculo perguntou se o visitante deixa a memoria e a pergunta sem resposta se fundirem em uma so forma, ou se prefere ordenar cada uma no seu lugar como inventario',
  optionA: 'Fundir',
  optionB: 'Ordenar',
  keywordsA: ['fundir', 'fundo', 'misturar', 'junto', 'mesmo', 'um so', 'uma so', 'deixar', 'sim', 'virar', 'forma', 'integrar'],
  keywordsB: ['separar', 'ordenar', 'cada', 'lugar', 'segurar', 'arquivar', 'distinguir', 'manter', 'nao', 'inventario', 'guardar'],
  defaultOnTimeout: 'A',
},
```

Comment header above QUESTION_META updated from "(6 base + 3 branch)" to "(6 base + 4 branch — Q2B@7, Q4B@8, Q1B@9, Q5B@10)".

Entries 1-9 are byte-identical (regression-critical — all v4.0 + Phase 31 NLU still works).

**Commits:**
- `f4ed683` feat(32-01): add QUESTION_META[10] for Q5B NLU classification (BR-02)

### Task 3 — POL-02 invariant verification (zero modifications)

This task is VERIFICATION ONLY. It produced ZERO file modifications. Its purpose is to PROVE that POL-02 invariant is intact before Plan 32-02 starts wiring the machine.

**Verification results:**
- ✅ `src/machines/oracleMachine.types.ts` QuestionId union contains `'q5b'` (added by Phase 31, line 8)
- ✅ `git diff HEAD -- src/machines/guards/patternMatching.ts` returns empty (POL-02 invariant intact)
- ✅ `git diff HEAD -- src/machines/oracleMachine.types.ts` returns empty (Phase 32 did not modify this file)
- ✅ `npx vitest run src/machines/__tests__/oracleMachine-types.test.ts -t "q5b"` exits 0 (1 test passing — Phase 31 added it)
- ✅ `npx vitest run src/machines/guards/__tests__/patternMatching.test.ts` exits 0 (all 59 archetype tests pass)
- ✅ `npx tsc --noEmit` reports 72 errors (same pre-existing count, all in obsolete v1.0 test files per CLAUDE.md)

**No commits** — this was a verification-only task.

## POL-02 Acceptance Verification

POL-02 requires the existing v4.0 archetype guards to continue passing without modification. Confirmed:

- **`src/machines/guards/patternMatching.ts` is byte-identical** — `git diff` returns empty
- **All 59 patternMatching tests pass** — DEPTH_SEEKER, SURFACE_KEEPER, MIRROR, PIVOT_EARLY, PIVOT_LATE, SEEKER, GUARDIAN, CONTRADICTED archetypes all detected correctly
- **`oracleMachine.types.ts` unchanged by Phase 32** — the `q5b` field in QuestionId was added by Phase 31 POL-02 work and remains intact

The Phase 32 data layer additions (SCRIPT keys + QUESTION_META[10]) extend type-level and runtime coverage without touching guard logic.

## Test Files

### Extended

1. **`src/data/__tests__/script-v3.test.ts`** — added "Q5B branch (Phase 32, BR-02)" describe block with 11 tests covering segment count, blueprint text verbatim, inflection tags, PT-BR validation, no author references, no whispering tag.

2. **`src/types/__tests__/question-meta.test.ts`** — added "Q5B branch (Phase 32, BR-02)" describe block with 7 tests covering labels, keywords, defaultOnTimeout, questionContext. Also added 2 regression tests confirming Phase 31 Q1B entries unchanged.

## Verification Results

### Tests

```
src/data/__tests__/script-v3.test.ts                      100/100 passing (11 new Q5B)
src/types/__tests__/question-meta.test.ts                  19/19 passing (7 new Q5B + 2 regression)
src/machines/__tests__/oracleMachine-types.test.ts          5/5 passing (Phase 31 q5b type test)
src/machines/guards/__tests__/patternMatching.test.ts      59/59 passing (regression)
```

**Total relevant: 183/183 passing** (18 plan-targeted + 165 regression)

### TypeScript Compilation

```bash
npx tsc --noEmit  # 72 errors (all pre-existing, obsolete v1.0 test files — unchanged count)
```

### Sanity Greps

```bash
grep -c "PARAISO_Q5B" src/data/script.ts                # 8 (4 narrative keys × 2 — interface + SCRIPT)
grep -c "FALLBACK_Q5B\|TIMEOUT_Q5B" src/data/script.ts  # 4 (2 keys × 2)
grep -c "10: {" src/types/index.ts                       # 1
grep -c "Fundir" src/types/index.ts                      # 2
grep -c "Você lembrou. Você carregou." src/data/script.ts  # 1 (verbatim blueprint)
grep -c "INFERNO_Q1B_SETUP" src/data/script.ts           # 2 (Phase 31 baseline intact)
```

## Deviations from Plan

None — plan executed exactly as written. No bugs found, no missing critical functionality, no blocking issues, no architectural decisions needed.

## Ready Signal for Plan 32-02

Plan 32-02 (machine wiring + OracleExperience integration) can now safely:

- Reference `SCRIPT.PARAISO_Q5B_SETUP`, `PARAISO_Q5B_PERGUNTA`, `PARAISO_Q5B_RESPOSTA_A`, `PARAISO_Q5B_RESPOSTA_B`, `FALLBACK_Q5B`, `TIMEOUT_Q5B` in `getScriptKey()` / `getFallbackScript()` helpers
- Add `shouldBranchQ5B` guard in oracleMachine.ts reading `context.choiceMap.q4` and `context.choiceMap.q5`
- Add 6 new states in PARAISO compound state (Q5B_SETUP, Q5B_PERGUNTA, Q5B_AGUARDANDO, Q5B_TIMEOUT, Q5B_RESPOSTA_A, Q5B_RESPOSTA_B)
- Call `recordChoice('q5b', 'A' | 'B')` in assign actions
- Use `QUESTION_META[10]` in `buildChoiceConfig(10)` for the voice choice pipeline
- Read `context.choiceMap.q5b` in future PORTADOR archetype guard (Phase 34) without TypeScript errors

The data and type primitives exist; the machine still ignores them. Plan 32-02 wires them in.

## Self-Check: PASSED

Files modified:
- FOUND: `src/data/script.ts` (6 Q5B keys added, interface extended)
- FOUND: `src/types/index.ts` (QUESTION_META[10] added)
- FOUND: `src/data/__tests__/script-v3.test.ts` (11 Q5B tests added)
- FOUND: `src/types/__tests__/question-meta.test.ts` (9 Q5B/regression tests added)

Commits exist:
- FOUND: `97cce06` feat(32-01): add Q5B branch script entries (BR-02)
- FOUND: `f4ed683` feat(32-01): add QUESTION_META[10] for Q5B NLU classification (BR-02)

POL-02 invariant intact:
- VERIFIED: `src/machines/guards/patternMatching.ts` byte-identical (git diff empty)
- VERIFIED: `src/machines/oracleMachine.types.ts` byte-identical (git diff empty, q5b added by Phase 31)
- VERIFIED: All 59 patternMatching archetype tests pass
