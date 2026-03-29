---
phase: 26-script-branching
plan: 01
subsystem: narrative-content
tags: [branching, script, psychoanalytic-depth, conditional-paths]
dependency_graph:
  requires: [PACE-01, PACE-02]
  provides: [BRNC-01, BRNC-02, BRNC-03, BRNC-04]
  affects: [state-machine, audio-generation]
tech_stack:
  added: []
  patterns: [conditional-narrative-paths, psychoanalytic-metaphor]
key_files:
  created: []
  modified:
    - src/types/index.ts
    - src/data/script.ts
decisions:
  - Q2B triggers after Q1=A (ficar) AND Q2=A (recuar) - tests pattern of avoidance
  - Q4B triggers after Q3=A (entrar) AND Q4=A (lembrar) - tests pattern of integration
  - Branch content maintains 2-segment resposta structure (echo + punchline)
  - Psychoanalytic depth level 4-5 matched to existing script quality
  - ChoicePattern type changed to variable-length array (6-10 choices)
metrics:
  duration: 3m 11s
  tasks_completed: 2
  files_modified: 2
  commits: 2
  lines_added: 121
  completed_date: 2026-03-28
---

# Phase 26 Plan 01: Branch Script Content Summary

Branch narrative foundation established — two conditional paths (Q2B, Q4B) with full psychoanalytic depth, variable-length choice type system.

## What Was Built

### Type System Evolution
- **ChoicePattern type**: Changed from fixed 6-tuple to `ChoiceAB[]` array supporting 6-10 choices
- **QUESTION_META expansion**: Added entries 7 (Q2B) and 8 (Q4B) with complete NLU metadata
- **ScriptDataV4 interface**: Extended ScriptDataV3 with 16 new branch keys (12 content + 4 fallback/timeout)

### Branch Q2B — A Segunda Coisa (INFERNO)
**Conditional trigger**: Q1=A (ficou na sala) AND Q2=A (recuou da coisa no chao)

**Narrative theme**: Second confrontation in corridor — another pulsing thing, smaller and warmer. Visitor must choose between touching or passing straight.

**Psychoanalytic depth**: Tests whether initial recuar was defensive (habitual avoidance pattern) or instinctive (isolated fear response). Tocar option reveals recognition ("isso ja era seu") — what was avoided becomes familiar when confronted. Passar reto confirms pattern ("decisao repetida vira identidade").

**Content created**:
- INFERNO_Q2B_SETUP (2 segments)
- INFERNO_Q2B_PERGUNTA (1 segment)
- INFERNO_Q2B_RESPOSTA_A — Tocar (2 segments, gentle inflection)
- INFERNO_Q2B_RESPOSTA_B — Passar reto (2 segments, serious inflection)
- FALLBACK_Q2B (1 segment)
- TIMEOUT_Q2B (1 segment)

### Branch Q4B — A Memoria Que Insiste (PURGATORIO)
**Conditional trigger**: Q3=A (entrou no jardim) AND Q4=A (lembrar)

**Narrative theme**: Specific memory materializes unbidden — has smell, texture, face of someone unseen for a long time. Visitor must choose between reliving or archiving definitively.

**Psychoanalytic depth**: Tests whether choosing to remember is active integration (reviver transforms memory each time) or passive accumulation (arquivar as protective postponement). Memory not as static object but dynamic process that changes with each return.

**Content created**:
- PURGATORIO_Q4B_SETUP (2 segments)
- PURGATORIO_Q4B_PERGUNTA (1 segment)
- PURGATORIO_Q4B_RESPOSTA_A — Reviver (2 segments, warm inflection)
- PURGATORIO_Q4B_RESPOSTA_B — Arquivar (2 segments, gentle inflection)
- FALLBACK_Q4B (1 segment)
- TIMEOUT_Q4B (1 segment)

### Quality Markers
- All respostas follow established echo + punchline pattern (1 short confirmation + 1 deep insight)
- pauseAfter values: 800-1000ms between segments (rhythm consistency)
- Inflection tags: max 1 per segment, sparse density matching existing script
- Portuguese natural flow with psychoanalytic vocabulary absorbed into metaphor
- Zero explicit theoretical references — depth felt, not declared

## Tasks Completed

| Task | Description | Commit | Files Modified |
|------|-------------|--------|----------------|
| 1 | Update type contracts for variable-length choices and branch questions | ac84773 | src/types/index.ts |
| 2 | Write branch narrative content (Q2B + Q4B) in script.ts | 2a5e2f8 | src/data/script.ts |

## Deviations from Plan

None - plan executed exactly as written. All branch content created with specified psychoanalytic depth, type system updated for variable-length patterns, QUESTION_META extended to 8 entries.

## Known Stubs

None. Branch content is complete narrative ready for state machine integration (26-02). All 16 keys have full content matching production quality of existing script.

## Verification Results

**TypeScript compilation**: Passed (only pre-existing test errors unrelated to changes)

**Content validation**:
- 35 occurrences of Q2B/Q4B in script.ts (all 16 keys present)
- ChoicePattern type confirmed as `ChoiceAB[]` in types/index.ts
- QUESTION_META entries 7 and 8 confirmed present
- All branch segments follow SpeechSegment interface structure
- ScriptDataV4 typed constant includes all legacy + branch keys

**Psychoanalytic depth check**:
- Q2B extends INFERNO "coisa no chao" metaphor with second-chance logic
- Q4B extends PURGATORIO memory theme with integration vs accumulation distinction
- All insights follow Winnicott/Lacan/Bion absorbed patterns (no explicit citations)
- Emotional weight distributed via pauseAfter and inflection tags

## Next Steps

**Immediate (Phase 26 Plan 02)**:
- State machine conditional transitions (Q2B after INFERNO_Q2_RESPOSTA_A, Q4B after PURGATORIO_Q4_RESPOSTA_A)
- Update pattern matching to handle 6-10 choice arrays
- Add branching logic guards to oracleMachine

**Dependent work**:
- Phase 27: Regenerate audio for 16 new branch keys
- Phase 28: Update timing validation for max-path with both branches

## Self-Check: PASSED

**Files created**: 0 (all modifications to existing files)

**Files modified**:
- ✓ src/types/index.ts exists and contains ChoiceAB[] type
- ✓ src/types/index.ts contains QUESTION_META entries 7 and 8
- ✓ src/data/script.ts exists and contains ScriptDataV4 interface
- ✓ src/data/script.ts contains all 12 branch content keys
- ✓ src/data/script.ts contains all 4 branch fallback/timeout keys

**Commits exist**:
- ✓ ac84773 (Task 1 - type contracts)
- ✓ 2a5e2f8 (Task 2 - branch narrative content)

**Requirements satisfied**:
- ✓ BRNC-01: Branch content created with depth 4-5 quality
- ✓ BRNC-02: Q2B content complete (setup, pergunta, 2 respostas, fallback, timeout)
- ✓ BRNC-03: Q4B content complete (setup, pergunta, 2 respostas, fallback, timeout)
- ✓ BRNC-04: ChoicePattern type supports variable-length arrays
